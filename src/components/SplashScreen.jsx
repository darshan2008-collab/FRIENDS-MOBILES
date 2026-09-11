import React, { useEffect, useState } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';
import logoImg from '../assets/logo.png';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING STORE PLATFORM...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Instantly hide native Capacitor static splash screen to reveal our animated splash
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide();
      } catch (_) {}
    };
    hideNativeSplash();

    // High-performance 60FPS requestAnimationFrame timeline
    let animationFrameId;
    const DURATION = 3800; // Optimal 3.8s duration for cinematic animations
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
    } else if (progress < 80) {
      setStatusText('PREPARING 3D CUSTOM STUDIO...');
    } else if (progress < 100) {
      setStatusText('WELCOME TO FRIENDS MOBILE');
    } else {
      setStatusText('WELCOME TO FRIENDS MOBILE');
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 550);
      }, 250);

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
      className="splash-container"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: '#070A11',
        backgroundImage: 'radial-gradient(ellipse at 50% 35%, #131d33 0%, #070A11 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1), transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale3d(1.05, 1.05, 1)' : 'scale3d(1, 1, 1)',
        willChange: 'opacity, transform',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Dynamic Background Glowing Aura Orb */}
      <div className="splash-ambient-orb" />
      <div className="splash-shockwave-1" />
      <div className="splash-shockwave-2" />

      {/* Ambient Floating Micro-Particles */}
      <div className="splash-particle p1" />
      <div className="splash-particle p2" />
      <div className="splash-particle p3" />
      <div className="splash-particle p4" />
      <div className="splash-particle p5" />

      {/* Discrete Skip Control Button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '28px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'rgba(255, 255, 255, 0.75)',
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 20
        }}
      >
        Skip
      </button>

      {/* Brand Stage */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '440px',
          width: '90%'
        }}
      >
        {/* Animated Flying/Dropping Logo Hero with Dual Energy Rings */}
        <div className="splash-logo-stage">
          {/* Outer Pulsing Neon Glow Ring */}
          <div className="splash-neon-ring" />
          
          {/* Inner Counter-Rotating Gradient Ring */}
          <div className="splash-neon-inner-ring" />

          {/* Logo Disc Container with 3D Depth */}
          <div className="splash-logo-disc">
            <img
              src={logoImg || '/logo.png'}
              alt="FRIENDS MOBILE"
              className="splash-logo-img"
              onError={(e) => {
                e.target.src = '/logo.png';
              }}
            />
          </div>
        </div>

        {/* Shimmering Animated Brand Title */}
        <div className="splash-title-wrapper">
          <h1 className="splash-title">
            FRIENDS MOBILE
          </h1>
          <div className="splash-title-shimmer" />
        </div>

        {/* Elegant Tagline Pill with Orange Accent */}
        <div className="splash-tagline-pill">
          <span>Premium Accessories • Doorstep Care</span>
        </div>

        {/* High-Speed Hardware Accelerated Progress Bar */}
        <div className="splash-progress-track">
          <div
            className="splash-progress-fill"
            style={{ width: `${progress}%` }}
          />
          {/* Glowing head dot */}
          <div
            className="splash-progress-glow-head"
            style={{ left: `${Math.max(0, progress - 2)}%` }}
          />
        </div>

        {/* Status Stage Text with Soft Indicator */}
        <div className="splash-status-text">
          <span className="splash-status-dot" />
          {statusText}
        </div>
      </div>

      {/* 60FPS GPU Hardware Accelerated CSS Keyframes */}
      <style>{`
        /* Smooth Logo Entrance from Depth/Sky with Elastic Bounce & Floating */
        .splash-logo-stage {
          position: relative;
          width: 130px;
          height: 130px;
          margin-bottom: 26px;
          animation: splashLogoFlyIn 1.1s cubic-bezier(0.34, 1.45, 0.64, 1) forwards,
                     splashLogoFloat 3.2s ease-in-out infinite alternate 1.1s;
          will-change: transform, opacity;
        }

        @keyframes splashLogoFlyIn {
          0% {
            transform: translate3d(0, -90px, 0) scale3d(0.4, 0.4, 1);
            opacity: 0;
            filter: blur(12px);
          }
          60% {
            transform: translate3d(0, 8px, 0) scale3d(1.08, 1.08, 1);
            opacity: 1;
            filter: blur(0);
          }
          85% {
            transform: translate3d(0, -4px, 0) scale3d(0.97, 0.97, 1);
          }
          100% {
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes splashLogoFloat {
          0% {
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
          100% {
            transform: translate3d(0, -8px, 0) scale3d(1.03, 1.03, 1);
          }
        }

        /* Outer Energy Ring */
        .splash-neon-ring {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, rgba(255, 85, 0, 0) 0%, #FF5500 40%, #FFAA00 70%, rgba(255, 85, 0, 0) 100%);
          animation: splashSpinRing 4s linear infinite;
          will-change: transform;
          opacity: 0.85;
          filter: drop-shadow(0 0 12px rgba(255, 85, 0, 0.7));
        }

        /* Inner Energy Ring (Reverse Spin) */
        .splash-neon-inner-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 180deg, transparent 0%, rgba(255, 170, 0, 0.6) 60%, transparent 100%);
          animation: splashSpinRingRev 6s linear infinite;
          will-change: transform;
          opacity: 0.6;
        }

        @keyframes splashSpinRing {
          0% { transform: rotate(0deg) translate3d(0, 0, 0); }
          100% { transform: rotate(360deg) translate3d(0, 0, 0); }
        }

        @keyframes splashSpinRingRev {
          0% { transform: rotate(360deg) translate3d(0, 0, 0); }
          100% { transform: rotate(0deg) translate3d(0, 0, 0); }
        }

        /* White Logo Disc */
        .splash-logo-disc {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #FFFFFF;
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.65), 
                      0 0 25px rgba(255, 85, 0, 0.35),
                      inset 0 1px 2px rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          border: 2px solid rgba(255, 255, 255, 0.6);
        }

        .splash-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
          transform: translate3d(0, 0, 0);
          animation: splashLogoPop 1.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes splashLogoPop {
          0% { transform: scale(0.65); }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        /* Ambient Center Orb */
        .splash-ambient-orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 85, 0, 0.18) 0%, rgba(255, 85, 0, 0.04) 45%, transparent 70%);
          top: 32%;
          left: 50%;
          transform: translate(-50%, -50%) translate3d(0, 0, 0);
          animation: splashOrbPulse 4s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes splashOrbPulse {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.15; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.35; }
        }

        /* Shockwave Aura Rings Expanding Outwards */
        .splash-shockwave-1 {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 2px solid rgba(255, 85, 0, 0.5);
          top: 36%;
          left: 50%;
          transform: translate(-50%, -50%) scale(1);
          animation: splashShockwave 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 0.8s;
          pointer-events: none;
          opacity: 0;
        }

        .splash-shockwave-2 {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 170, 0, 0.4);
          top: 36%;
          left: 50%;
          transform: translate(-50%, -50%) scale(1);
          animation: splashShockwave 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 2.2s;
          pointer-events: none;
          opacity: 0;
        }

        @keyframes splashShockwave {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
          60% { opacity: 0.25; }
          100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
        }

        /* Ambient Floating Particles */
        .splash-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 136, 0, 0.6);
          box-shadow: 0 0 6px #FF8800;
          pointer-events: none;
        }
        .p1 { width: 4px; height: 4px; top: 60%; left: 25%; animation: particleFloat 4s ease-in-out infinite; }
        .p2 { width: 5px; height: 5px; top: 40%; left: 80%; animation: particleFloat 5s ease-in-out infinite 1s; }
        .p3 { width: 3px; height: 3px; top: 25%; left: 30%; animation: particleFloat 3.8s ease-in-out infinite 1.5s; }
        .p4 { width: 4px; height: 4px; top: 75%; left: 70%; animation: particleFloat 4.5s ease-in-out infinite 0.5s; }
        .p5 { width: 6px; height: 6px; top: 50%; left: 15%; animation: particleFloat 5.5s ease-in-out infinite 2s; }

        @keyframes particleFloat {
          0% { transform: translate3d(0, 0, 0); opacity: 0.2; }
          50% { transform: translate3d(15px, -30px, 0); opacity: 0.8; }
          100% { transform: translate3d(-10px, -60px, 0); opacity: 0; }
        }

        /* Title with Shimmer Sweep */
        .splash-title-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 8px;
          animation: splashTitleReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s;
          opacity: 0;
        }

        .splash-title {
          margin: 0;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #FFFFFF 20%, #FFE0CC 50%, #FFFFFF 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
        }

        @keyframes splashTitleReveal {
          0% {
            transform: translate3d(0, 20px, 0);
            opacity: 0;
            letter-spacing: 8px;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
            letter-spacing: 3.5px;
          }
        }

        /* Tagline Pill */
        .splash-tagline-pill {
          display: inline-flex;
          align-items: center;
          padding: 5px 16px;
          border-radius: 20px;
          background: rgba(255, 85, 0, 0.08);
          border: 1px solid rgba(255, 85, 0, 0.25);
          color: rgba(255, 255, 255, 0.7);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 28px;
          animation: splashTaglineReveal 1s ease-out forwards 0.5s;
          opacity: 0;
        }

        @keyframes splashTaglineReveal {
          0% { transform: translate3d(0, 15px, 0); opacity: 0; }
          100% { transform: translate3d(0, 0, 0); opacity: 1; }
        }

        /* Progress Track */
        .splash-progress-track {
          width: 100%;
          max-width: 250px;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          overflow: visible;
          position: relative;
          margin-bottom: 14px;
        }

        .splash-progress-fill {
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #FF5500 0%, #FFAA00 50%, #FF5500 100%);
          background-size: 200% 100%;
          animation: splashProgressGradient 2s linear infinite;
          box-shadow: 0 0 12px rgba(255, 85, 0, 0.85);
          transition: width 0.06s linear;
          will-change: width;
        }

        @keyframes splashProgressGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .splash-progress-glow-head {
          position: absolute;
          top: -3px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FFAA00;
          box-shadow: 0 0 14px #FF5500, 0 0 6px #FFFFFF;
          transition: left 0.06s linear;
        }

        /* Micro Status Indicator */
        .splash-status-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          height: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .splash-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FF5500;
          box-shadow: 0 0 8px #FF5500;
          animation: statusDotBlink 1.2s ease-in-out infinite;
        }

        @keyframes statusDotBlink {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
