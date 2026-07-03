/**
 * localSongs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Auto-discovers all MP3s from src/songs/ using Vite's import.meta.glob.
 * Returns an array of song objects ready for the player — no folder picker needed.
 */

// Import from the virtual module. In development, this runs the eager glob scan.
// In production builds, this returns an empty object, completely bypassing directory scanning.
import { modules } from 'virtual:local-songs';

/* ── Parse filename → { title, album, artist } ─────────────────────────── */
function parseFilename(filename) {
  let name = filename.replace(/\.mp3$/i, '');
  name = name.replace(/(\s*-\s*Copy)+$/i, '').trim();
  name = name.replace(/\s*\(\d+\)$/, '').trim();
  name = name.replace(/\s*\(\d+\s*kbps\)/i, '').trim();
  name = name.replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

  const dashIdx = name.indexOf(' - ');
  let title  = name;
  let album  = 'Unknown Album';
  let artist = 'Unknown Artist';

  if (dashIdx !== -1) {
    title = name.slice(0, dashIdx).trim();
    album = name.slice(dashIdx + 3).trim();
  }

  const featMatch = title.match(/\(feat\.\s*([^)]+)\)/i);
  if (featMatch) {
    artist = featMatch[1].trim();
    title  = title.replace(featMatch[0], '').trim();
  }

  return { title, album, artist };
}

/**
 * loadLocalSongs()
 * Resolves all glob URLs eagerly and returns a sorted, deduped song list.
 */
export async function loadLocalSongs() {
  const entries = Object.entries(modules); // empty array in production

  const songs = entries.map(([fullPath, audioUrl]) => {
    const filename = fullPath.split('/').pop();          // "Song Name (320 kbps).mp3"
    const { title, album, artist } = parseFilename(filename);

    return {
      id:       filename,
      title:    title.trim(),
      album:    album.trim(),
      artist:   artist.trim(),
      audioUrl: typeof audioUrl === 'string' ? audioUrl : audioUrl.default,
      filename,
      source:   'local',
    };
  });

  // Sort by title
  songs.sort((a, b) => a.title.localeCompare(b.title));

  // Deduplicate strictly by title (same name = same song, no duplicates!)
  const seen = new Set();
  return songs.filter(s => {
    const key = s.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
