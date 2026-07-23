import React from 'react';
import { CheckCircle2, Truck, CreditCard, RefreshCw, Headphones } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    { title: '100% Original', desc: 'Genuine Products', icon: CheckCircle2 },
    { title: 'Fast Delivery', desc: 'Across India', icon: Truck },
    { title: 'Secure Payment', desc: '100% Secure', icon: CreditCard },
    { title: '7 Days Return', desc: 'Easy Returns', icon: RefreshCw },
    { title: 'Best Support', desc: '24/7 Support', icon: Headphones },
  ];

  return (
    <section className="guarantees-section">
      <div className="container guarantees-grid">
        {badges.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="guarantee-item">
              <div className="guarantee-icon">
                <Icon size={22} className="guarantee-svg" />
              </div>
              <div className="guarantee-text">
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
