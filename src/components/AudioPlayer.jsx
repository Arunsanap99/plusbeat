import React, { useState, useRef, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { 
  LuPlay, 
  LuPause, 
  LuSkipBack, 
  LuSkipForward, 
  LuVolume2, 
  LuVolume1, 
  LuVolumeX,
  LuGauge
} from 'react-icons/lu';

function fmt(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function AudioPlayer() {
  const {
    queue, currentIndex, isPlaying,
    progress, duration, volume, playbackRate,
    togglePlay, next, previous, seek, setVolume, setPlaybackRate,
  } = usePlayerStore();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef(null);

  useEffect(() => {
    function clickOutside(e) {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target)) {
        setShowSpeedMenu(false);
      }
    }
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const song = queue[currentIndex] || null;
  if (!song) return null;

  const handleSeek = (e) => {
    seek(parseFloat(e.target.value));
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 200,
      background: 'var(--bg-panel)',
      borderTop: '1px solid var(--border)',
      padding: '16px 24px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 1fr',
        alignItems: 'center',
        gap: '24px',
      }}>

        {/* ── Left: Metadata (Pure Text, Simple & Clean) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingLeft: '8px' }}>
          <p style={{
            margin: 0,
            fontWeight: '600',
            fontSize: '14px',
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{song.title}</p>
          <p style={{
            margin: '2px 0 0',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{song.artist !== 'Unknown Artist' ? song.artist : 'Local Track'}</p>
        </div>

        {/* ── Center: Controls ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={previous}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <LuSkipBack style={{ fontSize: '15px' }} />
            </button>
            <button
              onClick={togglePlay}
              style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                background: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#000',
                fontSize: '14px',
                transition: 'opacity 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {isPlaying ? <LuPause /> : <LuPlay style={{ marginLeft: '1px' }} />}
            </button>
            <button
              onClick={next}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <LuSkipForward style={{ fontSize: '15px' }} />
            </button>
          </div>

          {/* Seek Slider bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '400px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', width: '30px', textAlign: 'right' }}>
              {fmt(progress)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              style={{ flex: 1, accentColor: '#fff' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', width: '30px' }}>
              {fmt(duration)}
            </span>
          </div>
        </div>

        {/* ── Right: Speed and Volume Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
          
          {/* Speed control selector */}
          <div style={{ position: 'relative' }} ref={speedMenuRef}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <LuGauge style={{ fontSize: '11px' }} />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '3px',
                display: 'flex', flexDirection: 'column',
                gap: '1px',
                minWidth: '80px',
                zIndex: 300
              }}>
                {speedOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      setPlaybackRate(option);
                      setShowSpeedMenu(false);
                    }}
                    style={{
                      background: playbackRate === option ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: 'none',
                      color: playbackRate === option ? '#fff' : 'var(--text-secondary)',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {option === 1.0 ? 'Normal' : `${option}x`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '110px' }}>
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
            >
              {volume === 0 ? <LuVolumeX style={{ fontSize: '14px' }} /> : volume < 0.5 ? <LuVolume1 style={{ fontSize: '14px' }} /> : <LuVolume2 style={{ fontSize: '14px' }} />}
            </button>
            <input
              type="range"
              min="0" max="1" step="0.02"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#fff' }}
            />
          </div>

        </div>

      </div>
    </div>
  );
}

export default AudioPlayer;
