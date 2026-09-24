/**
 * The research paper as it first appears on the laptop: the top of the
 * paper page. The paper itself then takes the frame (PaperTour).
 */

import { PAPER } from "../../research/data";
import "../../research/paper.css";

export function ResearchApp() {
  return (
    <div className="app rs" data-app="research">
      <div className="paper rs-page">
        <header className="p-nav">
          <span className="p-mark">zain hafiz</span>
          <div className="p-nav-end">
            <span className="p-pill dark">Back to site</span>
            <span className="p-pill light">Download PDF ↗</span>
          </div>
        </header>

        <div className="p-hero">
          <p className="p-meta">
            <span>
              {PAPER.status} to {PAPER.venue}
            </span>
            <span className="p-kind">Publication</span>
          </p>
          <h1>{PAPER.short}</h1>
          <p className="p-dek">
            Empirical multi-model routing across accuracy, cost, and routing overhead, confirmed once on 7,853 fresh queries
            under a leakage-controlled protocol.
          </p>
          <span className="p-pill dark p-cta">Read the paper ↗</span>
        </div>

        <div className="p-byline">
          <p>
            {PAPER.author} <span>· University of North Texas</span>
          </p>
        </div>
      </div>
    </div>
  );
}
