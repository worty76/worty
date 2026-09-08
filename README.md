<p align="center">
  <h1 align="center">⭐ Worty</h1>

  <p align="center">
    The personal portfolio & blog of <strong>Le Thanh Dat</strong> — a Go developer writing about backend engineering, distributed systems, music, and the journey of getting a little better every day.
    <br/><br/>
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white"/>
    <img src="https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=nextdotjs&logoColor=white"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white"/>
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black"/>
    <img src="https://img.shields.io/badge/ImageKit-00ADF2?style=flat&logo=imagekit&logoColor=white"/>
    <br/>
    <a href="https://worty.id.vn">🌐 Live Demo</a>
  </p>

---

## ✨ Features

- **Home** — Profile with social links, custom avatar, and the article feed
- **Blog** — Markdown articles with categories, status workflow (draft / on progress / published), reading time, and auto-save editor
- **Gallery** — Photo memories with categories, tags, locations, and featured sorting
- **Music** — Favorite tracks with a persistent bottom player (YouTube IFrame API): play/pause, prev/next, seek, volume, playback speed, artist filter, infinite scroll
- **Projects** — Portfolio of personal work and open-source contributions, with GitHub/live links, stars, and feature breakdowns
- **Timeline** — Chronological career/education milestones, filterable by category
- **Bucket List** — "100 things to do before I die" progress tracker
- **Journey** — Interactive walk-through story (walkable scenes, keyboard + touch controls, persisted progress)
- **Systems** — Hand-drawn interactive diagram of how distributed systems fit together
- **Mascots** — Pixel-art sprite characters that wander the site (toggleable per character)
- **Admin Dashboard** — Full CMS with sidebar navigation, soft delete (trash/restore/permanent), confirmation dialogs, and unsaved-changes protection
- **Support** — Donation page with copy-to-clipboard bank details
- **Theme** — Warm dark/light toggle with custom color palette and animated transition

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Database / CMS | Firebase Firestore |
| Auth | Firebase Authentication (email/password) |
| Analytics | Firebase Analytics (opt-in via env) |
| Image CDN | ImageKit (signed uploads) |
| Music | YouTube IFrame Player API |
| Markdown | react-markdown + remark-gfm + rehype-raw |
| Icons | React Icons + Font Awesome |
| Toasts / UI | react-hot-toast, rough-notation, nextjs-toploader |

## 🏗 Architecture

The app follows a thin-server, client-first structure. The root layout is a server component (for `metadata`, `sitemap.ts`, `robots.ts`, and `feed.xml`), while all pages are `"use client"` and hydrate from Firestore on mount.

```
Firestore  ──(read, cached)──▶  lib/firestore-cache  ──▶  page components
ImageKit    ◀──(signed upload)──  api/imagekit-auth  ◀──  lib/image-uploads
Firebase Auth ──▶ context/auth-context  ──▶ /admin (guarded)
```

Three cross-cutting concerns are wrapped in React context providers mounted in the root layout:

- `AuthProvider` — session state, lazy-loads the shared Firebase app to avoid duplicate-init
- `ThemeProvider` — theme state with a before-paint script to prevent flash-of-wrong-theme
- `MascotProvider` — per-character enable toggles persisted to `localStorage`

Data access is centralized in `src/lib/firestore-cache.ts` rather than scattered `getDocs` calls, so caching and invalidation happen in one place.

### Content collections

| Collection | Purpose |
|------------|---------|
| `blog` | Articles (markdown body, bilingual fields, status, categories) |
| `gallery` | Photo memories (image, tags, location, featured) |
| `music` | Tracks (cover, artist, genre, YouTube/Spotify link) |
| `projects` | Personal projects & contributions |
| `timeline` | Career/education milestones |
| `bucketlist` | Bucket-list goals |
| `profile` | Singleton doc (`main`) for the homepage avatar |

## 🧩 Design Patterns

