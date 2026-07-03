import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LuX } from 'react-icons/lu';
import { FcGoogle } from 'react-icons/fc';

export function AuthModal({ isOpen, onClose }) {
  const { loginWithGoogle, error, loading } = useAuthStore();
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLocalError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Google Login failed.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.2s ease',
    }}>
      
      {/* Modal Card */}
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '360px',
        padding: '32px 28px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        textAlign: 'center'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px', right: '20px',
            background: 'none', border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer', display: 'flex', fontSize: '18px'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <LuX />
        </button>

        {/* Header */}
        <div>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            fontSize: '20px',
            color: '#fff'
          }}>
            Welcome to PulseBeat
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Sign in to synchronize your playlists and settings to the cloud
          </p>
        </div>

        {/* Error Indicator */}
        {(localError || error) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '12px',
          }}>
            {localError || error}
          </div>
        )}

        {/* Google Provider Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
            marginTop: '8px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        >
          <FcGoogle style={{ fontSize: '18px' }} />
          <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        {/* Secure Note */}
        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
          By signing in, you agree to secure cloud synchronization of your personal preferences and playlist saves.
        </span>

      </div>
    </div>
  );
}
export default AuthModal;
