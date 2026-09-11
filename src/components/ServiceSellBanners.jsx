import React from 'react';

export default function ServiceSellBanners({ onOpenServiceModal, onOpenSellPhoneModal, t = (k) => k }) {
  const fallbackRepair = 'https://images.unsplash.com/photo-1597740985671-2a8a3b80532e?q=80&w=600&auto=format&fit=crop';
  const fallbackSell = 'https://images.unsplash.com/photo-1556742049-0a67e557224f?q=80&w=600&auto=format&fit=crop';

  const handleImgError = (e, fallback) => {
    e.target.src = fallback;
  };

  return (
    <section className="service-sell-banners" style={{ padding: '24px 0 36px' }}>
      <div className="container service-sell-grid">
        
        {/* CARD 1: MOBILE REPAIR & DOORSTEP SERVICE */}
        <div 
          className="promo-card service-sell-card" 
          id="doorstep-repair"
          onClick={() => onOpenServiceModal && onOpenServiceModal()}
          style={{ cursor: 'pointer' }}
        >
          <div className="promo-info">
            <span className="promo-tag">
              Doorstep Service
            </span>
            <h3>
              Mobile Repair & Service
            </h3>
            <p className="sub-text">
              Cracked screen, battery drain, or dead phone? Certified doorstep pickup & 24h delivery.
            </p>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenServiceModal) onOpenServiceModal();
              }}
              className="btn btn-sm btn-orange"
              style={{ cursor: 'pointer', border: 'none' }}
            >
              BOOK SERVICE
            </button>
          </div>
          <div className="promo-img-box service-sell-img-box">
            <img 
              src="images/banner_repair_service.png" 
              onError={(e) => handleImgError(e, fallbackRepair)} 
              alt="Mobile Repair & Doorstep Service" 
            />
          </div>
        </div>

        {/* CARD 2: SELL YOUR OLD PHONE / INSTANT CASH */}
        <div 
          className="promo-card service-sell-card" 
          id="sell-old-phone"
          onClick={() => onOpenSellPhoneModal && onOpenSellPhoneModal()}
          style={{ cursor: 'pointer' }}
        >
          <div className="promo-info">
            <span className="promo-tag">
              Instant Cash
            </span>
            <h3>
              Sell Your Old Phone
            </h3>
            <p className="sub-text">
              Get the best guaranteed cash offer for your used mobile with free doorstep inspection.
            </p>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenSellPhoneModal) onOpenSellPhoneModal();
              }}
              className="btn btn-sm btn-orange"
              style={{ cursor: 'pointer', border: 'none' }}
            >
              SELL NOW
            </button>
          </div>
          <div className="promo-img-box service-sell-img-box">
            <img 
              src="images/banner_sell_phone.png" 
              onError={(e) => handleImgError(e, fallbackSell)} 
              alt="Sell Your Old Phone" 
            />
          </div>
        </div>

      </div>
    </section>
  );
}
