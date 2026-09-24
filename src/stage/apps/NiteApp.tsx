/**
 * nite, authored at 393 × 852 points. Layout is measured from the design
 * exports (852 px wide, i.e. ×2.168): loader, welcome, create account,
 * verify, and Home in Find (LiveLines, SafeRoute) and Plan.
 */

const U = "/projects/nite/ui/";

type IconName =
  | "lines" | "route" | "bed" | "ghost" | "search" | "home" | "chat" | "plus" | "gear" | "user"
  | "person" | "mail" | "lock" | "cap" | "eyeoff" | "down" | "back" | "cal" | "check" | "book" | "group" | "folder";

function Ico({ n, className = "" }: { n: IconName; className?: string }) {
  const d: Record<IconName, React.ReactNode> = {
    lines: <path d="M5 8h11v11M9 12h3v7" />,
    route: (
      <>
        <path d="M12 2.8 21.2 12 12 21.2 2.8 12Z" />
        <path d="M9 14.5v-2a2 2 0 0 1 2-2h2a2 2 0 0 0 2-2V7.5M13.5 9l1.5-1.5L16.5 9" />
      </>
    ),
    bed: (
      <>
        <path d="M3 6v13M3 16h18v3M21 16v-3a3 3 0 0 0-3-3h-7v6" />
        <circle cx="7" cy="12" r="2" />
      </>
    ),
    ghost: (
      <>
        <path d="M6 20V10a6 6 0 0 1 12 0v10l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5Z" />
        <circle cx="10" cy="10.5" r=".6" fill="currentColor" />
        <circle cx="14" cy="10.5" r=".6" fill="currentColor" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" />,
    chat: (
      <>
        <path d="M14 9a5 5 0 1 0-9.2 2.7L4 14l2.4-.8A5 5 0 0 0 14 9Z" />
        <path d="M10.5 15.8A5 5 0 0 0 17.6 17l2.4.8-.8-2.3A5 5 0 0 0 16 8.4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2.5 14 5l3.2-.4.9 3.1 2.9 1.4-1.2 3 1.2 3-2.9 1.4-.9 3.1L14 19l-2 2.5-2-2.5-3.2.4-.9-3.1L3 14.9l1.2-3L3 9l2.9-1.4.9-3.1L10 5Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="10" r="3" />
        <path d="M6.5 18.2a6 6 0 0 1 11 0" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 6 0 0 1 16 0Z" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 6.5 8.5 6 8.5-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <circle cx="12" cy="15.5" r=".8" fill="currentColor" />
      </>
    ),
    cap: <path d="M2 9.5 12 5l10 4.5L12 14Zm4 2v4.5c2.5 2.5 9.5 2.5 12 0v-4.5M22 9.5V14" />,
    eyeoff: (
      <>
        <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.8" />
        <path d="m4 4 16 16" />
      </>
    ),
    down: <path d="m6 9 6 6 6-6" />,
    back: <path d="M15 5 8 12l7 7" />,
    cal: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </>
    ),
    check: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Zm0 15A2.5 2.5 0 0 0 6.5 23H20v-5" />,
    group: (
      <>
        <circle cx="9" cy="9" r="3.2" />
        <circle cx="17" cy="10" r="2.4" />
        <path d="M3 19a6 5 0 0 1 12 0M15 15.5a4.5 4 0 0 1 6 3.5" />
      </>
    ),
    folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  };
  return (
    <svg className={`nt-ico ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {d[n]}
    </svg>
  );
}

function Status() {
  return (
    <div className="nt-status">
      <span>9:41</span>
      <span className="nt-status-r">
        <svg viewBox="0 0 18 12" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" aria-hidden="true">
          <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0Zm-4-4.2a5.7 5.7 0 0 1 8 0l1.5-1.5a7.8 7.8 0 0 0-11 0Zm-3-3a10 10 0 0 1 14 0L16.5 2.8a12 12 0 0 0-17 0Z" />
        </svg>
        <span className="nt-batt">
          <i />
        </span>
      </span>
    </div>
  );
}

function Arc({ className }: { className: string }) {
  return <i className={`nt-arc ${className}`} aria-hidden="true" />;
}

function Steps({ n }: { n: number }) {
  return (
    <div className="nt-steps">
      <span className="nt-step-label">
        step <b className="nt-step-n">{n}</b>/3
      </span>
      <span className="nt-bars">
        <i className="on" />
        <i className={`nt-bar2 ${n >= 2 ? "on" : ""}`} />
        <i />
      </span>
    </div>
  );
}

function Social() {
  return (
    <>
      <div className="nt-or">
        <i />
        or continue with
        <i />
      </div>
      <div className="nt-social">
        <span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#fff"
              d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8A4.7 4.7 0 0 0 4.2 9.5c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4a10 10 0 0 0 1.3-2.7 4.2 4.2 0 0 1-2.6-4ZM14 5.4A4.2 4.2 0 0 0 15 2.3a4.3 4.3 0 0 0-2.8 1.4 4 4 0 0 0-1 3 3.6 3.6 0 0 0 2.8-1.3Z"
            />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6Z" />
            <path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10.5 10.5 0 0 0 12 22.5Z" />
            <path fill="#FBBC05" d="M6.2 14.1a6.3 6.3 0 0 1 0-4.1V7.3H2.7a10.5 10.5 0 0 0 0 9.4Z" />
            <path fill="#EA4335" d="M12 5.7c1.5 0 2.9.5 4 1.6l3-3A10.5 10.5 0 0 0 2.7 7.3L6.2 10C7 7.5 9.3 5.7 12 5.7Z" />
          </svg>
        </span>
        <span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#fff"
              d="M19.3 5.3A16.6 16.6 0 0 0 15.2 4l-.5 1a15.4 15.4 0 0 0-4.6 0l-.5-1a16.5 16.5 0 0 0-4.1 1.3 17 17 0 0 0-3 11.5 16.7 16.7 0 0 0 5.1 2.6l1.1-1.8a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.2 0l.4.3-1.7.8 1.1 1.8a16.6 16.6 0 0 0 5.1-2.6 17 17 0 0 0-3-11.5ZM9 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"
            />
          </svg>
        </span>
      </div>
    </>
  );
}

function Loader() {
  return (
    <div className="nt-view nt-loader">
      <p>nite.</p>
    </div>
  );
}

function Welcome() {
  return (
    <div className="nt-view nt-welcome">
      <Arc className="nt-arc-welcome" />
      <Status />
      <img className="nt-wordmark" src={U + "wordmark.png"} alt="nite" />
      <h2 className="nt-welcome-title">enjoy smarter.</h2>
      <p className="nt-welcome-sub">
        events, people, and a better
        <br />
        student life.
      </p>
      <span className="nt-btn nt-btn-white nt-create">create account</span>
      <span className="nt-btn nt-btn-dark nt-signin">sign in</span>
    </div>
  );
}

const FIELDS: { icon: IconName; ph: string; cls: string; eye?: boolean; down?: boolean }[] = [
  { icon: "person", ph: "full name", cls: "f-name" },
  { icon: "mail", ph: "school email", cls: "f-email" },
  { icon: "lock", ph: "password", cls: "f-pass", eye: true },
  { icon: "lock", ph: "confirm password", cls: "f-pass2", eye: true },
  { icon: "cap", ph: "university", cls: "f-uni", down: true },
];

function Create() {
  return (
    <div className="nt-view nt-create-view">
      <Arc className="nt-arc-corner" />
      <Status />
      <Ico n="back" className="nt-back" />
      <Steps n={1} />
      <img className="nt-logo-sm" src={U + "wordmark.png"} alt="" />
      <h2 className="nt-serif">
        create your
        <br />
        account.
      </h2>
      <p className="nt-lede">
        join a more connected
        <br />
        student experience.
      </p>
      <div className="nt-fields">
        {FIELDS.map((f) => (
          <div className={`nt-field ${f.cls}`} key={f.cls}>
            <Ico n={f.icon} />
            <span className="nt-field-ph">{f.ph}</span>
            <span className="nt-field-val" />
            {f.eye && <Ico n="eyeoff" className="nt-field-end" />}
            {f.down && <Ico n="down" className="nt-field-end" />}
          </div>
        ))}
      </div>
      <div className="nt-agree">
        <span className="nt-check">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 12.5 4 4 8-9" />
          </svg>
        </span>
        <p>
          I agree to the <u>Terms of Service</u>
          <br />
          and <u>Privacy Policy</u>.
        </p>
      </div>
      <span className="nt-btn nt-btn-white nt-create-submit">create account</span>
      <div className="nt-social-wrap">
        <Social />
      </div>
    </div>
  );
}

function Verify() {
  return (
    <div className="nt-view nt-verify">
      <Arc className="nt-arc-corner" />
      <Status />
      <Ico n="back" className="nt-back" />
      <Steps n={2} />
      <img className="nt-logo-sm lower" src={U + "wordmark.png"} alt="" />
      <h2 className="nt-serif lower">
        verify your
        <br />
        email.
      </h2>
      <p className="nt-lede lower">
        we sent a 6-digit code to
        <br />
        <b>you@utdallas.edu</b>
      </p>
      <div className="nt-code">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span className={`nt-digit d${i}`} key={i}>
            <b />
            {i === 0 && <i className="nt-code-caret" />}
          </span>
        ))}
      </div>
      <p className="nt-resend">
        didn't receive a code? <u>resend (53s)</u>
      </p>
      <span className="nt-btn nt-btn-white nt-continue">continue</span>
    </div>
  );
}

const EVENTS = [
  { img: "tavern.jpg", t: "Tavern & Talks", host: "Student Union", line: "~20 min", cover: "$12", price: "$12", full: 70 },
  { img: "rooftop.jpg", t: "Campus Rooftop Mixer", host: "UCB Social Club", line: "~15 min", cover: "$8", price: "$8", full: 40 },
];
const POPULAR = [
  { img: "openmic.jpg", t: "The Daily Grind (Open Mic)", host: "Riverdale Coffee", line: "~10 min", cover: "Free", price: "Free", full: 0 },
  { img: "munchies.jpg", t: "Midnight Munchies", host: "Campus Eats", line: "~25 min", cover: "$5", price: "$5", full: 60 },
];

function EventCard({ e }: { e: (typeof EVENTS)[number] }) {
  return (
    <div className="nt-ev">
      <img src={U + e.img} alt="" />
      <p className="nt-ev-title">
        <span>{e.t}</span>
        <b>{e.price}</b>
      </p>
      <p>
        Host: <span>{e.host}</span>
      </p>
      <p>
        Line: <span>{e.line}</span>
      </p>
      <p>
        Cover: <span>{e.cover}</span>
      </p>
      {e.full > 0 && (
        <p className="nt-ev-full">
          <i>
            <b style={{ width: `${e.full}%` }} />
          </i>
          {e.full}% full
        </p>
      )}
    </div>
  );
}

/** A dark street grid with a purple route that draws itself. */
function RouteMap({ id, path, from, to }: { id: string; path: string; from: [number, number]; to: [number, number] }) {
  return (
    <svg className="nt-map" viewBox="0 0 180 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="180" height="90" fill="#101014" />
      <g stroke="#1f1f27" strokeWidth="0.8" fill="none">
        <path d="M-5 20 L190 8 M-5 44 L190 36 M-5 70 L190 62 M20 -5 L28 95 M58 -5 L64 95 M96 -5 L100 95 M134 -5 L136 95 M166 -5 L170 95" />
        <path d="M-5 84 C40 60 70 90 120 50 S170 30 190 20" stroke="#262631" strokeWidth="1.6" />
      </g>
      <g stroke="#17171d" strokeWidth="0.5">
        <path d="M0 30 L180 22 M0 57 L180 49 M40 0 L46 90 M78 0 L82 90 M116 0 L118 90 M152 0 L154 90" />
      </g>
      <path className={`nt-route nt-route-${id}`} d={path} pathLength={1} />
      <circle cx={from[0]} cy={from[1]} r="4.5" fill="none" stroke="#fff" strokeWidth="1.4" />
      <circle cx={from[0]} cy={from[1]} r="2" fill="#fff" />
      <circle className={`nt-route-end nt-route-end-${id}`} cx={to[0]} cy={to[1]} r="3" />
    </svg>
  );
}

function Home() {
  return (
    <div className="nt-view nt-home">
      <Status />
      <div className="nt-heads">
        <h2 className="nt-head h-line">check the line.</h2>
        <h2 className="nt-head h-route">get there safe.</h2>
        <h2 className="nt-head h-plan">stay ahead.</h2>
      </div>

      <div className="nt-toggle">
        <i className="nt-toggle-ink" />
        <span className="nt-toggle-find">find</span>
        <span className="nt-toggle-plan">plan</span>
      </div>

      <div className="nt-tiles nt-tiles-find">
        {(
          [
            ["lines", "LiveLines"],
            ["route", "SafeRoute"],
            ["bed", "CrashLink"],
            ["ghost", "Ghost"],
            ["search", "Finder"],
          ] as [IconName, string][]
        ).map(([n, l], i) => (
          <div className={`nt-tile t${i}`} key={l}>
            <span className="nt-tile-box">
              <i className="nt-tile-glow" />
              <Ico n={n} />
            </span>
            <span className="nt-tile-label">{l}</span>
          </div>
        ))}
      </div>
      <div className="nt-tiles nt-tiles-plan">
        {(
          [
            ["cal", "Schedule"],
            ["check", "Tasks"],
            ["book", "Study Hub"],
            ["group", "Groups"],
            ["folder", "Resources"],
          ] as [IconName, string][]
        ).map(([n, l], i) => (
          <div className={`nt-tile t${i}`} key={l}>
            <span className="nt-tile-box">
              <i className="nt-tile-glow" />
              <Ico n={n} />
            </span>
            <span className="nt-tile-label">{l}</span>
          </div>
        ))}
      </div>

      <div className="nt-feed nt-feed-line">
        <h3 className="nt-section">nearby now:</h3>
        <div className="nt-row">
          {EVENTS.map((e) => (
            <EventCard e={e} key={e.t} />
          ))}
        </div>
        <h3 className="nt-section">popular tonight:</h3>
        <div className="nt-row">
          {POPULAR.map((e) => (
            <EventCard e={e} key={e.t} />
          ))}
        </div>
      </div>

      <div className="nt-feed nt-feed-route">
        <h3 className="nt-section">suggested routes:</h3>
        <div className="nt-row">
          <div className="nt-rt">
            <div className="nt-rt-map">
              <RouteMap id="a" path="M20 70 H58 V52 H86 V40 H112 V34 H140 V26 H152" from={[20, 70]} to={[152, 26]} />
              <span className="nt-rt-tag">to campus</span>
              <span className="nt-rt-eta">
                12 min
                <br />
                <small>2.8 mi</small>
              </span>
            </div>
            <p className="nt-ev-title">
              <span>UTD → Home</span>
              <b>$12</b>
            </p>
            <p className="nt-rt-sub">UberX • Arrives in 4 min</p>
            <i className="nt-rt-bar">
              <b style={{ width: "58%" }} />
            </i>
          </div>
          <div className="nt-rt">
            <div className="nt-rt-map">
              <RouteMap id="b" path="M22 72 H66 V54 H76 V36 H104 V30 H122 V22 H132" from={[22, 72]} to={[132, 22]} />
              <span className="nt-rt-tag">to event</span>
              <span className="nt-rt-eta">
                8 min
                <br />
                <small>1.9 mi</small>
              </span>
            </div>
            <p className="nt-ev-title">
              <span>UTD → Legacy West</span>
              <b>$9</b>
            </p>
            <p className="nt-rt-sub">Lyft • Arrives in 3 min</p>
            <i className="nt-rt-bar">
              <b style={{ width: "52%" }} />
            </i>
          </div>
        </div>
        <h3 className="nt-section">nearby pick up spots:</h3>
        <div className="nt-row">
          {[
            ["library.jpg", "UTD Library", "Safe Pick-Up Zone", "0.2 mi"],
            ["legacy.jpg", "Legacy West", "Main Rideshare Spot", "4.1 mi"],
          ].map(([img, t, s, d]) => (
            <div className="nt-ev" key={t}>
              <img src={U + img} alt="" />
              <p className="nt-ev-title">
                <span>{t}</span>
                <b>Free</b>
              </p>
              <p className="nt-rt-sub">{s}</p>
              <p className="nt-rt-sub">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="nt-feed nt-feed-plan">
        <h3 className="nt-section">your semester:</h3>
        <div className="nt-row">
          <div className="nt-sem">
            <span className="nt-sem-k">Midterm Plan</span>
            <b className="nt-sem-big">3 subjects</b>
            <i className="nt-sem-bar">
              <b className="nt-sem-fill" />
            </i>
            <span className="nt-sem-foot">
              <span className="nt-sem-pct">0</span>% complete
            </span>
          </div>
          <div className="nt-sem">
            <span className="nt-sem-k">Exam Countdown</span>
            <b className="nt-sem-big">Calculus II</b>
            <span className="nt-sem-days">
              12 <small>days</small>
            </span>
          </div>
        </div>
        <h3 className="nt-section">coming up:</h3>
        <div className="nt-up">
          {[
            ["Assignment 4", "CS 3345 · due tomorrow, 11:59pm", "due"],
            ["Calc II study group", "Thu 6:00pm · Library 3F", "group"],
            ["Physics midterm", "Mon 9:00am · SCI 1.210", "exam"],
          ].map(([t, s, k]) => (
            <div className="nt-up-row" key={t}>
              <i className={`nt-up-dot ${k}`} />
              <span>
                <b>{t}</b>
                <small>{s}</small>
              </span>
            </div>
          ))}
        </div>
      </div>

      <nav className="nt-tabbar">
        <Ico n="home" className="on" />
        <Ico n="chat" />
        <span className="nt-plus">
          <Ico n="plus" />
        </span>
        <Ico n="gear" />
        <Ico n="user" />
      </nav>
    </div>
  );
}

export function NiteApp() {
  return (
    <div className="app nt" data-app="nite">
      <Home />
      <Verify />
      <Create />
      <Welcome />
      <Loader />
    </div>
  );
}
