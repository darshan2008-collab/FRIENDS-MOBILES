import React from 'react';
import { CheckCircle2, Truck, RefreshCw, Headphones } from 'lucide-react';

export default function TrustBadges({ t = (k) => k }) {
  const badges = [
    { 
      title: t('genuineProducts') || '100% Original', 
      desc: 'Genuine Products', 
      icon: CheckCircle2 
    },
    { 
      title: t('fastShipping') || 'Fast Delivery', 
      desc: 'Across India', 
      icon: Truck 
    },
    { 
      title: t('easyReturns') || '7 Days Return', 
      desc: 'Easy Returns', 
      icon: RefreshCw 
    },
    { 
      title: t('care247') || 'Best Support', 
      desc: '24/7 Support', 
      icon: Headphones 
    },
  ];

  return (
    <section className="guarantees-section">
      <div className="container guarantees-grid">
        {badges.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="guarantee-item">
              <div className="guarantee-icon">
                <Icon size={20} className="guarantee-svg" />
              </div>
              <div className="guarantee-text" style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                <h4 style={{ margin: '0 0 2px 0', wordBreak: 'normal', overflowWrap: 'break-word', whiteSpace: 'normal', lineHeight: '1.25' }}>{b.title}</h4>
                <p style={{ margin: 0, wordBreak: 'normal', overflowWrap: 'break-word', whiteSpace: 'normal', lineHeight: '1.15' }}>{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
