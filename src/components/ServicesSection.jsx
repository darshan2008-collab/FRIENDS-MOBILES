import React, { useRef, useEffect } from 'react';
import { Wrench, Smartphone, RefreshCw, Image, Printer, MapPin } from 'lucide-react';

export default function ServicesSection({ t = (k) => k, language = 'en' }) {
  const scrollContainerRef = useRef(null);

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

  // Double array to create seamless infinite loop
  const displayServices = [...services, ...services];

  // Continuous Non-Stop Smooth Auto-Scrolling Loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId;
    let lastTime = performance.now();
    let halfWidth = container.scrollWidth / 2;
    let accumulatedScroll = halfWidth;

    const scrollSpeed = 40; // Pixels per second (matched to company brand marquee speed)

    const autoScroll = (timestamp) => {
      if (!container) return;

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

      lastTime = timestamp;
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="services-section" id="services" style={{ overflow: 'hidden' }}>
      <div className="container">
        
        <div className="section-header">
          <h2 className="section-title">{t('servicesTitle') || 'OUR SERVICES'}</h2>
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
