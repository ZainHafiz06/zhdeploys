import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Sky } from "./Sky";
import { Laptop, Phone, type LaptopCtrl } from "./Devices";
import { SocialIcon } from "./SocialIcon";
import { computeLayout, type Layout } from "./geometry";
import { BLURBS, CHAPTERS, END, INTRO_END, type AppId } from "./story";
import { buildTimeline } from "./timeline";
import { useSiteContent } from "../content/store";
import { useReducedMotion } from "../motion/useReducedMotion";
import { scrollToY } from "../motion/lenis";
import "./stage.css";
import "./apps/haze.css";
import "./apps/mun.css";
import "./apps/vaqfa.css";
import "./apps/nite.css";

const APP_OF: Record<AppId, (typeof CHAPTERS)[number]> = Object.fromEntries(CHAPTERS.map((c) => [c.app, c])) as never;

/** Viewport size, ignoring the small height jitter of mobile browser chrome. */
function useViewport() {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [vp, setVp] = useState(read);
  useEffect(() => {
    let t = 0;
    const onResize = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const next = read();
        setVp((prev) =>
          prev.w === next.w && Math.abs(prev.h - next.h) < (matchMedia("(pointer: coarse)").matches ? 140 : 1)
            ? prev
            : next,
        );
      }, 160);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return vp;
}

export default function Stage() {
  const { content } = useSiteContent();
  const reduced = useReducedMotion();
  const vp = useViewport();
  const layout: Layout = useMemo(() => computeLayout(vp.w, vp.h), [vp.w, vp.h]);

  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drift = useRef(0);
  // Written by the scroll timeline, read by the laptop's render loop.
  const laptopCtrl = useRef<LaptopCtrl>({ p: 0, q: 0 });
  const [beat, setBeat] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.title = content.settings.seoTitle || "Zain Hafiz — High on Java";
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, [content.settings.seoTitle]);

  // Build (and rebuild on resize) the scroll timeline. Layout effects run
  // before paint, so the first frame is already in its scroll position.
  useLayoutEffect(() => {
    if (!fontsReady || !root.current || !track.current) return;
    const built = buildTimeline(root.current, track.current, layout, laptopCtrl.current);
    if (import.meta.env.DEV) Object.assign(window, { __hoj: { tl: built.tl, lap: laptopCtrl.current } });
    let lastIndex = -1;
    built.onBeat((b) => {
      drift.current = b * 0.32;
      const i = Math.floor(b * 20);
      if (i !== lastIndex) {
        lastIndex = i;
        setBeat(b);
      }
    });
    return () => {
      built.tl.revert();
    };
  }, [fontsReady, layout]);

  // Arrival (time-based, separate from scroll): the title rises, the laptop settles.
  useEffect(() => {
    if (!fontsReady || reduced) return;
    const a = animate(".t-rise", {
      translateY: ["60%", "0%"],
      opacity: [0, 1],
      duration: 1100,
      delay: (_el, i) => 120 + (i ?? 0) * 90,
      ease: "outExpo",
    });
    const b = animate(".laptop", {
      translateY: [90, 0],
      opacity: [0, 1],
      duration: 1500,
      delay: 200,
      ease: "outExpo",
    });
    return () => {
      a.revert();
      b.revert();
    };
  }, [fontsReady, reduced]);

  const current = CHAPTERS.find((c) => beat >= c.start && beat < c.end)?.app ?? null;
  // The project index stays hidden until "high on java" has left the frame.
  const showIndex = beat >= INTRO_END - 0.2;
  const jump = (b: number) => {
    const el = track.current;
    if (!el) return;
    const max = el.offsetHeight - window.innerHeight;
    scrollToY(el.offsetTop + (b / END) * max);
  };

  const { poster, title } = layout;
  const at = (o: { x: number; y: number }) => (x: number, y: number) => ({ left: o.x + x * poster.u, top: o.y + y * poster.u });
  const P = at(title.top);
  const J = at(title.java);
  const fs = (px: number) => px * poster.u;

  return (
    <div className={`hoj ${fontsReady ? "is-ready" : ""} ${layout.narrow ? "is-narrow" : ""}`} ref={root}>
      <div className="track" ref={track} style={{ height: `${(END + 1) * 100}svh` }}>
        <div className="stage">
          <div className="sky-fallback" />
          <Sky drift={drift} reduced={reduced} />
          <div className="scrim" />

          {/* Poster layers below the laptop: "high", "on" */}
          <div className="t-high title-word" style={{ ...P(0, -18.5), fontSize: fs(400) }}>
            <span className="t-rise">high</span>
          </div>
          <div className="t-on title-word" style={{ ...P(0, 315), fontSize: fs(450) }}>
            <span className="t-rise">on</span>
          </div>

          <Laptop layout={layout} ctrl={laptopCtrl} reduced={reduced} />

          {/* Poster layers above the laptop: the "ja" shadow, "ja", "va" */}
          <div className="t-java">
            <div
              className="t-ja-shadow title-word"
              style={{ ...J(959.1, 973.25), fontSize: fs(450), transform: "scale(0.9216, 0.9375)" }}
              aria-hidden="true"
            >
              <span className="t-rise">ja</span>
            </div>
            <div className="title-word bold" style={{ ...J(920, 974), fontSize: fs(450) }}>
              <span className="t-rise">ja</span>
            </div>
            <div className="title-word bold" style={{ ...J(1460, 974), fontSize: fs(450) }}>
              <span className="t-rise">va</span>
            </div>
          </div>

          <Phone />

          <div className="blurbs">
            {BLURBS.map((b) => {
              const chapter = APP_OF[b.app];
              return (
                <article className="blurb" data-id={b.id} key={b.id}>
                  <header className="blurb-app">
                    <img src={chapter.logo} alt="" />
                    <span>{chapter.label}</span>
                  </header>
                  <h2>{b.title}</h2>
                  <p>{b.body}</p>
                </article>
              );
            })}
          </div>

          <div className="outro">
            <p className="outro-line">different projects.</p>
            <p className="outro-line">same habit.</p>
          </div>

          <footer className="outro-foot">
            <nav className="outro-links" aria-label="Elsewhere">
              {content.links
                .filter((l) => l.visible)
                .map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    aria-label={l.label}
                    title={l.label}
                    target={l.openInNewTab ? "_blank" : undefined}
                    rel={l.openInNewTab ? "noreferrer" : undefined}
                  >
                    <SocialIcon link={l} />
                  </a>
                ))}
            </nav>
            <button type="button" className="outro-top" onClick={() => jump(0)}>
              back to the top ↑
            </button>
          </footer>

          <button type="button" className="scroll-cue" onClick={() => jump(CHAPTERS[0].start + 0.4)}>
            <span>scroll</span>
            <i />
          </button>
        </div>
      </div>

      <header className="topbar">
        <button type="button" className="topbar-name" onClick={() => jump(0)}>
          zain hafiz
        </button>
      </header>

      <nav className={`app-index ${showIndex ? "is-shown" : ""}`} aria-label="Projects" aria-hidden={!showIndex}>
        {CHAPTERS.map((c) => (
          <button
            type="button"
            key={c.app}
            className={current === c.app ? "on" : ""}
            aria-current={current === c.app ? "step" : undefined}
            aria-label={c.label}
            title={c.label}
            tabIndex={showIndex ? 0 : -1}
            onClick={() => jump(c.start + 0.45)}
          >
            <img src={c.logo} alt="" />
          </button>
        ))}
      </nav>

      <span className="u-visually-hidden" aria-live="polite">
        {current ? `Now showing ${APP_OF[current].label}` : ""}
      </span>
    </div>
  );
}
