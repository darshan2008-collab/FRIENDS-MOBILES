import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Sparkles, Smartphone, Image, Gift, Truck, Bot, ArrowRight, Check, Copy, ShieldCheck, Zap
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';

export default function WelcomeOnboardingModal({ 
  isOpen, 
  onClose, 
  user, 
  onOpenCustomCover, 
  onOpenCustomFrame,
  addToast 
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;
  const portalContainer = document.body || document.getElementById('root') || document.documentElement;
  if (!portalContainer) return null;

  const features = [
    {
      icon: <Smartphone size={28} color="#FF5500" />,
      title: '3D Custom Back Cover Studio',
      description: 'Upload your favorite photos, customize with text & preview live 3D prints on 100+ mobile models (iPhone, Samsung, Vivo, Oppo, Realme & more).',
      badge: 'POPULAR',
      actionText: 'Try 3D Cover Studio',
      action: () => {
        onClose();
        if (onOpenCustomCover) onOpenCustomCover();
      }
    },
    {
      icon: <Image size={28} color="#FF5500" />,
      title: 'Personalized Photo Frames',
      description: 'Create high-definition acrylic & wooden wall frames with your memories. Perfect for birthday & anniversary gifting.',
      badge: 'GIFTS',
      actionText: 'Explore Photo Frames',
      action: () => {
        onClose();
        if (onOpenCustomFrame) onOpenCustomFrame();
      }
    },
    {
      icon: <Gift size={28} color="#FF5500" />,
      title: 'Friends Rewards & Cashback',
      description: 'Earn 150 bonus reward points automatically on your first order! Redeem points for instant discounts on future purchases.',
      badge: 'REWARDS',
      actionText: 'View Member Perks',
      action: null
    },
    {
      icon: <Truck size={28} color="#FF5500" />,
      title: 'Express Delivery & Cash on Delivery',
      description: 'Fast shipping across 19,000+ pin codes in India with real-time SMS & WhatsApp order status tracking.',
      badge: 'PAN-INDIA',
      actionText: 'Shop All Accessories',
      action: () => onClose()
    },
    {
      icon: <Bot size={28} color="#FF5500" />,
      title: '24/7 AI Customer Support',
      description: 'Need assistance with your phone model or order? Our AI Assistant is available 24/7 at the bottom right corner.',
      badge: '24/7 CARE',
      actionText: 'Got It!',
      action: () => onClose()
    }
  ];

  const handleCopyCoupon = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('WELCOME100');
      setCopiedCoupon(true);
      if (addToast) addToast('Welcome Coupon WELCOME100 copied to clipboard! ₹100 OFF applied.', 'success');
      setTimeout(() => setCopiedCoupon(false), 3000);
    }
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Valued Member';

  return createPortal(
    <div className="welcome-onboarding-portal">
      <div className="welcome-backdrop" onClick={onClose} />
      
      <div className="welcome-card animate-scale-up">
        {/* Header Ribbon */}
        <div className="welcome-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CompanyLogo size={36} />
            <div>
              <div className="welcome-pill-badge">
                <Sparkles size={13} /> WELCOME PRIVILEGES
              </div>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                Welcome to FRIENDS <span style={{ color: '#FF5500' }}>MOBILE</span>, {userName}!
              </h2>
            </div>
          </div>

          <button onClick={onClose} className="welcome-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Coupon Highlight Box */}
        <div className="welcome-coupon-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="welcome-coupon-icon">
              <Zap size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                NEW MEMBER EXCLUSIVE GIFT
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '900' }}>
                Get ₹100 OFF on Your First Order!
              </div>
            </div>
          </div>

          <button onClick={handleCopyCoupon} className="welcome-coupon-code-btn">
            <code>WELCOME100</code>
            {copiedCoupon ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Feature Highlights Grid / Tabs */}
        <div className="welcome-body">
          <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#64748B', fontWeight: '600' }}>
            Here is your quick guide to get the most out of your shopping experience:
          </p>

          <div className="welcome-features-list">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className={`welcome-feature-card ${activeStep === idx ? 'active' : ''}`}
                onClick={() => setActiveStep(idx)}
              >
                <div className="welcome-feat-header">
                  <div className="welcome-feat-icon-box">
                    {feat.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="welcome-feat-badge">{feat.badge}</span>
                      <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#1e293b' }}>
                        {feat.title}
                      </h3>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#64748b', lineHeight: '1.5' }}>
                      {feat.description}
                    </p>
                  </div>
                </div>

                {feat.actionText && feat.action && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      feat.action();
                    }}
                    className="welcome-feat-action-btn"
                  >
                    {feat.actionText} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="welcome-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>
            <ShieldCheck size={16} color="#10B981" /> 100% Genuine Quality Guarantee
          </div>

          <button onClick={onClose} className="welcome-main-btn">
            Start Shopping Now <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>,
    portalContainer
  );
}
