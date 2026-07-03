import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { usePlayerStore } from '../store/playerStore';
import { useSongsStore } from '../store/songsStore';
import { usePlaylistStore } from '../store/playlistStore';
import { loadLocalSongs } from '../utils/localSongs';
import { 
  LuPlay, 
  LuPause, 
  LuSearch, 
  LuArrowUpDown,
  LuPlus,
  LuTrash2,
  LuX
} from 'react-icons/lu';

/* ── Highlight ──────────────────────────────────────────────────────────── */
function Highlight({ text, indices }) {
  if (!indices || indices.length === 0) return <span>{text}</span>;
  const chars = text.split('');
  const highlighted = new Set();
  indices.forEach(([start, end]) => {
    for (let i = start; i <= end; i++) highlighted.add(i);
  });
  const parts = [];
  let i = 0;
  while (i < chars.length) {
    if (highlighted.has(i)) {
      let j = i;
      while (j < chars.length && highlighted.has(j)) j++;
      parts.push(<mark key={i} style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '2px', padding: '0 2px' }}>{text.slice(i, j)}</mark>);
      i = j;
    } else {
      let j = i;
      while (j < chars.length && !highlighted.has(j)) j++;
      parts.push(<span key={i}>{text.slice(i, j)}</span>);
      i = j;
    }
  }
  return <>{parts}</>;
}

const FUSE_OPTIONS = {
  keys: [
    { name: 'title',  weight: 0.6 },
    { name: 'album',  weight: 0.3 },
    { name: 'artist', weight: 0.1 },
  ],
  threshold: 0.4,
  minMatchCharLength: 1,
  includeMatches: true,
  includeScore: true,
  ignoreLocation: true,
  findAllMatches: true,
};

