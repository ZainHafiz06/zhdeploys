import { ANTHROPIC_MODELS, CATALOG_SIZE, MUN_PICKS, VENDOR_GROUPS } from "./munCatalog";

/**
 * MŪN, rebuilt from its own components (IntroState, ModelLibraryPage,
 * ChatMessage) at 1152 × 720 and scaled onto the laptop screen.
 */

const V = "/projects/mun/vendors/";

const BANNER = [
  "openai.svg", "microsoft-color.svg", "nvidia-color.svg", "perplexity-color.svg", "anthropic.svg", "google-color.svg",
  "meta-color.svg", "xai.svg", "qwen-color.svg", "deepseek-color.svg", "mistral-color.svg", "cohere-color.svg",
];

const SUGGESTIONS = [
  { tag: "Explain", text: "Explain quantum computing in simple terms", icon: "flask" },
  { tag: "Write", text: "Write a professional email asking for a deadline extension", icon: "mail" },
  { tag: "Debug", text: "Debug this Python error: list index out of range", icon: "bug" },
  { tag: "Plan", text: "Plan a 3-day trip to Tokyo on a budget", icon: "plane" },
  { tag: "Compare", text: "Compare Roth IRA vs 401(k) for early-career savers", icon: "piggy" },
  { tag: "Summarize", text: "Summarize the pros and cons of remote work", icon: "case" },
];

const fmtCtx = (c: number) => (c >= 1_000_000 ? `${+(c / 1_000_000).toFixed(1)}M ctx` : `${Math.round(c / 1000)}K ctx`);

export const MUN_QUERY = "Is it cheaper to rent or buy in Austin right now?";
export const MUN_ANSWER =
  "Renting is cheaper in Austin right now for most people planning to stay under five years. Median rent sits near $1,650 a month, while a comparable mortgage at today's rates runs past $2,400 before taxes and insurance.";

function Icon({ name }: { name: string }) {
  const p: Record<string, React.ReactNode> = {
    flask: <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 14h9" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    bug: (
      <>
        <rect x="7" y="8" width="10" height="12" rx="5" />
        <path d="M12 8v12M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2M9 5l1 2M15 5l-1 2" />
      </>
    ),
    plane: <path d="M2 16h20M5 16l-2-5h3l2 3h4L9 5h3l6 9h3a1.5 1.5 0 0 1 0 3" />,
    piggy: (
      <>
        <path d="M5 11a7 6 0 0 1 12-2h2v4l-2 1v3h-3v-2H9v2H6v-3a6 6 0 0 1-1-3Z" />
        <path d="M3 10c0 1 1 2 2 2" />
      </>
    ),
    case: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5h6v2" />
      </>
    ),
    tools: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z" />,
    hub: (
      <>
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="12" cy="4" r="1.5" />
        <circle cx="12" cy="20" r="1.5" />
        <circle cx="4.5" cy="8" r="1.5" />
        <circle cx="19.5" cy="8" r="1.5" />
        <circle cx="4.5" cy="16" r="1.5" />
        <circle cx="19.5" cy="16" r="1.5" />
        <path d="M12 5.5v4M12 14.5v4M6 8.8l3.8 2M18 8.8l-3.8 2M6 15.2l3.8-2M18 15.2l-3.8-2" />
      </>
    ),
    history: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 7v5l3 2" />,
    tune: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-4-4" />
      </>
    ),
    back: <path d="M19 12H5M11 6l-6 6 6 6" />,
    chev: <path d="m9 6 6 6-6 6" />,
    clip: <path d="M21.4 11 12.3 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />,
    up: <path d="M12 19V5M6 11l6-6 6 6" />,
  };
  return (
    <svg className="mn-ico" viewBox="0 0 24 24" aria-hidden="true">
      {p[name]}
    </svg>
  );
}

function Topbar() {
  return (
    <header className="mn-topbar">
      <span className="mn-word">mun</span>
      <span className="mn-top-icons">
        <Icon name="tools" />
        <Icon name="hub" />
        <Icon name="history" />
        <span className="mn-avatar">Z</span>
      </span>
    </header>
  );
}

function Composer({ className = "" }: { className?: string }) {
  return (
    <div className={`mn-input ${className}`}>
      <Icon name="clip" />
      <span className="mn-input-field">
        <span className="mn-ph">Ask anything...</span>
        <span className="mn-typed" />
        <i className="mn-caret" />
      </span>
      <span className="mn-send">
        <Icon name="up" />
      </span>
    </div>
  );
}

