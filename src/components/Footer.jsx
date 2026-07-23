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
        
        {/* Showroom Announcement Banner */}
        <div style={{
          background: 'var(--orange-light)',
          border: '1.5px solid rgba(255, 85, 0, 0.3)',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '48px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 8px 30px rgba(255, 85, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#FF5500',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 85, 0, 0.3)',
              flexShrink: 0
            }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: '850', color: 'var(--text-primary)', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                KARUR'S #1 PREMIUM MULTI-BRAND MOBILE SHOWROOM
                <span style={{ 
                  fontSize: '0.72rem', 
                  background: '#16a34a', 
                  color: '#ffffff', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
                  OPEN TODAY
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Visit our Flagship Store or Order Online for Express 30-Min Custom Case Printing!
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} color="#FF5500" /> 9:00 AM – 10:00 PM
            </span>
            <a 
              href="https://wa.me/917448578507" 
              target="_blank" 
              rel="noreferrer"
              style={{
                background: '#FF5500',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(255, 85, 0, 0.3)',
                transition: 'transform 0.2s ease'
              }}
            >
              <MessageSquare size={14} /> Connect With Showroom
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

          {/* Col 2: Showroom Categories */}
          <div className="footer-col">
            <h4 className="footer-title">
              SHOWROOM COLLECTION
            </h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li>
                <a href="#products">
                  <Smartphone size={18} color="#FF5500" style={{ flexShrink: 0 }} /> Flagship Smartphones
                </a>
              </li>
              <li>
                <a href="#customized-covers" style={{ color: '#FF5500', fontWeight: '800' }}>
                  <Palette size={18} color="#FF5500" style={{ flexShrink: 0 }} /> Customized 3D Back Covers
                </a>
              </li>
              <li>
                <a href="#photo-frames">
                  <Frame size={18} color="#FF5500" style={{ flexShrink: 0 }} /> Designer Photo Frames
                </a>
              </li>
              <li>
                <a href="#products">
                  <Watch size={18} color="#FF5500" style={{ flexShrink: 0 }} /> Smart Watches &amp; Bands
                </a>
              </li>
              <li>
                <a href="#products">
                  <Headphones size={18} color="#FF5500" style={{ flexShrink: 0 }} /> Wireless Earbuds &amp; Audio
                </a>
              </li>
              <li>
                <a href="#products">
                  <Zap size={18} color="#FF5500" style={{ flexShrink: 0 }} /> Fast Chargers &amp; Accessories
                </a>
              </li>
            </ul>
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

        {/* Footer Bottom Bar */}
        <div className="footer-bottom" style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          paddingBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center'
        }}>
          {/* SECURE PAYMENTS SECTION (TOP) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '900', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: '4px' }}>SECURE PAYMENTS:</span>
            
            {/* Google Pay / UPI Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#4285F4' }}>G</span>
              <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#EA4335' }}>P</span>
              <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#FBBC05' }}>a</span>
              <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#34A853' }}>y</span>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', marginLeft: '2px' }}>/ UPI</span>
            </div>

            {/* PhonePe Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#5f259f' }}>Phone</span>
              <span style={{ fontSize: '0.74rem', fontWeight: '900', background: '#5f259f', color: '#ffffff', padding: '1px 5px', borderRadius: '4px' }}>Pe</span>
            </div>

            {/* VISA Badge */}
            <div style={{ padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: '900', color: '#1A1F71', fontStyle: 'italic', letterSpacing: '1px' }}>VISA</span>
            </div>

            {/* Mastercard Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EB001B', display: 'inline-block' }}></span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F79E1B', display: 'inline-block', marginLeft: '-4px', opacity: 0.95 }}></span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>Mastercard</span>
            </div>

            {/* Cash On Delivery Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '900' }}>💵 Cash on Delivery</span>
            </div>
          </div>

          {/* COPYRIGHT LINE (BOTTOM) */}
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            © 2026 <strong style={{ color: 'var(--text-primary)' }}>Friends Mobile</strong>. All rights reserved by <strong style={{ color: 'var(--text-primary)' }}>UnitaryX</strong>.
          </p>
        </div>

      </div>
    </footer>
  );
}
