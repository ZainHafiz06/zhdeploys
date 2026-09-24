import { Euler, MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import type { Quad } from "./geometry";

/**
 * Kinematics of the MacBook model (public/stage/mac.glb, from pmndrs/examples,
 * MIT). Everything here is plain math, so the screen overlay can be placed
 * even before — or without — WebGL.
 *
 * Model space: x right, y up, the screen faces +z, the base extends toward +z.
 */

/** Lid opening: rotation of the "screenflip" node about x. Negative leans back. */
export const HINGE = -0.42;

const FLIP_T = new Vector3(0.002, -0.038, 0.414);
const SCREEN_T = new Vector3(0, 2.965, -0.13);
const SCREEN_R = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0));
/** Corners of the "screen.001" primitive in its node's space (TL, TR, BR, BL). */
const SCREEN_LOCAL = [
  new Vector3(-4.1503, 0.0387, -2.7747),
  new Vector3(4.1503, 0.0387, -2.7747),
  new Vector3(4.1503, 0.0387, 2.5983),
  new Vector3(-4.1503, 0.0387, 2.5983),
];
export const SCREEN_ASPECT = 8.3006 / 5.373;

/** Front corners of the base (left, right), from the base mesh bounds. */
export const BASE_FRONT = [new Vector3(-4.401, -0.09, 6.419), new Vector3(4.401, -0.09, 6.419)];

/** Screen corners in model space for a given lid angle. */
export function screenCorners(hinge: number): Vector3[] {
  const flip = new Matrix4().compose(FLIP_T, new Quaternion().setFromEuler(new Euler(hinge, 0, 0)), new Vector3(1, 1, 1));
  const m = flip.multiply(new Matrix4().compose(SCREEN_T, SCREEN_R, new Vector3(1, 1, 1)));
  return SCREEN_LOCAL.map((v) => v.clone().applyMatrix4(m));
}

const SCREEN_CORNERS = screenCorners(HINGE);
const SCREEN_CENTER = SCREEN_CORNERS.reduce((a, v) => a.add(v), new Vector3()).multiplyScalar(0.25);
const SCREEN_WIDTH = SCREEN_CORNERS[0].distanceTo(SCREEN_CORNERS[1]);

export interface RigPose {
  q: Quaternion;
  t: Vector3;
  /** Vertical field of view, degrees. */
  fov: number;
  /** Lid angle (rotation of the hinge node about x). */
  hinge: number;
}

export interface View {
  w: number;
  h: number;
}

const focal = (view: View, fov: number) => view.h / 2 / Math.tan(MathUtils.degToRad(fov) / 2);

/** Projects a model-space point to viewport pixels. Camera at origin, looking down −z. */
export function project(p: Vector3, pose: RigPose, view: View, out = new Vector3()): Vector3 {
  out.copy(p).applyQuaternion(pose.q).add(pose.t);
  const f = focal(view, pose.fov);
  const z = -out.z;
  return out.set(view.w / 2 + (f * out.x) / z, view.h / 2 - (f * out.y) / z, z);
}

export function screenQuad(pose: RigPose, view: View): Quad {
  const v = new Vector3();
  return screenCorners(pose.hinge).map((c) => {
    project(c, pose, view, v);
    return [v.x, v.y];
  }) as Quad;
}

/**
 * Straight-on pose: the lid is tilted toward the camera until the screen is
 * parallel to the image plane, so it projects to an exact rectangle — the
 * apps are never skewed — with the screen `w` px wide, centred on (cx, cy).
 */
export function straightPose(view: View, cx: number, cy: number, w: number, fov: number): RigPose {
  const q = new Quaternion().setFromEuler(new Euler(-HINGE, 0, 0));
  const f = focal(view, fov);
  const depth = (SCREEN_WIDTH * f) / w;
  const target = new Vector3(((cx - view.w / 2) * depth) / f, (-(cy - view.h / 2) * depth) / f, -depth);
  const t = target.sub(SCREEN_CENTER.clone().applyQuaternion(q));
  return { q, t, fov, hinge: HINGE };
}

/* ── fitting the model to the mockup ────────────────────────────────────── */

const quatFromVec = (rx: number, ry: number, rz: number) => {
  const angle = Math.hypot(rx, ry, rz);
  if (angle < 1e-9) return new Quaternion();
  return new Quaternion().setFromAxisAngle(new Vector3(rx / angle, ry / angle, rz / angle), angle);
};

const poseOf = (x: number[]): RigPose => ({
  q: quatFromVec(x[0], x[1], x[2]),
  t: new Vector3(x[3], x[4], x[5]),
  fov: x[6],
  hinge: x[7],
});

/** Screen corners must land exactly; the base's front corners guide the
 *  orientation (four coplanar points alone admit a mirrored solution). */