export const Home = () => {
  const [localSongs, setLocalSongs]   = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Playlist dropdown menu state
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);
  const playlistMenuRef = useRef(null);

  // Sort and filter states
  const [sortBy, setSortBy] = useState('title');
  const [selectedArtist, setSelectedArtist] = useState('All');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { setQueue, currentIndex, queue, isPlaying, togglePlay } = usePlayerStore();
  const { songs: dbSongs, loading: dbLoading, fetchSongs } = useSongsStore();
  const { playlists, selectedPlaylist, addSongToPlaylist, removeSongFromPlaylist } = usePlaylistStore();
  const sortMenuRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    function clickOutside(e) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
      if (playlistMenuRef.current && !playlistMenuRef.current.contains(e.target)) {
        setActiveMenuSongId(null);
      }
    }
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  useEffect(() => {
    loadLocalSongs()
      .then(loaded => {
        setLocalSongs(loaded);
        setLocalLoading(false);
        if (loaded.length === 0) {
          // If local library is empty (production build on server), fetch from Firestore
          fetchSongs();
        }
      })
      .catch(err => {
        console.error('Local songs load failed, falling back to db:', err);
        setLoadError(err.message || 'Failed to load songs');
        setLocalLoading(false);
        fetchSongs();
      });
  }, []);

  // Determine songs source (use local if available, otherwise Firestore database)
  const availableSongs = useMemo(() => {
    return localSongs.length > 0 ? localSongs : dbSongs;
  }, [localSongs, dbSongs]);

  // Filter songs based on selected playlist
  const sourceSongs = useMemo(() => {
    if (selectedPlaylist === null) {
      return availableSongs;
    }
    return playlists[selectedPlaylist] || [];
  }, [availableSongs, selectedPlaylist, playlists]);

  // Filter unique artists in current view
  const topArtists = useMemo(() => {
    const counts = {};
    sourceSongs.forEach(s => {
      const art = s.artist !== 'Unknown Artist' ? s.artist : null;
      if (art) counts[art] = (counts[art] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }, [sourceSongs]);

  // Process sorting & filters
  const processedSongs = useMemo(() => {
    let result = [...sourceSongs];
    if (selectedArtist !== 'All') {
      result = result.filter(s => s.artist.toLowerCase() === selectedArtist.toLowerCase());
    }
    result.sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      if (sortBy === 'album') return (a.album || '').localeCompare(b.album || '');
      return 0;
    });
    return result;
  }, [sourceSongs, selectedArtist, sortBy]);

  const fuse = useMemo(() => new Fuse(processedSongs, FUSE_OPTIONS), [processedSongs]);

  const displayList = useMemo(() => {
    if (!search.trim()) return processedSongs.map(s => ({ item: s, matches: [] }));
    return fuse.search(search.trim(), { limit: 100 }).map(r => ({ item: r.item, matches: r.matches || [] }));
  }, [search, processedSongs, fuse]);

  const handlePlaySong = useCallback((song) => {
    const allItems = displayList.map(d => d.item);
    const idx = allItems.findIndex(s => s.id === song.id);
    if (queue[currentIndex]?.id === song.id) {
      togglePlay();
    } else {
      setQueue(allItems, idx >= 0 ? idx : 0);
    }
  }, [displayList, queue, currentIndex, setQueue, togglePlay]);

  const handlePlayAll = useCallback(() => {
    if (displayList.length === 0) return;
    setQueue(displayList.map(d => d.item), 0);
  }, [displayList, setQueue]);

  const currentSongId = queue[currentIndex]?.id;

  const isLoading = localLoading || (localSongs.length === 0 && dbLoading);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '32px', width: '180px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }} />
        <div style={{ height: '240px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.25s ease' }}>
      
      {/* Title & Info Panel (Very clean and simple) */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          color: '#fff',
          fontFamily: "var(--font-display)"
        }}>
          {selectedPlaylist === null 
            ? (localSongs.length > 0 ? 'My Library' : 'Cloud Library') 
            : selectedPlaylist}
        </h1>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {sourceSongs.length} songs
        </span>
      </div>

      {/* Control Actions Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Play all button */}
          <button
            onClick={handlePlayAll}
            disabled={displayList.length === 0}
            style={{
              padding: '10px 24px',
              borderRadius: '20px',
              background: displayList.length === 0 ? 'rgba(255,255,255,0.1)' : '#fff',
              border: 'none',
              cursor: displayList.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: displayList.length === 0 ? 'var(--text-secondary)' : '#000',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { if (displayList.length > 0) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { if (displayList.length > 0) e.currentTarget.style.opacity = '1'; }}
          >
            <LuPlay style={{ fontSize: '12px' }} />
            <span>Play All</span>
          </button>

          {/* Sort button */}
          <div style={{ position: 'relative' }} ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '8px 16px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}
            >
              <LuArrowUpDown style={{ fontSize: '13px' }} />
              <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
            </button>

            {showSortMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                background: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '4px',
                display: 'flex', flexDirection: 'column',
                gap: '2px',
                minWidth: '110px',
                zIndex: 100
              }}>
                {[
                  { id: 'title', label: 'Title' },
                  { id: 'artist', label: 'Artist' },
                  { id: 'album', label: 'Album' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSortBy(opt.id);
                      setShowSortMenu(false);
                    }}
                    style={{
                      background: sortBy === opt.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                      border: 'none',
                      color: sortBy === opt.id ? '#fff' : 'var(--text-secondary)',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '8px 16px',
          gap: '8px',
          width: '260px',
        }}>
          <LuSearch style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
          <input
            type="text"
            placeholder="Search in library"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              color: '#fff',
              fontSize: '13px',
              width: '100%'
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          )}
        </div>
      </div>

      {/* Quick Artist Filter Pills */}
      {topArtists.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setSelectedArtist('All')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              background: selectedArtist === 'All' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              color: selectedArtist === 'All' ? '#fff' : 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            All Tracks
          </button>
          {topArtists.map(artist => (
            <button
              key={artist}
              onClick={() => setSelectedArtist(artist)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                background: selectedArtist === artist ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                color: selectedArtist === artist ? '#fff' : 'var(--text-secondary)',
                whiteSpace: 'nowrap'
              }}
            >
              {artist}
            </button>
          ))}
        </div>
      )}

      {/* Song List */}
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px', position: 'relative' }}>
        {displayList.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No songs found in this view
          </div>
        ) : (
          displayList.map(({ item: song, matches }, idx) => {
            const isActive = song.id === currentSongId;
            const isHovered = hoveredIndex === idx;
            const titleMatch = matches.find(m => m.key === 'title');
            const albumMatch = matches.find(m => m.key === 'album');

            return (
              <div
                key={song.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 5fr 4fr 100px',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isActive
                    ? 'rgba(255, 255, 255, 0.05)'
                    : isHovered
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'transparent',
                  transition: 'background 0.15s ease',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.015)'
                }}
                onClick={() => handlePlaySong(song)}
              >
                {/* Play action or index */}
                <div style={{ fontSize: '13px', color: isActive ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                  {isHovered ? (
                    <span style={{ color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center' }}>
                      {isActive && isPlaying ? <LuPause /> : <LuPlay />}
                    </span>
                  ) : isActive && isPlaying ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5px', height: '11px' }}>
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                    </div>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Song info (Simple Text Layout) */}
                <div style={{ minWidth: 0, paddingRight: '16px' }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? 'var(--accent-light)' : '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {search && titleMatch ? <Highlight text={song.title} indices={titleMatch.indices} /> : song.title}
                  </p>
                  <p style={{
                    margin: '1px 0 0',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {song.artist !== 'Unknown Artist' ? song.artist : 'Unknown Artist'}
                  </p>
                </div>

                {/* Album */}
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingRight: '16px'
                }}>
                  {search && albumMatch ? <Highlight text={song.album} indices={albumMatch.indices} /> : song.album}
                </div>

                {/* Playlist Action & Menu */}
                <div 
                  style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px', position: 'relative' }}
                  onClick={e => e.stopPropagation()} // Stop row click trigger
                >
                  {/* Remove from current custom playlist */}
                  {selectedPlaylist !== null && (
                    <button
                      onClick={() => removeSongFromPlaylist(selectedPlaylist, song.id)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', display: 'flex', padding: '6px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <LuTrash2 />
                    </button>
                  )}

                  {/* Add song to custom playlist button */}
                  <button
                    onClick={() => setActiveMenuSongId(activeMenuSongId === song.id ? null : song.id)}
                    style={{
                      background: 'none', border: 'none', color: isHovered || isActive || activeMenuSongId === song.id ? '#fff' : 'transparent',
                      cursor: 'pointer', display: 'flex', padding: '6px', transition: 'color 0.2s'
                    }}
                  >
                    <LuPlus />
                  </button>

                  {/* Dropdown Menu listing custom playlists */}
                  {activeMenuSongId === song.id && (
                    <div
                      ref={playlistMenuRef}
                      style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 4px)',
                        right: 0,
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        minWidth: '140px',
                        zIndex: 500,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Add to:</span>
                        <button onClick={() => setActiveMenuSongId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                          <LuX size={10} />
                        </button>
                      </div>
                      {Object.keys(playlists).length === 0 ? (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px' }}>No playlists</span>
                      ) : (
                        Object.keys(playlists).map(pName => (
                          <button
                            key={pName}
                            onClick={() => {
                              addSongToPlaylist(pName, song);
                              setActiveMenuSongId(null);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {pName}
                          </button>
                        ))
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
