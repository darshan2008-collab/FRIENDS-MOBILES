import React, { useRef, useEffect } from 'react';
import { Wrench, Smartphone, RefreshCw, Image, Printer, MapPin } from 'lucide-react';

export default function ServicesSection() {
  const scrollContainerRef = useRef(null);

  const services = [
    { title: 'Mobile Repair', desc: 'Quick & Reliable', icon: Wrench },
    { title: 'Screen Replacement', desc: 'Best Quality', icon: Smartphone },
    { title: 'Software Update', desc: 'All Brands', icon: RefreshCw },
    { title: 'Photo Frame Making', desc: 'Custom Frames', icon: Image },
    { title: 'Back Cover Printing', desc: 'Your Design', icon: Printer },
    { title: 'Visit Our Store', desc: 'Find Nearest Store', icon: MapPin },
  ];

  // Double array to create seamless infinite loop
  const displayServices = [...services, ...services];

  // Continuous Smooth Auto-Scrolling Loop (Forward Left-to-Right)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId;
    let lastTime = performance.now();
    let isHovered = false;
    let accumulatedScroll = container.scrollLeft;

    const scrollSpeed = 35; // Pixels per second (smooth slow sliding)

    const autoScroll = (timestamp) => {
      if (!container) return;

      if (!isHovered) {
        const elapsed = timestamp - lastTime;
        if (elapsed > 0) {
          const delta = (scrollSpeed * elapsed) / 1000;
          const halfWidth = container.scrollWidth / 2;

          accumulatedScroll += delta;
          if (accumulatedScroll >= halfWidth) {
            accumulatedScroll = 0;
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

  return (
    <section className="services-section" id="services" style={{ overflow: 'hidden' }}>
      <div className="container">
        
        <div className="section-header">
          <h2 className="section-title">OUR <span className="orange-text">SERVICES</span></h2>
        </div>

        <div 
          ref={scrollContainerRef}
          className="services-grid"
          style={{
            display: 'flex',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {displayServices.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="service-card">
                <div className="service-icon">
                  <Icon size={22} className="service-svg" />
                </div>
                <div className="service-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
