# High on Java

An authored scroll experience for Zain Hafiz's portfolio, plus a private studio
for editing everything it shows.

The home page is one pinned stage. The viewport never moves; scrolling plays a
single timeline instead. "high on java" scrolls up out of frame, the laptop from
the Figma mockup turns towards you, and each web app runs on its screen —
**Haze → MŪN → Vaqfa** — with a pointer clicking through its key features. Then
the laptop leaves, a phone arrives, and **Nite** plays the same way. Short
blurbs (logo, bold header, light subheader) fade in and out on the left, and
the clouds behind drift live.

## Stack

| Concern | Choice |
| --- | --- |
| App | Vite + React 19 + TypeScript |
| Scroll-driven motion | Anime.js v4 — one `createTimeline` linked to `onScroll` |
| Smooth scroll | Lenis |
| Sky | A small WebGL fragment shader (no library) |
| Content, auth, media | Supabase (Postgres + Auth + Storage) |

The site is a static build, so it deploys anywhere. Authorisation is enforced in
Postgres with row-level security rather than on a server, which is what makes a
real admin possible without one.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview
```

With no environment configured, the site renders from `src/content/seed.ts`
and `/studio` explains what is missing. Nothing is broken in that state.

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Meaning |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key. Safe to ship; every table is behind RLS. |
| `VITE_OWNER_EMAIL` | The only account allowed into `/studio`. Shapes the UI; the database enforces it independently. |

## Database setup

1. Run `supabase/schema.sql` in the Supabase SQL editor. Edit the email in the
   `owners` insert first.
2. Optionally run `supabase/seed.sql` to start the tables where the local seed
   content leaves off.
3. Create the owner user once under Authentication → Users.
4. Turn off sign-ups under Authentication → Providers → Email. There is no
   registration path in the app.

Storage uses a public `media` bucket: anyone can read published assets, only the
owner can write. Uploaded originals are never modified.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | The stage. The index in the top bar jumps to each app. |
| `/work/:slug` | Readable project page in that project's palette. |
| `/research/:slug` | Readable research entry. |
| `/studio` | Private admin. Never linked publicly; `/admin` redirects here. |

Append `?preview=1` to a work or research route to render draft content. The
database only returns drafts to the signed-in owner.

## The studio

Projects, research entries, links and site copy are all editable, with drag
reordering, publish and draft states, duplication, deletion behind a
confirmation, a media library with uploads and alt text, per-project palettes,
and preview links. The stage reads links and SEO copy from the studio; the
app demos and their blurbs are authored in code (`src/stage/`), because each
one is a hand-built reproduction of the product.

## Content honesty

Narrative one-liners and palettes are authored in the seed. Factual fields —
role, dates, descriptions, outcomes, research findings — are deliberately empty
and are omitted from the page until filled in from the studio. Nothing about the
work is invented.

The research entry is titled **Multi-Model Routing**, which describes the
subject rather than naming a project. Rename it from the studio when the work
has a real name; the slug, the chapter deep link and the rail label all follow
the title you set.

## The stage

```
src/stage/
  story.ts      every beat range and blurb — the script for the whole page
  timeline.ts   builds the one Anime.js timeline from story.ts
  geometry.ts   Figma coordinates, the laptop-screen homography, layouts
  Sky.tsx       WebGL clouds
  Devices.tsx   laptop (Figma export) and phone (CSS)
  apps/         Haze, MŪN, Vaqfa and Nite, rebuilt as static markup
```

One beat is one viewport of scroll. To retime anything, change its beat range
in `story.ts` or `timeline.ts`; nothing else depends on absolute positions.

Scrolling backwards is exact by construction: every tween states its own
`from`, each property's segments are continuous, and the timeline uses
`composition: "none"` so no tween hands its value to a sibling. Text changes
(typing, counters) are pure functions of time. Jumping from the end straight
back to any point gives the same frame as arriving there going forward.

## Assets

```
public/stage/macbook.webp          `macbook 1` exported from Figma (with its shadow)
public/projects/{haze,nite,mun,vaqfa}/   logos
public/projects/mun/vendors/       vendor marks, from MŪN's @lobehub/icons-static-svg
public/projects/nite/ui/           photos and wordmark cropped from the Nite designs
public/projects/vaqfa/photos/      PLACEHOLDERS (Unsplash via picsum.photos)
```

Swap the Vaqfa placeholders for your own photographs; the file list lives at
the top of `src/stage/apps/VaqfaApp.tsx`.

The previous GSAP chapter system is kept, unused, in `_archive/story-v1/`.
Delete it once you no longer need it.

## Motion, accessibility, performance

Under `prefers-reduced-motion` the clouds hold still, the ambient float stops
and Lenis never starts. The sequence stays scroll-driven, so nothing moves
unless the visitor scrolls.

The sky renders below device resolution and pauses when the tab is hidden. The
Supabase client is a separate chunk.
