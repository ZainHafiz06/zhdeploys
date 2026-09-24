/**
 * hazeCSS web app, authored at the laptop's 1280 × 800 virtual resolution.
 * Static markup only: every state change is driven by the stage timeline
 * through the class names and data-* hooks below.
 */

function Mark({ size = 22 }: { size?: number }) {
  return (
    <span className="hz-mark" style={{ width: size, height: size }} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function Logo() {
  return (
    <span className="hz-logo">
      <Mark />
      haze
    </span>
  );
}

/* Three navbar designs — the numbered variants the whole product is built on. */
function Nav1() {
  return (
    <div className="nv nv-1">
      <span className="nv-brand">
        <b className="nv-dot" /> northwind
      </span>
      <span className="nv-links">
        <span>Product</span>
        <span>Pricing</span>
        <span>Docs</span>
        <span>Blog</span>
      </span>
      <span className="nv-btn">Get started</span>
    </div>
  );
}

function Nav2() {
  return (
    <div className="nv nv-2">
      <span className="nv-brand">◐ lumen</span>
      <span className="nv-links">
        <span className="on">Work</span>
        <span>Studio</span>
        <span>Journal</span>
      </span>
      <span className="nv-btn">Contact →</span>
    </div>
  );
}

function Nav3({ tunable = false }: { tunable?: boolean }) {
  return (
    <div className={`nv nv-3 ${tunable ? "hz-tunable" : ""}`}>
      <span className="nv-links">
        <span>Features</span>
        <span>Customers</span>
      </span>
      <span className="nv-brand">
        <Mark size={16} /> orbit
      </span>
      <span className="nv-links">
        <span>Changelog</span>
        <span className="nv-btn">Sign in</span>
      </span>
    </div>
  );
}

function Actions({ customize = false }: { customize?: boolean }) {
  return (
    <span className="hz-actions">
      <span className="on">Preview</span>
      <span>HTML</span>
      <span>CSS</span>
      <span className={customize ? "hz-customize" : ""}>Customize</span>
      <span className="hz-copy-btn">Copy</span>
    </span>
  );
}

function Browser() {
  const cats = ["Navigation", "Buttons", "Cards", "Forms", "Inputs", "Dropdowns", "Modals", "Tables", "Layout", "Utilities"];
  return (
    <div className="hz-view hz-browser">
      <AppBar active="Components" />
      <aside className="hz-side">
        <p className="hz-side-label">Categories</p>
        {cats.map((c) => (
          <div key={c} className={`hz-cat ${c === "Navigation" ? "open" : ""}`}>
            <span>{c}</span>
            {c === "Navigation" && (
              <div className="hz-sub">
                <span className="on">Navbar</span>
                <span>Sidebar</span>
                <span>Breadcrumb</span>
                <span>Tabs</span>
              </div>
            )}
          </div>
        ))}
      </aside>
      <main className="hz-list-wrap">
        <div className="hz-list">
          <header className="hz-list-head">
            <p className="hz-crumb">Components / Navigation</p>
            <h2>Navbar</h2>
            <p className="hz-muted">12 variations · responsive · light &amp; dark</p>
          </header>
          {[
            { n: "01", cls: "haze-nav-1", el: <Nav1 /> },
            { n: "02", cls: "haze-nav-2", el: <Nav2 /> },
            { n: "03", cls: "haze-nav-3", el: <Nav3 /> },
          ].map((v) => (
            <section key={v.n} className={`hz-item hz-item-${v.n}`}>
              <div className="hz-item-row">
                <span className="hz-item-name">Navbar {v.n}</span>
                <code className="hz-chip">{v.cls}</code>
                <Actions customize={v.n === "03"} />
              </div>
              <div className="hz-canvas">{v.el}</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function AppBar({ active }: { active: string }) {
  return (
    <header className="hz-appbar">
      <Logo />
      <nav className="hz-tabs">
        {["Components", "Docs", "Templates", "Playground", "Community"].map((t) => (
          <span key={t} className={`hz-tab hz-tab-${t.toLowerCase()} ${t === active ? "on" : ""}`}>
            {t}
          </span>
        ))}
      </nav>
      <span className="hz-search">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3.5 3.5" />
        </svg>
        Search components…
        <kbd>⌘K</kbd>
      </span>
    </header>
  );
}

const SWATCHES = ["#7c5cff", "#2f7bff", "#16b88a", "#ff6a55"];

function Detail() {
  return (
    <div className="hz-view hz-detail">
      <AppBar active="Components" />
      <div className="hz-detail-body">
        <div className="hz-detail-main">
          <p className="hz-crumb">
            Components / Navigation / <b>haze-nav-3</b>
          </p>
          <div className="hz-toolbar">
            <span className="hz-seg">
              <span className="on">Desktop</span>
              <span>Tablet</span>
              <span>Mobile</span>
            </span>
            <span className="hz-seg">
              <span className="on">Light</span>
              <span>Dark</span>
            </span>
          </div>
          <div className="hz-stage">
            <Nav3 tunable />
            <div className="hz-stage-hero">
              <h3>Ship the orbit.</h3>
              <p>A calmer way to plan launches.</p>
              <span className="hz-stage-btn">Start free</span>
            </div>
          </div>
          <pre className="hz-code">
            <span className="c-tag">&lt;nav</span> <span className="c-attr">class</span>=
            <span className="c-str">"haze-nav-3"</span>
            {"\n  "}
            <span className="c-attr">style</span>=<span className="c-str">"--haze-accent: </span>
            <span className="c-str hz-code-accent">#7c5cff</span>
            <span className="c-str">; --haze-radius: </span>
            <span className="c-str hz-code-radius">10px</span>
            <span className="c-str">"</span>
            <span className="c-tag">&gt;</span>
            {"\n  …\n"}
            <span className="c-tag">&lt;/nav&gt;</span>
          </pre>
        </div>
        <aside className="hz-panel">
          <p className="hz-panel-title">Customize</p>
          <p className="hz-muted small">Variables only — the framework stays untouched.</p>
          <label className="hz-field">
            <span>Accent</span>
            <span className="hz-swatches">
              {SWATCHES.map((c, i) => (
                <i key={c} className={`hz-swatch hz-swatch-${i}`} style={{ background: c }} />
              ))}
            </span>
          </label>
          <label className="hz-field">
            <span>
              Radius <em className="hz-val-radius">10px</em>
            </span>
            <span className="hz-slider">
              <i className="hz-slider-fill hz-radius-fill" />
              <i className="hz-slider-knob hz-radius-knob" />
            </span>
          </label>
          <label className="hz-field">
            <span>
              Height <em>64px</em>
            </span>
            <span className="hz-slider">
              <i className="hz-slider-fill" style={{ width: "46%" }} />
              <i className="hz-slider-knob" style={{ left: "46%" }} />
            </span>
          </label>
          <label className="hz-field">
            <span>
              Blur <em>12px</em>
            </span>
            <span className="hz-slider">
              <i className="hz-slider-fill" style={{ width: "60%" }} />
              <i className="hz-slider-knob" style={{ left: "60%" }} />
            </span>
          </label>
          <span className="hz-primary hz-copy-custom">Copy customized</span>
          <span className="hz-toast">
            <b>✓</b> Copied haze-nav-3
          </span>
        </aside>
      </div>
    </div>
  );
}

const CODE_LINES = [
  ["c-tag:<div ", "c-attr:class", "t:=", "c-str:\"haze-card-", "c-num hz-type:2", "c-str:\"", "c-tag:>"],
  ["t:  ", "c-tag:<img ", "c-attr:src", "t:=", "c-str:\"aurora.jpg\"", "c-tag: />"],
  ["t:  ", "c-tag:<h3>", "t:Northern lights", "c-tag:</h3>"],
  ["t:  ", "c-tag:<p>", "t:Tonight, 11pm — clear skies.", "c-tag:</p>"],
  ["t:  ", "c-tag:<button ", "c-attr:class", "t:=", "c-str:\"haze-btn-1\"", "c-tag:>", "t:Reserve", "c-tag:</button>"],
  ["c-tag:</div>"],
];

function Playground() {
  return (
    <div className="hz-view hz-play">
      <AppBar active="Playground" />
      <div className="hz-play-body">
        <div className="hz-editor">
          <div className="hz-editor-tabs">
            <span className="on">index.html</span>
            <span>styles.css</span>
            <span>main.js</span>
          </div>
          <pre className="hz-editor-code">
            {CODE_LINES.map((line, i) => (
              <div key={i} className="hz-line">
                <span className="hz-ln">{i + 1}</span>
                {line.map((part, j) => {
                  const [cls, ...rest] = part.split(":");
                  const text = rest.join(":");
                  return (
                    <span key={j} className={cls === "t" ? undefined : cls}>
                      {text}
                      {cls.includes("hz-type") && <i className="hz-caret" />}
                    </span>
                  );
                })}
              </div>
            ))}
          </pre>
          <p className="hz-editor-foot">
            <span className="hz-live" /> Live — renders as you type
          </p>
        </div>
        <div className="hz-preview">
          <div className="hz-preview-bar">
            <span className="hz-seg">
              <span className="on">Desktop</span>
              <span>Tablet</span>
              <span>Mobile</span>
            </span>
          </div>
          <div className="hz-preview-stage">
            <article className="card card-2">
              <div className="card-img" />
              <div className="card-body">
                <h4>Northern lights</h4>
                <p>Tonight, 11pm — clear skies.</p>
                <span className="card-btn">Reserve</span>
              </div>
            </article>
            <article className="card card-4">
              <div className="card-img" />
              <div className="card-body">
                <span className="card-kicker">Tonight · 11pm</span>
                <h4>Northern lights</h4>
                <p>Clear skies over the lake.</p>
                <span className="card-btn">Reserve</span>
              </div>
            </article>
          </div>
          <p className="hz-preview-cls">
            class=<code className="hz-preview-name">haze-card-2</code>
          </p>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div className="hz-view hz-landing">
      <header className="hz-nav">
        <Logo />
        <nav className="hz-nav-links">
          <span>Components</span>
          <span>Docs</span>
          <span>Templates</span>
          <span>Playground</span>
          <span>Community</span>
        </nav>
        <span className="hz-nav-right">
          <span>GitHub</span>
          <span className="hz-install-btn">Install</span>
        </span>
      </header>

      <section className="hz-hero">
        <span className="hz-pill">
          <b>new</b> Theme editor is live
        </span>
        <h1>
          build interfaces
          <br />
          through the <span className="hz-haze-word">haze.</span>
        </h1>
        <p className="hz-sub">Beautiful responsive components. One class away.</p>

        <div className="hz-install">
          <div className="hz-install-tabs">
            <span className="hz-pm hz-pm-npm on">npm</span>
            <span className="hz-pm hz-pm-pnpm">pnpm</span>
            <span className="hz-pm">yarn</span>
            <span className="hz-pm">CDN</span>
            <i className="hz-pm-ink" />
          </div>
          <code className="hz-cmd">
            <span className="hz-prompt">$</span>
            <span className="hz-cmd-text hz-cmd-npm">npm install haze-css</span>
            <span className="hz-cmd-text hz-cmd-pnpm">pnpm add haze-css</span>
            <span className="hz-copy">⧉</span>
          </code>
        </div>

        <div className="hz-ctas">
          <span className="hz-primary hz-browse">Browse Components</span>
          <span className="hz-ghost">Open Playground</span>
        </div>
      </section>

      <div className="hz-window">
        <div className="hz-window-bar">
          <i />
          <i />
          <i />
          <span>preview — built only with haze</span>
        </div>
        <div className="hz-demo">
          <div className="hz-part hz-part-nav" data-cls="haze-nav-2">
            <span className="hz-part-brand">
              <Mark size={14} /> atlas
            </span>
            <span className="hz-part-links">
              <span>Tours</span>
              <span>Stays</span>
              <span>Journal</span>
            </span>
            <code className="hz-tag">haze-nav-2</code>
          </div>
          <div className="hz-part hz-part-card" data-cls="haze-card-4">
            <div className="hz-part-img" />
            <div className="hz-part-copy">
              <span className="hz-part-kicker">Iceland · 6 days</span>
              <b>Chasing the aurora</b>
            </div>
            <code className="hz-tag">haze-card-4</code>
          </div>
          <div className="hz-part-row">
            <div className="hz-part hz-part-btn" data-cls="haze-btn-1">
              Book trip
              <code className="hz-tag">haze-btn-1</code>
            </div>
            <div className="hz-part hz-part-input" data-cls="haze-input-2">
              you@mail.com
              <code className="hz-tag">haze-input-2</code>
            </div>
          </div>
          <div className="hz-part-grid">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HazeApp() {
  return (
    <div className="app hz" data-app="haze">
      <div className="hz-atmos" aria-hidden="true">
        <i className="a1" />
        <i className="a2" />
        <i className="a3" />
      </div>
      <Landing />
      <Browser />
      <Detail />
      <Playground />
    </div>
  );
}
