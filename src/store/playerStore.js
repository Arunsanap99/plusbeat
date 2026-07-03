import { create } from 'zustand';
import { Howl } from 'howler';

let activeHowl = null;
let progressInterval = null;

export const usePlayerStore = create((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: parseFloat(localStorage.getItem('pulsebeat_volume')) || 0.8,
  playbackRate: parseFloat(localStorage.getItem('pulsebeat_rate')) || 1.0,
  progress: 0,
  duration: 0,
  audioError: null, // Error message to show in the player UI

  setQueue: (songs, startIndex = 0) => {
    const idx = startIndex >= 0 && startIndex < songs.length ? startIndex : 0;
    set({ queue: songs, currentIndex: idx, audioError: null });
    if (songs.length > 0) {
      get().playSong(songs[idx]);
    }
  },

  playSong: (song) => {
    if (!song || !song.audioUrl) {
      console.warn('Cannot play song: Missing valid audioUrl', song);
      set({ audioError: 'Missing valid audio URL' });
      return;
    }

    if (activeHowl) {
      activeHowl.unload();
      activeHowl = null;
    }
    clearInterval(progressInterval);
    set({ audioError: null, progress: 0, duration: 0 });

    const audioUrl = song.audioUrl;

    const sound = new Howl({
      src: [audioUrl],
      html5: true, // Bypass CORS/stream constraints
      volume: get().volume,
      rate: get().playbackRate, // Apply current speed rate
      onload: () => {
        set({ duration: sound.duration() });
      },
      onplay: () => {
        set({ isPlaying: true });
        get().startProgressTracker();
      },
      onpause: () => {
        set({ isPlaying: false });
        clearInterval(progressInterval);
      },
      onend: () => {
        clearInterval(progressInterval);
        get().next();
      },
      onloaderror: (id, err) => {
        console.error('Error loading audio stream:', err);
        set({ isPlaying: false });
        
        // Give helpful instructions for local files loaded on the live website
        if (audioUrl.startsWith('/src/songs/') && !window.location.hostname.includes('localhost')) {
          set({ audioError: "Local file not found online. Run 'npm run dev' to play your local library." });
        } else {
          set({ audioError: "Failed to load audio stream." });
        }
      },
      onplayerror: (id, err) => {
        console.error('Error playing audio stream:', err);
        set({ isPlaying: false });
        set({ audioError: "Playback failed. Try unlocking audio." });
        sound.once('unlock', () => sound.play());
      }
    });

    activeHowl = sound;
    sound.play();
  },

  togglePlay: () => {
    const { queue, currentIndex, isPlaying } = get();
    if (currentIndex === -1 && queue.length > 0) {
      get().playAtIndex(0);
      return;
    }
    if (!activeHowl) return;

    if (isPlaying) {
      activeHowl.pause();
    } else {
      activeHowl.play();
    }
  },

  playAtIndex: (index) => {
    const { queue } = get();
    if (index < 0 || index >= queue.length) return;
    set({ currentIndex: index });
    get().playSong(queue[index]);
  },

  next: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    get().playAtIndex(nextIndex);
  },

  previous: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    get().playAtIndex(prevIndex);
  },

  seek: (seconds) => {
    if (!activeHowl) return;
    activeHowl.seek(seconds);
    set({ progress: seconds });
  },

  setVolume: (value) => {
    const vol = Math.max(0, Math.min(1, value));
    localStorage.setItem('pulsebeat_volume', vol.toString());
    set({ volume: vol });
    if (activeHowl) {
      activeHowl.volume(vol);
    }
  },

  setPlaybackRate: (rate) => {
    const r = Math.max(0.25, Math.min(3.0, rate));
    localStorage.setItem('pulsebeat_rate', r.toString());
    set({ playbackRate: r });
    if (activeHowl) {
      activeHowl.rate(r);
    }
  },

  startProgressTracker: () => {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (activeHowl && get().isPlaying) {
        const currentSeek = activeHowl.seek();
        if (typeof currentSeek === 'number') {
          set({ progress: currentSeek });
        }
      }
    }, 250);
  }
}));
