import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Hero({ theme, slides, t = (k) => k, language = 'en' }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const isDark = theme === 'dark';

  const defaultSlides = [
    {
      id: 1,
      desc: '',
      imgSrc: isDark ? '/images/hero_devices_dark.png' : '/images/hero_devices_light.png',
      btnText: 'SHOP NOW',
      btnLink: '#products'
    },
    {
      id: 2,
      desc: '',
      imgSrc: '/images/banner_backcover.png',
      btnText: 'CUSTOMIZE COVER',
      btnLink: '#customized-covers'
    },
    {
      id: 3,
      desc: '',
      imgSrc: '/images/banner_photoframe.png',
      btnText: 'CREATE FRAME',
      btnLink: '#photo-frames'
    },
    {
      id: 4,
      desc: '',
      imgSrc: '/images/banner_accessories.png',
      btnText: 'EXPLORE OFFERS',
      btnLink: '#products'
    }
  ];

  const heroSlides = (slides && slides.length > 0 ? slides : defaultSlides).map(slide => {
    if (slide.id === 1 && (slide.imgSrc === '/images/hero_devices_light.png' || slide.imgSrc === '/images/hero_devices_dark.png')) {
      return {
        ...slide,
        imgSrc: isDark ? '/images/hero_devices_dark.png' : '/images/hero_devices_light.png'
      };
    }
    return slide;
  });

  // Preload slide images for zero-lag instant transitions
  useEffect(() => {
    heroSlides.forEach(slide => {
      if (slide.imgSrc) {
        const img = new Image();
        img.src = slide.imgSrc;
      }
    });
  }, [heroSlides]);

  // High-Speed Fast Auto-Slide Timer (Rotates every 2.2 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex(prevIndex => (prevIndex + 1) % heroSlides.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[currentSlideIndex];

  const handleNextSlide = () => {
    setCurrentSlideIndex((currentSlideIndex + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((currentSlideIndex - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="hero-section" style={{ position: 'relative' }}>
      <div className="container hero-container">
        
        {/* Left Text Content Slide */}
        <div className="hero-content" key={`slide-text-${currentSlideIndex}`}>

          <div className="hero-tag-wrapper" style={{ marginBottom: '16px' }}>
            <span className="hero-tag" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(255, 85, 0, 0.12)', 
              color: 'var(--text-primary)', 
              padding: '5px 12px', 
              borderRadius: '20px', 
              fontSize: '0.72rem', 
              fontWeight: '800', 
              letterSpacing: '0.5px',
              border: '1px solid rgba(255, 85, 0, 0.25)'
            }}>
              <Sparkles size={13} style={{ color: '#FF5500' }} /> {language === 'ta' ? 'பிரண்ட்ஸ் மொபைல் ஷோரூம் 🖐️' : (activeSlide.tag || "WELCOME TO FRIENDS MOBILE")}
            </span>
          </div>

          <h1 className="hero-title" style={{ 
            marginBottom: '14px',
            fontSize: 'clamp(1.25rem, 4.2vw, 2.3rem)',
            lineHeight: '1.2'
          }}>
            <span className="hero-heading-white" style={{ fontWeight: '900', fontSize: 'inherit' }}>
              {language === 'ta' ? 'மொபைல் போன் அக்சஸரீஸ் &' : (activeSlide.titleWhite || "Your One Stop")}
            </span>
            <br />
            <span className="hero-heading-gradient" style={{ fontWeight: '900', fontSize: 'inherit' }}>
              {language === 'ta' ? '3D போட்டோ கவர் ஷாப் 🚀' : (activeSlide.titleGradient || "Mobile Destination")}
            </span>
          </h1>

          <p className="hero-desc" style={{ 
            fontWeight: '500', 
            fontSize: 'clamp(0.78rem, 2vw, 0.88rem)', 
            lineHeight: '1.45', 
            marginBottom: '20px',
            color: 'var(--text-secondary)'
          }}>
            {language === 'ta' ? 'போட், மி, ரியல்மி, போர்ட்ரானிக்ஸ் ஒரிஜினல் பொருட்கள், 3D போட்டோ கவர்கள் & போட்டோ பிரேம்கள்.' : (activeSlide.desc || "Premium Accessories, Custom Covers & Wall Photo Frames Crafted for Your Style.")}
          </p>

          <div className="hero-buttons">
            <a href={activeSlide.btnLink} className="btn btn-primary btn-sm">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                {language === 'ta' ? (activeSlide.btnText === 'CUSTOMIZE COVER' ? 'போட்டோ கவர் டிசைன்' : activeSlide.btnText === 'CREATE FRAME' ? 'போட்டோ பிரேம்' : activeSlide.btnText === 'EXPLORE OFFERS' ? 'சலுகைகள் பார்க்க' : 'இப்போதே வாங்க') : activeSlide.btnText}
                <ArrowRight size={16} style={{ flexShrink: 0 }} />
              </span>
            </a>
            <a href="#products" className="btn btn-secondary btn-sm">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                {language === 'ta' ? 'பொருட்களை பார்க்க' : 'EXPLORE STORE'}
              </span>
            </a>
          </div>

          {/* Interactive Slide Pagination Dots */}
          <div className="slider-dots">
            {heroSlides.map((slide, idx) => (
              <span 
                key={slide.id}
                className={`dot ${idx === currentSlideIndex ? 'active' : ''}`}
                onClick={() => setCurrentSlideIndex(idx)}
                title={`Slide ${idx + 1}: ${slide.tag}`}
              />
            ))}
          </div>
        </div>

        {/* Right Multi-Image Showcase Slide */}
        <div className="hero-image-wrapper" style={{ position: 'relative' }}>
          <div className="glowing-ring"></div>
          
          <img 
            key={`slide-img-${currentSlideIndex}-${theme}`}
            src={activeSlide.imgSrc} 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop';
            }}
            alt={activeSlide.titleGradient} 
            className="hero-device-img" 
            style={{ 
              width: '100%',
              maxWidth: '380px', 
              maxHeight: '420px', 
              objectFit: 'contain',
              borderRadius: '24px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          />

          {/* Image Slide Arrow Controls */}
          <button
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              left: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNextSlide}
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              right: '-10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
}
