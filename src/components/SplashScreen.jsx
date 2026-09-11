import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';

export default function SplashScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide({ fadeOutDuration: 150 });
      } catch (_) {}
    };
    hideNativeSplash();

    // Auto transition into the app after video finishes or 2.8s
    const exitTimer = setTimeout(() => {
      triggerAppEnter();
    }, 2800);

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
      <video
        ref={videoRef}
        src="/friends_mobile_splash.mp4"
        autoPlay
        playsInline
        muted
        className="fm-splash-video"
        onEnded={triggerAppEnter}
      />

      <style>{`
        .fm-splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999999;
          background-color: #F8F9FB;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          transition: opacity 0.38s cubic-bezier(0.2, 0.9, 0.3, 1),
                      transform 0.38s cubic-bezier(0.2, 0.9, 0.3, 1);
          will-change: opacity, transform;
        }

        .fm-splash-exit {
          opacity: 0 !important;
          transform: scale3d(1.06, 1.06, 1) !important;
          filter: blur(4px);
          pointer-events: none;
        }

        .fm-splash-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `}</style>
    </div>
  );
}