function Intro() {
  return (
    <div className="mn-view mn-intro">
      <Topbar />
      <div className="mn-split">
        <h1 className="mn-title">
          What's on
          <br />
          the <span className="med">docket</span>
          <br />
          today, <span className="strong">Zain</span>?
        </h1>
        <i className="mn-divider" />
        <div className="mn-right">
          <div className="mn-sugg">
            {SUGGESTIONS.map((s) => (
              <div className="mn-card" key={s.tag}>
                <span className="mn-card-ico">
                  <Icon name={s.icon} />
                </span>
                <span className="mn-card-body">
                  <span className="mn-card-tag">{s.tag}</span>
                  <span className="mn-card-text">{s.text}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mn-roster">
            <span className="mn-chip">
              <i style={{ background: "#9a9a9a" }} />
              Glm 5.2:free
            </span>
            <span className="mn-chip">
              <i style={{ background: "#a3e635" }} />
              Nemotron 3 Super:free
            </span>
            <span className="mn-chip mn-chip-new">
              <i style={{ background: "#e8855a" }} />
              {ANTHROPIC_MODELS[MUN_PICKS[0]].name}
            </span>
            <span className="mn-chip mn-chip-new2">
              <i style={{ background: "#e8855a" }} />
              {ANTHROPIC_MODELS[MUN_PICKS[1]].name}
            </span>
            <span className="mn-chip mn-manage">
              <Icon name="tune" />
              Manage
            </span>
          </div>
          <Composer />
        </div>
      </div>
    </div>
  );
}

function Toggle() {
  return (
    <span className="mn-toggle">
      <i />
    </span>
  );
}

function Library() {
  return (
    <div className="mn-view mn-library">
      <header className="mn-lib-top">
        <span className="mn-back">
          <Icon name="back" />
          Back to chat
        </span>
        <span className="mn-active">
          <i />
          <span className="mn-active-n">3</span> active
        </span>
      </header>
      <div className="mn-lib-scroll">
        <div className="mn-lib-content">
          <div className="mn-banner">
            <div className="mn-banner-rows">
              {[0, 1, 2].map((row) => (
                <div className={`mn-banner-row r${row}`} key={row}>
                  {[...BANNER, ...BANNER].map((_, i) => (
                    <span className="mn-tile" key={i}>
                      <img src={V + BANNER[(i + row * 4) % BANNER.length]} alt="" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <h1 className="mn-lib-title">Assemble your council</h1>
          <p className="mn-lib-sub">
            Every public model, organized by the technology behind it. Free models are open to everyone, and your
            wallet unlocks the rest.
          </p>
          <div className="mn-search-row">
            <span className="mn-search">
              <Icon name="search" />
              Search {CATALOG_SIZE} models
            </span>
            <span className="mn-filters">
              <Icon name="tune" />
              Filters
            </span>
          </div>

          <div className="mn-swap">
          <div className="mn-grid">
            {VENDOR_GROUPS.map((v) => (
              <div className={`mn-vendor mn-vendor-${v.slug}`} key={v.slug}>
                <div className="mn-vendor-top">
                  {v.logo ? (
                    <span className="mn-mono">
                      <img src={V + v.logo} alt="" />
                    </span>
                  ) : (
                    <span className="mn-mono mono-letter">{v.label.charAt(0)}</span>
                  )}
                  <span className="mn-vendor-titles">
                    <b>{v.label}</b>
                    <small>
                      {v.count} model{v.count === 1 ? "" : "s"}
                    </small>
                  </span>
                  <Icon name="chev" />
                </div>
                <p>{v.blurb}</p>
              </div>
            ))}
          </div>

          <div className="mn-detail">
            <span className="mn-back sub">
              <Icon name="back" />
              All providers
            </span>
            <div className="mn-detail-head">
              <span className="mn-mono large">
                <img src={V + "anthropic.svg"} alt="" />
              </span>
              <span>
                <b>Anthropic</b>
                <small>Claude: deep reasoning, long context, careful answers.</small>
              </span>
            </div>
            <div className="mn-rows">
              {ANTHROPIC_MODELS.map((m, i) => (
                <div className={`mn-row mn-row-${i}`} key={m.id}>
                  <i className="mn-row-dot" />
                  <span className="mn-mono small">
                    <img src={V + "anthropic.svg"} alt="" />
                  </span>
                  <span className="mn-row-info">
                    <b>{m.name}</b>
                    <small>{m.id}</small>
                  </span>
                  {m.free && <span className="mn-badge">free</span>}
                  {m.vision && <span className="mn-badge">◉ vision</span>}
                  <span className="mn-badge">{fmtCtx(m.ctx)}</span>
                  <Toggle />
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  return (
    <div className="mn-view mn-chat">
      <Topbar />
      <div className="mn-feed">
        <div className="mn-user">{MUN_QUERY}</div>
        <div className="mn-answer">
          <span className="mn-type">FINANCIAL ANALYSIS</span>
          <div className="mn-live">
            <span className="mn-live-chip l0">
              <i style={{ background: "#4ade80" }} />
              ChatGPT
            </span>
            <span className="mn-live-chip l1">
              <i style={{ background: "#e8855a" }} />
              Claude
            </span>
            <span className="mn-live-chip l2">
              <i style={{ background: "#60a5fa" }} />
              Gemini
            </span>
            <span className="mn-live-chip l3">
              <i style={{ background: "#e8855a" }} />
              Claude Opus
            </span>
          </div>
          <p className="mn-consensus">
            <span className="mn-stream" />
            <i className="mn-stream-caret" />
          </p>
          <div className="mn-meta">
            <span className="mn-conf">
              <i /> High confidence
            </span>
            <span className="mn-sources">4 sources</span>
          </div>
          <div className="mn-model-cards">
            {[
              ["#4ade80", "ChatGPT", "Gpt 5.1"],
              ["#e8855a", "Claude", "Sonnet 5"],
              ["#60a5fa", "Gemini", "Gemini 2.5 Pro"],
              ["#e8855a", "Claude", "Opus 5.5"],
            ].map(([c, p, m]) => (
              <div className="mn-model-card" key={m}>
                <i style={{ background: c }} />
                <span style={{ color: c }}>{p}</span>
                <small>{m}</small>
                <em>›</em>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Composer className="mn-chat-input" />
    </div>
  );
}

export function MunApp() {
  return (
    <div className="app mn" data-app="mun">
      <div className="mn-frame">
        <Intro />
        <Library />
        <Chat />
      </div>
    </div>
  );
}
