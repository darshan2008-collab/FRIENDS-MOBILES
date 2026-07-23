import React, { useRef, useEffect } from 'react';
import { Smartphone, Cable, Headphones, Watch, BatteryCharging, Speaker, Image, Shield, Grid, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryGrid({ onOpenShop }) {
  const scrollContainerRef = useRef(null);

  const categories = [
    { name: 'Mobile Phones', icon: Smartphone, href: '#products', color: '#FF5500', count: '120+ Items' },
    { name: 'Chargers & Cables', icon: Cable, href: '#products', color: '#3b82f6', count: '85+ Items' },
    { name: 'Earphones', icon: Headphones, href: '#products', color: '#a855f7', count: '90+ Items' },
    { name: 'Smart Watches', icon: Watch, href: '#products', color: '#10b981', count: '45+ Items' },
    { name: 'Power Banks', icon: BatteryCharging, href: '#products', color: '#f59e0b', count: '30+ Items' },
    { name: 'Speakers', icon: Speaker, href: '#products', color: '#ec4899', count: '60+ Items' },
    { name: 'Photo Frames', icon: Image, href: '#photo-frames', color: '#06b6d4', count: 'Studio Custom' },
    { name: 'Back Covers', icon: Smartphone, href: '#customized-covers', color: '#FF5500', count: '3D Custom' },
    { name: 'Tempered Glass', icon: Shield, href: '#products', color: '#64748b', count: 'Premium Guard' },
    { name: 'More Categories', icon: Grid, href: '#products', color: '#8b5cf6', count: 'Explore All' },
  ];

  // Double array to create seamless infinite loop
  const displayCategories = [...categories, ...categories];

  // Continuous Smooth Auto-Scrolling Loop (Forward Left-to-Right)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId;
    let lastTime = performance.now();
    let isHovered = false;
    let halfWidth = container.scrollWidth / 2;
    let accumulatedScroll = halfWidth;

    const scrollSpeed = 40; // Pixels per second (smooth forward sliding)

    const autoScroll = (timestamp) => {
      if (!container) return;

      if (!isHovered) {
        const elapsed = timestamp - lastTime;
        if (elapsed > 0) {
          const delta = (scrollSpeed * elapsed) / 1000;
          halfWidth = container.scrollWidth / 2 || 1;

          accumulatedScroll -= delta;
          if (accumulatedScroll <= 0) {
            accumulatedScroll = halfWidth;
          }
          container.scrollLeft = Math.round(accumulatedScroll);
        }
      } else {
        accumulatedScroll = container.scrollLeft;
      }

      lastTime = timestamp;
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; accumulatedScroll = container.scrollLeft; };
    const handleTouchStart = () => { isHovered = true; };
    const handleTouchEnd = () => { isHovered = false; accumulatedScroll = container.scrollLeft; };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  const handleManualScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="categories-section" style={{ overflow: 'hidden' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '12px'
        }}>
          <div>
            <h2 className="section-title" style={{
              margin: 0,
              fontSize: 'clamp(1.1rem, 4vw, 1.45rem)',
              fontWeight: '800'
            }}>
              Browse Categories
            </h2>
          </div>

          {/* Left/Right Manual Arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => handleManualScroll('left')}
              aria-label="Previous Categories"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => handleManualScroll('right')}
              aria-label="Next Categories"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Continuous Fast Auto-Scrolling Track */}
        <div 
          ref={scrollContainerRef}
          className="category-carousel-track"
          style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            paddingBottom: '8px',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {displayCategories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <div 
                key={index} 
                onClick={() => onOpenShop && onOpenShop(cat.name === 'More Categories' ? 'All' : cat.name)} 
                className="category-slide-card"
                style={{
                  flex: '0 0 auto',
                  minWidth: '140px',
                  maxWidth: '160px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: `${cat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  border: `1px solid ${cat.color}30`
                }}>
                  <Icon size={26} color={cat.color} />
                </div>
                <span style={{
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  marginBottom: '3px',
                  lineHeight: '1.2'
                }}>
                  {cat.name}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  fontWeight: '600'
                }}>
                  {cat.count}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
