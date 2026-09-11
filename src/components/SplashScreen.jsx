import React, { useEffect, useState, useCallback } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';
import logoImg from '../assets/logo.png';

export default function SplashScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Instantly hide native static splash to show animated screen with 0ms delay
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide({ fadeOutDuration: 100 });
      } catch (_) {}
    };
    hideNativeSplash();

    // 5-second cinematic experience requested by user (4.6s display + 0.4s exit transition)
    const exitTimer = setTimeout(() => {
      triggerAppEnter();
    }, 4600);

    return () => clearTimeout(exitTimer);
  }, []);

  const triggerAppEnter = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  }, [onFinish]);

  return (
    <div
      className={`fm-splash-root ${isExiting ? 'fm-splash-exit' : ''}`}
      onClick={triggerAppEnter}
      role="button"
      tabIndex={0}
      aria-label="Friends Mobile Splash"
    >
      {/* Ambient Atmospheric Deep Glow */}
      <div className="fm-splash-glow-core" />
      <div className="fm-splash-ambient-rays" />

      {/* Floating Micro Light Particles */}
      <div className="fm-sparkle sp-1" />
      <div className="fm-sparkle sp-2" />
      <div className="fm-sparkle sp-3" />
      <div className="fm-sparkle sp-4" />

      {/* Center Brand Centerpiece */}
      <div className="fm-splash-stage">
        {/* Orbital 360 High-Speed Neon Energy Rings */}
        <div className="fm-orbit-box">
          <div className="fm-orbit-ring ring-outer" />
          <div className="fm-orbit-ring ring-inner" />
          <div className="fm-orbit-dot dot-1" />
          <div className="fm-orbit-dot dot-2" />

          {/* Perfect 1:1 Circular Logo Badge */}
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
              <div className="fm-disc-specular" />
            </div>
          </div>
        </div>

        {/* Brand Title: FRIENDS MOBILE */}
        <div className="fm-brand-title-box">
          <h1 className="fm-brand-title">
            <span className="fm-title-white">FRIENDS </span>
            <span className="fm-title-orange">MOBILE</span>
          </h1>
          <div className="fm-title-underline" />
        </div>

        {/* Modern Tagline Pill Badge */}
        <div className="fm-brand-badge">
          <span className="fm-badge-dot" />
          <span className="fm-badge-text">CUSTOM CASES • ACCESSORIES • CARE</span>
          <span className="fm-badge-dot" />
        </div>

        {/* Sleek Minimalist Continuous Glowing Loader Ring */}
        <div className="fm-loader-track">
          <div className="fm-loader-spinner" />
          <span className="fm-loader-label">LOADING STORE...</span>
        </div>
      </div>

      {/* 60FPS Hardware Accelerated Motion Styles */}
      <style>{`
        .fm-splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999999;
          background-color: #070A11;
          background-image: radial-gradient(circle at 50% 45%, #141c2e 0%, #0a0e18 60%, #070A11 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          transition: opacity 0.4s cubic-bezier(0.2, 0.9, 0.3, 1),
                      transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1),
                      filter 0.4s ease-out;
          will-change: opacity, transform, filter;
        }

        /* Camera Push-Through Zoom into App */
        .fm-splash-exit {
          opacity: 0 !important;
          transform: scale3d(1.15, 1.15, 1) !important;
          filter: blur(6px);
          pointer-events: none;
        }

        /* Ambient Core Light */
        .fm-splash-glow-core {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 85, 0, 0.25) 0%, rgba(255, 140, 0, 0.07) 50%, transparent 75%);
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: fmCorePulse 3s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes fmCorePulse {
          0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1.18); opacity: 1; }
        }

        .fm-splash-ambient-rays {
          position: absolute;
          inset: -40px;
          background: conic-gradient(
            from 0deg at 50% 45%,
            transparent 0deg,
            rgba(255, 85, 0, 0.04) 40deg,
            transparent 80deg,
            rgba(255, 170, 0, 0.04) 160deg,
            transparent 220deg,
            rgba(255, 85, 0, 0.04) 280deg,
            transparent 360deg
          );
          animation: fmRotateRays 16s linear infinite;
          pointer-events: none;
        }

        @keyframes fmRotateRays {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Floating Micro Light Particles */
        .fm-sparkle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 136, 0, 0.7);
          box-shadow: 0 0 8px #FF8800;
          pointer-events: none;
        }
        .sp-1 { width: 4px; height: 4px; top: 30%; left: 22%; animation: fmParticleFloat 4s ease-in-out infinite; }
        .sp-2 { width: 5px; height: 5px; top: 65%; left: 78%; animation: fmParticleFloat 5s ease-in-out infinite 1s; }
        .sp-3 { width: 3px; height: 3px; top: 25%; left: 70%; animation: fmParticleFloat 3.8s ease-in-out infinite 1.5s; }
        .sp-4 { width: 4px; height: 4px; top: 70%; left: 28%; animation: fmParticleFloat 4.6s ease-in-out infinite 0.7s; }

        @keyframes fmParticleFloat {
          0% { transform: translate3d(0, 0, 0); opacity: 0.2; }
          50% { transform: translate3d(12px, -24px, 0); opacity: 0.85; }
          100% { transform: translate3d(-8px, -48px, 0); opacity: 0; }
        }

        /* Center Stage */
        .fm-splash-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px;
          width: 100%;
          max-width: 440px;
        }

        /* Orbital Energy Rings */
        .fm-orbit-box {
          position: relative;
          width: 140px;
          height: 140px;
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

        .ring-outer {
          inset: -14px;
          border: 2.5px solid transparent;
          border-top-color: #FF5500;
          border-right-color: #FFAA00;
          filter: drop-shadow(0 0 12px rgba(255, 85, 0, 0.85));
          animation: fmSpinFast 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .ring-inner {
          inset: -7px;
          border: 1.5px solid transparent;
          border-bottom-color: rgba(255, 170, 0, 0.75);
          border-left-color: rgba(255, 85, 0, 0.55);
          animation: fmSpinRev 2.4s linear infinite;
        }

        .fm-orbit-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FFF;
          box-shadow: 0 0 12px #FF5500, 0 0 5px #FFF;
          pointer-events: none;
        }

        .dot-1 {
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          animation: fmSparkOrbit 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 50% 86px;
        }

        .dot-2 {
          bottom: -9px;
          left: 50%;
          transform: translateX(-50%);
          animation: fmSparkOrbitRev 2.4s linear infinite;
          transform-origin: 50% -63px;
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

        /* 1:1 Circular Logo Disc */
        .fm-logo-disc {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: fmLogoBounce 0.75s cubic-bezier(0.16, 1.25, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        @keyframes fmLogoBounce {
          0% {
            transform: translate3d(0, -60px, 0) scale3d(0.45, 0.45, 1);
            opacity: 0;
            filter: blur(8px);
          }
          70% {
            transform: translate3d(0, 4px, 0) scale3d(1.05, 1.05, 1);
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
            0 16px 40px rgba(0, 0, 0, 0.8),
            0 0 30px rgba(255, 85, 0, 0.45),
            inset 0 1px 3px rgba(255, 255, 255, 0.95);
          border: 2.5px solid rgba(255, 255, 255, 0.85);
          overflow: hidden;
        }

        .fm-logo-graphic {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
          aspect-ratio: 1 / 1;
          display: block;
        }

        .fm-disc-specular {
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

        /* Brand Title */
        .fm-brand-title-box {
          position: relative;
          margin-bottom: 12px;
          animation: fmTitleSlide 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.15s;
          opacity: 0;
          will-change: transform, opacity;
        }

        @keyframes fmTitleSlide {
          0% {
            transform: translate3d(0, -20px, 0);
            opacity: 0;
            letter-spacing: 6px;
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
          font-size: 27px;
          font-weight: 900;
          text-transform: uppercase;
          line-height: 1.1;
        }

        .fm-title-white {
          color: #FFFFFF;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
        }

        .fm-title-orange {
          color: #FF5500;
          text-shadow: 0 0 16px rgba(255, 85, 0, 0.6);
        }

        .fm-title-underline {
          margin: 8px auto 0;
          width: 52px;
          height: 2.5px;
          border-radius: 2px;
          background: linear-gradient(90deg, transparent, #FF5500, #FFAA00, transparent);
          box-shadow: 0 0 10px #FF5500;
          animation: fmUnderlineExpand 0.7s ease-out forwards 0.3s;
          transform: scaleX(0);
        }

        @keyframes fmUnderlineExpand {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        /* Tagline Pill Badge */
        .fm-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 85, 0, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1);
          animation: fmBadgeRise 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.25s;
          opacity: 0;
          margin-bottom: 22px;
          will-change: transform, opacity;
        }

        @keyframes fmBadgeRise {
          0% {
            transform: translate3d(0, 22px, 0);
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
          box-shadow: 0 0 8px #FF5500;
        }

        .fm-badge-text {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.85);
        }

        /* Continuous Glowing Loader Sweep Underneath */
        .fm-loader-track {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          animation: fmLoaderReveal 0.8s ease-out forwards 0.4s;
          opacity: 0;
        }

        @keyframes fmLoaderReveal {
          0% { opacity: 0; transform: translate3d(0, 10px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        .fm-loader-spinner {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid rgba(255, 85, 0, 0.18);
          border-top-color: #FF5500;
          border-right-color: #FFAA00;
          box-shadow: 0 0 16px rgba(255, 85, 0, 0.5);
          animation: fmSpinnerSpin 1s linear infinite;
        }

        @keyframes fmSpinnerSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .fm-loader-label {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
        }
      `}</style>
    </div>
  );
}



