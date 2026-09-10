import React, { useRef, useEffect, useState } from 'react';
import { Wrench, Smartphone, RefreshCw, Image, Printer, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ServicesSection({ 
  t = (k) => k,
  onOpenServiceModal,
  onOpenCustomCover,
  onOpenCustomFrame
}) {
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const services = [
    { title: 'Mobile Repair', desc: 'Doorstep Pickup & 24h Delivery', icon: Wrench, action: () => onOpenServiceModal && onOpenServiceModal('Display / Screen Replacement') },
    { title: 'Screen Replacement', desc: 'Original Display with Warranty', icon: Smartphone, action: () => onOpenServiceModal && onOpenServiceModal('Display / Screen Replacement') },
    { title: 'Software Update', desc: 'Flashing, Unlock & OS Upgrade', icon: RefreshCw, action: () => onOpenServiceModal && onOpenServiceModal('Software & OS Update') },
    { title: 'Photo Frame Making', desc: 'Custom Gift Frames in 30 Mins', icon: Image, action: () => onOpenCustomFrame && onOpenCustomFrame() },
    { title: 'Back Cover Printing', desc: 'Upload Any Photo & 3D Print', icon: Printer, action: () => onOpenCustomCover && onOpenCustomCover() },
    { title: 'Visit Our Store', desc: 'Madurai & Karur Service Center', icon: MapPin, action: () => {
      const el = document.getElementById('contact') || document.querySelector('.main-footer');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } },
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
        
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>{t('servicesTitle') || 'OUR STORE EXECUTIVE SERVICES'}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Professional doorstep pickup, original replacement parts & 1-day express turnaround
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onOpenServiceModal && onOpenServiceModal()}
              style={{
                padding: '9px 16px',
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #FF5500 0%, #FF8800 100%)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)',
                transition: 'transform 0.15s ease'
              }}
            >
              <Wrench size={16} /> Book Repair Pickup
            </button>

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
                onClick={s.action}
                role="button"
                tabIndex={0}
                style={{
                  flex: '0 0 220px',
                  minWidth: '220px',
                  maxWidth: '220px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
