import React, { useEffect, useState } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('FRIENDS MOBILE');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Hide native Capacitor splash screen smoothly once web splash mounts
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide();
      } catch (_) {
        // Fallback for standard web environment
      }
    };
    hideNativeSplash();

    // Timeline guaranteed to run smoothly for at least 3.2s to 3.5s
    const startTime = Date.now();
    const TARGET_DURATION = 3200; // 3.2 seconds progress fill + 300ms stay = 3.5s total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / TARGET_DURATION) * 100), 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 25) {
      setStatusText('INITIALIZING STORE PLATFORM...');
    } else if (progress < 60) {
      setStatusText('SYNCING PRODUCT CATALOG & OFFERS...');
    } else if (progress < 90) {
      setStatusText('PREPARING CUSTOMIZATION ENGINE...');
    } else if (progress < 100) {
      setStatusText('WELCOME TO FRIENDS MOBILE');
    } else {
      setStatusText('WELCOME TO FRIENDS MOBILE');
      // Hold briefly at 100% then execute elegant luxury exit
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 700); // Luxury dissolve duration
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [progress, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'radial-gradient(ellipse at 50% 35%, #131A2A 0%, #070A11 65%, #030408 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), filter 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(0.98)' : 'scale(1)',
        filter: isFadingOut ? 'blur(6px)' : 'none',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Subtle Metallic Ambient Background Glow */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 85, 0, 0.12) 0%, rgba(255, 85, 0, 0) 70%)',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(70px)',
          animation: 'luxuryGlow 4s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }}
      />

      {/* Discrete Elegant Skip Control */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '28px',
          right: '28px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.55)',
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#FFFFFF';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        Skip
      </button>

      {/* Main Luxury Brand Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '460px',
          width: '88%',
          padding: '20px'
        }}
      >
        {/* Sleek Metallic Logo Frame with Smooth Scale Reveal */}
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            marginBottom: '32px',
            animation: 'luxuryLogoEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Subtle Outer Halo Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 85, 0, 0.4) 50%, transparent 100%)',
              animation: 'luxuryRingSpin 6s linear infinite'
            }}
          />

          {/* Logo Disc Container */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F1F5F9 100%)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <img
              src="/logo.png"
              alt="FRIENDS MOBILE"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Brand Title with High-End Metallic Gradient */}
        <h1
          style={{
            margin: '0 0 10px 0',
            fontSize: '30px',
            fontWeight: 800,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 60%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'luxuryTextFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          FRIENDS MOBILE
        </h1>

        {/* Tagline with Ultra-Clean Tracking */}
        <p
          style={{
            margin: '0 0 36px 0',
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            animation: 'luxuryTextFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          Excellence in Mobile Accessories & Custom Creations
        </p>

        {/* Ultra-Thin Minimalist Luxury Progress Bar */}
        <div style={{ width: '100%', maxWidth: '240px', marginBottom: '16px' }}>
          <div
            style={{
              width: '100%',
              height: '2px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FF5500 0%, #F59E0B 100%)',
                borderRadius: '2px',
                transition: 'width 0.05s linear',
                boxShadow: '0 0 10px rgba(255, 85, 0, 0.6)'
              }}
            />
          </div>
        </div>

        {/* Micro Status Text */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            height: '16px'
          }}
        >
          {statusText}
        </div>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes luxuryGlow {
          0% { transform: translateX(-50%) scale(0.85); opacity: 0.15; }
          100% { transform: translateX(-50%) scale(1.15); opacity: 0.35; }
        }
        @keyframes luxuryRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes luxuryLogoEntrance {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes luxuryTextFade {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
