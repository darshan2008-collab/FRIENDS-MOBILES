import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, MessageSquare, Clock, ShieldCheck, Sparkles, Navigation, Award, CheckCircle2, ArrowRight, Smartphone, Palette, Frame, Watch, Headphones, Zap } from 'lucide-react';
import CompanyLogo from './CompanyLogo';

export default function Footer() {
  return (
    <footer className="main-footer" id="contact" style={{
      background: 'var(--bg-card)',
      borderTop: '2px solid rgba(255, 85, 0, 0.25)',
      paddingTop: '60px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Neon Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #FF5500, transparent)',
        boxShadow: '0 0 20px #FF5500'
      }} />

      <div className="container">
        
        {/* Showroom Announcement Banner - Ultra-Premium Glassmorphic Design */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255, 85, 0, 0.25)',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '48px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.05), 0 0 20px rgba(255, 85, 0, 0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Top Gradient Accent Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #FF5500, #ff8800, #22c55e)'
          }} />

          {/* Left Info Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FF5500, #ff7700)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(255, 85, 0, 0.35)',
              flexShrink: 0
            }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.96rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span>KARUR'S #1 MULTI-BRAND MOBILE SHOWROOM</span>
                <span style={{ 
                  fontSize: '0.72rem', 
                  background: 'rgba(34, 197, 94, 0.12)', 
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#16a34a', 
                  padding: '3px 10px', 
                  borderRadius: '20px', 
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                  OPEN TODAY
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: '500', lineHeight: '1.4' }}>
                Visit our Flagship Store or Order Online for Express 30-Min Custom Case Printing!
              </div>
            </div>
          </div>

          {/* Right Action Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'var(--bg-input)', 
              padding: '8px 14px', 
              borderRadius: '10px', 
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem', 
              fontWeight: '750', 
              color: 'var(--text-primary)' 
            }}>
              <Clock size={16} color="#FF5500" />
              <span>9:00 AM – 10:00 PM</span>
            </div>

            <a 
              href="https://wa.me/919344522086" 
              target="_blank" 
              rel="noreferrer"
              style={{
                background: 'linear-gradient(135deg, #FF5500, #ff7700)',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.86rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(255, 85, 0, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <MessageSquare size={16} /> Connect With Showroom
            </a>
          </div>
        </div>

        {/* Showroom Main Footer Grid */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          
          {/* Col 1: Showroom Brand & Bio */}
          <div className="footer-col brand-col">
            <a href="#" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '16px' }}>
              <CompanyLogo size={42} />
              <div className="logo-text">
                <span className="logo-brand" style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '1px' }}>FRIENDS</span>
                <span className="logo-sub" style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FF5500', marginLeft: '5px' }}>MOBILE</span>
              </div>
            </a>

            {/* Showroom Assurance Tags */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '750', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.3' }}>
                <CheckCircle2 size={17} color="#22c55e" style={{ flexShrink: 0 }} />
                <span>100% Original Brand Guarantee</span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: '750', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.3' }}>
                <CheckCircle2 size={17} color="#22c55e" style={{ flexShrink: 0 }} />
                <span>Real-time 3D Phone Case Studio</span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: '750', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.3' }}>
                <CheckCircle2 size={17} color="#22c55e" style={{ flexShrink: 0 }} />
                <span>Pan-India Express Delivery</span>
              </div>
            </div>

            {/* Social Media Badges */}
            <div className="social-links" style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
              <a href="#" className="social-icon" aria-label="Facebook" style={{
                width: '38px', height: '38px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
              }}>
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram" style={{
                width: '38px', height: '38px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
              }}>
                <Instagram size={18} />
              </a>
              <a href="https://wa.me/917448578507" target="_blank" rel="noreferrer" className="social-icon" aria-label="WhatsApp" style={{
                width: '38px', height: '38px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
              }}>
                <MessageSquare size={18} />
              </a>
              <a href="#" className="social-icon" aria-label="YouTube" style={{
                width: '38px', height: '38px', borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
              }}>
                <Youtube size={18} />
              </a>
            </div>
          </div>



          {/* Col 3: Showroom Contact & Live Address Card */}
          <div className="footer-col contact-col">
            <h4 className="footer-title" style={{ margin: 0, padding: 0 }}>
              SHOWROOM LOCATION
            </h4>
            <div style={{ width: '48px', height: '3.5px', background: 'linear-gradient(90deg, #FF5500, #ff8800)', borderRadius: '2px', marginTop: '6px', marginBottom: '18px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} color="#FF5500" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '2px' }}>Friends Mobile Flagship Store</strong>
                  Double Tank, South Gandhigramam,<br />
                  Karur - 639004, Tamil Nadu, India
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} color="#FF5500" style={{ flexShrink: 0 }} />
                <a href="tel:+919344522086" style={{ fontSize: '0.92rem', fontWeight: '800', color: '#FF5500', textDecoration: 'none' }}>
                  +91 93445 22086
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="#FF5500" style={{ flexShrink: 0 }} />
                <a href="mailto:friendsmobile@gmail.com" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600' }}>
                  friendsmobile@gmail.com
                </a>
              </div>

              {/* Get Directions Button */}
              <a 
                href="https://maps.google.com/?q=Double+Tank+South+Gandhigramam+Karur+Tamil+Nadu" 
                target="_blank" 
                rel="noreferrer"
                style={{
                  marginTop: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: '#FF5500',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 85, 0, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Navigation size={15} color="#ffffff" /> Get Directions to Showroom
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar - Amazon / Flipkart Style */}
        <div className="footer-bottom" style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          paddingBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'center'
        }}>
          {/* COMPACT ULTRA-SLEEK PAYMENT BAR */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.7rem',
              fontWeight: '850',
              color: 'var(--text-muted)',
              letterSpacing: '0.8px',
              textTransform: 'uppercase'
            }}>
              <ShieldCheck size={14} color="#22c55e" />
              100% SECURE &amp; TRUSTED PAYMENTS
            </div>

            {/* Compact Micro-Sized Single Row Payment Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              maxWidth: '100%'
            }}>
              
              {/* 100% OFFICIAL PIXEL-PERFECT SVG PAYMENT LOGOS */}
              
              {/* 10000% OFFICIAL PIXEL-PERFECT BRAND PAYMENT LOGOS */}
              
              {/* COMPACT MICRO-SIZED 21px OFFICIAL BRAND PAYMENT LOGOS */}
              
              {/* Google Pay / UPI Official Logo */}
              <div style={{
                height: '21px',
                padding: '0 6px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <svg width="34" height="13" viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.5 24.1c0-1.4-.1-2.8-.4-4.1H11.5v8.1h6.2c-.3 1.5-1.1 2.8-2.3 3.6v3h3.7c2.2-2 3.4-5 3.4-10.6z" fill="#4285F4"/>
                  <path d="M11.5 35.3c3.2 0 6-1.1 8-2.9l-3.7-3c-1.1.7-2.5 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.3H.6v3.1c2 4 6.2 6.9 10.9 6.9z" fill="#34A853"/>
                  <path d="M4.4 25.3c-.3-.8-.4-1.7-.4-2.7s.1-1.9.4-2.7v-3.1H.6C-.2 18.5-.6 20.7-.6 23s.4 4.5 1.2 6.1l3.8-3.8z" fill="#FBBC05"/>
                  <path d="M11.5 12.3c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.4 8.8 14.7 7.7 11.5 7.7 6.8 7.7 2.6 10.6.6 14.6l3.8 3.1c1-3.1 3.8-5.4 7.1-5.4z" fill="#EA4335"/>
                  <path d="M37.8 24.7v9.4h-3.6V12.7h6.8c2.1 0 3.7.6 4.9 1.8s1.8 2.7 1.8 4.6c0 1.9-.6 3.4-1.8 4.6s-2.8 1.8-4.9 1.8h-3.2zm0-9.2v6.4h3.4c1.1 0 2-.3 2.7-1s1-1.4 1-2.2c0-.9-.3-1.6-1-2.2s-1.6-1-2.7-1h-3.4z" fill="#5F6368"/>
                  <path d="M57.6 19.3v14.8h-3.5v-2.3c-1 1.7-2.6 2.6-4.6 2.6-1.7 0-3.1-.6-4.1-1.7s-1.6-2.5-1.6-4.3c0-1.9.6-3.4 1.7-4.4s2.5-1.6 4.3-1.6c1.9 0 3.4.8 4.4 2.3v-5.4h3.4zm-6.8 6.4c-1 0-1.8.3-2.4 1s-.9 1.5-.9 2.5c0 1 .3 1.9.9 2.5s1.4 1 2.4 1c1 0 1.8-.3 2.4-1s.9-1.5.9-2.5c0-1-.3-1.9-.9-2.5s-1.4-1-2.4-1z" fill="#5F6368"/>
                  <path d="M60.6 38.6l3.7-8.1-6-13.8h3.8l3.9 9.8 3.8-9.8h3.7L64.1 38.6h-3.5z" fill="#5F6368"/>
                </svg>
                <span style={{ fontSize: '0.55rem', fontWeight: '900', color: '#047857', background: '#ecfdf5', padding: '0 3px', borderRadius: '3px', border: '1px solid #a7f3d0' }}>UPI</span>
              </div>

              {/* PhonePe Official Logo */}
              <div style={{
                height: '21px',
                padding: '0 6px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <svg width="14" height="14" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" rx="24" fill="#5F259F"/>
                  <path d="M66.4 32.5H47.8c-2.4 0-4.4 2-4.4 4.4v40c0 1.5.8 2.9 2.1 3.7 1.3.8 3 .8 4.3 0L65.4 68c2.1-1.3 3.4-3.6 3.4-6.1V36.9c0-2.4-2-4.4-4.4-4.4z" fill="#FFFFFF"/>
                  <path d="M52.8 40.5v18h6.5c4.2 0 7.5-3.4 7.5-7.5s-3.4-7.5-7.5-7.5h-6.5z" fill="#5F259F"/>
                </svg>
                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#5F259F', letterSpacing: '-0.3px' }}>Phone<span style={{ color: '#5F259F' }}>Pe</span></span>
              </div>

              {/* Paytm Official Logo */}
              <div style={{
                height: '21px',
                padding: '0 6px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#002E6E', letterSpacing: '-0.4px' }}>
                  Pay<span style={{ color: '#00BAF2' }}>tm</span>
                </span>
              </div>

              {/* VISA Official Logo */}
              <div style={{
                height: '21px',
                padding: '0 6px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <svg width="32" height="11" viewBox="0 0 100 32" fill="none">
                  <path d="M38.8 2.5L25.6 30H17.2L10.5 6.6C10.1 5.1 9.7 4.5 8.4 3.8C6.4 2.7 3.1 1.7 0 1L0.4 0H14.1C15.9 0 17.4 1.2 17.8 3.2L21.2 21L29.6 0H38.8V2.5ZM72.6 20.8C72.7 12.9 61.4 12.4 61.6 8.9C61.7 7.8 62.8 6.6 65.3 6.3C66.5 6.1 69.9 6 73.5 7.6L74.8 1.6C73.1 1 70.8 0.4 67.9 0.4C59.6 0.4 53.7 4.8 53.6 11C53.4 15.6 57.6 18.2 60.8 19.8C64 21.4 65.1 22.4 65.1 23.8C65 25.9 62.4 26.8 60 26.8C55.8 26.8 53.4 25.6 51.5 24.7L50.1 31C52 31.8 55.4 32.5 59 32.5C67.8 32.5 73.6 28.2 73.6 21.4M94.6 30H102L95.5 0H88.7C87.2 0 86 0.9 85.4 2.2L73 30H81.4L83.1 25.4H93.3L94.6 30ZM85.5 19L89.6 7.8L92 19H85.5ZM51 0L44.3 30H36.3L43 0H51Z" fill="#1A1F71"/>
                  <path d="M14.1 0L8.4 3.8L10.5 6.6L17.8 3.2L14.1 0Z" fill="#F7B600"/>
                </svg>
              </div>

              {/* Mastercard Official Logo */}
              <div style={{
                height: '21px',
                padding: '0 6px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <svg width="18" height="11" viewBox="0 0 38 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#EB001B"/>
                  <circle cx="26" cy="12" r="12" fill="#F79E1B"/>
                  <path d="M19 3.5C21.6 5.7 23.3 8.7 23.3 12C23.3 15.3 21.6 18.3 19 20.5C16.4 18.3 14.7 15.3 14.7 12C14.7 8.7 16.4 5.7 19 3.5Z" fill="#FF5F00"/>
                </svg>
                <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#111827', letterSpacing: '-0.3px' }}>mastercard</span>
              </div>

              {/* Cash On Delivery Official Badge */}
              <div style={{
                height: '21px',
                padding: '0 6px',
                borderRadius: '4px',
                background: '#f0fdf4',
                border: '1px solid #a7f3d0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#16a34a'
              }}>
                <svg width="13" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
                <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#15803d', letterSpacing: '0.3px' }}>COD</span>
              </div>

            </div>
          </div>

          {/* Separator line */}
          <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', opacity: 0.6 }} />

          {/* COPYRIGHT LINE (BOTTOM) */}
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            © 2026 <strong style={{ color: 'var(--text-primary)' }}>Friends Mobile</strong>. All rights reserved by <strong style={{ color: 'var(--text-primary)' }}>UnitaryX</strong>.
          </p>
        </div>

      </div>
    </footer>
  );
}
