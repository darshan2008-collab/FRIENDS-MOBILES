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
            <div className="social-links" style={{ display: 'flex', gap: '10px' }}>
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
            <h4 className="footer-title">
              SHOWROOM LOCATION
            </h4>

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
          paddingTop: '24px',
          paddingBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          textAlign: 'center'
        }}>
          {/* AMAZON & FLIPKART STYLE PAYMENT SECTION */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: '850',
              color: 'var(--text-secondary)',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              <ShieldCheck size={16} color="#22c55e" />
              100% SECURE &amp; TRUSTED PAYMENTS
            </div>

            {/* Single Horizontal Row of Flipkart/Amazon Style Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              maxWidth: '100%'
            }}>
              
              {/* Google Pay / UPI */}
              <div style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#4285F4' }}>G</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#EA4335' }}>P</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#FBBC05' }}>a</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#34A853' }}>y</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', marginLeft: '3px' }}>UPI</span>
              </div>

              {/* PhonePe */}
              <div style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#5f259f' }}>Phone</span>
                <span style={{ fontSize: '0.72rem', fontWeight: '900', background: '#5f259f', color: '#ffffff', padding: '1px 5px', borderRadius: '4px' }}>Pe</span>
              </div>

              {/* Paytm */}
              <div style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#002e6e', letterSpacing: '-0.3px' }}>Pay<span style={{ color: '#00baf2' }}>tm</span></span>
              </div>

              {/* VISA */}
              <div style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#1A1F71', fontStyle: 'italic', letterSpacing: '1px' }}>VISA</span>
              </div>

              {/* Mastercard */}
              <div style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EB001B', display: 'inline-block' }}></span>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F79E1B', display: 'inline-block', marginLeft: '-4px', opacity: 0.95 }}></span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e293b' }}>Mastercard</span>
              </div>

              {/* Cash On Delivery */}
              <div style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '6px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#16a34a'
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800' }}>🚚 Cash on Delivery</span>
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
