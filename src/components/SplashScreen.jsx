import React, { useEffect, useState, useCallback } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';
import logoImg from '../assets/logo.png';

export default function SplashScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  // Instantly dismiss native static splash screen to smoothly show the animated stage
  useEffect(() => {
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide({ fadeOutDuration: 150 });
      } catch (_) {}
    };
    hideNativeSplash();

    // Snappy, punchy duration: 1.25s animation + 0.3s camera push-through into app
    const exitTimer = setTimeout(() => {
      triggerAppEnter();
    }, 1250);

    return () => clearTimeout(exitTimer);
  }, []);

  const triggerAppEnter = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 380);
  }, [onFinish]);

  return (
    <div
      className={`fm-splash-root ${isExiting ? 'fm-splash-exit' : ''}`}
      onClick={triggerAppEnter}
      role="button"
      tabIndex={0}
      aria-label="Friends Mobile Splash"
    >
      {/* Ambient Deep Atmospheric Glows */}
      <div className="fm-splash-glow-core" />
      <div className="fm-splash-rays" />

      {/* Main Animated Brand Centerpiece */}
      <div className="fm-splash-stage">
        {/* Orbital High-Speed Energy Rings ("சுத்திகிட்டு வர மாதிரி") */}
        <div className="fm-orbit-container">
          <div className="fm-orbit-ring ring-fast" />
          <div className="fm-orbit-ring ring-reverse" />
          <div className="fm-orbit-spark spark-1" />
          <div className="fm-orbit-spark spark-2" />

          {/* Logo Disc Dropping In From Top ("மேல இருந்து வர மாதிரி") */}
          <div className="fm-logo-disc">
            <div className="fm-disc-inner">
              <img
                src={logoImg || '/logo.png'}
                alt="FRIENDS MOBILE"
                className="fm-logo-graphic"
                onError={(e) => {
                  e.target.src = '/logo.png';
                }}
              />
              <div className="fm-logo-specular" />
            </div>
          </div>
        </div>

        {/* Brand Title Dropping from Top ("மேல இருந்து வர மாதிரி") */}
        <div className="fm-brand-title-box">
          <h1 className="fm-brand-title">FRIENDS MOBILE</h1>
          <div className="fm-title-underline" />
        </div>

        {/* Tagline Badge Gliding Up from Bottom ("கீழ இருந்து வர மாதிரி") */}
        <div className="fm-brand-badge">
          <span className="fm-badge-dot" />
          <span className="fm-badge-text">CUSTOM CASES • ACCESSORIES • CARE</span>
          <span className="fm-badge-dot" />
        </div>
      </div>

      {/* GPU Hardware Accelerated Keyframes & Motion Typography */}
      <style>{`
        .fm-splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999999;
          background-color: #070A11;
          background-image: 
            radial-gradient(circle at 50% 42%, #141c2e 0%, #0b0f19 50%, #070A11 90%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
          cursor: pointer;
          transition: opacity 0.38s cubic-bezier(0.2, 0.9, 0.3, 1),
                      transform 0.38s cubic-bezier(0.2, 0.9, 0.3, 1),
                      filter 0.38s ease-out;
          will-change: opacity, transform, filter;
        }

        /* Camera Push-Through Zoom into App ("ஆப் குள்ள போற மாதிரி") */
        .fm-splash-exit {
          opacity: 0 !important;
          transform: scale3d(1.18, 1.18, 1) !important;
          filter: blur(6px);
          pointer-events: none;
        }

        /* Ambient Pulsing Core Behind Logo */
        .fm-splash-glow-core {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 85, 0, 0.28) 0%, rgba(255, 140, 0, 0.08) 50%, transparent 75%);
          top: 42%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: fmCorePulse 2.4s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes fmCorePulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.22); opacity: 1; }
        }

        /* Subtle Rotating Volumetric Light Rays */
        .fm-splash-rays {
          position: absolute;
          inset: -40px;
          background: conic-gradient(
            from 0deg at 50% 42%,
            transparent 0deg,
            rgba(255, 85, 0, 0.03) 30deg,
            transparent 60deg,
            rgba(255, 170, 0, 0.04) 120deg,
            transparent 160deg,
            rgba(255, 85, 0, 0.03) 240deg,
            transparent 300deg,
            rgba(255, 170, 0, 0.04) 340deg,
            transparent 360deg
          );
          animation: fmRotateRays 14s linear infinite;
          pointer-events: none;
        }

        @keyframes fmRotateRays {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Stage Content Center */
        .fm-splash-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px;
          width: 100%;
          max-width: 420px;
        }

        /* -------------------------------------------------------------
           1. ORBITAL ROTATING RINGS ("சுத்திகிட்டு வர மாதிரி")
           ------------------------------------------------------------- */
        .fm-orbit-container {
          position: relative;
          width: 136px;
          height: 136px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fm-orbit-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .ring-fast {
          inset: -12px;
          border: 2px solid transparent;
          border-top-color: #FF5500;
          border-right-color: #FFAA00;
          filter: drop-shadow(0 0 10px rgba(255, 85, 0, 0.8));
          animation: fmSpinFast 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .ring-reverse {
          inset: -6px;
          border: 1.5px solid transparent;
          border-bottom-color: rgba(255, 170, 0, 0.7);
          border-left-color: rgba(255, 85, 0, 0.5);
          animation: fmSpinRev 2.2s linear infinite;
        }

        .fm-orbit-spark {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFF;
          box-shadow: 0 0 12px #FF5500, 0 0 4px #FFF;
          pointer-events: none;
        }

        .spark-1 {
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          animation: fmSparkOrbit 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 50% 82px;
        }

        .spark-2 {
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          animation: fmSparkOrbitRev 2.2s linear infinite;
          transform-origin: 50% -60px;
        }

        @keyframes fmSpinFast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fmSpinRev {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes fmSparkOrbit {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }

        @keyframes fmSparkOrbitRev {
          0% { transform: translateX(-50%) rotate(360deg); }
          100% { transform: translateX(-50%) rotate(0deg); }
        }

        /* -------------------------------------------------------------
           2. LOGO DISC ARRIVING FROM TOP ("மேல இருந்து வர மாதிரி")
           ------------------------------------------------------------- */
        .fm-logo-disc {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: fmLogoDrop 0.65s cubic-bezier(0.16, 1.2, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        @keyframes fmLogoDrop {
          0% {
            transform: translate3d(0, -60px, 0) scale3d(0.5, 0.5, 1);
            opacity: 0;
            filter: blur(8px);
          }
          70% {
            transform: translate3d(0, 4px, 0) scale3d(1.04, 1.04, 1);
            opacity: 1;
            filter: blur(0);
          }
          100% {
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
            opacity: 1;
            filter: blur(0);
          }
        }

        .fm-disc-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #FFFFFF;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 14px 36px rgba(0, 0, 0, 0.75),
            0 0 28px rgba(255, 85, 0, 0.4),
            inset 0 1px 3px rgba(255, 255, 255, 0.9);
          border: 2.5px solid rgba(255, 255, 255, 0.85);
          overflow: hidden;
        }

        .fm-logo-graphic {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .fm-logo-specular {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.45) 0%,
            transparent 45%,
            rgba(255, 85, 0, 0.15) 100%
          );
          pointer-events: none;
        }

        /* -------------------------------------------------------------
           3. BRAND TITLE FROM TOP ("மேல இருந்து வர மாதிரி")
           ------------------------------------------------------------- */
        .fm-brand-title-box {
          position: relative;
          margin-bottom: 12px;
          animation: fmTitleSlideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.12s;
          opacity: 0;
          will-change: transform, opacity;
        }

        @keyframes fmTitleSlideDown {
          0% {
            transform: translate3d(0, -22px, 0);
            opacity: 0;
            letter-spacing: 7px;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
            letter-spacing: 3.5px;
          }
        }

        .fm-brand-title {
          margin: 0;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 26px;
          font-weight: 900;
          text-transform: uppercase;
          background: linear-gradient(180deg, #FFFFFF 30%, #FFD6C2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 18px rgba(0, 0, 0, 0.8);
          line-height: 1.1;
        }

        .fm-title-underline {
          margin: 8px auto 0;
          width: 48px;
          height: 2.5px;
          border-radius: 2px;
          background: linear-gradient(90deg, transparent, #FF5500, #FFAA00, transparent);
          box-shadow: 0 0 8px #FF5500;
          animation: fmUnderlineExpand 0.7s ease-out forwards 0.25s;
          transform: scaleX(0);
        }

        @keyframes fmUnderlineExpand {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        /* -------------------------------------------------------------
           4. TAGLINE BADGE FROM BOTTOM ("கீழ இருந்து வர மாதிரி")
           ------------------------------------------------------------- */
        .fm-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 85, 0, 0.28);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1);
          animation: fmBadgeSlideUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.22s;
          opacity: 0;
          will-change: transform, opacity;
        }

        @keyframes fmBadgeSlideUp {
          0% {
            transform: translate3d(0, 24px, 0);
            opacity: 0;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        .fm-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FF5500;
          box-shadow: 0 0 6px #FF5500;
        }

        .fm-badge-text {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
        }
      `}</style>
    </div>
  );
}

