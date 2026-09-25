/**
 * Stage geometry. Coordinates come straight from the Figma "Portfolio" frame
 * (2000 × 1500 sky, Kode Mono type, `macbook 1` at 371,186 and the white
 * screen vector `Rectangle 12` on top of it).
 */

export const POSTER = { w: 2000, h: 1500 } as const;

/** Virtual resolution the laptop apps are authored at: 1280 wide, at the
 *  model screen's own aspect (8.30 by 5.37). */
export const SCREEN = { w: 1280, h: 828 } as const;

/** Virtual resolution of the phone apps (iPhone 15/16 Pro points). */
export const PHONE = { w: 393, h: 852, bezel: 13, radius: 62 } as const;

export type Pt = [number, number];
export type Quad = [Pt, Pt, Pt, Pt];

/** Where the laptop sat in the Figma frame (`macbook 1` layer box), and its
 *  screen corners in that box (TL, TR, BR, BL), measured from `Rectangle 12`.
 *  The 3D model is fitted onto these so the opening matches the mockup. */
const LAPTOP = { x: 371, y: 186, w: 1048, h: 1139 } as const;
const MOCKUP_SCREEN: Quad = [
  [226, 265],
  [803, 18],
  [902, 516],
  [366, 617],
];
/** Front-left and front-right corners of the base, from the photo's alpha. */
const MOCKUP_BASE_FRONT: [Pt, Pt] = [
  [15, 1028],
  [1030, 1118],
];

/* ── homography ─────────────────────────────────────────────────────────── */

type M3 = number[];

const adj = (m: M3): M3 => [
  m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
];

const mulMM = (a: M3, b: M3): M3 => {
  const c: M3 = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j];
      c[3 * i + j] = s;
    }
  return c;
};

const mulMV = (m: M3, v: number[]) => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];

const basisToPoints = (q: Quad): M3 => {
  const m = [q[0][0], q[1][0], q[3][0], q[0][1], q[1][1], q[3][1], 1, 1, 1];
  const v = mulMV(adj(m), [q[2][0], q[2][1], 1]);
  return mulMM(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
};

/** CSS matrix3d that maps a w×h box (transform-origin 0 0) onto `quad`. */
export function quadMatrix(w: number, h: number, quad: Quad): string {
  const src: Quad = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const t = mulMM(basisToPoints(quad), adj(basisToPoints(src)));
  const n = t.map((x) => x / t[8]);
  return `matrix3d(${n[0]},${n[3]},0,${n[6]},${n[1]},${n[4]},0,${n[7]},0,0,1,0,${n[2]},${n[5]},0,${n[8]})`;
}

/** The inverse of quadMatrix: a viewport point back to local px on the w × h surface. */
export function unquad(w: number, h: number, quad: Quad, x: number, y: number): Pt {
  const src: Quad = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const inv = mulMM(basisToPoints(src), adj(basisToPoints(quad)));
  const [X, Y, W] = mulMV(inv, [x, y, 1]);
  return [X / W, Y / W];
}

/* ── layout ─────────────────────────────────────────────────────────────── */

export interface Pose {
  x: number;
  y: number;
  r: number;
  s: number;
}

export interface Layout {
  vw: number;
  vh: number;
  narrow: boolean;
  /** Poster origin and scale — the Figma frame mapped into the viewport. */
  poster: { x: number; y: number; u: number };
  /** Where the Figma frame's origin lands for each title group. On wide
   *  screens both equal the poster origin; on narrow screens "high on" is
   *  pinned top-left and "java" bottom-right so neither is cropped. */
  title: { top: { x: number; y: number }; java: { x: number; y: number } };
  laptop: {
    /** The mockup's screen, in viewport px — the 3D model is fitted to it. */
    introQuad: Quad;
    /** The mockup's base front corners, in viewport px. */
    introBase: [Pt, Pt];
    /** Straight-on screen: centre and width in px. */
    app: { cx: number; cy: number; w: number };
    /** How far up (px) the laptop travels when it leaves. */
    exit: number;
    /** How far right (px) it slides when the paper takes the frame. */
    aside: number;
  };
  /** The frame the paper tour plays in. */
  tour: { x: number; y: number; w: number; h: number };
  phone: { in: Pose; below: Pose; gone: Pose };
}

export function computeLayout(vw: number, vh: number): Layout {
  const narrow = vw < 820 || vw / vh < 0.9;

  // Wide: the poster is contained, exactly like the mockup. Narrow: the type
  // is sized so "high" and "java" each span the width, and the three groups
  // are anchored to the viewport's corners instead of a shared frame.
  const u = narrow ? Math.min(vw / 1040, vh / 1750) : Math.min(vw / POSTER.w, vh / POSTER.h);
  const px = (vw - POSTER.w * u) / 2;
  const py = (vh - POSTER.h * u) / 2;

  // Ink extents measured from the mockup: "high" starts at x 32, top 62;
  // "java" ends at x 1973, bottom 1463.
  const title = narrow
    ? {
        top: { x: 14 - 32 * u, y: 64 - 62 * u },
        java: { x: vw - 14 - 1973 * u, y: vh - 56 - 1463 * u },
      }
    : { top: { x: px, y: py }, java: { x: px, y: py } };

  // On phones the laptop sits a little smaller than the type, between the lines.
  const lu = narrow ? u * 0.78 : u;
  const lx = narrow ? (vw - LAPTOP.w * lu) / 2 + 40 * lu : px + LAPTOP.x * u;
  const ly = narrow ? vh * 0.52 - LAPTOP.h * lu * 0.5 : py + LAPTOP.y * u;
  const introQuad = MOCKUP_SCREEN.map(([x, y]) => [lx + x * lu, ly + y * lu]) as Quad;
  const introBase = MOCKUP_BASE_FRONT.map(([x, y]) => [lx + x * lu, ly + y * lu]) as [Pt, Pt];

  const app = narrow
    ? // leaves a gutter on the right for the project index
      { cx: vw * 0.45, cy: vh * 0.27, w: vw * 0.84 }
    : { cx: vw * 0.61, cy: vh * 0.45, w: Math.min(vw * 0.56, vh * 0.62 * 1.545) };

  // Phone: height-led on wide screens, centred over the same point as the laptop screen.
  const phoneH = narrow ? vh * 0.6 : vh * 0.84;
  const ps = phoneH / (PHONE.h + PHONE.bezel * 2);
  const phoneW = (PHONE.w + PHONE.bezel * 2) * ps;
  const pcx = narrow ? vw * 0.5 : vw * 0.62;
  const pcy = narrow ? vh * 0.36 : vh * 0.5;
  const phoneIn: Pose = { x: pcx - phoneW / 2, y: pcy - phoneH / 2, r: 0, s: ps };

  return {
    vw,
    vh,
    narrow,
    poster: { x: px, y: py, u },
    title,
    laptop: { introQuad, introBase, app, exit: vh * 1.6, aside: vw * 0.85 },
    tour: narrow
      ? { x: vw * 0.04, y: vh * 0.08, w: vw * 0.82, h: vh * 0.5 }
      : { x: vw * 0.355, y: vh * 0.07, w: vw * 0.585, h: vh * 0.86 },
    phone: {
      in: phoneIn,
      below: { ...phoneIn, y: phoneIn.y + vh * 1.2, r: 6 },
      gone: { ...phoneIn, y: phoneIn.y + vh * 1.15, r: -5 },
    },
  };
}
