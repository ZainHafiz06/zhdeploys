import { PAGE_H, PAGE_W, TOUR, pageSrc } from "../research/tour";
import type { Layout } from "./geometry";

/**
 * The paper takes the frame: real page renders in a camera the timeline pans
 * and zooms, with a highlighter stroke for each key line.
 * The later pages start tucked behind page 1 and open into a column when the
 * camera zooms in. Page images load only once the chapter is near (`load`).
 */
export function PaperTour({ layout, load }: { layout: Layout; load: boolean }) {
  const f = layout.tour;
  return (
    <div className="tour" style={{ left: f.x, top: f.y, width: f.w, height: f.h }} aria-hidden="true">
      <div className="tour-frame">
        <div className="tour-cam" style={{ width: PAGE_W, height: PAGE_H }}>
          {TOUR.map((pg, i) => (
            <div className="tour-page" data-page={pg.n} key={pg.n} style={{ zIndex: TOUR.length - i, opacity: i ? 0 : 1 }}>
              {load && <img src={pageSrc(pg.n)} alt="" width={PAGE_W} height={PAGE_H} decoding="async" />}
              {pg.steps.map((st, si) =>
                st.lines.map(([x0, y0, x1, y1], li) => (
                  <i
                    key={`${si}-${li}`}
                    className={`tour-hl tour-hl-${pg.n}-${si}`}
                    style={{ left: x0 - 1.5, top: y0 - 0.5, width: x1 - x0 + 3, height: y1 - y0 + 1.5 }}
                  />
                )),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
