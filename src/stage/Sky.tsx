import { useEffect, useRef } from "react";

/**
 * The sky from the mockup, rendered live: a deep-to-bright blue gradient with
 * two layers of domain-warped cumulus that drift with the wind and slide past
 * faster as you scroll, so clouds genuinely enter and leave the frame.
 *
 * `drift` is read every frame — the stage writes scroll progress into it.
 */
interface Props {
  drift: React.MutableRefObject<number>;
  reduced: boolean;
}

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uDrift;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 R = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 6; i++) {
    s += a * noise(p);
    p = R * p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
}

/* One cloud layer: density in [0,1] plus a lit/shadowed term. */
vec2 clouds(vec2 p, float cover, float soft) {
  vec2 w = vec2(fbm(p * 0.6 + vec2(3.1, 1.7)), fbm(p * 0.6 + vec2(8.3, 2.8)));
  float d = fbm(p + w * 1.6);
  // Large-scale field decides where cloud banks exist at all, so whole
  // formations slide in and out of frame instead of a uniform texture.
  float bank = smoothstep(0.28, 0.62, fbm(p * 0.3 + vec2(11.0, 4.0)));
  float dens = smoothstep(cover, cover + soft, d * bank * 1.25);
  // Light from the upper right: sample slightly toward the sun.
  float lit = fbm(p + w * 1.6 + vec2(0.05, 0.04));
  float shade = clamp((d - lit) * 6.0 + 0.6, 0.0, 1.0);
  return vec2(dens, shade);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;

  // Sky gradient sampled from the mockup: deep cobalt upper-left,
  // brightening toward the right and the lower edge.
  vec3 deep  = vec3(0.157, 0.314, 0.667);  // #2850aa
  vec3 mid   = vec3(0.192, 0.373, 0.749);  // #315fbf
  vec3 light = vec3(0.314, 0.498, 0.906);  // #507fe7
  vec3 haze  = vec3(0.467, 0.608, 0.937);  // #779bef
  float g = clamp(uv.x * 0.8 + (1.0 - uv.y) * 0.2, 0.0, 1.0);
  vec3 sky = mix(deep, mid, smoothstep(0.0, 0.5, g));
  sky = mix(sky, light, smoothstep(0.55, 1.0, g));
  sky = mix(sky, haze, smoothstep(0.6, 1.0, uv.x * (1.0 - uv.y)) * 0.5);

  vec2 base = vec2(uv.x * aspect, uv.y);
  float t = uTime;

  // Composition, as in the photograph: clouds mass toward the frame's edges
  // and thin out through the middle, where the type and the devices sit.
  float edge = smoothstep(0.18, 0.62, length((uv - vec2(0.48, 0.52)) * vec2(1.25, 1.0)));
  float mask = mix(0.35, 1.0, edge);

  // Far layer: slower, thinner, bluer.
  vec2 pf = base * 1.25 + vec2(t * 0.008 + uDrift * 0.45, t * 0.0012 + uDrift * 0.06);
  vec2 far = clouds(pf, 0.3, 0.32);
  vec3 farCol = mix(vec3(0.55, 0.64, 0.90), vec3(0.86, 0.90, 0.99), far.y);
  vec3 col = mix(sky, farCol, far.x * 0.45 * mask);

  // Near layer: big soft masses, brighter and faster — closer to camera.
  vec2 pn = base * 0.62 + vec2(t * 0.014 + uDrift * 1.05 + 40.0, -t * 0.0015 + uDrift * 0.14 + 9.0);
  vec2 near = clouds(pn, 0.28, 0.22);
  vec3 nearCol = mix(vec3(0.62, 0.70, 0.93), vec3(1.0), smoothstep(0.2, 0.9, near.y));
  col = mix(col, nearCol, near.x * 0.95 * mask);

  // Gentle vignette keeps the frame's edges deep, like the photograph.
  float v = smoothstep(1.25, 0.35, length((uv - vec2(0.55, 0.5)) * vec2(1.1, 1.0)));
  col *= mix(0.92, 1.0, v);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function Sky({ drift, reduced }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) {
      if (import.meta.env.DEV) console.warn("[sky] no WebGL; using the CSS sky");
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (import.meta.env.DEV && !gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn("[sky]", gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (import.meta.env.DEV) console.warn("[sky]", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uDrift = gl.getUniformLocation(prog, "uDrift");

    // Clouds are soft; rendering below device resolution costs nothing visible.
    const resize = () => {
      const scale = Math.min(0.75, 1400 / window.innerWidth);
      canvas.width = Math.round(window.innerWidth * scale);
      canvas.height = Math.round(window.innerHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let smooth = drift.current;
    const start = performance.now();
    // Start mid-drift so the first frame already has formed clouds on screen.
    const t0 = 40;
    const frame = (now: number) => {
      smooth += (drift.current - smooth) * 0.08;
      const t = reduced ? t0 : t0 + (now - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uDrift, smooth);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = "1";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      // Free resources but keep the context: the canvas may be re-used by a
      // remount (StrictMode), and a lost context cannot be recovered.
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [drift, reduced]);

  return <canvas ref={canvasRef} className="sky" aria-hidden="true" />;
}
