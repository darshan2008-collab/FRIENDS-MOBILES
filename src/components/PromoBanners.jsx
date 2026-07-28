import React from 'react';

export default function PromoBanners({ onOpenCustomCover, onOpenCustomFrame, t = (k) => k, language = 'en' }) {
  const unsplashAcc = 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop';
  const unsplashCover = 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=600&auto=format&fit=crop';
  const unsplashFrame = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop';

  const handleImgError = (e, fallbackUnsplash) => {
    e.target.src = fallbackUnsplash;
  };

  return (
    <section className="promo-banners">
      <div className="container promo-grid">
        
        <div className="promo-card">
          <div className="promo-info">
            <span className="promo-tag">
              {language === 'ta' ? 'அகஸ்சரீஸ் ஆஃபர்' : 'Trending Gear'}
            </span>
            <h3>
              {language === 'ta' ? 'பிரீமியம் அக்சஸரீஸ்' : 'PREMIUM ACCESSORIES'}
            </h3>
            <p className="discount">
              {language === 'ta' 
                ? 'சார்ஜர்கள் மற்றும் கேபிள்களுக்கு 40% வரை சிறப்பு தள்ளுபடி!' 
                : <>Up to <span className="highlight">40% OFF</span> on chargers, cases, and tech utilities.</>}
            </p>
            <a href="#products" className="btn btn-sm btn-orange">
              {t('shopNow') || 'SHOP NOW'}
            </a>
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
            <span className="promo-tag">
              {language === 'ta' ? '3D கஸ்டமைஸ்' : '3D Printing'}
            </span>
            <h3>
              {t('navCustomCovers') || 'CUSTOM BACK COVERS'}
            </h3>
            <p className="sub-text">
              {language === 'ta' 
                ? 'உங்கள் விருப்ப புகைப்படங்கள் மற்றும் பெயருடன் 3D கவர் டிசைன் செய்யுங்கள்.' 
                : 'Design your custom case with custom images, text, and styles.'}
            </p>
            <button 
              onClick={onOpenCustomCover} 
              className="btn btn-sm btn-orange"
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {t('customize') || 'CUSTOMIZE NOW'}
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
            <span className="promo-tag">
              {language === 'ta' ? 'நினைவுகள் பொக்கிஷம்' : 'Memories Preserved'}
            </span>
            <h3>
              {t('navPhotoFrames') || 'PREMIUM PHOTO FRAMES'}
            </h3>
            <p className="sub-text">
              {language === 'ta' 
                ? 'உயர்தர மர மற்றும் அக்ரிலிக் போட்டோ பிரேம்களை உருவாக்குங்கள்.' 
                : 'Create high-quality custom glass and wood frames for your special moments.'}
            </p>
            <button 
              onClick={onOpenCustomFrame} 
              className="btn btn-sm btn-orange"
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {language === 'ta' ? 'இப்போதே ஆர்டர் செய்ய' : 'ORDER NOW'}
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
