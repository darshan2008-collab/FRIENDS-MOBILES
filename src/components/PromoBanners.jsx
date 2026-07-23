import React from 'react';

export default function PromoBanners({ onOpenCustomCover, onOpenCustomFrame }) {
  const unsplashAcc = 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop';
  const unsplashCover = 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=600&auto=format&fit=crop';
  const unsplashFrame = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop';

  const handleImgError = (e, fallbackUnsplash) => {
    const current = e.target.src;
    if (current.includes('images/') && !current.startsWith('http://localhost:5000')) {
      e.target.src = `http://localhost:5000/${current.slice(current.indexOf('images/'))}`;
    } else {
      e.target.src = fallbackUnsplash;
    }
  };

  return (
    <section className="promo-banners">
      <div className="container promo-grid">
        
        <div className="promo-card">
          <div className="promo-info">
            <span className="promo-tag">Trending Gear</span>
            <h3>PREMIUM ACCESSORIES</h3>
            <p className="discount">Up to <span className="highlight">40% OFF</span> on chargers, cases, and premium tech utilities.</p>
            <a href="#products" className="btn btn-sm btn-orange">SHOP NOW</a>
          </div>
          <div className="promo-img-box">
            <img 
              src="images/banner_accessories.png" 
              onError={(e) => handleImgError(e, unsplashAcc)} 
              alt="Premium Accessories" 
            />
          </div>
        </div>

        <div style={{ display: 'none' }}></div> {/* dummy spacer */}

        <div className="promo-card" id="customized-covers">
          <div className="promo-info">
            <span className="promo-tag">3D Printing</span>
            <h3>CUSTOM BACK COVERS</h3>
            <p className="sub-text">Design your custom case with custom images, text, and styles.</p>
            <button 
              onClick={onOpenCustomCover} 
              className="btn btn-sm btn-orange"
              style={{ cursor: 'pointer', border: 'none' }}
            >
              CUSTOMIZE NOW
            </button>
          </div>
          <div className="promo-img-box" onClick={onOpenCustomCover} style={{ cursor: 'pointer' }}>
            <img 
              src="images/banner_backcover.png" 
              onError={(e) => handleImgError(e, unsplashCover)} 
              alt="Customized Back Cover" 
            />
          </div>
        </div>

        <div className="promo-card" id="photo-frames">
          <div className="promo-info">
            <span className="promo-tag">Memories Preserved</span>
            <h3>PREMIUM PHOTO FRAMES</h3>
            <p className="sub-text">Create high-quality custom glass and wood frames for your special moments.</p>
            <button 
              onClick={onOpenCustomFrame} 
              className="btn btn-sm btn-orange"
              style={{ cursor: 'pointer', border: 'none' }}
            >
              ORDER NOW
            </button>
          </div>
          <div className="promo-img-box" onClick={onOpenCustomFrame} style={{ cursor: 'pointer' }}>
            <img 
              src="images/banner_photoframe.png" 
              onError={(e) => handleImgError(e, unsplashFrame)} 
              alt="Photo Frames" 
            />
          </div>
        </div>

      </div>
    </section>
  );
}
