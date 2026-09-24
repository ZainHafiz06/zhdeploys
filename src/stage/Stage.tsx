import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Sky } from "./Sky";
import { Laptop, Phone, type LaptopCtrl } from "./Devices";
import { SocialIcon } from "./SocialIcon";
import { computeLayout, type Layout } from "./geometry";
import { BLURBS, CHAPTERS, END, INTRO_END, OUTRO, RESEARCH_START, type AppId } from "./story";
import { PaperTour } from "./PaperTour";
import { Link } from "react-router-dom";
import { buildTimeline } from "./timeline";
import { useSiteContent } from "../content/store";
import { useReducedMotion } from "../motion/useReducedMotion";
import { scrollToY } from "../motion/lenis";
import "./stage.css";
import "./apps/haze.css";
import "./apps/mun.css";
import "./apps/vaqfa.css";
import "./apps/nite.css";
import "./apps/research-app.css";

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
  const laptopCtrl = useRef<LaptopCtrl>({ p: 0, q: 0, s: 0 });
  const [beat, setBeat] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.title = content.settings.seoTitle || "Zain Hafiz | High on Java";
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
    return () => {
      built.tl.revert();
    };
  }, [fontsReady, layout]);

  // The page's own sense of "where are we" comes straight from the scroll
  // position (the timeline's update callback doesn't fire when it lands
  // exactly on its first frame). It drives the index, the blurb links and the sky.
  useEffect(() => {
    let last = -1;
    const read = () => {
      const el = track.current;
      if (!el) return;
      const max = Math.max(1, el.offsetHeight - window.innerHeight);
      const b = (Math.min(max, Math.max(0, window.scrollY - el.offsetTop)) / max) * END;
      drift.current = b * 0.32;
      const q = Math.round(b * 20);
      if (q !== last) {
        last = q;
        setBeat(b);
      }
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [layout]);

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
  // The project index appears once "high on java" has left the frame, and
  // bows out again when the closing lines arrive.
  const showIndex = beat >= INTRO_END - 0.2 && beat < OUTRO[0] + 0.25;
  const atEnd = beat >= OUTRO[0] + 0.55;
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
          <PaperTour layout={layout} load={beat > RESEARCH_START - 4} />

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
            {/* One header per app: it stays put while that app's blurbs change beneath it. */}
            {CHAPTERS.map((c) => {
              const mine = BLURBS.filter((b) => b.app === c.app);
              const live = mine.length > 0 && beat >= mine[0].at[0] - 0.15 && beat <= mine[mine.length - 1].at[1] + 0.15;
              const inner = (
                <>
                  <img src={c.logo} alt="" />
                  <span>{c.label}</span>
                </>
              );
              const cls = `blurb-app ${live ? "is-live" : ""}`;
              return c.placeholder ? (
                // PLACEHOLDER: no live site yet. Set `href` in story.ts to link it.
                <a className={cls} data-app={c.app} key={c.app} href={c.href} title={`${c.label}: link coming soon`} tabIndex={live ? 0 : -1} onClick={(e) => e.preventDefault()}>
                  {inner}
                </a>
              ) : (
                <Link className={cls} data-app={c.app} key={c.app} to={c.href} title={`Open ${c.label}`} tabIndex={live ? 0 : -1}>
                  {inner}
                </Link>
              );
            })}
            {BLURBS.map((b) => (
              <article className={`blurb ${beat >= b.at[0] - 0.12 && beat <= b.at[1] + 0.12 ? "is-live" : ""}`} data-id={b.id} key={b.id}>
                <h2>{b.title}</h2>
                <p>{b.body}</p>
                {b.link &&
                  (b.link.href.endsWith(".pdf") ? (
                    <a className="blurb-link" href={b.link.href} target="_blank" rel="noreferrer">
                      {b.link.label}
                    </a>
                  ) : (
                    <Link className="blurb-link" to={b.link.href}>
                      {b.link.label}
                    </Link>
                  ))}
              </article>
            ))}
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
          </footer>

          <button
            type="button"
            className={`outro-up ${atEnd ? "is-live" : ""}`}
            onClick={() => jump(0)}
            aria-label="Back to the top"
            title="Back to the top"
            tabIndex={atEnd ? 0 : -1}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
            </svg>
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
