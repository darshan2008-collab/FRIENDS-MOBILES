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
              href="https://wa.me/917448578507" 
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

            <p className="footer-desc" style={{ fontSize: '0.86rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '22px', fontWeight: '500' }}>
              Karur's premier destination for original smartphones, luxury mobile accessories, 100% custom-printed back covers, and premium designer photo frames.
            </p>

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
                <a href="tel:+917448578507" style={{ fontSize: '0.92rem', fontWeight: '800', color: '#FF5500', textDecoration: 'none' }}>
                  +91 74485 78507
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
              
              {/* Google Pay / UPI Official Logo */}
              <div style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <svg width="42" height="16" viewBox="0 0 100 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 19.3C12.5 13.1 17.3 8.3 23.5 8.3C26.6 8.3 29.1 9.5 30.9 11.2L28.1 14C26.9 12.8 25.4 12 23.5 12C19.4 12 16.3 15.3 16.3 19.3C16.3 23.4 19.4 26.6 23.5 26.6C26.2 26.6 27.8 25.5 28.8 24.5C29.7 23.5 30.4 22.1 30.7 20.1H23.5V16.4H35.5C35.7 17.1 35.8 18.1 35.8 19.3C35.8 23 34.8 27.2 30.9 31.1C27.1 35 22.3 35.1 12.5 35.1V19.3Z" fill="#4285F4"/>
                  <path d="M49 14.5H44.6V34H40.7V14.5H36.3V11H49V14.5Z" fill="#5F6368"/>
                  <path d="M51.8 22.5C51.8 17.5 55.4 14.2 59.8 14.2C64.2 14.2 67.8 17.5 67.8 22.5C67.8 27.5 64.2 30.8 59.8 30.8C55.4 30.8 51.8 27.5 51.8 22.5ZM64 22.5C64 19.3 61.9 17.3 59.8 17.3C57.7 17.3 55.6 19.3 55.6 22.5C55.6 25.7 57.7 27.7 59.8 27.7C61.9 27.7 64 25.7 64 22.5Z" fill="#5F6368"/>
                  <path d="M83.8 14.5L75.6 34H71.8L78.6 19L71 14.5H75.3L80.4 25.3L85.5 14.5H83.8Z" fill="#5F6368"/>
                </svg>
                <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#047857', background: '#ecfdf5', padding: '1px 4px', borderRadius: '3px', border: '1px solid #a7f3d0' }}>UPI</span>
              </div>

              {/* PhonePe Official Logo */}
              <div style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" rx="22" fill="#5f259f"/>
                  <path d="M58 24H42C37.6 24 34 27.6 34 32V68C34 72.4 37.6 76 42 76H46V54H54C61.7 54 68 47.7 68 40V34C68 28.5 63.5 24 58 24ZM54 44H46V34H54C57.3 34 60 36.7 60 40C60 43.3 57.3 46 54 46Z" fill="white"/>
                  <path d="M50 76L68 56H56L50 76Z" fill="#a855f7"/>
                </svg>
                <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#5f259f', letterSpacing: '-0.2px' }}>Phone<span style={{ color: '#5f259f' }}>Pe</span></span>
              </div>

              {/* Paytm Official Logo */}
              <div style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <svg width="48" height="14" viewBox="0 0 120 36" fill="none">
                  <path d="M0 4H10.5C15.2 4 18.5 7.1 18.5 11.5C18.5 15.9 15.2 19 10.5 19H5.5V32H0V4ZM5.5 14H10.2C12.3 14 13.8 12.9 13.8 11.5C13.8 10.1 12.3 9 10.2 9H5.5V14Z" fill="#002E6E"/>
                  <path d="M22 14.5C22 11.2 24.6 9 28.2 9C31.8 9 34.4 11.2 34.4 14.5V32H29.1V28.8C27.9 31 25.5 32.5 22.8 32.5C19.2 32.5 16.5 29.9 16.5 26.2C16.5 22.5 19.5 19.9 25.2 19.9H29.1V18.8C29.1 16.2 27.5 14.8 25.1 14.8C23.2 14.8 21.8 15.8 21.4 17.5L16.8 16.5C17.7 13 20.8 9 25.5 9C30.8 9 34.4 12 34.4 17.5V32H29.1V28.8C27.9 31 25.5 32.5 22.8 32.5C19.2 32.5 16.5 29.9 16.5 26.2V14.5Z" fill="#002E6E"/>
                  <path d="M37 9H43L47.5 22.5L52 9H58L49.5 32H44.5L37 9Z" fill="#002E6E"/>
                  <path d="M60 4H76V9.5H68V32H62.5V9.5H60V4Z" fill="#00BAF2"/>
                  <path d="M78 4H83.5V13.5C84.8 10.8 87.5 9 91 9C95 9 97.5 11.8 97.5 16.5V32H92V17.5C92 14.8 90.2 13.5 88 13.5C85.5 13.5 83.5 15.2 83.5 18.5V32H78V4Z" fill="#00BAF2"/>
                </svg>
              </div>

              {/* VISA Official Logo */}
              <div style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <svg width="44" height="15" viewBox="0 0 100 32" fill="none">
                  <path d="M38.8 2.5L25.6 30H17.2L10.5 6.6C10.1 5.1 9.7 4.5 8.4 3.8C6.4 2.7 3.1 1.7 0 1L0.4 0H14.1C15.9 0 17.4 1.2 17.8 3.2L21.2 21L29.6 0H38.8V2.5ZM72.6 20.8C72.7 12.9 61.4 12.4 61.6 8.9C61.7 7.8 62.8 6.6 65.3 6.3C66.5 6.1 69.9 6 73.5 7.6L74.8 1.6C73.1 1 70.8 0.4 67.9 0.4C59.6 0.4 53.7 4.8 53.6 11C53.4 15.6 57.6 18.2 60.8 19.8C64 21.4 65.1 22.4 65.1 23.8C65 25.9 62.4 26.8 60 26.8C55.8 26.8 53.4 25.6 51.5 24.7L50.1 31C52 31.8 55.4 32.5 59 32.5C67.8 32.5 73.6 28.2 73.6 21.4M94.6 30H102L95.5 0H88.7C87.2 0 86 0.9 85.4 2.2L73 30H81.4L83.1 25.4H93.3L94.6 30ZM85.5 19L89.6 7.8L92 19H85.5ZM51 0L44.3 30H36.3L43 0H51Z" fill="#1A1F71"/>
                </svg>
              </div>

              {/* Mastercard Official Logo */}
              <div style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <svg width="24" height="15" viewBox="0 0 38 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#EB001B"/>
                  <circle cx="26" cy="12" r="12" fill="#F79E1B"/>
                  <path d="M19 3.5C21.6 5.7 23.3 8.7 23.3 12C23.3 15.3 21.6 18.3 19 20.5C16.4 18.3 14.7 15.3 14.7 12C14.7 8.7 16.4 5.7 19 3.5Z" fill="#FF5F00"/>
                </svg>
                <span style={{ fontSize: '0.68rem', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.2px' }}>Mastercard</span>
              </div>

              {/* Cash On Delivery Official Badge */}
              <div style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '6px',
                background: '#f0fdf4',
                border: '1px solid #a7f3d0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#16a34a'
              }}>
                <svg width="18" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <path d="M6 12h.01M18 12h.01"/>
                </svg>
                <span style={{ fontSize: '0.68rem', fontWeight: '900', color: '#15803d' }}>COD</span>
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
