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
- **Blog** — Write and publish posts with markdown support, categories, and status management
- **Gallery** — Photo gallery with categories, tags, locations, and featured memories
- **Music** — Showcase your favorite tracks with album art and Spotify links
- **Admin Dashboard** — Full content management with sidebar navigation
- **Support** — Donation page with bank transfer details

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| CMS | Firebase Firestore |
| Image CDN | ImageKit |
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
│   ├── (blog)/          # Blog routes
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes (ImageKit auth)
│   ├── gallery/         # Photo gallery page
│   ├── music/           # Music collection page
│   ├── support/         # Donation/support page
│   └── page.tsx         # Home / portfolio page
├── components/
│   ├── admin/           # Admin forms & lists
│   ├── gallery/         # Gallery grid & masonry
│   ├── layouts/         # Navbar
│   ├── main/            # Profile component
│   └── ui/              # Shared UI components
├── context/             # Auth & theme context
├── firebase/            # Firebase config
├── hooks/               # Custom hooks
└── utils/               # Utility functions
```

## 📄 License

MIT © [worty76](https://github.com/worty76)
