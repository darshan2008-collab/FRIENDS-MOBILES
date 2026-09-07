import React, { useEffect, useState } from 'react';
import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';
import { Sparkles, ShieldCheck, Zap, Award, Smartphone, ArrowRight } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Friends Mobile...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Safely hide native Capacitor splash screen once web splash mounts
    const hideNativeSplash = async () => {
      try {
        await CapSplashScreen.hide();
      } catch (_) {
        // Fallback if running on standard web browser
      }
    };
    hideNativeSplash();

    // Progress animation timeline
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 12) + 8;
        return next > 100 ? 100 : next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 30) {
      setStatusText('Initializing Friends Mobile Store...');
    } else if (progress < 65) {
      setStatusText('Syncing Products & Special Offers...');
    } else if (progress < 90) {
      setStatusText('Loading 3D Custom Studio & Deals...');
    } else if (progress < 100) {
      setStatusText('Preparing Exclusive Shopping Experience...');
    } else {
      setStatusText('Welcome to FRIENDS MOBILE!');
      // Trigger exit animation sequence
      const timeout = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 600); // Duration matching fadeout transition
      }, 400);

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
        background: 'radial-gradient(circle at 50% 30%, #1E1B4B 0%, #0F172A 50%, #030712 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.08)' : 'scale(1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Background Animated Ambient Glowing Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 85, 0, 0.35) 0%, rgba(255, 85, 0, 0) 70%)',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(50px)',
          animation: 'splashPulse 4s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0) 70%)',
          bottom: '10%',
          left: '10%',
          filter: 'blur(60px)',
          animation: 'splashFloat 6s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0) 70%)',
          top: '20%',
          right: '5%',
          filter: 'blur(60px)',
          animation: 'splashFloat 8s ease-in-out infinite alternate-reverse',
          pointerEvents: 'none'
        }}
      />

      {/* Decorative Shimmer Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      {/* Skip Button for Quick Entrance */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '9999px',
          padding: '8px 18px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
        }}
      >
        Skip Intro <ArrowRight size={14} />
      </button>

      {/* Main Glassmorphism Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '440px',
          width: '90%',
          padding: '40px 24px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Animated Dual Aura Logo Frame */}
        <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '28px' }}>
          {/* Outer Spin Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#FF5500',
              borderRightColor: '#38BDF8',
              animation: 'splashSpin 3s linear infinite'
            }}
          />
          {/* Counter Spin Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderBottomColor: '#A855F7',
              borderLeftColor: '#F59E0B',
              animation: 'splashSpinReverse 4s linear infinite'
            }}
          />

          {/* Logo Container */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.9) 100%)',
              boxShadow: '0 12px 30px rgba(255, 85, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              overflow: 'hidden'
            }}
          >
            <img
              src="/logo.png"
              alt="FRIENDS MOBILE"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Sparkle Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              background: 'linear-gradient(135deg, #FF5500 0%, #FF2200 100%)',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 85, 0, 0.5)',
              border: '2px solid #0F172A'
            }}
          >
            <Sparkles size={18} />
          </div>
        </div>

        {/* Brand Title with Vibrant Gradient */}
        <h1
          style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '1px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD6A5 40%, #FF5500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 20px rgba(255, 85, 0, 0.3)'
          }}
        >
          FRIENDS MOBILE
        </h1>

        {/* Tagline */}
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.75)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}
        >
          Premium Accessories & Custom Cases
        </p>

        {/* Trust Badges Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.2)'
            }}
          >
            <Zap size={12} /> Fast COD Delivery
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              color: '#4ADE80',
              border: '1px solid rgba(74, 222, 128, 0.2)'
            }}
          >
            <ShieldCheck size={12} /> 100% Genuine
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              color: '#FACC15',
              border: '1px solid rgba(250, 204, 21, 0.2)'
            }}
          >
            <Award size={12} /> Top Rated Store
          </div>
        </div>

        {/* Glowing Progress Bar Container */}
        <div style={{ width: '100%', maxWidth: '320px', marginBottom: '12px' }}>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              overflow: 'hidden',
              position: 'relative',
              padding: '1px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FF5500 0%, #F59E0B 50%, #38BDF8 100%)',
                borderRadius: '9999px',
                transition: 'width 0.15s ease-out',
                boxShadow: '0 0 15px rgba(255, 85, 0, 0.8)'
              }}
            />
          </div>
        </div>

        {/* Loading Status Text & Percentage */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '320px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.65)'
          }}
        >
          <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {statusText}
          </span>
          <span style={{ fontWeight: 700, color: '#FFD6A5', marginLeft: '8px' }}>{progress}%</span>
        </div>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes splashSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes splashSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes splashPulse {
          0% { transform: translateX(-50%) scale(0.9); opacity: 0.25; }
          100% { transform: translateX(-50%) scale(1.15); opacity: 0.45; }
        }
        @keyframes splashFloat {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-20px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
