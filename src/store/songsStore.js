import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useSongsStore = create((set, get) => ({
  songs: [],
  loading: false,
  error: null,
  fetched: false,

  fetchSongs: async () => {
    if (get().fetched || get().loading) return;
    set({ loading: true, error: null });
    try {
      if (!db) {
        throw new Error('Firebase Firestore instance not initialized. Verify credentials.');
      }
      const querySnapshot = await getDocs(collection(db, 'songs'));
      const songsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || data.track_name || 'Unknown Title',
          artist: data.artist || data.artist_name || 'Unknown Artist',
          album: data.album || data.album_name || 'Unknown Album',
          coverImage: data.coverImage || data.cover_image || '',
          audioUrl: data.audioUrl || data.audio_url || data.url || '',
          duration: data.duration || 0,
          genre: data.genre || ''
        };
      });
      console.log('Songs Count:', songsList.length);
      console.log('Songs Data:', songsList);
      set({ songs: songsList, loading: false, fetched: true });
    } catch (err) {
      console.error('Error fetching songs from Firestore:', err);
      set({ error: err.message || 'Failed to load songs', loading: false });
    }
  }
}));
