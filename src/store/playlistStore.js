import { create } from 'zustand';

export const usePlaylistStore = create((set, get) => ({
  playlists: JSON.parse(localStorage.getItem('pulsebeat_playlists')) || {
    'Favorites': []
  },
  selectedPlaylist: null, // null means "All Tracks" (Library)

  setSelectedPlaylist: (name) => {
    set({ selectedPlaylist: name });
  },

  createPlaylist: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const current = get().playlists;
    if (current[trimmed]) return; // already exists

    const updated = { ...current, [trimmed]: [] };
    localStorage.setItem('pulsebeat_playlists', JSON.stringify(updated));
    set({ playlists: updated });
  },

  deletePlaylist: (name) => {
    const current = { ...get().playlists };
    delete current[name];
    
    // If deleted playlist was selected, fallback to null
    let nextSelected = get().selectedPlaylist;
    if (nextSelected === name) {
      nextSelected = null;
    }

    localStorage.setItem('pulsebeat_playlists', JSON.stringify(current));
    set({ playlists: current, selectedPlaylist: nextSelected });
  },

  addSongToPlaylist: (playlistName, song) => {
    const current = get().playlists;
    const list = current[playlistName] || [];
    
    // Check if already in playlist
    if (list.some(s => s.id === song.id)) return;

    const updated = {
      ...current,
      [playlistName]: [...list, song]
    };
    localStorage.setItem('pulsebeat_playlists', JSON.stringify(updated));
    set({ playlists: updated });
  },

  removeSongFromPlaylist: (playlistName, songId) => {
    const current = get().playlists;
    const list = current[playlistName] || [];
    const updatedList = list.filter(s => s.id !== songId);

    const updated = {
      ...current,
      [playlistName]: updatedList
    };
    localStorage.setItem('pulsebeat_playlists', JSON.stringify(updated));
    set({ playlists: updated });
  }
}));
