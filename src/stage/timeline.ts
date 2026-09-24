import { createTimeline, onScroll, stagger, type Timeline } from "animejs";
import type { Layout, Pose } from "./geometry";
import { BLURBS, END, OUTRO, SWAP } from "./story";
import { MUN_ANSWER, MUN_QUERY } from "./apps/MunApp";
import { VQ_OPEN } from "./apps/VaqfaApp";
import type { LaptopCtrl } from "./Devices";

/**
 * Builds the one timeline that drives the home page. One beat = 1000 ms of
 * timeline = one viewport of scroll. Every tween states its `from` value
 * explicitly and every scrubber is a pure function of time, so the page is
 * identical whether you arrive at a beat scrolling down or scrolling up.
 */

const U = 1000;

type Targets = string | Element | Element[] | NodeListOf<Element> | LaptopCtrl | null;
type Params = Record<string, unknown>;
type Scrub = { t0: number; t1: number; fn: (p: number) => void; last: number };

export interface Built {
  tl: Timeline;
  /** Current beat, for the index and the sky. */
  onBeat: (cb: (beat: number) => void) => void;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function mixHex(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(",")})`;
}

/** Sum of layout offsets up to the document, ignoring transforms. */
function docOffset(el: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) {
    x += e.offsetLeft;
    y += e.offsetTop;
  }
  return { x, y };
}

/** Layout box of `el` relative to `frame` — both inside the same device screen. */
function offsetIn(el: HTMLElement, frame: HTMLElement) {
  const a = docOffset(el);
  const b = docOffset(frame);
  return { x: a.x - b.x, y: a.y - b.y, w: el.offsetWidth, h: el.offsetHeight };
}

export function buildTimeline(root: HTMLElement, track: HTMLElement, L: Layout, lap: LaptopCtrl): Built {
  const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const $$ = (sel: string) => root.querySelectorAll(sel);

  const scrubs: Scrub[] = [];
  const beatListeners: ((b: number) => void)[] = [];
  let lastBeat = -1;

  const runScrubs = (time: number) => {
    const beat = time / U;
    for (const s of scrubs) {
      const p = clamp01((beat - s.t0) / (s.t1 - s.t0));
      if (p !== s.last) {
        s.last = p;
        s.fn(p);
      }
    }
    if (beat !== lastBeat) {
      lastBeat = beat;
      beatListeners.forEach((cb) => cb(beat));
    }
  };

  // composition "none": every tween states its own `from`, and each property's
  // segments are continuous, so no tween needs to hand its value to a sibling.
  // Anime's default ("replace") links siblings into hand-off chains that can
  // leave a stale value behind after a long backward jump — the exact failure
  // this page must never show.
  const tl = createTimeline({
    autoplay: false,
    defaults: { ease: "inOutQuad", composition: "none" },
    onUpdate: (self) => runScrubs(self.currentTime),
  });

  /* ── primitives ─────────────────────────────────────────────────────── */

  const add = (targets: Targets, t0: number, t1: number, params: Params, e: string = "inOutQuad") => {
    if (!targets || (targets as NodeListOf<Element>).length === 0) return;
    tl.add(targets as never, { ...params, duration: Math.max(1, (t1 - t0) * U), ease: e }, t0 * U);
  };
  const scrub = (t0: number, t1: number, fn: (p: number) => void) => scrubs.push({ t0, t1, fn, last: -1 });

  /** Cross-fade with a touch of haze: the outgoing view blurs away, the incoming one clears. */
  const swapViews = (out: Targets, into: Targets, t: number, d = 0.14) => {
    add(out, t, t + d, { opacity: [1, 0], filter: ["blur(0px)", "blur(6px)"], scale: [1, 0.985] }, "inOutSine");
    add(into, t + d * 0.35, t + d * 1.2, { opacity: [0, 1], filter: ["blur(6px)", "blur(0px)"], scale: [1.012, 1] }, "outCubic");
  };
  const fade = (t: Targets, t0: number, t1: number, from: number, to: number) =>
    add(t, t0, t1, { opacity: [from, to] }, "inOutSine");

  const setText = (el: HTMLElement | null, text: string) => {
    if (el && el.textContent !== text) el.textContent = text;
  };
  const typeInto = (el: HTMLElement, text: string, t0: number, t1: number) =>
    scrub(t0, t1, (p) => setText(el, text.slice(0, Math.round(p * text.length))));

  /* ── a pointer that lives inside a device screen ────────────────────── */

  function makePointer(sel: string, bodySel: string, rippleSel: string, start: [number, number]) {
    const el = $(sel);
    const body = $(bodySel);
    const ripple = $(rippleSel);
    let at = start;
    el.style.transform = `translate(${start[0]}px, ${start[1]}px)`;
    return {
      move(t0: number, t1: number, to: [number, number], e = "inOutCubic") {
        add(el, t0, t1, { translateX: [at[0], to[0]], translateY: [at[1], to[1]] }, e);
        at = to;
      },
      /** Hold still, then press. */
      click(t: number) {
        add(body, t, t + 0.03, { scale: [1, 0.8] }, "outQuad");
        add(body, t + 0.03, t + 0.08, { scale: [0.8, 1] }, "outBack(2)");
        // Opacity stays continuous across clicks (0 → 0.7 → 0), so a ripple
        // can never flash between presses whichever way you scroll.
        add(ripple, t + 0.004, t + 0.01, { opacity: [0, 0.7] }, "linear");
        add(ripple, t + 0.01, t + 0.13, { scale: [0.2, 1.4], opacity: [0.7, 0] }, "outQuad");
      },
      get at() {
        return at;
      },
    };
  }

  const pose = (el: Targets, t0: number, t1: number, a: Pose, b: Pose, e = "inOutCubic") =>
    add(el, t0, t1, { translateX: [a.x, b.x], translateY: [a.y, b.y], rotate: [a.r, b.r], scale: [a.s, b.s] }, e);

  /* ── stage: title, laptop, phone ────────────────────────────────────── */

  const phone = $(".phone");

  // Initial poses (beat 0), written directly so the first paint is right.
  const setPose = (el: HTMLElement, p: Pose) => {
    el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) scale(${p.s})`;
  };
  setPose(phone, L.phone.below);

  // "high on java" scrolls up and out like the top of a page.
  const lift = -(L.vh * 1.15 + L.poster.u * 600);
  add(".t-high", 0.02, 1.0, { translateY: [0, lift] }, "inQuad");
  add(".t-on", 0.05, 1.03, { translateY: [0, lift] }, "inQuad");
  add(".t-java", 0.08, 1.08, { translateY: [0, lift * 1.1] }, "inQuad");
  fade(".scroll-cue", 0, 0.1, 1, 0);

  // The 3D laptop turns from the mockup's angle to face you square-on.
  add(lap, 0.2, 1.3, { p: [0, 1] }, "inOutCubic");
  fade(".screen-mug", 0.85, 1.2, 1, 0);
  add(".hz", 0.9, 1.3, { filter: ["blur(8px)", "blur(0px)"] }, "outCubic");
  fade(".scrim", 0.95, 1.3, 0, 1);

  /* ── HAZE ───────────────────────────────────────────────────────────── */

  const hz = $(".hz");
  const hzPt = (sel: string, ax = 0.5, ay = 0.5, dy = 0): [number, number] => {
    const r = offsetIn(hz.querySelector<HTMLElement>(sel)!, hz);
    return [r.x + r.w * ax, r.y + r.h * ay + dy];
  };
  const ptr = makePointer(".pointer", ".pointer-body", ".pointer-ripple", [1040, 700]);

  fade(".pointer", 1.28, 1.38, 0, 1);

  // Hover the preview: each component sharpens out of the haze and names itself.
  const reveal = (part: string, t: number) => {
    add(`${part}`, t, t + 0.1, { filter: ["blur(2.4px)", "blur(0px)"], opacity: [0.7, 1], outlineColor: ["rgba(124,92,255,0)", "rgba(124,92,255,0.9)"] }, "outCubic");
    add(`${part} .hz-tag`, t + 0.03, t + 0.1, { opacity: [0, 1], translateY: [6, 0] }, "outCubic");
  };
  const unfocus = (part: string, t: number) => {
    add(`${part}`, t, t + 0.08, { outlineColor: ["rgba(124,92,255,0.9)", "rgba(124,92,255,0)"] });
    add(`${part} .hz-tag`, t, t + 0.08, { opacity: [1, 0] });
  };
  ptr.move(1.42, 1.58, hzPt(".hz-part-nav", 0.62, 0.55));
  reveal(".hz-part-nav", 1.58);
  ptr.move(1.76, 1.9, hzPt(".hz-part-card", 0.55, 0.45));
  unfocus(".hz-part-nav", 1.78);
  reveal(".hz-part-card", 1.9);
  ptr.move(2.04, 2.15, hzPt(".hz-part-btn", 0.55, 0.6));
  unfocus(".hz-part-card", 2.05);
  reveal(".hz-part-btn", 2.15);
  unfocus(".hz-part-btn", 2.3);
  add(".hz-part-input, .hz-part-grid", 2.28, 2.4, { filter: ["blur(2.4px)", "blur(0px)"], opacity: [0.65, 1] }, "outCubic");

  // Switch the package manager.
  const npm = offsetIn(hz.querySelector<HTMLElement>(".hz-pm-npm")!, hz.querySelector<HTMLElement>(".hz-install-tabs")!);
  const pnpm = offsetIn(hz.querySelector<HTMLElement>(".hz-pm-pnpm")!, hz.querySelector<HTMLElement>(".hz-install-tabs")!);
  $(".hz-pm-ink").style.left = `${npm.x}px`;
  $(".hz-pm-ink").style.width = `${npm.w}px`;
  ptr.move(2.3, 2.42, hzPt(".hz-pm-pnpm", 0.5, 0.55));
  ptr.click(2.44);
  add(".hz-pm-ink", 2.45, 2.53, { translateX: [0, pnpm.x - npm.x], width: [`${npm.w}px`, `${pnpm.w}px`] }, "outCubic");
  add(".hz-pm-npm", 2.45, 2.5, { color: ["#14131c", "#6d6b80"] });
  add(".hz-pm-pnpm", 2.45, 2.5, { color: ["#6d6b80", "#14131c"] });
  add(".hz-cmd-npm", 2.45, 2.52, { opacity: [1, 0], translateY: [0, -8] });
  add(".hz-cmd-pnpm", 2.48, 2.56, { opacity: [0, 1], translateY: [8, 0] });

  // Browse Components.
  ptr.move(2.56, 2.68, hzPt(".hz-browse", 0.5, 0.55));
  ptr.click(2.7);
  swapViews(".hz-landing", ".hz-browser", 2.72, 0.15);

  // Scroll the navbar list down to Navbar 03.
  const list = hz.querySelector<HTMLElement>(".hz-list")!;
  const item3 = offsetIn(hz.querySelector<HTMLElement>(".hz-item-03")!, list);
  const listShift = -(item3.y - 250);
  add(".hz-list", 2.95, 3.4, { translateY: [0, listShift] }, "inOutCubic");
  ptr.move(2.95, 3.35, [860, 520], "inOutSine");
  const cust = hzPt(".hz-customize", 0.5, 0.55, listShift);
  ptr.move(3.38, 3.5, cust);
  ptr.click(3.52);
  swapViews(".hz-browser", ".hz-detail", 3.55, 0.15);

  // Tune: accent swatch, then drag the radius.
  const detail = $(".hz-detail");
  const codeAccent = $(".hz-code-accent");
  const codeRadius = $(".hz-code-radius");
  const valRadius = $(".hz-val-radius");
  ptr.move(3.78, 3.9, hzPt(".hz-swatch-2", 0.5, 0.5));
  ptr.click(3.92);
  add(".hz-swatch-0", 3.93, 4.0, { outlineColor: ["rgba(20,19,28,1)", "rgba(20,19,28,0)"] });
  add(".hz-swatch-2", 3.93, 4.0, { outlineColor: ["rgba(20,19,28,0)", "rgba(20,19,28,1)"] });
  scrub(3.93, 4.12, (p) => {
    const c = mixHex("#7c5cff", "#16b88a", ease(p));
    detail.style.setProperty("--accent", c);
    setText(codeAccent, p < 0.5 ? "#7c5cff" : "#16b88a");
  });

  const knob0 = hzPt(".hz-radius-knob", 0.5, 0.5);
  const slider = offsetIn(hz.querySelector<HTMLElement>(".hz-radius-knob")!.parentElement!, hz);
  ptr.move(4.16, 4.26, knob0);
  ptr.click(4.28);
  const knob1: [number, number] = [slider.x + slider.w * 0.78, knob0[1]];
  ptr.move(4.3, 4.56, knob1, "inOutSine");
  add(".hz-radius-knob", 4.3, 4.56, { left: ["20%", "78%"] }, "inOutSine");
  add(".hz-radius-fill", 4.3, 4.56, { width: ["20%", "78%"] }, "inOutSine");
  scrub(4.3, 4.56, (p) => {
    const r = Math.round(lerp(10, 26, (1 - Math.cos(p * Math.PI)) / 2));
    detail.style.setProperty("--radius", `${r}px`);
    setText(codeRadius, `${r}px`);
    setText(valRadius, `${r}px`);
  });

  ptr.move(4.62, 4.72, hzPt(".hz-copy-custom", 0.5, 0.55));
  ptr.click(4.74);
  add(".hz-toast", 4.76, 4.84, { opacity: [0, 1], translateY: [12, 0] }, "outBack(1.6)");
  add(".hz-toast", 5.02, 5.1, { opacity: [1, 0], translateY: [0, 8] });

  // Playground: haze-card-2 → haze-card-4.
  ptr.move(4.98, 5.1, hzPt(".hz-detail .hz-tab-playground", 0.5, 0.55));
  ptr.click(5.12);
  swapViews(".hz-detail", ".hz-play", 5.14, 0.15);
  const digit = $(".hz-type");
  const caret = $(".hz-caret");
  const typePt = hzPt(".hz-type", 0.9, 0.55);
  ptr.move(5.32, 5.44, [typePt[0] + 6, typePt[1] + 8]);
  ptr.click(5.46);
  fade(caret, 5.47, 5.49, 0, 1);
  scrub(5.52, 5.7, (p) => setText(digit, p < 0.35 ? "2" : p < 0.62 ? "" : "4"));
  add(".card-2", 5.72, 5.9, { opacity: [1, 0], filter: ["blur(0px)", "blur(12px)"], scale: [1, 0.94] }, "inOutSine");
  add(".card-4", 5.78, 5.98, { opacity: [0, 1], filter: ["blur(12px)", "blur(0px)"], scale: [1.04, 1] }, "outCubic");
  const pvName = $(".hz-preview-name");
  scrub(5.72, 5.9, (p) => setText(pvName, p < 0.5 ? "haze-card-2" : "haze-card-4"));
  fade(caret, 5.95, 5.98, 1, 0);

  /* ── MŪN ────────────────────────────────────────────────────────────── */

  const mn = $(".mn-frame");
  const MK = 1280 / 1152;
  const mnPt = (el: HTMLElement | string, ax = 0.5, ay = 0.5, dy = 0): [number, number] => {
    const node = typeof el === "string" ? mn.querySelector<HTMLElement>(el)! : el;
    const r = offsetIn(node, mn);
    return [(r.x + r.w * ax) * MK, (r.y + r.h * ay + dy) * MK];
  };

  fade(".hz", 6.08, 6.24, 1, 0);
  add(".mn", 6.14, 6.32, { opacity: [0, 1], filter: ["blur(8px)", "blur(0px)"] }, "outCubic");
  ptr.move(6.1, 6.3, [900, 250], "inOutSine");
  add(".mn-title", 6.22, 6.45, { opacity: [0, 1], translateY: [24, 0] }, "outCubic");
  tl.add($$(".mn-card") as never, { opacity: [0, 1], translateY: [14, 0], duration: 0.14 * U, ease: "outCubic", delay: stagger(0.035 * U) }, 6.28 * U);

  ptr.move(6.92, 7.06, mnPt(".mn-manage", 0.5, 0.55));
  ptr.click(7.08);
  swapViews(".mn-intro", ".mn-library", 7.1, 0.15);

  add(".mn-banner-row.r0", 7.1, 8.6, { translateX: [0, -150] }, "linear");
  add(".mn-banner-row.r1", 7.1, 8.6, { translateX: [-120, 30] }, "linear");
  add(".mn-banner-row.r2", 7.1, 8.6, { translateX: [0, -150] }, "linear");

  const grid = mn.querySelector<HTMLElement>(".mn-swap")!;
  const libShift = -(offsetIn(grid, mn.querySelector<HTMLElement>(".mn-lib-content")!).y - 40);
  add(".mn-lib-content", 7.38, 7.8, { translateY: [0, libShift] }, "inOutCubic");
  ptr.move(7.4, 7.8, [760, 500], "inOutSine");
  ptr.move(7.84, 7.96, mnPt(".mn-vendor-anthropic", 0.45, 0.5, libShift));
  ptr.click(7.98);
  add(".mn-grid", 8.0, 8.1, { opacity: [1, 0], translateY: [0, -8] });
  add(".mn-detail", 8.04, 8.16, { opacity: [0, 1], translateY: [10, 0] }, "outCubic");

  const count = $(".mn-active-n");
  const toggleOn = (i: number, t: number) => {
    const row = `.mn-row-${i}`;
    ptr.move(t - 0.1, t - 0.02, mnPt(`${row} .mn-toggle`, 0.5, 0.55, libShift));
    ptr.click(t);
    add(`${row} .mn-toggle`, t + 0.01, t + 0.07, { backgroundColor: ["#191919", "#ffffff"] });
    add(`${row} .mn-toggle i`, t + 0.01, t + 0.07, { translateX: [0, 16], backgroundColor: ["#4d4d4d", "#000000"] }, "outBack(1.4)");
    add(`${row} .mn-row-dot`, t + 0.01, t + 0.07, { backgroundColor: ["#4d4d4d", "#e8855a"] });
    add(row, t + 0.01, t + 0.1, { borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.22)"] });
  };
  toggleOn(0, 8.26);
  toggleOn(1, 8.44);
  scrub(8.26, 8.46, (p) => setText(count, p < 0.1 ? "3" : p < 0.95 ? "4" : "5"));

  ptr.move(8.58, 8.7, mnPt(".mn-back", 0.4, 0.55));
  ptr.click(8.72);
  swapViews(".mn-library", ".mn-intro", 8.74, 0.15);
  add(".mn-chip-new", 8.9, 9.02, { maxWidth: ["0px", "200px"], paddingLeft: ["0px", "12px"], paddingRight: ["0px", "12px"], marginLeft: ["-6px", "0px"], opacity: [0, 1], borderWidth: ["0px", "1px"] }, "outCubic");
  add(".mn-chip-new2", 8.96, 9.08, { maxWidth: ["0px", "200px"], paddingLeft: ["0px", "12px"], paddingRight: ["0px", "12px"], marginLeft: ["-6px", "0px"], opacity: [0, 1], borderWidth: ["0px", "1px"] }, "outCubic");

  const typed = mn.querySelector<HTMLElement>(".mn-intro .mn-typed")!;
  ptr.move(9.06, 9.16, mnPt(".mn-intro .mn-input", 0.35, 0.55));
  ptr.click(9.18);
  fade(".mn-intro .mn-caret", 9.19, 9.2, 0, 1);
  fade(".mn-intro .mn-ph", 9.2, 9.21, 1, 0);
  typeInto(typed, MUN_QUERY, 9.22, 9.52);
  add(".mn-intro .mn-send", 9.5, 9.54, { backgroundColor: ["#191919", "#ffffff"], color: ["#4d4d4d", "#000000"] });
  ptr.move(9.54, 9.62, mnPt(".mn-intro .mn-send", 0.5, 0.5));
  ptr.click(9.64);
  swapViews(".mn-intro", ".mn-chat", 9.66, 0.12);
  ptr.move(9.7, 9.9, [1180, 740], "inOutSine");

  tl.add($$(".mn-live-chip") as never, { opacity: [0, 1], scale: [0.85, 1], duration: 0.05 * U, ease: "outBack(2)", delay: stagger(0.045 * U) }, 9.8 * U);
  const stream = $(".mn-stream");
  fade(".mn-stream-caret", 9.98, 10.0, 0, 1);
  scrub(10.0, 10.26, (p) => {
    const n = Math.round(p * MUN_ANSWER.length);
    const shown = MUN_ANSWER.slice(0, n);
    // Bold the lead clause, like MessageContent renders the real answer.
    const lead = "Renting is cheaper in Austin right now";
    stream.innerHTML =
      n <= lead.length ? `<b>${shown}</b>` : `<b>${lead}</b>${shown.slice(lead.length).replace(/&/g, "&amp;").replace(/</g, "&lt;")}`;
  });
  fade(".mn-stream-caret", 10.26, 10.28, 1, 0);
  add(".mn-meta", 10.27, 10.33, { opacity: [0, 1], translateY: [6, 0] }, "outCubic");
  tl.add($$(".mn-model-card") as never, { opacity: [0, 1], translateY: [6, 0], duration: 0.05 * U, ease: "outCubic", delay: stagger(0.02 * U) }, 10.3 * U);

  /* ── VAQFA ──────────────────────────────────────────────────────────── */

  const vq = $(".vq-frame");
  const vqPt = (sel: string, ax = 0.5, ay = 0.5, dy = 0): [number, number] => {
    const r = offsetIn(vq.querySelector<HTMLElement>(sel)!, vq);
    return [(r.x + r.w * ax) * MK, (r.y + r.h * ay + dy) * MK];
  };

  fade(".mn", 10.42, 10.56, 1, 0);
  add(".vq", 10.46, 10.62, { opacity: [0, 1], filter: ["blur(8px)", "blur(0px)"] }, "outCubic");
  // The Classic template has its own cursor: a soft grey dot.
  fade(".pointer-arrow", 10.45, 10.52, 1, 0);
  fade(".pointer-dot", 10.45, 10.52, 0, 1);
  ptr.move(10.4, 10.6, [640, 330], "inOutSine");
  add(".vq-name", 10.5, 10.7, { opacity: [0, 1], translateY: [30, 0] }, "outCubic");

  const trackEl = $(".vq-track");
  const trackShift = -Math.min(trackEl.scrollWidth - 1152 * 0.9, 2100);
  add(".vq-track", 10.55, 11.5, { translateX: [0, trackShift] }, "linear");

  ptr.move(11.36, 11.48, vqPt(".vq-nav-work", 0.5, 0.5));
  ptr.click(11.5);
  swapViews(".vq-home", ".vq-work", 11.52, 0.15);

  const masonry = vq.querySelector<HTMLElement>(".vq-masonry-wrap")!;
  const openSel = `.vq-tile-${VQ_OPEN}`;
  const tile = vq.querySelector<HTMLElement>(openSel)!;
  const tileY = offsetIn(tile, masonry).y;
  const workShift = -Math.max(0, Math.min(tileY - 140, masonry.querySelector<HTMLElement>(".vq-masonry")!.offsetHeight - masonry.offsetHeight));
  add(".vq-masonry", 11.72, 12.2, { translateY: [0, workShift] }, "inOutCubic");
  ptr.move(11.72, 12.2, [700, 420], "inOutSine");
  ptr.move(12.22, 12.32, vqPt(`${openSel} .vq-tile-img`, 0.5, 0.45, workShift));
  // Classic's hover: the photo eases up to 104%.
  add(`${openSel} img`, 12.32, 12.4, { scale: [1, 1.04] }, "outCubic");
  ptr.click(12.4);
  add(".vq-modal", 12.42, 12.52, { opacity: [0, 1] }, "outCubic");
  add(".vq-modal-card", 12.42, 12.56, { scale: [0.96, 1], translateY: [14, 0] }, "outCubic");
  ptr.move(12.62, 12.72, vqPt(".vq-close", 0.5, 0.5));
  ptr.click(12.74);
  add(".vq-modal", 12.76, 12.86, { opacity: [1, 0] });
  add(`${openSel} img`, 12.76, 12.86, { scale: [1.04, 1] });

  ptr.move(12.9, 13.0, vqPt(".vq-nav-info2", 0.5, 0.5));
  ptr.click(13.02);
  swapViews(".vq-work", ".vq-info", 13.04, 0.16);
  add(".vq-info-bg", 13.04, 14.0, { scale: [1.08, 1] }, "outSine");
  add(".vq-info-body", 13.12, 13.3, { opacity: [0, 1], translateY: [20, 0] }, "outCubic");
  ptr.move(13.1, 13.5, [1100, 700], "inOutSine");
  fade(".pointer", 13.9, 14.0, 1, 0);

  /* ── laptop out, phone in ───────────────────────────────────────────── */

  add(lap, SWAP[0], SWAP[0] + 0.62, { q: [0, 1] }, "inCubic");
  pose(phone, SWAP[0] + 0.22, SWAP[1], L.phone.below, L.phone.in, "outCubic");

  /* ── NITE ───────────────────────────────────────────────────────────── */

  const nt = $(".nt");
  const ntPt = (sel: string, ax = 0.5, ay = 0.5): [number, number] => {
    const r = offsetIn(nt.querySelector<HTMLElement>(sel)!, nt);
    return [r.x + r.w * ax, r.y + r.h * ay];
  };
  const touch = makePointer(".touch", ".touch-dot", ".touch-ring", [300, 640]);
  const tap = (t: number) => touch.click(t);
  const push = (out: string, into: string, t: number) => {
    add(out, t, t + 0.12, { opacity: [1, 0], translateX: [0, -30] }, "inOutSine");
    add(into, t + 0.03, t + 0.15, { translateX: [36, 0] }, "outCubic");
  };

  add(".nt-loader p", 15.0, 15.18, { opacity: [0, 1], scale: [0.92, 1], filter: ["blur(6px)", "blur(0px)"] }, "outCubic");
  add(".nt-loader", 15.26, 15.4, { opacity: [1, 0] });
  add(".nt-arc-welcome", 15.3, 15.6, { opacity: [0, 1], rotate: [-8, 0] }, "outCubic");
  add(".nt-welcome .nt-wordmark", 15.32, 15.5, { opacity: [0, 1], translateY: [10, 0] }, "outCubic");

  fade(".touch", 15.6, 15.66, 0, 1);
  touch.move(15.62, 15.74, ntPt(".nt-create", 0.55, 0.55));
  tap(15.76);
  push(".nt-welcome", ".nt-create-view", 15.8);
  add(".nt-create-view .nt-arc-corner", 15.85, 16.1, { opacity: [0, 1], rotate: [10, 0] }, "outCubic");

  const field = (cls: string, text: string, t0: number, t1: number) => {
    const sel = `.nt-create-view .${cls}`;
    touch.move(t0 - 0.08, t0 - 0.01, ntPt(sel, 0.4, 0.55));
    tap(t0 - 0.005);
    add(`${sel}`, t0, t0 + 0.03, { borderColor: ["#2a2a2a", "#8a58c9"] });
    fade(`${sel} .nt-field-ph`, t0, t0 + 0.01, 1, 0);
    typeInto(nt.querySelector<HTMLElement>(`${sel} .nt-field-val`)!, text, t0 + 0.01, t1);
    add(`${sel}`, t1 + 0.01, t1 + 0.04, { borderColor: ["#8a58c9", "#2a2a2a"] });
  };
  field("f-name", "Zain Hafiz", 16.1, 16.3);
  field("f-email", "you@utdallas.edu", 16.4, 16.62);
  field("f-pass", "••••••••••", 16.7, 16.8);
  field("f-pass2", "••••••••••", 16.86, 16.95);
  field("f-uni", "UT Dallas", 17.0, 17.08);
  touch.move(17.1, 17.16, ntPt(".nt-check", 0.5, 0.5));
  tap(17.17);
  add(".nt-check", 17.18, 17.22, { backgroundColor: ["rgba(127,63,191,0)", "rgba(127,63,191,1)"], borderColor: ["#555555", "#9b5fe0"] });
  fade(".nt-check svg", 17.18, 17.22, 0, 1);
  touch.move(17.24, 17.3, ntPt(".nt-create-submit", 0.5, 0.5));
  tap(17.31);
  push(".nt-create-view", ".nt-verify", 17.33);

  const digits = [..."482916"];
  digits.forEach((d, i) => {
    const t = 17.52 + i * 0.045;
    const b = nt.querySelector<HTMLElement>(`.nt-verify .d${i} b`)!;
    scrub(t, t + 0.01, (p) => setText(b, p > 0.5 ? d : ""));
    add(`.nt-verify .d${i}`, t, t + 0.04, { borderColor: ["#2a2a2a", "#6f4a9c"] });
  });
  add(".nt-code-caret", 17.52, 17.52 + 0.001, { opacity: [1, 0] });
  touch.move(17.5, 17.72, ntPt(".nt-continue", 0.5, 0.5), "inOutSine");
  tap(17.76);
  push(".nt-verify", ".nt-home", 17.78);
  fade(".nt-tiles-find .t0 .nt-tile-glow", 17.9, 17.98, 0, 1);
  add(".nt-tiles-find .t0 .nt-tile-box", 17.9, 17.98, { color: ["#7f7f7f", "#b575f2"] });
  add(".nt-feed-line", 17.92, 18.1, { opacity: [0, 1], translateY: [16, 0] }, "outCubic");
  add(".nt-feed-line .nt-row", 18.1, 18.5, { translateX: [0, -60] }, "inOutSine");

  // SafeRoute
  touch.move(18.5, 18.62, ntPt(".nt-tiles-find .t1 .nt-tile-box", 0.5, 0.5));
  tap(18.64);
  fade(".nt-tiles-find .t0 .nt-tile-glow", 18.66, 18.72, 1, 0);
  add(".nt-tiles-find .t0 .nt-tile-box", 18.66, 18.72, { color: ["#b575f2", "#7f7f7f"] });
  fade(".nt-tiles-find .t1 .nt-tile-glow", 18.66, 18.72, 0, 1);
  add(".nt-tiles-find .t1 .nt-tile-box", 18.66, 18.72, { color: ["#7f7f7f", "#b575f2"] });
  add(".h-line", 18.66, 18.76, { opacity: [1, 0], filter: ["blur(0px)", "blur(4px)"] });
  add(".h-route", 18.7, 18.8, { opacity: [0, 1], filter: ["blur(4px)", "blur(0px)"] });
  add(".nt-feed-line", 18.66, 18.76, { opacity: [1, 0] });
  add(".nt-feed-route", 18.7, 18.82, { opacity: [0, 1], translateY: [14, 0] }, "outCubic");
  add(".nt-route-a", 18.82, 19.12, { strokeDashoffset: [1, 0] }, "inOutSine");
  add(".nt-route-b", 18.88, 19.18, { strokeDashoffset: [1, 0] }, "inOutSine");
  fade(".nt-route-end-a", 19.1, 19.14, 0, 1);
  fade(".nt-route-end-b", 19.16, 19.2, 0, 1);

  // Find → Plan
  touch.move(19.4, 19.52, ntPt(".nt-toggle-plan", 0.5, 0.5));
  tap(19.54);
  add(".nt-toggle-ink", 19.56, 19.7, { translateX: [0, 77] }, "inOutCubic");
  scrub(19.56, 19.7, (p) => {
    nt.style.setProperty("--acc", mixHex("#7f3fbf", "#02c27a", p));
    nt.style.setProperty("--acc-hi", mixHex("#b575f2", "#3fe0a4", p));
  });
  add(".nt-toggle-find", 19.56, 19.7, { color: ["#b56ef5", "#4a4a4a"] });
  add(".nt-toggle-plan", 19.56, 19.7, { color: ["#4a4a4a", "#3fe0a4"] });
  add(".nt-tiles-find", 19.58, 19.7, { opacity: [1, 0], translateY: [0, -6] });
  add(".nt-tiles-plan", 19.64, 19.78, { opacity: [0, 1], translateY: [6, 0] }, "outCubic");
  fade(".nt-tiles-plan .t0 .nt-tile-glow", 19.74, 19.82, 0, 1);
  add(".nt-tiles-plan .t0 .nt-tile-box", 19.74, 19.82, { color: ["#7f7f7f", "#3fe0a4"] });
  add(".h-route", 19.58, 19.68, { opacity: [1, 0], filter: ["blur(0px)", "blur(4px)"] });
  add(".h-plan", 19.62, 19.74, { opacity: [0, 1], filter: ["blur(4px)", "blur(0px)"] });
  add(".nt-feed-route", 19.58, 19.7, { opacity: [1, 0] });
  add(".nt-feed-plan", 19.64, 19.8, { opacity: [0, 1], translateY: [14, 0] }, "outCubic");
  add(".nt-sem-fill", 19.84, 20.2, { width: ["0%", "60%"] }, "inOutCubic");
  const pct = $(".nt-sem-pct");
  scrub(19.84, 20.2, (p) => setText(pct, String(Math.round(ease(p) * 60))));
  tl.add($$(".nt-up-row") as never, { opacity: [0, 1], translateX: [12, 0], duration: 0.08 * U, ease: "outCubic", delay: stagger(0.05 * U) }, 19.9 * U);
  fade(".touch", 20.0, 20.1, 1, 0);

  /* ── outro ──────────────────────────────────────────────────────────── */

  pose(phone, OUTRO[0], OUTRO[0] + 0.55, L.phone.in, L.phone.gone, "inCubic");
  fade(".scrim", OUTRO[0], OUTRO[0] + 0.3, 1, 0);
  tl.add($$(".outro-line") as never, { opacity: [0, 1], translateY: [60, 0], duration: 0.35 * U, ease: "outCubic", delay: stagger(0.08 * U) }, (OUTRO[0] + 0.3) * U);
  add(".outro-foot", OUTRO[0] + 0.55, OUTRO[0] + 0.8, { opacity: [0, 1], translateY: [16, 0] }, "outCubic");

  /* ── blurbs ─────────────────────────────────────────────────────────── */

  for (const b of BLURBS) {
    const sel = `.blurb[data-id="${b.id}"]`;
    const [a, z] = b.at;
    add(sel, a - 0.24, a, { opacity: [0, 1], translateY: [22, 0], filter: ["blur(6px)", "blur(0px)"] }, "outCubic");
    add(sel, z, z + 0.24, { opacity: [1, 0], translateY: [0, -22], filter: ["blur(0px)", "blur(6px)"] }, "inCubic");
  }

  // Pad to the end so the final state holds.
  tl.add({ duration: 1 } as never, END * U - 1);

  // Render every tween once at its end and back at the start: each property
  // then shows its first `from` value, whatever the stylesheet says.
  tl.seek(tl.duration);
  tl.seek(0);

  onScroll({
    target: track,
    enter: "top top",
    leave: "bottom bottom",
    sync: true,
  }).link(tl);

  return {
    tl,
    onBeat: (cb) => {
      beatListeners.push(cb);
      cb(tl.currentTime / U);
    },
  };
}
