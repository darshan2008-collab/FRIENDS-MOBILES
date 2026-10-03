import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User, Sun, Moon, Menu, ShieldCheck, LogOut, Headphones, Wrench, Smartphone, Home, Zap, Image, Sparkles, Store, Flame } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

export default function Header({ 
  theme, 
  toggleTheme, 
  t = (k) => k,
  cartCount, 
  wishlistCount, 
  onOpenDrawer, 
  searchQuery, 
  setSearchQuery, 
  onOpenAdmin, 
  currentUser, 
  onOpenAuth, 
  onOpenUserAccount, 
  onOpenCart, 
  onLogout, 
  onOpenShop, 
  onOpenChatbot,
  onOpenServiceModal,
  onOpenSellPhoneModal
}) {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <>
      {/* Main Header */}
      <header className="main-header">
        <div className="container header-container">
          
          {/* Top Row: Hamburger + Logo on Left, Actions on Right */}
          <div className="header-top-row">
            <div className="header-left">
              <button className="mobile-hamburger-btn" onClick={onOpenDrawer} aria-label="Open Navigation">
                <Menu size={22} />
              </button>

              <a href="/" className="logo" title="Friends Mobile | Mobile Phones &amp; Accessories" aria-label="Friends Mobile Home Page">
                <CompanyLogo size={34} />
                <h1 className="logo-text" style={{ fontSize: 'inherit', fontWeight: 'inherit', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span className="logo-brand">Friends</span>
                  <span className="logo-sub">Mobile</span>
                </h1>
              </a>
            </div>

            {/* Desktop Search Bar */}
            <div className="search-box desktop-search-box">
              <input 
                type="text" 
                placeholder={t('searchPlaceholder') || "Search for products, brands and more..."} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="button"
                className="search-btn" 
                aria-label="Search"
                onClick={() => onOpenShop && onOpenShop('All')}
                style={{
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  minHeight: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6A00 0%, #FF4500 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  flexShrink: 0
                }}
              >
                <Search size={18} color="#ffffff" strokeWidth={2.4} style={{ display: 'block', minWidth: '18px', minHeight: '18px' }} />
              </button>
            </div>

            {/* Actions & Theme Toggle */}
            <div className="header-actions">
              <button className="theme-toggle-btn" onClick={toggleTheme} title="Switch Light/Dark Theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button 
                className="action-btn mobile-hide-action header-ai-care-btn" 
                title="24/7 AI Customer Care & Order Tracking"
                onClick={onOpenChatbot}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div className="icon-wrap" style={{ color: '#FF5500' }}>
                  <Headphones size={20} />
                </div>
              </button>

              <button 
                className="action-btn mobile-hide-action" 
                title="Wishlist"
                onClick={() => onOpenShop && onOpenShop('Wishlist')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div className="icon-wrap">
                  <Heart size={20} color={wishlistCount > 0 ? '#FF5500' : 'currentColor'} fill={wishlistCount > 0 ? '#FF5500' : 'none'} />
                  {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                </div>
              </button>

              <button 
                type="button"
                className="action-btn header-cart-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenCart) onOpenCart();
                }}
                title="Cart"
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px 4px 4px', marginRight: '4px' }}
              >
                <div className="icon-wrap" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={22} />
                  <span className="badge">{cartCount}</span>
                </div>
              </button>

              {/* Public Admin Shield Button hidden - Admin logs in securely via Login Modal */}

              {currentUser ? (
                <div className="user-profile-header-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    className="account-btn"
                    onClick={onOpenUserAccount}
                    style={{ cursor: 'pointer' }}
                    title="View Profile & Orders"
                  >
                    <div className="icon-wrap">
                      <User size={20} color="#FF5500" />
                    </div>
                    <div className="account-text mobile-hide-action">
                      <span className="acc-title">Hi, {currentUser.name.split(' ')[0]}</span>
                      <span className="acc-sub">My Orders & Profile</span>
                    </div>
                  </div>

                  <button 
                    onClick={onLogout}
                    className="header-logout-btn mobile-hide-action"
                    title="Log Out Account"
                    aria-label="Log Out Account"
                  >
                    <LogOut size={15} />
                    <span className="logout-btn-text">Logout</span>
                  </button>
                </div>
              ) : (
                <div 
                  className="account-btn mobile-hide-action"
                  onClick={onOpenAuth}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="icon-wrap">
                    <User size={20} />
                  </div>
                  <div className="account-text">
                    <span className="acc-title">My Account</span>
                    <span className="acc-sub">Login / Sign Up</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Full-Width Search Bar */}
          <div className="search-box mobile-search-box">
            <input 
              type="text" 
              placeholder={t('searchPlaceholder') || "Search products, brands and accessories..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="button"
              className="search-btn" 
              aria-label="Search"
              onClick={() => onOpenShop && onOpenShop('All')}
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                minHeight: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6A00 0%, #FF4500 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0
              }}
            >
              <Search size={18} color="#ffffff" strokeWidth={2.4} style={{ display: 'block', minWidth: '18px', minHeight: '18px' }} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Desktop Navigation */}
      <nav className="main-nav" aria-label="Desktop Primary Navigation">
        <div className="container">
          <ul className="nav-links">
            <li>
              <a 
                href="/" 
                onClick={(e) => { e.preventDefault(); setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`nav-link ${activeNav === 'home' ? 'active' : ''}`}
                title="Home"
              >
                <Home size={14} className="nav-icon" />
                <span>{t('navHome')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#shop"
                onClick={(e) => { e.preventDefault(); setActiveNav('phones'); if (onOpenShop) onOpenShop('Mobile Phones'); }}
                className={`nav-link ${activeNav === 'phones' ? 'active' : ''}`}
                title="Mobile Phones"
              >
                <Smartphone size={14} className="nav-icon" />
                <span>{t('navPhones')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#shop"
                onClick={(e) => { e.preventDefault(); setActiveNav('chargers'); if (onOpenShop) onOpenShop('Chargers & Cables'); }}
                className={`nav-link ${activeNav === 'chargers' ? 'active' : ''}`}
                title="Chargers & Accessories"
              >
                <Zap size={14} className="nav-icon" />
                <span>{t('navChargers')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#photo-frames" 
                onClick={() => setActiveNav('frames')}
                className={`nav-link ${activeNav === 'frames' ? 'active' : ''}`}
                title="Photo Frames"
              >
                <Image size={14} className="nav-icon" />
                <span>{t('navPhotoFrames')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#customized-covers" 
                onClick={() => setActiveNav('covers')}
                className={`nav-link ${activeNav === 'covers' ? 'active' : ''}`}
                title="Customized Back Covers"
              >
                <Sparkles size={14} className="nav-icon" />
                <span>{t('navCustomCovers')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#services"
                onClick={(e) => { e.preventDefault(); setActiveNav('repair'); if (onOpenServiceModal) onOpenServiceModal(); }}
                className={`nav-link nav-special-repair ${activeNav === 'repair' ? 'active' : ''}`}
                title="Mobile Repair and Service"
              >
                <Wrench size={14} className="nav-icon" />
                <span>{t('navRepair') || 'Repair and Service'}</span>
              </a>
            </li>
            <li>
              <a 
                href="#sell-old-phone"
                onClick={(e) => { e.preventDefault(); setActiveNav('sell'); if (onOpenSellPhoneModal) onOpenSellPhoneModal(); }}
                className={`nav-link nav-special-sell ${activeNav === 'sell' ? 'active' : ''}`}
                title="Sell Your Old Mobile for Instant Cash"
              >
                <Smartphone size={14} className="nav-icon" />
                <span>{t('navSellPhone') || 'Sell Your Mobile'}</span>
                <span className="nav-tag nav-tag-green">Cash</span>
              </a>
            </li>
            <li>
              <a 
                href="#shop"
                onClick={(e) => { e.preventDefault(); setActiveNav('shop'); if (onOpenShop) onOpenShop('All'); }}
                className={`nav-link ${activeNav === 'shop' ? 'active' : ''}`}
                title="Shop All Store Products"
              >
                <Store size={14} className="nav-icon" />
                <span>{t('navShopAll')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#offers" 
                onClick={() => setActiveNav('offers')}
                className={`nav-link nav-special-offers ${activeNav === 'offers' ? 'active' : ''}`}
                title="Exclusive Offers & Deals"
              >
                <Flame size={14} className="nav-icon flame-icon" />
                <span>{t('navOffers')}</span>
                <span className="nav-tag nav-tag-red">HOT</span>
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                onClick={() => setActiveNav('contact')}
                className={`nav-link ${activeNav === 'contact' ? 'active' : ''}`}
                title="Contact Friends Mobile Support"
              >
                <Headphones size={14} className="nav-icon" />
                <span>{t('navContact')}</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
