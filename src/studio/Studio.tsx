import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, ownerEmail, supabase } from "../lib/supabase";
import { fetchContent } from "../content/store";
import type { SiteContent } from "../content/types";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { ResearchPanel } from "./panels/ResearchPanel";
import { LinksAdminPanel } from "./panels/LinksAdminPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { MediaPanel } from "./panels/MediaPanel";
import "./studio.css";

type Tab = "projects" | "research" | "links" | "settings" | "media";

const TABS: Array<[Tab, string]> = [
  ["projects", "Projects"],
  ["research", "Research"],
  ["links", "Links"],
  ["settings", "Site"],
  ["media", "Media"],
];

/**
 * The control room. Authentication is Supabase Auth; authorisation is enforced
 * in Postgres by row-level security against the owner allowlist, so knowing
 * this URL grants nothing.
 */
export default function Studio() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [tab, setTab] = useState<Tab>("projects");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--bg", "#050505");
    document.documentElement.style.setProperty("--fg", "#f2f2f0");
    document.documentElement.style.setProperty("--accent", "#ff3b30");
    document.title = "Studio — High on Java";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  const reload = useCallback(async () => {
    setContent(await fetchContent({ includeDrafts: true }));
  }, []);

  useEffect(() => {
    if (session) void reload();
  }, [session, reload]);

  if (!isSupabaseConfigured) {
    return (
      <main className="studio studio-gate">
        <h1>Studio</h1>
        <p>
          This instance has no backend configured, so the public site is running on its seeded
          content. Add <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code> and{" "}
          <code>VITE_OWNER_EMAIL</code> to <code>.env.local</code>, run the SQL in{" "}
          <code>supabase/schema.sql</code>, and reload.
        </p>
      </main>
    );
  }

  if (!ready) return <main className="studio studio-gate">Checking session…</main>;

  const email = session?.user.email?.toLowerCase();
  const isOwner = Boolean(email && (!ownerEmail || email === ownerEmail));

  if (!session) return <SignIn onError={setError} error={error} />;

  if (!isOwner) {
    return (
      <main className="studio studio-gate">
        <h1>Not your studio</h1>
        <p>{email} is signed in but is not the owner account.</p>
        <button className="btn" onClick={() => supabase!.auth.signOut()}>
          Sign out
        </button>
      </main>
    );
  }

  return (
    <main className="studio">
      <header className="studio-bar">
        <span className="studio-mark">HOJ / STUDIO</span>
        <nav className="studio-tabs">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              className={`studio-tab${tab === key ? " is-active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="studio-actions">
          <a className="btn btn-ghost" href="/" target="_blank" rel="noreferrer">
            View site
          </a>
          <button className="btn btn-ghost" onClick={() => supabase!.auth.signOut()}>
            Sign out
          </button>
        </div>
      </header>

      {!content ? (
        <p className="studio-loading">Loading content…</p>
      ) : (
        <div className="studio-body">
          {tab === "projects" && <ProjectsPanel content={content} reload={reload} />}
          {tab === "research" && <ResearchPanel content={content} reload={reload} />}
          {tab === "links" && <LinksAdminPanel content={content} reload={reload} />}
          {tab === "settings" && <SettingsPanel content={content} reload={reload} />}
          {tab === "media" && <MediaPanel />}
        </div>
      )}
    </main>
  );
}

function SignIn({ onError, error }: { onError: (e: string | null) => void; error: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="studio studio-gate">
      <h1>Studio</h1>
      <form
        className="signin"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          onError(null);
          const { error } = await supabase!.auth.signInWithPassword({ email, password });
          if (error) onError(error.message);
          setBusy(false);
        }}
      >
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? "…" : "Enter"}
        </button>
        {error && <p className="studio-error">{error}</p>}
        <p className="field-hint">
          There is no sign-up. The owner account is created once in the Supabase dashboard.
        </p>
      </form>
    </main>
  );
}
