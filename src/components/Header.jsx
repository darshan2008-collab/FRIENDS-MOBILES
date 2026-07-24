import React from 'react';
import { Search, Heart, ShoppingBag, User, Sun, Moon, Menu, ShieldCheck, LogOut } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

export default function Header({ theme, toggleTheme, cartCount, wishlistCount, onOpenDrawer, searchQuery, setSearchQuery, onOpenAdmin, currentUser, onOpenAuth, onOpenUserAccount, onOpenCart, onLogout, onOpenShop }) {
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

              <a href="#" className="logo">
                <CompanyLogo size={34} />
                <div className="logo-text">
                  <span className="logo-brand">FRIENDS</span>
                  <span className="logo-sub">MOBILE</span>
                </div>
              </a>
            </div>

            {/* Desktop Search Bar */}
            <div className="search-box desktop-search-box">
              <input 
                type="text" 
                placeholder="Search for products, brands and more..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="search-btn" 
                aria-label="Search"
                onClick={() => onOpenShop && onOpenShop('All')}
              >
                <Search size={18} />
              </button>
            </div>

            {/* Actions & Theme Toggle */}
            <div className="header-actions">
              <button className="theme-toggle-btn" onClick={toggleTheme} title="Switch Light/Dark Theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
                className="action-btn header-cart-btn" 
                onClick={onOpenCart}
                title="Cart"
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div className="icon-wrap">
                  <ShoppingBag size={20} />
                  <span className="badge">{cartCount}</span>
                </div>
              </button>

              <button 
                className="action-btn admin-btn" 
                onClick={onOpenAdmin}
                title="Admin Portal"
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div className="icon-wrap" style={{ color: '#FF5500' }}>
                  <ShieldCheck size={20} />
                </div>
              </button>

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
              placeholder="Search for products, brands and more..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="search-btn" 
              aria-label="Search"
              onClick={() => onOpenShop && onOpenShop('All')}
            >
              <Search size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Desktop Navigation */}
      <nav className="main-nav">
        <div className="container">
          <ul className="nav-links">
            <li><a href="#" className="nav-link active">Home</a></li>
            <li>
              <button 
                type="button"
                onClick={() => onOpenShop && onOpenShop('Mobile Phones')}
                className="nav-link"
              >
                Mobile Phones
              </button>
            </li>
            <li>
              <button 
                type="button"
                onClick={() => onOpenShop && onOpenShop('Chargers & Cables')}
                className="nav-link"
              >
                Chargers &amp; Accessories
              </button>
            </li>
            <li><a href="#photo-frames" className="nav-link">Photo Frames</a></li>
            <li><a href="#customized-covers" className="nav-link">Customized Back Covers</a></li>
            <li>
              <button 
                type="button"
                onClick={() => onOpenShop && onOpenShop('All')}
                className="nav-link"
              >
                Shop All Store
              </button>
            </li>
            <li><a href="#offers" className="nav-link">Offers</a></li>
            <li><a href="#contact" className="nav-link">Contact Us</a></li>
          </ul>
        </div>
      </nav>
    </>
  );
}
