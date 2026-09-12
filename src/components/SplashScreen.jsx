import React, { useEffect, useState, useCallback } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';
import logoImg from '../assets/logo.png';

export default function SplashScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Instantly hide native static splash to show animated screen with 0ms delay
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide({ fadeOutDuration: 150 });
      } catch (_) {}
    };
    hideNativeSplash();

    // 5.6-second luxurious cinematic experience + 0.5s smooth exit transition
    const exitTimer = setTimeout(() => {
      triggerAppEnter();
    }, 5600);

    return () => clearTimeout(exitTimer);
  }, []);

  const triggerAppEnter = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 500);
  }, [onFinish]);

  return (
    <div
      className={`fm-studio-splash-root ${isExiting ? 'fm-splash-exit' : ''}`}
      onClick={triggerAppEnter}
      role="button"
      tabIndex={0}
      aria-label="Friends Mobile Splash Screen"
    >
      {/* Pristine Studio Ambient Radial Light & Soft Vignette */}
      <div className="fm-studio-light-radial" />
      <div className="fm-studio-soft-highlight" />

      {/* Main Studio Centerpiece Stage */}
      <div className="fm-studio-stage">
        
        {/* Unified Brand Identity: 3D Logo Badge + Complete "Friends Mobile" with Prominent "F" */}
        <div className="fm-brand-lockup">
          
          {/* 3D Orange Circular Brand Logo Badge */}
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
                  {/* Subtle 3D Glass Specular Sheen */}
                  <div className="fm-badge-specular" />
                </div>
              </div>
            </div>
            {/* Ground shadow beneath the 3D logo badge */}
            <div className="fm-badge-ground-shadow" />
          </div>

          {/* Typography animates outwards smoothly: Complete "Friends Mobile" with crystal-clear "F" */}
          <div className="fm-text-reveal-container">
            <span className="fm-word-friends">
              <span className="fm-letter-f">F</span><span className="fm-word-rest">riends</span>
            </span>
            <span className="fm-word-space">&nbsp;</span>
            <span className="fm-word-mobile">Mobile</span>
          </div>
        </div>

        {/* Studio Soft Floor Drop Shadow for the entire Lockup */}
        <div className="fm-lockup-ground-shadow" />

        {/* Sleek Minimalist Loading Section Directly Underneath */}
        <div className="fm-studio-loader-section">
          <div className="fm-loader-spinner-box">
            {/* Glowing Orange Progress Ring */}
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
            {/* Rhythmic Pulsing Glow Dot in center */}
            <div className="fm-loader-pulse-dot" />
          </div>

          {/* Minimalist Status Text with Synchronized Blinking Dots */}
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

      {/* 60FPS Hardware Accelerated Studio Motion Graphics Styles */}
      <style>{`
        .fm-studio-splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999999;
          background-color: #FFFFFF;
          background-image: 
            radial-gradient(circle at 50% 42%, #FFFFFF 0%, #F9FAFC 45%, #EFF2F7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          transition: opacity 0.5s cubic-bezier(0.2, 0.9, 0.3, 1),
                      transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1),
                      filter 0.5s ease-out;
          will-change: opacity, transform, filter;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        /* Seamless smooth exit fade & gentle push into app */
        .fm-splash-exit {
          opacity: 0 !important;
          transform: scale3d(1.03, 1.03, 1) !important;
          filter: blur(5px);
          pointer-events: none;
        }

        /* Ambient Studio Light Glow */
        .fm-studio-light-radial {
          position: absolute;
          width: 540px;
          height: 540px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 110, 20, 0.09) 0%, rgba(255, 170, 50, 0.03) 45%, transparent 70%);
          top: 45%;
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
          height: 40%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Center Stage Container */
        .fm-studio-stage {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          width: 100%;
          max-width: 480px;
          transform: translate3d(0, 0, 0);
        }

        /* Main Brand Lockup: Logo Badge + Complete "Friends Mobile" */
        .fm-brand-lockup {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 72px;
          margin-bottom: 22px;
          transform: translate3d(0, 0, 0);
        }

        /* Logo Badge Anchor */
        .fm-logo-badge-anchor {
          position: relative;
          width: clamp(52px, 14vw, 68px);
          height: clamp(52px, 14vw, 68px);
          flex-shrink: 0;
          z-index: 2;
        }

        /* 3D Smooth Elastic Bounce Entrance (Paced gently) */
        .fm-logo-badge-3d {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: fmElasticLogoIn 1.1s cubic-bezier(0.18, 0.89, 0.32, 1.22) forwards;
          will-change: transform, opacity;
        }

        @keyframes fmElasticLogoIn {
          0% {
            transform: scale3d(0.15, 0.15, 1);
            opacity: 0;
          }
          60% {
            transform: scale3d(1.14, 1.14, 1);
            opacity: 1;
          }
          80% {
            transform: scale3d(0.96, 0.96, 1);
          }
          100% {
            transform: scale3d(1, 1, 1);
            opacity: 1;
          }
        }

        /* Precise outer stroke: fine white & black border with specular shadow */
        .fm-badge-outer-ring {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          padding: 2.5px;
          background: linear-gradient(145deg, #1A1A1A 0%, #000000 100%);
          box-shadow: 
            0 14px 30px -4px rgba(0, 0, 0, 0.18),
            0 6px 16px -2px rgba(255, 107, 0, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.75);
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
            rgba(255, 255, 255, 0.52) 0%,
            rgba(255, 255, 255, 0.12) 42%,
            transparent 60%
          );
          pointer-events: none;
          border-radius: 50%;
        }

        /* Badge Ground Shadow */
        .fm-badge-ground-shadow {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.04) 55%, transparent 75%);
          animation: fmShadowScale 1.1s cubic-bezier(0.18, 0.89, 0.32, 1.22) forwards;
          pointer-events: none;
        }

        @keyframes fmShadowScale {
          0% { transform: translateX(-50%) scale(0.2); opacity: 0; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* Smooth, Luxurious Typography Reveal: Complete "Friends Mobile" with crystal-clear "F" */
        .fm-text-reveal-container {
          display: flex;
          align-items: baseline;
          white-space: nowrap;
          overflow: hidden;
          margin-left: clamp(6px, 1.8vw, 10px);
          animation: fmTextExpand 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.45s;
          opacity: 0;
          max-width: 0;
          will-change: max-width, opacity;
        }

        @keyframes fmTextExpand {
          0% {
            max-width: 0;
            opacity: 0;
            transform: translate3d(-18px, 0, 0);
          }
          40% {
            opacity: 0.7;
          }
          100% {
            max-width: 380px;
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .fm-word-friends {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: clamp(24px, 6.8vw, 36px);
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1;
          display: inline-flex;
          align-items: baseline;
        }

        /* Prominent, bold letter "F" in Friends */
        .fm-letter-f {
          color: #FF5500;
          font-size: 1.06em;
          font-weight: 900;
          display: inline-block;
          margin-right: 1px;
          text-shadow: 0 2px 10px rgba(255, 85, 0, 0.28);
        }

        .fm-word-rest {
          color: #1A1D20;
          display: inline-block;
        }

        .fm-word-space {
          font-size: clamp(24px, 6.8vw, 36px);
          line-height: 1;
        }

        .fm-word-mobile {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: clamp(24px, 6.8vw, 36px);
          font-weight: 800;
          color: #FF5500;
          letter-spacing: -0.5px;
          line-height: 1;
          display: inline-block;
          text-shadow: 0 4px 16px rgba(255, 85, 0, 0.25);
        }

        /* Floor shadow under whole lockup */
        .fm-lockup-ground-shadow {
          width: 82%;
          max-width: 280px;
          height: 10px;
          margin-top: -6px;
          margin-bottom: 26px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.015) 60%, transparent 80%);
          animation: fmLockupShadowIn 1s ease-out forwards 0.5s;
          opacity: 0;
          pointer-events: none;
        }

        @keyframes fmLockupShadowIn {
          0% { opacity: 0; transform: scaleX(0.4); }
          100% { opacity: 1; transform: scaleX(1); }
        }

        /* Loading Section Positioned Directly Underneath */
        .fm-studio-loader-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          animation: fmLoaderFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.75s;
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

        /* Spinner Box */
        .fm-loader-spinner-box {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fm-loader-svg {
          width: 100%;
          height: 100%;
          animation: fmSvgSpin 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .fm-loader-bg-track {
          stroke: rgba(255, 107, 0, 0.12);
        }

        .fm-loader-sweep-ring {
          stroke: #FF5500;
          filter: drop-shadow(0 0 6px rgba(255, 85, 0, 0.65));
          animation: fmStrokeSweep 1.8s ease-in-out infinite;
        }

        @keyframes fmSvgSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fmStrokeSweep {
          0% {
            stroke-dashoffset: 100;
          }
          50% {
            stroke-dashoffset: 25;
          }
          100% {
            stroke-dashoffset: 100;
          }
        }

        /* Center Rhythmic Pulsing Dot */
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

        /* Modern Crisp Typography for Loader Label */
        .fm-loader-label-group {
          display: flex;
          align-items: center;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
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





