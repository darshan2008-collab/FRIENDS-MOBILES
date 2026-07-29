import React from 'react';
import { CheckCircle2, Truck, RefreshCw, Headphones } from 'lucide-react';

export default function TrustBadges({ t = (k) => k, language = 'en' }) {
  const isTamil = language === 'ta';

  const badges = [
    { 
      title: t('genuineProducts') || (isTamil ? '100% அசல் தயாரிப்புகள்' : '100% Original'), 
      desc: isTamil ? 'அனைத்தும் ஒரிஜினல்' : 'Genuine Products', 
      icon: CheckCircle2 
    },
    { 
      title: t('fastShipping') || (isTamil ? 'வேகமான எக்ஸ்பிரஸ் டெலிவரி' : 'Fast Delivery'), 
      desc: isTamil ? 'இந்தியா முழுவதும்' : 'Across India', 
      icon: Truck 
    },
    { 
      title: t('easyReturns') || (isTamil ? 'எளிதான 7 நாட்கள் பரிமாற்றம்' : '7 Days Return'), 
      desc: isTamil ? 'எளிதான ரிட்டர்ன்ஸ்' : 'Easy Returns', 
      icon: RefreshCw 
    },
    { 
      title: t('care247') || (isTamil ? '24/7 சேவை ஆதரவு' : 'Best Support'), 
      desc: isTamil ? '24/7 வாடிக்கையாளர் சேவை' : '24/7 Support', 
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
