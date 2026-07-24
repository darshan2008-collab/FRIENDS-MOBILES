import React, { useState } from 'react';
import { Headphones, Heart, Paintbrush, ShoppingBag, User, Smartphone, Frame, Sparkles } from 'lucide-react';

export default function MobileBottomBar({ 
  cartCount, 
  wishlistCount = 0,
  currentUser, 
  onOpenAuth, 
  onOpenUserAccount, 
  onOpenCustomCover, 
  onOpenCustomFrame,
  onOpenWishlist,
  onOpenCart,
  onOpenChatbot
}) {
  const [showCustomMenu, setShowCustomMenu] = useState(false);

  const handleSupportClick = () => {
    setShowCustomMenu(false);
    if (onOpenChatbot) {
      onOpenChatbot();
    } else {
      const contactElem = document.getElementById('contact') || document.querySelector('.main-footer');
      if (contactElem) {
        contactElem.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open('https://wa.me/919344522086', '_blank');
      }
    }
  };

  const handleWishlistClick = () => {
    setShowCustomMenu(false);
    const wishlistElement = document.getElementById('wishlist') || document.querySelector('#products');
    if (wishlistElement) {
      wishlistElement.scrollIntoView({ behavior: 'smooth' });
    }
    if (onOpenWishlist) onOpenWishlist();
  };

  const handleAccountClick = () => {
    setShowCustomMenu(false);
    if (currentUser) {
      onOpenUserAccount();
    } else {
      onOpenAuth();
    }
  };

  const handleCartClick = () => {
    setShowCustomMenu(false);
    if (onOpenCart) onOpenCart();
  };

  return (
    <>
      {/* Quick Customization Options Popup */}
      {showCustomMenu && (
        <div 
          className="custom-quick-popup-overlay"
          onClick={() => setShowCustomMenu(false)}
        >
          <div className="custom-quick-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-handle"></div>
            <h4 className="popup-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={18} color="#FF5500" /> Customize &amp; Personalize
            </h4>
            <div className="popup-buttons">
              <button 
                className="popup-opt-btn cover-opt"
                onClick={() => {
                  setShowCustomMenu(false);
                  onOpenCustomCover();
                }}
              >
                <div className="opt-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={24} color="#FF5500" />
                </div>
                <div className="opt-text">
                  <strong>3D Back Cover Studio</strong>
                  <span>Personalized Phone Case</span>
                </div>
              </button>
              <button 
                className="popup-opt-btn frame-opt"
                onClick={() => {
                  setShowCustomMenu(false);
                  onOpenCustomFrame();
                }}
              >
                <div className="opt-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Frame size={24} color="#FF5500" />
                </div>
                <div className="opt-text">
                  <strong>Custom Photo Frame</strong>
                  <span>Memorable Wall &amp; Desk Frames</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Bottom Navigation Bar */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button className="bottom-nav-item" onClick={handleSupportClick} title="24/7 Customer Care" aria-label="24/7 Customer Care">
          <Headphones size={20} />
          <span>24/7 Care</span>
        </button>

        <button className="bottom-nav-item" onClick={handleWishlistClick}>
          <div className="nav-icon-badge-wrap">
            <Heart size={20} color={wishlistCount > 0 ? '#FF5500' : 'currentColor'} fill={wishlistCount > 0 ? '#FF5500' : 'none'} />
            {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
          </div>
          <span>Wishlist</span>
        </button>

        <button 
          className={`bottom-nav-item custom-highlight ${showCustomMenu ? 'active' : ''}`}
          onClick={() => setShowCustomMenu(!showCustomMenu)}
        >
          <div className="custom-icon-ring">
            <Paintbrush size={20} />
          </div>
          <span>Customize</span>
        </button>

        <button className="bottom-nav-item" onClick={handleCartClick}>
          <div className="nav-icon-badge-wrap">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </div>
          <span>Cart</span>
        </button>

        <button className="bottom-nav-item" onClick={handleAccountClick}>
          <User size={20} />
          <span>{currentUser ? 'Account' : 'Login'}</span>
        </button>
      </nav>
    </>
  );
}
