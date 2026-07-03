import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import AudioPlayer from './components/AudioPlayer';
import { usePlaylistStore } from './store/playlistStore';
import { FiHome, FiSearch, FiMenu, FiX, FiPlus, FiFolder, FiTrash2 } from 'react-icons/fi';
import './styles/index.css';

function SidebarLink({ to, children, icon, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
        color: isActive ? '#fff' : 'var(--text-secondary)',
        background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>{icon}</span>
      {children}
    </Link>
  );
}

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const { playlists, selectedPlaylist, setSelectedPlaylist, createPlaylist, deletePlaylist } = usePlaylistStore();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false); // Close mobile drawer when resizing back to desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
  };

  const handleSelectPlaylist = (name) => {
    setSelectedPlaylist(name);
    setIsSidebarOpen(false);
  };

  const handleSelectLibrary = () => {
    setSelectedPlaylist(null);
    setIsSidebarOpen(false);
  };

  return (
    <Router>
      <div style={{
        height: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "var(--font-sans)",
        overflow: 'hidden',
      }}>
        
        {/* Mobile Header Bar */}
        {isMobile && (
          <header style={{
            height: '56px',
            background: 'var(--bg-panel)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 100,
            flexShrink: 0
          }}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              style={{
                background: 'none', border: 'none', color: '#fff',
                fontSize: '20px', cursor: 'pointer', display: 'flex'
              }}
            >
              <FiMenu />
            </button>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: '700', fontSize: '15px' }}>PulseBeat</span>
            <div style={{ width: '20px' }} /> {/* Spacer */}
          </header>
        )}

        {/* Main Workspace */}
        <div style={{
          display: 'flex',
          flex: 1,
          height: isMobile ? 'calc(100vh - 136px)' : 'calc(100vh - 80px)', // adjust for header/player
          overflow: 'hidden',
          position: 'relative'
        }}>
          
          {/* Sidebar (Desktop static or Mobile Drawer) */}
          <aside style={{
            width: '240px',
            background: 'var(--bg-panel)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 12px',
            gap: '24px',
            flexShrink: 0,
            height: '100%',
            zIndex: 999,
            transition: 'transform 0.25s ease',
            ...(isMobile ? {
              position: 'absolute',
              top: 0, left: 0,
              transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              boxShadow: isSidebarOpen ? '8px 0 24px rgba(0,0,0,0.6)' : 'none',
            } : {})
          }}>
            {/* Logo & Close Button (Mobile Only) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '12px' }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: '700',
                fontSize: '16px',
                color: '#fff',
                letterSpacing: '-0.02em',
              }}>
                PulseBeat
              </span>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    fontSize: '18px', cursor: 'pointer', display: 'flex', marginRight: '4px'
                  }}
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Navigation links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SidebarLink to="/" icon={<FiHome />} onClick={handleSelectLibrary}>Home</SidebarLink>
              <SidebarLink to="/search" icon={<FiSearch />}>Search</SidebarLink>
            </div>

            {/* Playlists Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                paddingLeft: '16px',
              }}>Playlists</span>

              {/* Create Playlist Input */}
              <form onSubmit={handleCreatePlaylist} style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                padding: '4px 8px',
                margin: '0 8px 8px'
              }}>
                <input
                  type="text"
                  placeholder="New Playlist"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    color: '#fff', fontSize: '12px', width: '100%',
                  }}
                />
                <button type="submit" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}>
                  <FiPlus />
                </button>
              </form>

              {/* Playlist List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <Link
                  to="/"
                  onClick={handleSelectLibrary}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 16px', borderRadius: '6px',
                    fontSize: '13px', textDecoration: 'none',
                    color: selectedPlaylist === null ? '#fff' : 'var(--text-secondary)',
                    background: selectedPlaylist === null ? 'rgba(255,255,255,0.03)' : 'transparent',
                  }}
                >
                  <FiFolder />
                  <span>All Songs</span>
                </Link>
                {Object.keys(playlists).map(name => (
                  <div
                    key={name}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '4px 16px', borderRadius: '6px',
                      background: selectedPlaylist === name ? 'rgba(255,255,255,0.03)' : 'transparent',
                    }}
                  >
                    <Link
                      to="/"
                      onClick={() => handleSelectPlaylist(name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '13px', textDecoration: 'none', flex: 1, minWidth: 0,
                        color: selectedPlaylist === name ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      <FiFolder style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                    </Link>
                    <button
                      onClick={() => deletePlaylist(name)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '12px', display: 'flex', padding: '4px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>

            </div>

            {/* App State Info */}
            <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>Local Server</span>
              </div>
            </div>
          </aside>

          {/* Drawer backdrop (Mobile only) */}
          {isMobile && isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 998
              }}
            />
          )}

          {/* Main Panel Content */}
          <main style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--bg-base)',
            padding: isMobile ? '20px 16px' : '32px 40px',
            height: '100%',
          }}>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Minimal Audio Player */}
        <div style={{ height: '80px', position: 'relative', zIndex: 10 }}>
          <AudioPlayer />
        </div>
      </div>
    </Router>
  );
}
