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

            <p className="footer-desc" style={{ fontSize: '0.88rem', lineHeight: '1.65', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Karur's premier destination for original smartphones, luxury mobile accessories, 100% custom-printed back covers, and premium designer photo frames.
            </p>

            {/* Showroom Assurance Tags */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#22c55e" /> 100% Original Brand Guarantee
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#22c55e" /> Real-time 3D Phone Case Studio
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#22c55e" /> Pan-India Express Delivery
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
            <h4 className="footer-title" style={{ fontSize: '0.92rem', fontWeight: '850', color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase', borderBottom: '2px solid #FF5500', display: 'inline-block', paddingBottom: '4px' }}>
              SHOWROOM COLLECTION
            </h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a href="#products" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                  <Smartphone size={16} color="#FF5500" /> Flagship Smartphones
                </a>
              </li>
              <li>
                <a href="#customized-covers" style={{ color: '#FF5500', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                  <Palette size={16} color="#FF5500" /> Customized 3D Back Covers
                </a>
              </li>
              <li>
                <a href="#photo-frames" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                  <Frame size={16} color="#FF5500" /> Designer Photo Frames
                </a>
              </li>
              <li>
                <a href="#products" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                  <Watch size={16} color="#FF5500" /> Smart Watches &amp; Bands
                </a>
              </li>
              <li>
                <a href="#products" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                  <Headphones size={16} color="#FF5500" /> Wireless Earbuds &amp; Audio
                </a>
              </li>
              <li>
                <a href="#products" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s ease' }}>
                  <Zap size={16} color="#FF5500" /> Fast Chargers &amp; Accessories
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Services */}
          <div className="footer-col">
            <h4 className="footer-title" style={{ fontSize: '0.92rem', fontWeight: '850', color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase', borderBottom: '2px solid #FF5500', display: 'inline-block', paddingBottom: '4px' }}>
              CUSTOMER CARE
            </h4>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '16px' }}>
              <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Help Center &amp; FAQs</a></li>
              <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Store Pickup &amp; Express Delivery</a></li>
              <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Returns &amp; Replacement Policy</a></li>
              <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Terms &amp; Conditions</a></li>
              <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '600' }}>Cancellation &amp; Refunds</a></li>
            </ul>
          </div>

          {/* Col 4: Showroom Contact & Live Address Card */}
          <div className="footer-col contact-col">
            <h4 className="footer-title" style={{ fontSize: '0.92rem', fontWeight: '850', color: 'var(--text-primary)', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase', borderBottom: '2px solid #FF5500', display: 'inline-block', paddingBottom: '4px' }}>
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
          paddingTop: '24px',
          paddingBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            © 2026 <strong style={{ color: 'var(--text-primary)' }}>Friends Mobile</strong>. All rights reserved by <strong style={{ color: 'var(--text-primary)' }}>UnitaryX</strong>.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>SECURE PAYMENTS:</span>
            {['UPI / GPAY', 'PHONEPE', 'VISA', 'MASTERCARD', 'CASH ON DELIVERY'].map((pay, idx) => (
              <span key={idx} style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                fontWeight: '800',
                letterSpacing: '0.5px'
              }}>
                {pay}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
