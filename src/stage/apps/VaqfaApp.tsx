/**
 * Your Vaqfa site on the Classic template (vaqfa/src/templates/classic):
 * Home with the drifting carousel, the Work archive with its photo modal,
 * and the Info page — with your photographs from the Vaqfa Drive folder and
 * the copy from the original Vaqfa.tsx / your published profile.
 */

import { VQ_PHOTOS, type VqPhoto } from "./vaqfaPhotos";

const FULL = "/projects/vaqfa/photos/";
const THUMB = "/projects/vaqfa/photos/thumbs/";

const NAME = "Zain Hafiz";
const DEFINITION = "vaq·fa. A pause. A halt. A deliberate stance taken in stillness before the next move.";
const BIO = "A visual storyteller providing the narratives through photography, creative direction, and consulting.";
const INSTAGRAM = "@zainito__";

/** The photo the pointer opens in the Work archive. */
export const VQ_OPEN = "shoreline-trail";

/** Same deterministic 155–310px heights the real Carousel assigns. */
const seeded = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 1000) / 1000;
};

/** Classic shuffles on every load; a seeded shuffle keeps the scroll replayable. */
function seededShuffle<T>(items: T[], seed = 7): T[] {
  const out = [...items];
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const slug = (p: VqPhoto) => p.f.replace(".jpg", "");

function Dot({ c = "#000" }: { c?: string }) {
  return <i className="vq-dot" style={{ background: c }} />;
}

function Home() {
  const row = seededShuffle(VQ_PHOTOS).slice(0, 28);
  return (
    <div className="vq-view vq-home">
      <header className="vq-head">
        <span className="vq-nav vq-nav-work">Work</span>
        <div className="vq-name-block">
          <h1 className="vq-name">{NAME}</h1>
          <p className="vq-tagline">{DEFINITION}</p>
        </div>
        <span className="vq-nav vq-nav-info">Info</span>
      </header>
      <div className="vq-carousel">
        <div className="vq-track">
          {row.map((p, i) => {
            const h = Math.round(155 + seeded(p.f + i) * 155);
            return (
              <span className="vq-item" key={i} style={{ width: Math.round((h * p.w) / p.h), height: h }}>
                <img src={THUMB + p.f} alt="" loading="lazy" decoding="async" />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Work() {
  const open = VQ_PHOTOS.find((p) => slug(p) === VQ_OPEN)!;
  return (
    <div className="vq-view vq-work">
      <header className="vq-head small">
        <span className="vq-nav">
          <Dot />
          Work
        </span>
        <span className="vq-small-name">{NAME}</span>
        <span className="vq-nav vq-nav-info2">Info</span>
      </header>
      <div className="vq-filters">
        <span className="on">All</span>
        <span>Photo</span>
        <span>Video</span>
      </div>
      <div className="vq-masonry-wrap">
        <div className="vq-masonry">
          {VQ_PHOTOS.map((p) => (
            <div className={`vq-tile vq-tile-${slug(p)}`} key={p.f}>
              <div className="vq-tile-img">
                <img src={THUMB + p.f} alt="" loading="lazy" decoding="async" style={{ aspectRatio: `${p.w} / ${p.h}` }} />
              </div>
              <p>{p.t}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="vq-modal">
        <div className="vq-modal-card">
          <div className="vq-modal-img">
            <img src={FULL + open.f} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="vq-modal-meta">
            <h2>{open.t}</h2>
          </div>
        </div>
        <span className="vq-close">×</span>
      </div>
    </div>
  );
}

function Info() {
  return (
    <div className="vq-view vq-info">
      <img className="vq-info-bg" src={FULL + "cover.jpg"} alt="" loading="lazy" decoding="async" />
      <i className="vq-info-shade" />
      <header className="vq-head inv">
        <span className="vq-nav">Work</span>
        <span className="vq-nav">
          Info
          <Dot c="#fff" />
        </span>
      </header>
      <div className="vq-info-body">
        <h1>{NAME}</h1>
        <p>{BIO}</p>
        <div className="vq-insta">
          <span>Instagram</span>
          <b>{INSTAGRAM}</b>
        </div>
      </div>
    </div>
  );
}

export function VaqfaApp() {
  return (
    <div className="app vq" data-app="vaqfa">
      <div className="vq-frame">
        <Home />
        <Work />
        <Info />
      </div>
    </div>
  );
}