- **Provider / Context** (`src/context/*`) — `useAuth`, `useTheme`, `useMascot` expose scoped state via custom hooks that throw when used outside their provider.
- **Two-layer read cache** (`src/lib/firestore-cache.ts`) — in-memory `Map` + `sessionStorage` with TTL, plus explicit `invalidateCollectionCache()` calls after every admin mutation so public pages never serve stale data.
- **Deferred upload markers** (`src/lib/image-uploads.ts`) — picking a file stores a `pending-upload:` marker in form state; nothing hits the network until save, when markers are swapped for real ImageKit URLs.
- **Feature flags** (`src/lib/flags.ts`) — a single switch (`TRANSLATIONS_ENABLED`) controls the EN/VI bilingual toggle without deleting the code path.
- **Generic CRUD hook** (`src/hooks/useFirestore.ts`) — one typed `useFirestore<T>` covers fetch/add/update/remove for any collection.
- **Promise-based confirm dialog** (`src/components/ui/ConfirmDialog.tsx`) — `useConfirm()` returns a `Promise<boolean>`, so async flows read like `if (await confirm(...)) { ... }`.
- **Auto-registration registry** (`src/components/fun/sprites/index.ts`) — `require.context` scans `./characters/*/index.ts` so adding a mascot is a folder drop, no barrel edit.
- **Data-driven rendering** (`src/data/systems.ts`, `src/data/journey.ts`) — the systems diagram and journey story are typed data structures rendered generically; content edits need no component changes.
- **Config self-check** (`src/components/fun/sprites/types.ts`) — `selfCheck()` asserts frame/transition math at load, failing fast on a bad sprite definition.
- **Soft delete** — records get a `deleted` flag + `deletedAt` timestamp rather than hard removal, enabling trash/restore/permanent-delete in the admin.
- **Server/client boundary** (`SiteNavbar`, `sitemap.ts`, `feed.xml`) — thin client wrappers keep the root layout server-rendered so static SEO routes still work.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (with Email/Password auth enabled)
- An ImageKit account

### Installation

```bash
git clone https://github.com/worty76/worty.git
cd worty
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=   # optional — enables Analytics

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=

# Site
NEXT_PUBLIC_SITE_URL=                  # optional — defaults to https://worty.id.vn
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                     # App Router routes
│   ├── (blog)/              # Article list + [id] detail
│   ├── admin/               # CMS dashboard + login (auth-guarded)
│   ├── api/imagekit-auth/   # Signed ImageKit upload token endpoint
│   ├── bucket-list/         # Bucket list tracker
│   ├── gallery/             # Photo memories
│   ├── journey/             # Interactive walk-through story
│   ├── music/               # Music collection + bottom player
│   ├── projects/            # Project list + [id] detail
│   ├── systems/             # Hand-drawn distributed-systems diagram
│   ├── timeline/            # Career milestone timeline
│   ├── support/             # Donation page
│   ├── feed.xml/            # RSS feed route
│   ├── sitemap.ts           # Dynamic sitemap (static + blog posts)
│   ├── robots.ts            # Robots rules (blocks /admin)
│   └── page.tsx             # Home
├── components/
│   ├── admin/               # CMS forms, lists, timeline + profile managers
│   ├── blog/                # Blog skeleton components
│   ├── fun/                 # Mascot engine, grid background, sprite configs
│   ├── gallery/             # Gallery grid + masonry layout
│   ├── layouts/             # Public navbar (hidden on /admin)
│   ├── main/                # Homepage profile
│   ├── music/               # Music skeleton
│   └── ui/                  # Shared UI (Card, Button, ConfirmDialog, Pagination…)
├── context/                 # Auth / theme / mascot providers
├── data/                    # Static content (journey scenes, systems diagram)
├── firebase/                # Firebase config + analytics
├── hooks/                   # useFirestore, useForm, usePagination
├── lib/                     # firestore-cache, image-uploads, flags, site
├── types/                   # Ambient type declarations (YouTube, webpack)
├── utils/                   # fonts, social-links
└── common/styles/           # Shared color tokens
```

## 📄 License

MIT © [worty76](https://github.com/worty76)
