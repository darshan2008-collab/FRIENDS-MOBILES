import React from 'react';
import { DEFAULT_PROMO_CARDS } from '../data/promoCards';

export default function PromoBanners({ 
  cards = DEFAULT_PROMO_CARDS,
  onOpenCustomCover, 
  onOpenCustomFrame, 
  onOpenShop,
  onOpenServiceModal,
  onOpenSellPhoneModal,
  t = (k) => k 
}) {
  const activeCards = (cards && cards.length > 0 ? cards : DEFAULT_PROMO_CARDS)
    .filter(c => (c.section === 'top_promo' || !c.section) && c.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (!activeCards || activeCards.length === 0) {
    return null;
  }

  const handleCardAction = (card, e) => {
    if (e) e.stopPropagation();

    const action = card.btnAction || 'shop';
    if (action === 'custom_cover') {
      if (onOpenCustomCover) onOpenCustomCover();
    } else if (action === 'custom_frame') {
      if (onOpenCustomFrame) onOpenCustomFrame();
    } else if (action === 'repair_service') {
      if (onOpenServiceModal) onOpenServiceModal();
    } else if (action === 'sell_phone') {
      if (onOpenSellPhoneModal) onOpenSellPhoneModal();
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

  const renderSubtitle = (card) => {
    const text = card.subtitle || '';
    const highlight = card.highlight;

    if (highlight && text.includes(highlight)) {
      const parts = text.split(highlight);
      return (
        <p className="discount">
          {parts[0]}
          <span className="highlight">{highlight}</span>
          {parts.slice(1).join(highlight)}
        </p>
      );
    }

    return <p className="sub-text">{text}</p>;
  };

  const cardCount = activeCards.length;

  return (
    <section className="promo-banners">
      <div 
        className="container promo-grid" 
        data-count={cardCount}
      >
        {activeCards.map((card) => {
          const fallbackImage = card.fallbackImg || 'images/banner_accessories.png';
          return (
            <div 
              key={card.id || card.title} 
              className="promo-card heading-in-view"
              id={card.id}
              style={{
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
                {renderSubtitle(card)}
                <button 
                  type="button"
                  onClick={(e) => handleCardAction(card, e)}
                  className="btn btn-sm btn-orange"
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {card.btnText || 'EXPLORE'}
                </button>
              </div>
              <div 
                className="promo-img-box" 
                onClick={(e) => handleCardAction(card, e)} 
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={card.imgSrc || fallbackImage} 
                  onError={(e) => {
                    if (e.target.src !== fallbackImage) {
                      e.target.src = fallbackImage;
                    }
                  }} 
                  alt={card.title} 
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
