import React, { useRef, useEffect, useState } from 'react';
import { Wrench, Smartphone, RefreshCw, Image, Printer, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ServicesSection({ t = (k) => k, language = 'en' }) {
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const services = language === 'ta' ? [
    { title: '30-நிமிட மொபைல் சர்வீஸ்', desc: 'விரைவு & நம்பகமான சேவை', icon: Wrench },
    { title: 'ஒரிஜினல் டிஸ்பிளே மாற்றுதல்', desc: 'உயர்தர டிஸ்பிளே', icon: Smartphone },
    { title: 'மென்பொருள் அப்டேட்', desc: 'அனைத்து போன்களுக்கும்', icon: RefreshCw },
    { title: 'போட்டோ பிரேம் தயாரிப்பு', desc: 'கஸ்டம் பிரேம்கள்', icon: Image },
    { title: '3D போட்டோ கவர் பிரிண்டிங்', desc: 'உங்கள் விருப்ப டிசைன்', icon: Printer },
    { title: 'மதுரை & கரூர் ஷோரூம்', desc: 'நேரில் வருகை தாருங்கள்', icon: MapPin },
  ] : [
    { title: 'Mobile Repair', desc: 'Quick & Reliable', icon: Wrench },
    { title: 'Screen Replacement', desc: 'Best Quality', icon: Smartphone },
    { title: 'Software Update', desc: 'All Brands', icon: RefreshCw },
    { title: 'Photo Frame Making', desc: 'Custom Frames', icon: Image },
    { title: 'Back Cover Printing', desc: 'Your Design', icon: Printer },
    { title: 'Visit Our Store', desc: 'Find Nearest Store', icon: MapPin },
  ];

  // Repeat items 4 times for continuous seamless forward marquee loop
  const displayServices = [...services, ...services, ...services, ...services];

  // Continuous Fast & Smooth Forward Auto-Scrolling Loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId;
    let lastTime = performance.now();
    const scrollSpeed = 65; // Pixels per second (Fast & Forward)

    const autoScroll = (timestamp) => {
      if (!container) return;

      const elapsed = timestamp - lastTime;
      lastTime = timestamp;

      if (!isPaused && elapsed > 0) {
        // Disable smooth CSS physics during continuous frame updates
        container.style.scrollBehavior = 'auto';

        const delta = (scrollSpeed * elapsed) / 1000;
        container.scrollLeft += delta;

        // Reset scroll position seamlessly when reaching end of loop
        const singleSetWidth = container.scrollWidth / 4;
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft -= singleSetWidth;
        }
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = 'smooth';
      scrollContainerRef.current.scrollBy({ left: -260 });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = 'smooth';
      scrollContainerRef.current.scrollBy({ left: 260 });
    }
  };

  return (
    <section className="services-section" id="services" style={{ overflow: 'hidden', padding: '36px 0' }}>
      <div className="container" style={{ position: 'relative' }}>
        
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>{t('servicesTitle') || 'OUR STORE EXECUTIVE SERVICES'}</h2>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleScrollLeft}
              aria-label="Scroll Left"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleScrollRight}
              aria-label="Scroll Right"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="services-grid"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            padding: '12px 4px 18px 4px',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {displayServices.map((s, i) => {
            const Icon = s.icon;
            return (
              <div 
                key={i} 
                className="service-card"
                style={{
                  flex: '0 0 210px',
                  minWidth: '210px',
                  maxWidth: '210px',
                  boxSizing: 'border-box'
                }}
              >
                <div className="service-icon">
                  <Icon size={22} className="service-svg" />
                </div>
                <div className="service-content">
                  <h3 style={{ whiteSpace: 'normal', wordBreak: 'break-word', margin: '0 0 4px 0' }}>{s.title}</h3>
                  <p style={{ whiteSpace: 'normal', wordBreak: 'break-word', margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
