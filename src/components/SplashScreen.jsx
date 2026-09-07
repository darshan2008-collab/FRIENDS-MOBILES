import React, { useEffect, useState } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING FRIENDS MOBILE...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Instantly hide native Capacitor splash screen
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide();
      } catch (_) {
        // Fallback for standard web environment
      }
    };
    hideNativeSplash();

    // High-performance 60FPS requestAnimationFrame timer for exact 4.0 seconds (4000ms)
    let animationFrameId;
    const DURATION = 4000; // Exact 4.0 seconds duration requested by user
    const startTime = performance.now();

    const updateTimeline = (currentTime) => {
      const elapsed = currentTime - startTime;
      const pct = Math.min(Math.floor((elapsed / DURATION) * 100), 100);
      setProgress(pct);

      if (elapsed < DURATION) {
        animationFrameId = requestAnimationFrame(updateTimeline);
      } else {
        setProgress(100);
      }
    };

    animationFrameId = requestAnimationFrame(updateTimeline);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (progress < 25) {
      setStatusText('INITIALIZING STORE PLATFORM...');
    } else if (progress < 55) {
      setStatusText('SYNCING PRODUCTS & OFFERS...');
    } else if (progress < 85) {
      setStatusText('PREPARING 3D CUSTOM STUDIO...');
    } else if (progress < 100) {
      setStatusText('WELCOME TO FRIENDS MOBILE');
    } else {
      setStatusText('WELCOME TO FRIENDS MOBILE');
      // Hold smoothly at 100% then trigger lag-free 60FPS fadeout transition
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 500); // 500ms smooth fadeout
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [progress, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#070A11',
        backgroundImage: 'radial-gradient(circle at 50% 35%, #111827 0%, #070A11 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(0.97) translate3d(0, 0, 0)' : 'scale(1) translate3d(0, 0, 0)',
        willChange: 'opacity, transform',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Subtle Hardware-Accelerated Ambient Light Glow */}
      <div
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 85, 0, 0.14) 0%, rgba(255, 85, 0, 0) 70%)',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%) translate3d(0, 0, 0)',
          willChange: 'transform',
          animation: 'splashGlowPulse 4s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }}
      />

      {/* Discrete Skip Control */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: 'rgba(255, 255, 255, 0.65)',
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
      >
        Skip
      </button>

      {/* Main Brand Frame */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '420px',
          width: '88%',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        {/* Crisp Original Logo in Glowing Metallic Frame */}
        <div
          style={{
            position: 'relative',
            width: '124px',
            height: '124px',
            marginBottom: '30px',
            transform: 'translate3d(0, 0, 0)',
            animation: 'splashLogoScale 1s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Glowing Aura Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-6px',
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 85, 0, 0.45) 50%, transparent 100%)',
              animation: 'splashSpinRing 6s linear infinite',
              transform: 'translate3d(0, 0, 0)'
            }}
          />

          {/* White Disc Container for Original Logo */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
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

        {/* Brand Title */}
        <h1
          style={{
            margin: '0 0 10px 0',
            fontSize: '30px',
            fontWeight: 800,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            transform: 'translate3d(0, 0, 0)',
            animation: 'splashTextReveal 0.8s ease-out forwards'
          }}
        >
          FRIENDS MOBILE
        </h1>

        {/* Tagline */}
        <p
          style={{
            margin: '0 0 32px 0',
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.55)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            transform: 'translate3d(0, 0, 0)',
            animation: 'splashTextReveal 1s ease-out forwards'
          }}
        >
          Premium Accessories & Custom Creations
        </p>

        {/* Hardware-Accelerated 60FPS Progress Bar */}
        <div style={{ width: '100%', maxWidth: '240px', marginBottom: '14px' }}>
          <div
            style={{
              width: '100%',
              height: '3px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FF5500 0%, #F59E0B 100%)',
                borderRadius: '3px',
                transition: 'width 0.05s linear',
                boxShadow: '0 0 10px rgba(255, 85, 0, 0.7)',
                willChange: 'width'
              }}
            />
          </div>
        </div>

        {/* Micro Status Indicator */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '1.2px',
            color: 'rgba(255, 255, 255, 0.45)',
            textTransform: 'uppercase',
            height: '16px'
          }}
        >
          {statusText}
        </div>
      </div>

      {/* Hardware-Accelerated CSS Keyframes */}
      <style>{`
        @keyframes splashGlowPulse {
          0% { transform: translateX(-50%) scale(0.9) translate3d(0, 0, 0); opacity: 0.12; }
          100% { transform: translateX(-50%) scale(1.1) translate3d(0, 0, 0); opacity: 0.28; }
        }
        @keyframes splashSpinRing {
          0% { transform: rotate(0deg) translate3d(0, 0, 0); }
          100% { transform: rotate(360deg) translate3d(0, 0, 0); }
        }
        @keyframes splashLogoScale {
          0% { transform: scale(0.88) translate3d(0, 0, 0); opacity: 0; }
          100% { transform: scale(1) translate3d(0, 0, 0); opacity: 1; }
        }
        @keyframes splashTextReveal {
          0% { transform: translateY(6px) translate3d(0, 0, 0); opacity: 0; }
          100% { transform: translateY(0) translate3d(0, 0, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
