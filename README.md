<p align="center">
  <img src="./public/logo.png" alt="PulseBeat Logo" width="120" />
</p>

<h1 align="center">?? PulseBeat</h1>

<p align="center">
  <strong>A premium, dark-themed music streaming web app — built with React, Firebase &amp; Howler.js</strong>
</p>

<p align="center">
  <a href="https://github.com/Arunsanap99/plusbeat/stargazers">
    <img src="https://img.shields.io/github/stars/Arunsanap99/plusbeat?style=flat-square&color=white&labelColor=0d0d12" alt="Stars" />
  </a>
  <a href="https://github.com/Arunsanap99/plusbeat/issues">
    <img src="https://img.shields.io/github/issues/Arunsanap99/plusbeat?style=flat-square&color=white&labelColor=0d0d12" alt="Issues" />
  </a>
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react&logoColor=white&labelColor=0d0d12" alt="React" />
  <img src="https://img.shields.io/badge/Firebase-12-orange?style=flat-square&logo=firebase&logoColor=white&labelColor=0d0d12" alt="Firebase" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=0d0d12" alt="Vite" />
  <img src="https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white&labelColor=0d0d12" alt="Netlify" />
</p>

---

## ? Features

| Feature | Description |
|---|---|
| ?? **Full Audio Player** | Play, pause, skip, seek, volume control, and playback speed (0.5x–2x) |
| ?? **Fuzzy Search** | Smart Fuse.js-powered search with real-time match highlighting |
| ?? **Playlist Manager** | Create, delete, and manage multiple playlists — persisted in localStorage |
| ?? **Song Library** | Browse thousands of songs from Firebase Firestore |
| ?? **Authentication** | Sign in via Google OAuth or Phone OTP (Firebase Auth) |
| ?? **Fully Responsive** | Mobile-first layout with drawer navigation |
| ? **Blazing Fast** | Vite 8 + React 19 with code-splitting and lazy loading |
| ??? **Sort & Filter** | Sort songs by title, artist, or album. Filter by artist |
| ?? **Offline-ready** | PWA-enabled with service worker caching |
| ?? **Multi-platform Deployment** | Hosted on both **Firebase Hosting** and **Netlify** |

---

## ??? Tech Stack

```
Frontend     ?  React 19, React Router v7, Framer Motion, Zustand
Audio        ?  Howler.js (HTML5 audio engine)
Search       ?  Fuse.js (fuzzy search)
Backend/DB   ?  Firebase Firestore (songs database)
Auth         ?  Firebase Authentication (Google + Phone OTP)
Styling      ?  Vanilla CSS + CSS Variables (dark theme)
Build Tool   ?  Vite 8
PWA          ?  vite-plugin-pwa (service worker + manifest)
Deployment   ?  Firebase Hosting, Netlify
```

---

## ?? Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A **Firebase project** with Firestore & Authentication enabled

### 1. Clone the Repository

```bash
git clone https://github.com/Arunsanap99/plusbeat.git
cd plusbeat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> Warning: Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## ?? Seeding Songs to Firestore

To upload your local MP3 library to Firestore, run the import script:

```bash
node src/scripts/insertAllSongs.js
```

> This scans `src/songs/`, parses filenames into `title / album / artist`, deduplicates, and writes them to the `songs` collection in Firestore.

---

## ?? Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Netlify

**Option A – CLI:**
```bash
npm run build
npx netlify-cli deploy --prod
```

**Option B – Auto-deploy via Git (Recommended):**

Push to `main` — Netlify reads `netlify.toml` and builds automatically.

> Add all `VITE_FIREBASE_*` environment variables in your **Netlify dashboard ? Site Settings ? Environment Variables**.

---

## ?? Project Structure

```
plusbeat/
+-- public/                  # Static assets (favicon, logo, PWA icons)
+-- src/
¦   +-- components/
¦   ¦   +-- AudioPlayer.jsx  # Fixed bottom audio player bar
¦   ¦   +-- AuthModal.jsx    # Login modal (Google + Phone OTP)
¦   +-- pages/
¦   ¦   +-- Home.jsx         # Main library view with search, sort, filter
¦   ¦   +-- Search.jsx       # Dedicated search page
¦   +-- store/
¦   ¦   +-- playerStore.js   # Howler.js audio engine (Zustand)
¦   ¦   +-- songsStore.js    # Firestore songs fetching (Zustand)
¦   ¦   +-- playlistStore.js # Playlist CRUD (localStorage + Zustand)
¦   ¦   +-- authStore.js     # Firebase auth (Zustand)
¦   +-- firebase/
¦   ¦   +-- config.js        # Firebase app initialization
¦   +-- utils/
¦   ¦   +-- localSongs.js    # Local MP3 discovery via Vite glob
¦   +-- scripts/             # Node.js admin scripts for Firestore
¦   +-- songs/               # Local MP3 files (not committed to Git)
¦   +-- styles/
¦       +-- index.css        # Global CSS variables & dark theme
+-- .firebaserc              # Firebase project alias
+-- firebase.json            # Firebase hosting & Firestore config
+-- netlify.toml             # Netlify build & redirect config
+-- vite.config.js           # Vite + plugins configuration
+-- package.json
```

---

## ??? Audio Player Features

- ?? **Play / Pause** with smooth toggle
- ?? **Skip forward / backward** through queue
- ?? **Volume control** with mute toggle
- ? **Playback speed:** 0.5x · 0.75x · Normal · 1.25x · 1.5x · 2x
- ?? **Seek bar** with current time and total duration
- ?? **Auto-advance** to next track on end

---

## ?? Authentication

PulseBeat supports two sign-in methods via **Firebase Auth**:

1. **Google Sign-In** — One-click OAuth popup
2. **Phone OTP** — Enter phone number ? receive SMS code ? verify

---

## ?? Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the project
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## ?? License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ?? by <a href="https://github.com/Arunsanap99">Arunsanap99</a></p>
