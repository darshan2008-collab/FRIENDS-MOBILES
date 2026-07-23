import React from 'react';
import { X, User, LogOut, ShoppingBag } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

export default function MobileDrawer({ isOpen, onClose, currentUser, onOpenAuth, onOpenUserAccount, onLogout }) {
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
                  <ShoppingBag size={14} /> My Account
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
                  <LogOut size={14} /> Logout
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
              <User size={16} /> Login / Sign Up
            </button>
          )}
        </div>

        <ul className="drawer-links">
          <li><a href="#" className="drawer-link" onClick={onClose}>Home</a></li>
          <li><a href="#products" className="drawer-link" onClick={onClose}>Mobile Phones</a></li>
          <li><a href="#products" className="drawer-link" onClick={onClose}>Accessories</a></li>
          <li><a href="#photo-frames" className="drawer-link" onClick={onClose}>Photo Frames</a></li>
          <li><a href="#customized-covers" className="drawer-link" onClick={onClose}>Customized Back Covers</a></li>
          <li><a href="#services" className="drawer-link" onClick={onClose}>Services</a></li>
          <li><a href="#offers" className="drawer-link" onClick={onClose}>Offers</a></li>
          <li><a href="#contact" className="drawer-link" onClick={onClose}>Contact Us</a></li>
        </ul>
      </aside>
    </>
  );
}
