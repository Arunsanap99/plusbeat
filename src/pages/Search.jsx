import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSongsStore } from '../store/songsStore';
import { usePlayerStore } from '../store/playerStore';
import { usePlaylistStore } from '../store/playlistStore';
import { 
  LuSearch, 
  LuPlay, 
  LuPause, 
  LuArrowUpDown,
  LuPlus,
  LuX
} from 'react-icons/lu';

function fmt(secs) {
  if (!secs) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const Search = () => {
  const { songs, loading, error, fetchSongs } = useSongsStore();
  const { currentIndex, queue, isPlaying, setQueue, togglePlay } = usePlayerStore();
  const { playlists, addSongToPlaylist } = usePlaylistStore();
  
  // Search, Filter, Sort and Menu states
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [sortBy, setSortBy] = useState('title');
  const [selectedArtist, setSelectedArtist] = useState('All');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeMenuSongId, setActiveMenuSongId] = useState(null);
  
  const sortMenuRef = useRef(null);
  const playlistMenuRef = useRef(null);

  useEffect(() => { 
    fetchSongs(); 
  }, []);

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

  const topArtists = useMemo(() => {
    const counts = {};
    songs.forEach(s => {
      const art = s.artist !== 'Unknown Artist' ? s.artist : null;
      if (art) counts[art] = (counts[art] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }, [songs]);

  const filtered = useMemo(() => {
    let result = [...songs];

    if (selectedArtist !== 'All') {
      result = result.filter(s => s.artist.toLowerCase() === selectedArtist.toLowerCase());
    }

    const t = searchTerm.toLowerCase().trim();
    if (t) {
      result = result.filter(s =>
        (s.title  && s.title.toLowerCase().includes(t)) ||
        (s.artist && s.artist.toLowerCase().includes(t)) ||
        (s.album  && s.album.toLowerCase().includes(t))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      if (sortBy === 'album') return (a.album || '').localeCompare(b.album || '');
      return 0;
    });

    return result;
  }, [songs, searchTerm, selectedArtist, sortBy]);

  const handlePlay = (song) => {
    const idx = filtered.findIndex(s => s.id === song.id);
    if (idx !== -1) {
      if (queue[currentIndex]?.id === song.id) {
        togglePlay();
      } else {
        setQueue(filtered, idx);
      }
    }
  };

  const currentId = queue[currentIndex]?.id || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.25s ease' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          color: '#fff',
          fontFamily: "var(--font-display)"
        }}>
          Search Cloud
        </h1>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Database collection
        </span>
      </div>

      {/* Input Box and Actions Row */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Large Input Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '8px 16px',
          gap: '8px',
          flex: 1,
          minWidth: '240px',
        }}>
          <LuSearch style={{ fontSize: '14px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search database songs, artist, album..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              color: '#fff',
              fontSize: '13px',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: '16px', padding: 0,
              }}
            >×</button>
          )}
        </div>

        {/* Sort Button Dropdown */}
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
              right: 0,
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

      {/* Artist Filter Pills */}
      {!loading && !error && topArtists.length > 0 && (
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
            All Database
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

      {loading && (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin-slow 1.5s linear infinite', display: 'inline-block' }}>⚙️</div>
          <p style={{ margin: 0, fontSize: '14px' }}>Loading cloud database…</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '8px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: '#f87171',
          fontSize: '13px',
        }}>
          ⚠️ Database not available: {error} (Falling back to Local Mode)
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Table Stats */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 4px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Results
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {filtered.length} matches
            </span>
          </div>

          {/* Results Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px', position: 'relative' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No matching cloud songs found
              </div>
            ) : (
              filtered.map((song, idx) => {
                const isCur = currentId === song.id;
                const isHovered = hoveredIndex === idx;

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
                      background: isCur
                        ? 'rgba(255, 255, 255, 0.05)'
                        : isHovered
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'transparent',
                      transition: 'background 0.15s ease',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.015)'
                    }}
                    onClick={() => handlePlay(song)}
                  >
                    {/* Index or play icon */}
                    <div style={{ fontSize: '13px', color: isCur ? 'var(--accent-light)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      {isHovered ? (
                        <span style={{ color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center' }}>{isCur && isPlaying ? <LuPause /> : <LuPlay />}</span>
                      ) : isCur && isPlaying ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5px', height: '11px' }}>
                          <span className="eq-bar" />
                          <span className="eq-bar" />
                          <span className="eq-bar" />
                        </div>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Title */}
                    <div style={{ minWidth: 0, paddingRight: '16px' }}>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: isCur ? '600' : '500',
                        color: isCur ? 'var(--accent-light)' : '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{song.title}</p>
                      <p style={{
                        margin: '1px 0 0',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {song.artist || 'Unknown Artist'}
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
                      {song.album || 'Unknown Album'}
                    </div>

                    {/* Duration / Add Playlist */}
                    <div 
                      style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', position: 'relative' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', marginRight: '6px' }}>
                        {fmt(song.duration)}
                      </span>

                      {/* Add button */}
                      <button
                        onClick={() => setActiveMenuSongId(activeMenuSongId === song.id ? null : song.id)}
                        style={{
                          background: 'none', border: 'none', color: isHovered || isCur || activeMenuSongId === song.id ? '#fff' : 'transparent',
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
        </>
      )}
    </div>
  );
};

export default Search;
