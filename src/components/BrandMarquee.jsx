import React from 'react';

export default function BrandMarquee() {
  const brands = [
    {
      id: 1,
      name: 'Apple',
      svg: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.64c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.08.08 2.16-.57 2.81-1.37z" />
        </svg>
      )
    },
    {
      id: 2,
      name: 'Samsung',
      svg: (
        <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '900', letterSpacing: '-0.8px', fontSize: '0.96rem', fontStyle: 'italic', color: '#034EA2' }}>
          SAMSUNG
        </span>
      )
    },
    {
      id: 3,
      name: 'OnePlus',
      svg: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ background: '#F5002C', color: '#fff', padding: '1px 4px', fontWeight: '900', fontSize: '0.7rem', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            1+
          </div>
          <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '700', letterSpacing: '-0.2px', fontSize: '0.82rem', color: '#F5002C' }}>ONEPLUS</span>
        </div>
      )
    },
    {
      id: 4,
      name: 'Xiaomi',
      svg: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', background: '#FF6700', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold' }}>
            mi
          </div>
          <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Xiaomi</span>
        </div>
      )
    },
    {
      id: 5,
      name: 'Realme',
      svg: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', background: '#FFC800', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: '900' }}>
            r
          </div>
          <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '800', fontSize: '0.82rem', color: 'var(--text-primary)' }}>realme</span>
        </div>
      )
    },
    {
      id: 7,
      name: 'Oppo',
      svg: (
        <svg viewBox="0 0 125 40" width="56" height="18" fill="none">
          {/* O */}
          <circle cx="20" cy="20" r="10" stroke="#008A5C" strokeWidth="4.5" />
          {/* P */}
          <circle cx="48" cy="20" r="10" stroke="#008A5C" strokeWidth="4.5" />
          <rect x="38" y="20" width="4.5" height="15" fill="#008A5C" />
          {/* P */}
          <circle cx="76" cy="20" r="10" stroke="#008A5C" strokeWidth="4.5" />
          <rect x="66" y="20" width="4.5" height="15" fill="#008A5C" />
          {/* O */}
          <circle cx="104" cy="20" r="10" stroke="#008A5C" strokeWidth="4.5" />
        </svg>
      )
    },
    {
      id: 8,
      name: 'Vivo',
      svg: (
        <svg viewBox="0 0 80 32" width="52" height="18" fill="none">
          {/* v */}
          <path d="M6 8 L13 24 L20 8" stroke="#415FFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* i */}
          <line x1="28" y1="12" x2="28" y2="24" stroke="#415FFF" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="28" cy="6" r="2.25" fill="#415FFF" />
          {/* v */}
          <path d="M36 8 L43 24 L50 8" stroke="#415FFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* o */}
          <circle cx="64" cy="16" r="8" stroke="#415FFF" strokeWidth="4.5" />
        </svg>
      )
    },
    {
      id: 6,
      name: 'Nothing',
      svg: (
        <span style={{ fontFamily: 'monospace', fontWeight: '800', letterSpacing: '1.5px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
          N O T H I N G
        </span>
      )
    },
    {
      id: 9,
      name: 'Google Pixel',
      svg: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.83-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '700', fontSize: '0.82rem' }}>Pixel</span>
        </div>
      )
    },
    {
      id: 10,
      name: 'Motorola',
      svg: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', background: '#001430', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
            M
          </div>
          <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-primary)' }}>moto</span>
        </div>
      )
    },
    {
      id: 11,
      name: 'iQOO',
      svg: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '900', fontSize: '0.96rem', color: 'var(--text-primary)' }}>iQOO</span>
          <div style={{ width: '6px', height: '6px', background: '#FFDD00', borderRadius: '50%' }}></div>
        </div>
      )
    },
    {
      id: 12,
      name: 'POCO',
      svg: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ background: '#FFD400', color: '#000', padding: '1px 5px', fontWeight: '900', fontSize: '0.7rem', borderRadius: '3px' }}>
            POCO
          </div>
        </div>
      )
    },
    {
      id: 13,
      name: 'Infinix',
      svg: (
        <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '800', letterSpacing: '0.3px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
          Infinix
        </span>
      )
    },
    {
      id: 14,
      name: 'Tecno',
      svg: (
        <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: '800', letterSpacing: '-0.2px', fontSize: '0.85rem', color: '#0052D9' }}>
          TECNO
        </span>
      )
    }
  ];

  // Repeat items for endless scrolling (doubled for mathematically perfect seam alignment)
  const marqueeItems = [...brands, ...brands];

  return (
    <section className="brands-marquee-section" style={{
      padding: '20px 0',
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div className="container">
        <h4 style={{
          textAlign: 'center',
          fontSize: '0.7rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          margin: 0
        }}>
          Authorized Partner &amp; Genuine Products
        </h4>
      </div>

      {/* Continuous Fast Scrolling Row */}
      <div style={{
        display: 'block', /* Changed from flex to block to prevent child sizing compression */
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        maskImage: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)'
      }}>
        <div className="brands-marquee-container" style={{ width: 'max-content' }}>
          {marqueeItems.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                padding: '8px 18px',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0 /* Prevent items from shrinking or collapsing */
              }}
            >
              {item.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
