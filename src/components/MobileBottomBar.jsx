import React, { useState } from 'react';
import { Home, Grid, Paintbrush, ShoppingBag, User } from 'lucide-react';

export default function MobileBottomBar({ 
  cartCount, 
  currentUser, 
  onOpenAuth, 
  onOpenUserAccount, 
  onOpenCustomCover, 
  onOpenCustomFrame,
  onOpenCategories,
  onOpenCart
}) {
  const [showCustomMenu, setShowCustomMenu] = useState(false);

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowCustomMenu(false);
  };

  const handleCategoriesClick = () => {
    setShowCustomMenu(false);
    const catElement = document.getElementById('categories') || document.querySelector('.categories-section');
    if (catElement) {
      catElement.scrollIntoView({ behavior: 'smooth' });
    } else if (onOpenCategories) {
      onOpenCategories();
    }
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
            <h4 className="popup-title">✨ Customize & Personalize</h4>
            <div className="popup-buttons">
              <button 
                className="popup-opt-btn cover-opt"
                onClick={() => {
                  setShowCustomMenu(false);
                  onOpenCustomCover();
                }}
              >
                <div className="opt-icon">📱</div>
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
                <div className="opt-icon">🖼️</div>
                <div className="opt-text">
                  <strong>Custom Photo Frame</strong>
                  <span>Memorable Wall & Desk Frames</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Bottom Navigation Bar */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button className="bottom-nav-item" onClick={handleHomeClick}>
          <Home size={20} />
          <span>Home</span>
        </button>

        <button className="bottom-nav-item" onClick={handleCategoriesClick}>
          <Grid size={20} />
          <span>Categories</span>
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
