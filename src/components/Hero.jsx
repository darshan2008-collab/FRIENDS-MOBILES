import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Hero({ theme, slides }) {
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

  // Auto-Slide Timer (Scrolls every 3.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex(prevIndex => (prevIndex + 1) % heroSlides.length);
    }, 3500);

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
              gap: '6px'
            }}>
              <Sparkles size={13} style={{ color: '#FF5500' }} /> {activeSlide.tag || "WELCOME TO FRIENDS MOBILE"}
            </span>
          </div>

          <h1 className="hero-title" style={{ marginBottom: '16px' }}>
            <span className="hero-heading-white" style={{ fontWeight: '900' }}>
              {activeSlide.titleWhite || "Your One Stop"}
            </span>
            <br />
            <span className="hero-heading-gradient" style={{ fontWeight: '900' }}>
              {activeSlide.titleGradient || "Mobile Destination"}
            </span>
          </h1>

          <p className="hero-desc" style={{ 
            fontWeight: '500', 
            fontSize: 'clamp(0.78rem, 2vw, 0.88rem)', 
            lineHeight: '1.45', 
            marginBottom: '20px',
            color: 'var(--text-secondary)'
          }}>
            {activeSlide.desc || "Premium Accessories, Custom Covers & Wall Photo Frames Crafted for Your Style."}
          </p>

          <div className="hero-buttons">
            <a href={activeSlide.btnLink} className="btn btn-primary btn-sm">
              {activeSlide.btnText} <ArrowRight size={16} />
            </a>
            <a href="#products" className="btn btn-secondary btn-sm">
              EXPLORE STORE
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
              const current = e.target.src;
              if (!current.startsWith('http://localhost:5000')) {
                e.target.src = `http://localhost:5000${activeSlide.imgSrc}`;
              } else {
                e.target.src = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop';
              }
            }}
            alt={activeSlide.titleGradient} 
            className="hero-device-img" 
            style={{ 
              width: '100%',
              maxWidth: '380px', 
              maxHeight: '420px', 
              objectFit: 'contain',
              borderRadius: '24px',
              animation: 'fadeIn 0.5s ease-in-out'
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
