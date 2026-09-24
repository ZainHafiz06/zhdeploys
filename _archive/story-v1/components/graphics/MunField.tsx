import { useEffect, useRef } from "react";
import { cappedDpr, isLowPower } from "../../motion/useDeviceTier";
import { useReducedMotion } from "../../motion/useReducedMotion";

export interface MunFieldHandle {
  /** 0 = MŪN sphere, 1 = routing network. */
  morph: number;
  /** Scroll velocity, normalised. */
  velocity: number;
  /** Overall opacity, for chapter hand-off. */
  opacity: number;
}

const VERT = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aSeed;
  uniform float uTime;
  uniform float uMorph;
  uniform float uSize;
  uniform float uDpr;
  uniform vec2 uPointer;
  varying float vAlpha;

  void main() {
    vec3 base = position;

    // Flowing wave topology across the sphere — the density bands of the mark.
    float band = sin(base.y * 6.0 + sin(base.x * 3.0 + uTime * 0.12) * 1.6 + uTime * 0.09);
    float ink = smoothstep(0.15, 0.95, band * 0.5 + 0.5);

    // Low-amplitude breathing along the normal.
    vec3 sphere = base * (1.0 + sin(uTime * 0.5 + aSeed * 6.2831) * 0.012);

    // Pointer parallax: a gentle lean, never a spin.
    sphere.xy += uPointer * 0.06 * (0.4 + aSeed * 0.6);

    vec3 pos = mix(sphere, aScatter, uMorph);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // In network mode every node is equally present; on the sphere the bands read.
    vAlpha = mix(0.10 + ink * 0.9, 0.75, uMorph);

    // uSize is a world-space radius; 300 converts it to drawing-buffer pixels
    // at this camera distance and field of view.
    gl_PointSize = uSize * uDpr * (1.0 + uMorph * 0.35) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;
    float edge = smoothstep(0.25, 0.08, d);
    gl_FragColor = vec4(uColor, vAlpha * edge * uOpacity);
  }
`;

/**
 * The MŪN point field. Sphere by default; under scroll it separates into the
 * routing network of the research chapter. A procedural interpretation — the
 * original mark still appears as artwork elsewhere in the chapter.
 */
export function MunField({ handleRef }: { handleRef: React.MutableRefObject<MunFieldHandle> }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;

      const low = isLowPower();
      const COUNT = low ? 2200 : 6200;
      const RADIUS = 1.35;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 4.2;

      const renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(cappedDpr());
      host.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";

      const positions = new Float32Array(COUNT * 3);
      const scatter = new Float32Array(COUNT * 3);
      const seeds = new Float32Array(COUNT);
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < COUNT; i++) {
        // Fibonacci sphere — even coverage, no polar clustering.
        const y = 1 - (i / (COUNT - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = golden * i;
        positions[i * 3] = Math.cos(theta) * r * RADIUS;
        positions[i * 3 + 1] = y * RADIUS;
        positions[i * 3 + 2] = Math.sin(theta) * r * RADIUS;

        // Network layout: layered columns, like models arranged across a route.
        // Five lanes — one per consideration the routing question weighs.
        const lane = i % 5;
        const spread = (i / COUNT) * 2 - 1;
        scatter[i * 3] = (lane - 2) * 0.34 + (Math.random() - 0.5) * 0.16;
        scatter[i * 3 + 1] = spread * 1.25 + (Math.random() - 0.5) * 0.12;
        scatter[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        seeds[i] = Math.random();
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

      const uniforms = {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uSize: { value: low ? 0.030 : 0.034 },
        uDpr: { value: cappedDpr() },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uOpacity: { value: 1 },
        uColor: { value: new THREE.Color("#ffffff") },
      };

      const material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Routing paths between a sparse subset of nodes — only visible in network mode.
      const LINKS = low ? 90 : 220;
      const linkPositions = new Float32Array(LINKS * 6);
      for (let i = 0; i < LINKS; i++) {
        const a = Math.floor(Math.random() * COUNT);
        const b = Math.floor(Math.random() * COUNT);
        for (let k = 0; k < 3; k++) {
          linkPositions[i * 6 + k] = scatter[a * 3 + k];
          linkPositions[i * 6 + 3 + k] = scatter[b * 3 + k];
        }
      }
      const linkGeo = new THREE.BufferGeometry();
      linkGeo.setAttribute("position", new THREE.BufferAttribute(linkPositions, 3));
      const linkMat = new THREE.LineBasicMaterial({ color: 0x8fb8ff, transparent: true, opacity: 0 });
      const links = new THREE.LineSegments(linkGeo, linkMat);
      scene.add(links);

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      const pointerTarget = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointerTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
      };
      if (!low) window.addEventListener("pointermove", onPointer, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "10%" });
      io.observe(host);

      let raf = 0;
      let last = performance.now();
      let spin = 0;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!visible) return;

        const handle = handleRef.current;
        uniforms.uTime.value += dt;
        uniforms.uMorph.value += (handle.morph - uniforms.uMorph.value) * Math.min(1, dt * 4);
        uniforms.uOpacity.value += (handle.opacity - uniforms.uOpacity.value) * Math.min(1, dt * 5);
        uniforms.uPointer.value.x += (pointerTarget.x - uniforms.uPointer.value.x) * Math.min(1, dt * 2.2);
        uniforms.uPointer.value.y += (pointerTarget.y - uniforms.uPointer.value.y) * Math.min(1, dt * 2.2);

        linkMat.opacity = Math.max(0, uniforms.uMorph.value - 0.3) * 0.75 * uniforms.uOpacity.value;

        // Base drift plus a nudge from scroll velocity. The spin belongs to the
        // sphere; the network is a diagram and must hold still to be read.
        const morph = uniforms.uMorph.value;
        spin += dt * (0.055 + Math.min(0.5, Math.abs(handle.velocity)) * 0.5);
        const settle = 1 - morph;

        points.rotation.y = spin * settle;
        points.rotation.x = Math.sin(spin * 0.4) * 0.12 * settle + morph * 0.1;
        links.rotation.copy(points.rotation);

        // As it becomes a diagram it clears the column of copy on the left.
        points.position.x = morph * 0.12;
        points.position.y = morph * -0.02;
        points.scale.setScalar(1 - morph * 0.12);
        links.position.copy(points.position);
        links.scale.copy(points.scale);

        renderer.render(scene, camera);
      };

      if (reduced) {
        uniforms.uMorph.value = handleRef.current.morph;
        renderer.render(scene, camera);
      } else {
        raf = requestAnimationFrame(frame);
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("pointermove", onPointer);
        geometry.dispose();
        material.dispose();
        linkGeo.dispose();
        linkMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [handleRef, reduced]);

  return <div ref={hostRef} className="mun-canvas" aria-hidden="true" />;
}
