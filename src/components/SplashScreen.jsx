import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';
import logoImg from '../assets/logo.png';

export default function SplashScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);
  const finishedRef = useRef(false);

  const triggerAppEnter = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsExiting(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 600);
  }, [onFinish]);

  useEffect(() => {
    // Instantly dismiss any native static splash screen so the animation takes over seamlessly
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide({ fadeOutDuration: 100 });
      } catch (_) {}
    };
    hideNativeSplash();

    // Luxurious, complete cinematic duration (allows all phases to finish naturally and gracefully)
    const exitTimer = setTimeout(() => {
      triggerAppEnter();
    }, 6400);

    return () => clearTimeout(exitTimer);
  }, [triggerAppEnter]);

  return (
    <div
      className={`fm-studio-splash-root ${isExiting ? 'fm-splash-exit' : ''}`}
      onClick={triggerAppEnter}
      role="button"
      tabIndex={0}
      aria-label="Friends Mobile Splash Screen"
    >
      {/* Pristine Studio Ambient Light Glow */}
      <div className="fm-studio-light-radial" />
      <div className="fm-studio-soft-highlight" />

      {/* Main Studio Stage */}
      <div className="fm-studio-stage">
        
        {/* Brand Lockup: Logo centered first -> then glides smoothly to left as text unfolds to the side */}
        <div className="fm-brand-stage">
          <div className="fm-brand-lockup">
            
            {/* 3D Circular Logo Badge Anchor */}
            <div className="fm-logo-badge-anchor">
              <div className="fm-logo-badge-3d">
                <div className="fm-badge-outer-ring">
                  <div className="fm-badge-inner-circle">
                    <img
                      src={logoImg || '/logo.png'}
                      alt="Friends Mobile Logo"
                      className="fm-badge-icon"
                      onError={(e) => {
                        e.target.src = '/logo.png';
                      }}
                    />
                    {/* Glass Specular Sheen */}
                    <div className="fm-badge-specular" />
                  </div>
                </div>
              </div>
              {/* Dynamic Logo Ground Shadow */}
              <div className="fm-badge-ground-shadow" />
            </div>

            {/* Typography: Unfolds smoothly from behind the logo to the right */}
            <div className="fm-text-reveal-wrapper">
              <div className="fm-text-reveal-inner">
                <span className="fm-word-friends">
                  <span className="fm-letter-f">F</span>
                  <span className="fm-word-rest">riends</span>
                </span>
                <span className="fm-word-space">&nbsp;</span>
                <span className="fm-word-mobile">Mobile</span>
              </div>
              {/* Light Shimmer Sweep across text once revealed */}
              <div className="fm-text-shimmer-sheen" />
            </div>

          </div>

          {/* Unified Lockup Ground Shadow */}
          <div className="fm-lockup-ground-shadow" />
        </div>

        {/* Sleek Minimalist Loading Section */}
        <div className="fm-studio-loader-section">
          <div className="fm-loader-spinner-box">
            <svg className="fm-loader-svg" viewBox="0 0 44 44">
              <circle
                className="fm-loader-bg-track"
                cx="22"
                cy="22"
                r="18"
                fill="none"
                strokeWidth="3"
              />
              <circle
                className="fm-loader-sweep-ring"
                cx="22"
                cy="22"
                r="18"
                fill="none"
                strokeWidth="3"
                strokeDasharray="113"
                strokeDashoffset="75"
                strokeLinecap="round"
              />
            </svg>
            <div className="fm-loader-pulse-dot" />
          </div>

          <div className="fm-loader-label-group">
            <span className="fm-loader-label">PREPARING YOUR STORE</span>
            <span className="fm-loader-dots">
              <span className="fmd-1">.</span>
              <span className="fmd-2">.</span>
              <span className="fmd-3">.</span>
            </span>
          </div>
        </div>
      </div>

      {/* 60FPS Hardware Accelerated Motion Graphics */}
      <style>{`
        :root {
          --fm-logo-size: clamp(66px, 16vw, 76px);
          --fm-half-logo: calc(var(--fm-logo-size) / 2);
        }

        .fm-studio-splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999999;
          background-color: #FFFFFF;
          background-image: 
            radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F9FAFC 45%, #EFF2F7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          transition: opacity 0.6s cubic-bezier(0.2, 0.9, 0.3, 1),
                      transform 0.6s cubic-bezier(0.2, 0.9, 0.3, 1),
                      filter 0.6s ease-out;
          will-change: opacity, transform, filter;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        /* Silky Cinematic Exit */
        .fm-splash-exit {
          opacity: 0 !important;
          transform: scale3d(1.03, 1.03, 1) !important;
          filter: blur(6px);
          pointer-events: none;
        }

        /* Ambient Lighting */
        .fm-studio-light-radial {
          position: absolute;
          width: 580px;
          height: 580px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 110, 20, 0.12) 0%, rgba(255, 170, 50, 0.03) 50%, transparent 70%);
          top: 46%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: fmStudioAmbientBreathe 5s ease-in-out infinite alternate;
        }

        @keyframes fmStudioAmbientBreathe {
          0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.75; }
          100% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }

        .fm-studio-soft-highlight {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 38%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Stage */
        .fm-studio-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          width: 100%;
          max-width: 520px;
          transform: translate3d(0, 0, 0);
        }

        .fm-brand-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
          width: 100%;
        }

        /* Brand Lockup: Centered container.
           Phase 1: Shifted right by (50% - half-logo) so the logo is dead center.
           Phase 2: Glides smoothly to (0, 0, 0) as text reveals.
        */
        .fm-brand-lockup {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
          will-change: transform;
          transform: translate3d(calc(50% - var(--fm-half-logo)), 0, 0);
          animation: fmLockupGlideToCenter 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards 1.5s;
        }

        @keyframes fmLockupGlideToCenter {
          0% {
            transform: translate3d(calc(50% - var(--fm-half-logo)), 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        /* Logo Badge Anchor */
        .fm-logo-badge-anchor {
          position: relative;
          width: var(--fm-logo-size);
          height: var(--fm-logo-size);
          flex-shrink: 0;
          z-index: 3;
          transform: translate3d(0, 0, 0);
        }

        /* Phase 1: Logo enters centered with grand 3D pop (scale ~1.22)
           Phase 2: Settles down to lockup scale 1.0 simultaneously as it glides left
        */
        .fm-logo-badge-3d {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          will-change: transform, opacity;
          animation: fmLogoPopGrand 1.3s cubic-bezier(0.18, 0.89, 0.32, 1.25) forwards,
                     fmLogoSettleScale 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards 1.5s;
        }

        @keyframes fmLogoPopGrand {
          0% {
            transform: scale3d(0.2, 0.2, 1);
            opacity: 0;
          }
          65% {
            transform: scale3d(1.30, 1.30, 1);
            opacity: 1;
          }
          85% {
            transform: scale3d(1.18, 1.18, 1);
          }
          100% {
            transform: scale3d(1.22, 1.22, 1);
            opacity: 1;
          }
        }

        @keyframes fmLogoSettleScale {
          0% {
            transform: scale3d(1.22, 1.22, 1);
          }
          100% {
            transform: scale3d(1, 1, 1);
          }
        }

        /* Badge Styling: Deep ring + glossy orange */
        .fm-badge-outer-ring {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          padding: 2.5px;
          background: linear-gradient(145deg, #1C1D21 0%, #000000 100%);
          box-shadow: 
            0 16px 32px -4px rgba(0, 0, 0, 0.22),
            0 6px 18px -2px rgba(255, 107, 0, 0.38),
            inset 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .fm-badge-inner-circle {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #FF6600;
          border: 2px solid #FFFFFF;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fm-badge-icon {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
          display: block;
        }

        .fm-badge-specular {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.15) 40%,
            transparent 60%
          );
          pointer-events: none;
          border-radius: 50%;
          animation: fmBadgeGlint 2.8s ease-in-out infinite 1.4s;
        }

        @keyframes fmBadgeGlint {
          0%, 60% { opacity: 0.8; transform: rotate(0deg); }
          80% { opacity: 1; transform: rotate(15deg); }
          100% { opacity: 0.8; transform: rotate(0deg); }
        }

        /* Badge Ground Shadow */
        .fm-badge-ground-shadow {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.04) 55%, transparent 75%);
          animation: fmShadowScale 1.3s cubic-bezier(0.18, 0.89, 0.32, 1.25) forwards;
          pointer-events: none;
        }

        @keyframes fmShadowScale {
          0% { transform: translateX(-50%) scale(0.2); opacity: 0; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* Phase 2: As the logo glides smoothly to the left side, the text wrapper smoothly unrolls out to the right */
        .fm-text-reveal-wrapper {
          position: relative;
          display: flex;
          align-items: baseline;
          white-space: nowrap;
          overflow: hidden;
          margin-left: clamp(10px, 2.5vw, 15px);
          opacity: 0;
          clip-path: inset(0 100% 0 0);
          will-change: clip-path, opacity, transform;
          animation: fmTextUnfoldReveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards 1.5s;
        }

        @keyframes fmTextUnfoldReveal {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
            transform: translate3d(-24px, 0, 0);
          }
          20% {
            opacity: 0.8;
          }
          100% {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .fm-text-reveal-inner {
          display: inline-flex;
          align-items: baseline;
          white-space: nowrap;
        }

        .fm-word-friends {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: clamp(25px, 6.8vw, 36px);
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1;
          display: inline-flex;
          align-items: baseline;
        }

        /* Prominent Brand "F" */
        .fm-letter-f {
          color: #FF5500;
          font-size: 1.08em;
          font-weight: 900;
          display: inline-block;
          margin-right: 1px;
          text-shadow: 0 2px 12px rgba(255, 85, 0, 0.35);
        }

        .fm-word-rest {
          color: #1A1D20;
          display: inline-block;
        }

        .fm-word-space {
          font-size: clamp(25px, 6.8vw, 36px);
          line-height: 1;
        }

        .fm-word-mobile {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: clamp(25px, 6.8vw, 36px);
          font-weight: 800;
          color: #FF5500;
          letter-spacing: -0.5px;
          line-height: 1;
          display: inline-block;
          text-shadow: 0 4px 18px rgba(255, 85, 0, 0.28);
        }

        /* Light Shimmer Sweep across the brand name once revealed */
        .fm-text-shimmer-sheen {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            110deg,
            transparent 0%,
            rgba(255, 255, 255, 0) 35%,
            rgba(255, 255, 255, 0.90) 50%,
            rgba(255, 255, 255, 0) 65%,
            transparent 100%
          );
          transform: translateX(-120%);
          pointer-events: none;
          animation: fmTextShimmerSweep 1.6s ease-out forwards 3.1s;
        }

        @keyframes fmTextShimmerSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          40% { opacity: 0.9; }
          100% { transform: translateX(130%); opacity: 0; }
        }

        /* Floor Shadow for lockup */
        .fm-lockup-ground-shadow {
          width: 85%;
          max-width: 320px;
          height: 10px;
          margin-top: -4px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.015) 60%, transparent 80%);
          animation: fmLockupShadowGrow 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards 1.5s;
          opacity: 0;
          pointer-events: none;
        }

        @keyframes fmLockupShadowGrow {
          0% { opacity: 0; transform: scaleX(0.3); }
          100% { opacity: 1; transform: scaleX(1); }
        }

        /* Loader Section floats up underneath */
        .fm-studio-loader-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          animation: fmLoaderFadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards 2.5s;
          opacity: 0;
          will-change: transform, opacity;
        }

        @keyframes fmLoaderFadeUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .fm-loader-spinner-box {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fm-loader-svg {
          width: 100%;
          height: 100%;
          animation: fmSvgSpin 1.8s linear infinite;
        }

        .fm-loader-bg-track {
          stroke: rgba(0, 0, 0, 0.06);
        }

        .fm-loader-sweep-ring {
          stroke: #FF5500;
          animation: fmStrokeSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes fmSvgSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fmStrokeSweep {
          0% { stroke-dashoffset: 100; }
          50% { stroke-dashoffset: 25; }
          100% { stroke-dashoffset: 100; }
        }

        /* Pulse Dot */
        .fm-loader-pulse-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FF5500;
          box-shadow: 0 0 10px #FF5500;
          animation: fmDotPulse 1.3s ease-in-out infinite alternate;
        }

        @keyframes fmDotPulse {
          0% { transform: scale(0.7); opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 1; }
        }

        /* Status Text */
        .fm-loader-label-group {
          display: flex;
          align-items: center;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 2.2px;
          color: #8C93A0;
          text-transform: uppercase;
        }

        .fm-loader-dots {
          display: inline-flex;
          margin-left: 2px;
        }

        .fmd-1 { animation: fmDotBlink 1.4s infinite 0s; }
        .fmd-2 { animation: fmDotBlink 1.4s infinite 0.2s; }
        .fmd-3 { animation: fmDotBlink 1.4s infinite 0.4s; }

        @keyframes fmDotBlink {
          0%, 20% { opacity: 0; }
          40%, 100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
