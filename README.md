<p align="center">
  <h1 align="center">⭐ Worty</h1>

  <p align="center">
    A personal portfolio & blog by <strong>Le Thanh Dat</strong> — built to share who I am, my experiences, and what I'm working on.
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

- **Portfolio** — Profile page with social links and personal info
- **Blog** — Markdown-based blog with bilingual support (Vietnamese/English), categories, status management (draft/on progress/published), and auto-save editor
- **Gallery** — Photo gallery with categories, tags, locations, and featured memories
- **Music** — Favorite tracks collection with a persistent bottom player bar (YouTube IFrame API), artist filtering, infinite scroll, playback controls (play/pause, next/prev, seek, volume, speed)
- **Admin Dashboard** — Full CMS with sidebar navigation, soft delete (trash/restore), and confirmation dialogs
- **Support** — Donation page with bank transfer details
- **Theme** — Warm dark/light theme toggle with custom color palette

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| CMS | Firebase Firestore |
| Image CDN | ImageKit + YouTube Thumbnails |
| Auth | Firebase Authentication |
| Icons | React Icons |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project
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

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── (blog)/          # Blog routes (list + detail pages)
│   │   └── [id]/        # Individual blog post
│   ├── admin/           # Admin dashboard (CMS)
│   ├── api/             # API routes (ImageKit auth)
│   ├── gallery/         # Photo gallery page
│   ├── music/           # Music collection with bottom player bar
│   ├── support/         # Donation/support page
│   └── page.tsx         # Home / portfolio page
├── components/
│   ├── admin/           # Admin forms (Blog, Gallery, Music) + lists
│   │   ├── BlogForm.tsx     # Blog editor with markdown toolbar & auto-save
│   │   ├── GalleryForm.tsx  # Gallery upload form
│   │   ├── MusicForm.tsx    # Music entry form
│   │   ├── MarkdownEditor.tsx # Reusable markdown editor
│   │   └── MarkdownGuide.tsx  # Markdown syntax guide
│   ├── gallery/         # Gallery grid & masonry layout
│   ├── layouts/         # Navbar component
│   ├── main/            # Profile component
│   └── ui/              # Shared UI components (Card, StatusBadge, etc.)
├── context/             # Auth & theme context providers
├── firebase/            # Firebase configuration
├── hooks/               # Custom React hooks
├── types/               # TypeScript type declarations
└── utils/               # Utility functions
```

## 🎵 Music Player

The music page features a persistent bottom player bar powered by the YouTube IFrame Player API:

- **Playback controls** — Play/pause, previous/next track
- **Progress bar** — Seekable with time display
- **Volume** — Slider with mute toggle
- **Speed** — Cycle through 0.5x → 2x playback rates
- **Artist filter** — Filter songs by artist with pill chips
- **Infinite scroll** — Lazy loads 8 tracks at a time
- **Auto-advance** — Automatically plays next track

## 📝 Blog

- **Bilingual** — Vietnamese and English content stored in the same document, with language toggle
- **Markdown** — Full markdown support with toolbar (bold, italic, heading, link, image, code, quote, lists)
- **Auto-save** — Saves to localStorage every 3 seconds
- **Fullscreen** — Distraction-free writing mode
- **Status** — Draft (hidden), On Progress (visible teaser, non-clickable), Published (full access)
- **Soft delete** — Trash/restore from admin

## 🎨 Theme

Custom warm color palette:
- **Dark mode**: Brown background `rgb(38, 34, 35)` with beige text `rgb(221, 198, 182)`
- **Light mode**: Swapped via CSS custom properties
- Theme toggle persists across pages

## 📄 License

MIT © [worty76](https://github.com/worty76)