function residuals(x: number[], view: View, target: Quad, base: Pt2[]): number[] {
  const pose = poseOf(x);
  const r: number[] = [];
  screenQuad(pose, view).forEach(([px, py], i) => r.push(px - target[i][0], py - target[i][1]));
  const v = new Vector3();
  BASE_FRONT.forEach((c, i) => {
    project(c, pose, view, v);
    r.push(v.x - base[i][0], v.y - base[i][1]);
  });
  return r;
}

type Pt2 = [number, number];

function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const k = M[r][c] / d;
      for (let k2 = c; k2 <= n; k2++) M[r][k2] -= k * M[c][k2];
    }
  }
  return M.map((row, i) => row[n] / (row[i] || 1e-12));
}

/** Damped Gauss–Newton over rotation, translation and field of view. */
function refine(x0: number[], view: View, target: Quad, base: Pt2[]) {
  let x = [...x0];
  let lambda = 1e-2;
  let err = residuals(x, view, target, base).reduce((s, v) => s + v * v, 0);
  for (let it = 0; it < 120; it++) {
    const r = residuals(x, view, target, base);
    const J = x.map((_, j) => {
      const h = j < 3 ? 1e-4 : 1e-3;
      const xp = [...x];
      xp[j] += h;
      return residuals(xp, view, target, base).map((v, i) => (v - r[i]) / h);
    });
    const n = x.length;
    const A = Array.from({ length: n }, (_, a) =>
      Array.from({ length: n }, (_, b) => J[a].reduce((s, v, i) => s + v * J[b][i], 0) + (a === b ? lambda * (1 + J[a].reduce((s, v) => s + v * v, 0)) : 0)),
    );
    const g = Array.from({ length: n }, (_, a) => -J[a].reduce((s, v, i) => s + v * r[i], 0));
    const dx = solveLinear(A, g);
    const xn = x.map((v, i) => v + dx[i]);
    xn[6] = MathUtils.clamp(xn[6], 12, 100);
    xn[7] = MathUtils.clamp(xn[7], -0.9, 0.1);
    const en = residuals(xn, view, target, base).reduce((s, v) => s + v * v, 0);
    if (en < err) {
      x = xn;
      err = en;
      lambda *= 0.4;
      if (err < 1e-4) break;
    } else {
      lambda *= 4;
    }
  }
  return { x, err };
}

/**
 * Finds the pose whose screen lands on `target` (the mockup's screen corners,
 * in viewport px) with the base's front corners on `base`. Several starting
 * orientations are tried and the best fit wins.
 */
export function fitPose(view: View, target: Quad, base: Pt2[]): RigPose {
  const cx = target.reduce((s, p) => s + p[0], 0) / 4;
  const cy = target.reduce((s, p) => s + p[1], 0) / 4;
  const wpx = Math.hypot(target[1][0] - target[0][0], target[1][1] - target[0][1]);
  let best: { x: number[]; err: number } | null = null;

  // Starts bracket the photo's solution family (camera low, in front and a
  // little to the left); a wide sweep finds the same pose at 10× the cost.
  for (const yaw of [-0.45, -0.1]) {
    for (const pitch of [0.35, 0.75]) {
      for (const roll of [0.15, 0.5]) {
        const fov = 60;
        const f = focal(view, fov);
        const depth = (SCREEN_WIDTH * f) / wpx;
        const q = new Quaternion().setFromEuler(new Euler(pitch, yaw, roll));
        const tgt = new Vector3(((cx - view.w / 2) * depth) / f, (-(cy - view.h / 2) * depth) / f, -depth);
        const t = tgt.sub(SCREEN_CENTER.clone().applyQuaternion(q));
        const axis = new Vector3(q.x, q.y, q.z);
        const s = axis.length();
        const angle = 2 * Math.atan2(s, q.w);
        const rv = s > 1e-9 ? axis.multiplyScalar(angle / s) : new Vector3();
        const fit = refine([rv.x, rv.y, rv.z, t.x, t.y, t.z, fov, HINGE], view, target, base);
        const pose = poseOf(fit.x);
        const lip = project(BASE_FRONT[0], pose, view);
        if (lip.z > 0 && pose.t.z < 0 && (!best || fit.err < best.err)) best = fit;
      }
    }
  }
  return poseOf(best!.x);
}

/** Pose between two keyframes; rotation is slerped so it never wobbles. */
export function mixPose(a: RigPose, b: RigPose, k: number, out: RigPose): RigPose {
  out.q.slerpQuaternions(a.q, b.q, k);
  out.t.lerpVectors(a.t, b.t, k);
  out.fov = a.fov + (b.fov - a.fov) * k;
  out.hinge = a.hinge + (b.hinge - a.hinge) * k;
  return out;
}
