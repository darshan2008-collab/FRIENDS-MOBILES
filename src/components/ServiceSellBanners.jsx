import React from 'react';
import { DEFAULT_PROMO_CARDS } from '../data/promoCards';

export default function ServiceSellBanners({ 
  cards = DEFAULT_PROMO_CARDS,
  onOpenServiceModal, 
  onOpenSellPhoneModal, 
  onOpenCustomCover,
  onOpenCustomFrame,
  onOpenShop,
  t = (k) => k 
}) {
  const activeCards = (cards && cards.length > 0 ? cards : DEFAULT_PROMO_CARDS)
    .filter(c => c.section === 'service_sell' && c.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (!activeCards || activeCards.length === 0) {
    return null;
  }

  const handleCardAction = (card, e) => {
    if (e) e.stopPropagation();

    const action = card.btnAction || 'repair_service';
    if (action === 'repair_service') {
      if (onOpenServiceModal) onOpenServiceModal();
    } else if (action === 'sell_phone') {
      if (onOpenSellPhoneModal) onOpenSellPhoneModal();
    } else if (action === 'custom_cover') {
      if (onOpenCustomCover) onOpenCustomCover();
    } else if (action === 'custom_frame') {
      if (onOpenCustomFrame) onOpenCustomFrame();
    } else if (action === 'shop') {
      if (onOpenShop) {
        onOpenShop();
      } else {
        const el = document.getElementById('products');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.location.hash = '#products';
      }
    } else if (card.btnLink) {
      if (card.btnLink.startsWith('#')) {
        const targetId = card.btnLink.substring(1);
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.location.hash = card.btnLink;
      } else {
        window.open(card.btnLink, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const cardCount = activeCards.length;

  return (
    <section className="service-sell-banners">
      <div 
        className="container service-sell-grid"
        data-count={cardCount}
      >
        {activeCards.map((card) => {
          const fallbackImage = card.fallbackImg || 'images/banner_repair_service.png';
          return (
            <div 
              key={card.id || card.title}
              className="promo-card service-sell-card heading-in-view" 
              id={card.id}
              role="button"
              tabIndex={0}
              onClick={(e) => handleCardAction(card, e)}
              style={{ 
                cursor: 'pointer', 
                userSelect: 'none', 
                WebkitUserSelect: 'none', 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                opacity: 1,
                visibility: 'visible',
                transform: 'none'
              }}
            >
              <div className="promo-info">
                {card.tag && (
                  <span className="promo-tag">
                    {card.tag}
                  </span>
                )}
                <h3>
                  {card.title}
                </h3>
                <p className="sub-text">
                  {card.subtitle}
                </p>
                <button 
                  type="button"
                  onClick={(e) => handleCardAction(card, e)}
                  className="btn btn-sm btn-orange"
                  style={{ 
                    cursor: 'pointer', 
                    border: 'none',
                    userSelect: 'none', 
                    WebkitUserSelect: 'none', 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {card.btnText || 'EXPLORE'}
                </button>
              </div>
              <div className="promo-img-box service-sell-img-box" style={{ pointerEvents: 'none' }}>
                <img 
                  src={card.imgSrc || fallbackImage} 
                  onError={(e) => {
                    if (e.target.src !== fallbackImage) {
                      e.target.src = fallbackImage;
                    }
                  }} 
                  alt={card.title} 
                  style={{ pointerEvents: 'none' }}
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
