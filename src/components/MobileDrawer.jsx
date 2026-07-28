import React from 'react';
import { X, User, LogOut, ShoppingBag, Languages } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

export default function MobileDrawer({ 
  isOpen, 
  onClose, 
  language = 'en',
  toggleLanguage,
  t = (k) => k,
  currentUser, 
  onOpenAuth, 
  onOpenUserAccount, 
  onLogout 
}) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`mobile-drawer-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      <aside className={`mobile-drawer ${isOpen ? 'active' : ''}`}>
        <div className="drawer-header">
          <div className="logo">
            <CompanyLogo size={32} />
            <div className="logo-text">
              <span className="logo-brand">FRIENDS</span>
              <span className="logo-sub">MOBILE</span>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        {/* Language Selection Card */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Languages size={15} color="#FF5500" /> {t('switchLanguage') || 'Switch Language / மொழி'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => toggleLanguage && toggleLanguage('en')}
              style={{
                padding: '7px',
                borderRadius: '8px',
                border: language === 'en' ? '2px solid #FF5500' : '1px solid var(--border-color)',
                background: language === 'en' ? 'rgba(255, 85, 0, 0.12)' : 'var(--bg-input)',
                color: language === 'en' ? '#FF5500' : 'var(--text-primary)',
                fontWeight: 'bold',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => toggleLanguage && toggleLanguage('ta')}
              style={{
                padding: '7px',
                borderRadius: '8px',
                border: language === 'ta' ? '2px solid #FF5500' : '1px solid var(--border-color)',
                background: language === 'ta' ? 'rgba(255, 85, 0, 0.12)' : 'var(--bg-input)',
                color: language === 'ta' ? '#FF5500' : 'var(--text-primary)',
                fontWeight: 'bold',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              🇮🇳 தமிழ்
            </button>
          </div>
        </div>

        {/* Account & Logout section in Mobile Menu */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-input)' }}>
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#FF5500', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Hi, {currentUser.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{currentUser.phone || currentUser.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenUserAccount) onOpenUserAccount();
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ShoppingBag size={14} /> {t('myAccount') || 'My Account'}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onLogout) onLogout();
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ef4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={14} /> {t('logout') || 'Logout'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#FF5500',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <User size={16} /> {t('loginSignUp') || 'Login / Sign Up'}
            </button>
          )}
        </div>

        <ul className="drawer-links">
          <li><a href="#" className="drawer-link" onClick={onClose}>{t('navHome') || 'Home'}</a></li>
          <li><a href="#products" className="drawer-link" onClick={onClose}>{t('navPhones') || 'Mobile Phones'}</a></li>
          <li><a href="#products" className="drawer-link" onClick={onClose}>{t('navAccessories') || 'Accessories'}</a></li>
          <li><a href="#photo-frames" className="drawer-link" onClick={onClose}>{t('navPhotoFrames') || 'Photo Frames'}</a></li>
          <li><a href="#customized-covers" className="drawer-link" onClick={onClose}>{t('navCustomCovers') || 'Customized Back Covers'}</a></li>
          <li><a href="#services" className="drawer-link" onClick={onClose}>{t('navServices') || 'Services'}</a></li>
          <li><a href="#offers" className="drawer-link" onClick={onClose}>{t('navOffers') || 'Offers'}</a></li>
          <li><a href="#contact" className="drawer-link" onClick={onClose}>{t('navContact') || 'Contact Us'}</a></li>
        </ul>
      </aside>
    </>
  );
}
