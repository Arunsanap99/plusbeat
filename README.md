# ⚡ PulseBeat

> **A premium, minimalist local music player built with React, Vite, Howler, and Firebase, featuring responsive drawer navigation and local playlist management.**

---

PulseBeat is an elegant, content-first web audio player designed to deliver a modern music streaming experience for both local MP3 directories and cloud-synced database tracks. The layout mimics native apps like Spotify and Apple Music with a fully mobile-responsive sidebar drawer, custom local playlists, and detailed playback controls.

![App Screenshot](https://raw.githubusercontent.com/user-attachments/assets/placeholder)

---

## ✨ Features

- **📂 Automatic Local Sync**: Auto-discovers and resolves all tracks inside the local directory using Vite’s asset glob module loader.
- **✨ Strict Same-Name Deduplication**: Smart parsing and deduplication filters prevent duplicate copies of songs from appearing in the library.
- **🎛️ Playback Rate Control**: Dynamic speed control (adjust playback rate between `0.5x`, `0.75x`, `Normal (1.0x)`, `1.25x`, `1.5x`, and `2.0x`) powered by the Howler.js API.
- **📁 Spotify-like Playlists**:
  - Instantly create, name, and delete custom playlists.
  - Add tracks to playlists via the `+` hover popover dropdown.
  - View playlist sizes and remove tracks dynamically.
- **🔍 Database Search & Filtering**:
  - Filter both local and cloud collections by search term, album, or artist.
  - Staggered quick filter pills for the most popular artists.
  - Sort track rows alphabetically by Title, Artist, or Album.
- **📱 Fully Mobile Responsive**: Adaptable layouts; shifts from a desktop sidebar layout to a collapsible drawer navigation overlay with dim backdrop filters on small viewports.
- **🧼 Minimalist Modern Aesthetics**: Premium dark-slate theme featuring thin borders, clean typography, dynamic equalizer bar animations, and zero visual clutter.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Audio Engine**: [Howler.js](https://howlerjs.com/) (low-latency HTML5 audio management)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (lightweight global store)
- **Cloud Database**: [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) + Auth
- **Icons**: [Lucide React / Feather Icons](https://lucide.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS variables

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/pulsebeat.git
cd pulsebeat
npm install
```

### 2. Configure Firebase Environment

Create a `.env` file in the project root folder and insert your Firebase configuration keys:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Local Development

Start the Vite hot-reloading dev server:

```bash
npm run dev
```

The application will run locally at `http://localhost:5173` (or the next available port).

### 4. Optional: Batch Upload Local Songs to Cloud Database

If you wish to synchronize your local `src/songs/` folder metadata to your Firestore `songs` collection, run the batch upload script:

```bash
node src/scripts/insertAllSongs.js
```

---

## 📄 License

This project is licensed under the MIT License.
