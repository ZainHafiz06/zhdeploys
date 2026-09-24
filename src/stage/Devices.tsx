import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PHONE, SCREEN, quadMatrix, type Layout } from "./geometry";
import { fitPose, mixPose, screenQuad, straightPose, type RigPose } from "./laptopRig";
import { Mug } from "./Mug";
import { HazeApp } from "./apps/HazeApp";
import { MunApp } from "./apps/MunApp";
import { ResearchApp } from "./apps/ResearchApp";
import { VaqfaApp } from "./apps/VaqfaApp";
import { NiteApp } from "./apps/NiteApp";

/** Scroll-driven laptop state, written by the timeline. p: mockup → straight
 *  on. q: straight on → gone. */
export interface LaptopCtrl {
  p: number;
  q: number;
  /** 0 → 1: slid off to the side while the paper tour plays. */
  s: number;
}

const APP_FOV = 22;

/** A sky-coloured studio: the aluminium reflects the same blues as the page. */
function skyEnvironment(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: "varying vec3 v; void main(){ v = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: `varying vec3 v; void main(){
        float y = v.y;
        vec3 top = vec3(0.12,0.27,0.66), horizon = vec3(0.70,0.77,0.96), low = vec3(0.30,0.38,0.62);
        vec3 c = y > 0. ? mix(horizon, top, pow(y, .6)) : mix(horizon, low, pow(-y, .5));
        gl_FragColor = vec4(c, 1.); }`,
    }),
  );
  scene.add(sky);
  // Soft cloud-bright panels, like the big highlights in the photograph.
  const panel = (x: number, y: number, z: number, s: number, i: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s * 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(i, i, i * 1.04) }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(18, 16, 14, 26, 1.6);
  panel(-20, 4, 18, 18, 1.1);
  panel(0, -18, 20, 30, 0.9);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  return env;
}

/**
 * The MacBook (public/stage/mac.glb, pmndrs/examples, MIT). It opens in the
 * mockup's pose — fitted so its screen lands exactly on the Figma screen — and
 * turns to face you square-on, so the apps on it are never skewed.
 */
export function Laptop({ layout, ctrl, reduced }: { layout: Layout; ctrl: React.MutableRefObject<LaptopCtrl>; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);

  const poses = useMemo(() => {
    const view = { w: layout.vw, h: layout.vh };
    const intro = fitPose(view, layout.laptop.introQuad, layout.laptop.introBase);
    const app = straightPose(view, layout.laptop.app.cx, layout.laptop.app.cy, layout.laptop.app.w, APP_FOV);
    // Pixels → world units at the straight-on depth, for the exit.
    const f = layout.vh / 2 / Math.tan(THREE.MathUtils.degToRad(APP_FOV) / 2);
    const exitWorld = (layout.laptop.exit * -app.t.z) / f;
    const asideWorld = (layout.laptop.aside * -app.t.z) / f;
    return { view, intro, app, exitWorld, asideWorld };
  }, [layout]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const screen = screenRef.current!;
    const rig = rigRef.current!;
    const { view, intro, app, exitWorld, asideWorld } = poses;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      rig.classList.add("no-gl");
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(intro.fov, view.w / view.h, 0.1, 500);
    const model = new THREE.Group();
    scene.add(model);
    let loaded = false;
    let flip: THREE.Object3D | null = null;

    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(view.w, view.h, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      scene.environment = skyEnvironment(renderer);
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(-4, 12, 10);
      const rim = new THREE.DirectionalLight(0xb9c8ff, 1.1);
      rim.position.set(10, 2, -6);
      scene.add(key, rim, new THREE.AmbientLight(0xd6dcff, 0.5));

      new GLTFLoader().load("/stage/mac.glb", (gltf) => {
        gltf.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.name.startsWith("screen")) {
            // The DOM screen sits on top; underneath, a black panel.
            mesh.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
          } else if (mat.name === "aluminium") {
            // Bright, slightly lavender aluminium, as in the photograph.
            mat.color.set("#e4e5ef");
            mat.metalness = 0.82;
            mat.roughness = 0.34;
            mat.envMapIntensity = 1.0;
          } else if (mat.name.startsWith("matte")) {
            mat.color.set("#050507");
            mat.roughness = 0.35;
          }
        });
        flip = gltf.scene.getObjectByName("screenflip") ?? null;
        model.add(gltf.scene);
        loaded = true;
        rig.classList.add("is-loaded");
      });
    }

    const pose: RigPose = { q: new THREE.Quaternion(), t: new THREE.Vector3(), fov: intro.fov, hinge: intro.hinge };
    const bob = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const start = performance.now();
    let raf = 0;
    let lastKey = "";

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const { p, q, s } = ctrl.current;
      const time = (now - start) / 1000;

      mixPose(intro, app, p, pose);
      // Ambient float: a slow bob always; a slight sway only while angled,
      // so the straight-on screen stays perfectly square.
      if (!reduced) {
        pose.t.y += Math.sin(time * 0.7) * 0.05;
        euler.set(Math.sin(time * 0.5) * 0.012 * (1 - p), Math.sin(time * 0.37) * 0.018 * (1 - p), 0);
        pose.q.multiply(bob.setFromEuler(euler));
      }
      pose.t.y += q * exitWorld;
      // Translation only, so the screen stays perfectly square as it slides.
      pose.t.x += s * asideWorld;

      const key = `${p.toFixed(5)}|${q.toFixed(5)}|${s.toFixed(5)}|${reduced ? 0 : Math.round(time * 60)}|${loaded}`;
      if (key === lastKey) return;
      lastKey = key;

      const hidden = q >= 1 || s >= 1;
      rig.style.visibility = hidden ? "hidden" : "";
      if (hidden) return;

      screen.style.transform = quadMatrix(SCREEN.w, SCREEN.h, screenQuad(pose, view));

      if (renderer && loaded) {
        model.quaternion.copy(pose.q);
        model.position.copy(pose.t);
        flip?.rotation.set(pose.hinge, 0, 0);
        camera.fov = pose.fov;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      scene.environment?.dispose();
      renderer?.dispose();
    };
  }, [poses, ctrl, reduced]);

  return (
    <div className="laptop" ref={rigRef}>
      <canvas className="laptop-canvas" ref={canvasRef} style={{ width: layout.vw, height: layout.vh }} />
      <div className="screen" ref={screenRef} style={{ width: SCREEN.w, height: SCREEN.h }}>
        <HazeApp />
        <MunApp />
        <ResearchApp />
        <VaqfaApp />
        <Mug />
        <div className="screen-glare" />
        <div className="pointer">
          <div className="pointer-body">
            <svg className="pointer-arrow" viewBox="0 0 28 40" aria-hidden="true">
              <path d="M2 2v31l8.2-7.6 5.3 12.1 5.1-2.2-5.3-11.9H26Z" fill="#111" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
            </svg>
            <i className="pointer-dot" />
          </div>
          <i className="pointer-ripple" />
        </div>
      </div>
    </div>
  );
}

/** An iPhone-proportioned frame built in CSS, running nite at 393 × 852 pt. */
export function Phone() {
  const W = PHONE.w + PHONE.bezel * 2;
  const H = PHONE.h + PHONE.bezel * 2;
  return (
    <div className="phone" style={{ width: W, height: H }}>
      <div className="phone-float">
        <i className="phone-btn b1" />
        <i className="phone-btn b2" />
        <i className="phone-btn b3" />
        <i className="phone-btn b4" />
        <div className="phone-body">
          <div className="phone-screen" style={{ width: PHONE.w, height: PHONE.h }}>
            <NiteApp />
            <i className="phone-island" />
            <i className="phone-home" />
            <div className="touch">
              <i className="touch-dot" />
              <i className="touch-ring" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
