import React, { useState } from 'react';
import { Gift, Award, Sparkles, CheckCircle2, Copy, ArrowRight, Tag, ShieldCheck, Zap } from 'lucide-react';

export const REWARD_COUPONS = [
  {
    id: 'c1',
    code: 'FRIENDS10',
    title: 'Bronze Reward - 10% OFF',
    discountPct: 10,
    flatDiscount: 0,
    pointsRequired: 100,
    minOrderValue: 299,
    desc: 'Get 10% OFF on all mobile accessories & back covers.',
    badgeColor: '#cd7f32',
    bgGradient: 'linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05))'
  },
  {
    id: 'c2',
    code: 'FRIENDS15',
    title: 'Silver Reward - 15% OFF',
    discountPct: 15,
    flatDiscount: 0,
    pointsRequired: 200,
    minOrderValue: 499,
    desc: 'Get 15% OFF on orders above ₹499.',
    badgeColor: '#64748b',
    bgGradient: 'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(100, 116, 139, 0.05))'
  },
  {
    id: 'c3',
    code: 'FRIENDS20',
    title: 'Gold Reward - 20% OFF',
    discountPct: 20,
    flatDiscount: 0,
    pointsRequired: 300,
    minOrderValue: 799,
    desc: 'Get 20% OFF on orders above ₹799.',
    badgeColor: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(234, 179, 8, 0.05))'
  },
  {
    id: 'c4',
    code: 'SUPER200',
    title: 'VIP Reward - FLAT ₹200 OFF',
    discountPct: 0,
    flatDiscount: 200,
    pointsRequired: 500,
    minOrderValue: 999,
    desc: 'Get Flat ₹200 OFF on orders above ₹999.',
    badgeColor: '#FF5500',
    bgGradient: 'linear-gradient(135deg, rgba(255, 85, 0, 0.18), rgba(255, 85, 0, 0.05))'
  }
];

export default function RewardsTab({ currentUser, onUpdateUserProfile, addToast, onOpenCheckout }) {
  const [copiedCode, setCopiedCode] = useState('');

  const currentPoints = currentUser?.rewardPoints || 150; // Welcome points default
  const claimedCoupons = currentUser?.claimedCoupons || [];
  const pointHistory = currentUser?.pointHistory || [
    { id: 1, type: 'credit', points: 50, title: 'Welcome Bonus Points', date: 'Just Now' },
    { id: 2, type: 'credit', points: 100, title: 'First Order Reward Bonus', date: 'Just Now' }
  ];

  const handleClaimCoupon = (coupon) => {
    if (currentPoints < coupon.pointsRequired) {
      if (addToast) addToast(`You need ${coupon.pointsRequired - currentPoints} more points to claim this coupon!`, '⚠️');
      return;
    }

    if (claimedCoupons.some(c => c.code === coupon.code)) {
      if (addToast) addToast(`You have already claimed coupon "${coupon.code}"!`, 'ℹ️');
      return;
    }

    const updatedPoints = currentPoints - coupon.pointsRequired;
    const updatedClaimed = [...claimedCoupons, { ...coupon, claimedAt: new Date().toISOString() }];
    const updatedHistory = [
      { id: Date.now(), type: 'debit', points: coupon.pointsRequired, title: `Claimed ${coupon.title} (${coupon.code})`, date: 'Just Now' },
      ...pointHistory
    ];

    const updatedUser = {
      ...currentUser,
      rewardPoints: updatedPoints,
      claimedCoupons: updatedClaimed,
      pointHistory: updatedHistory
    };

    if (onUpdateUserProfile) {
      onUpdateUserProfile(updatedUser);
    }

    if (addToast) addToast(`Successfully claimed coupon "${coupon.code}"! Used ${coupon.pointsRequired} Points.`, '🎉');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (addToast) addToast(`Copied Coupon Code: ${code}`, '📋');
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Points Overview Card */}
      <div style={{
        background: 'linear-gradient(135deg, #FF5500 0%, #E04400 100%)',
        borderRadius: '20px',
        padding: '24px',
        color: '#ffffff',
        boxShadow: '0 10px 30px rgba(255, 85, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} /> FRIENDS LOYALTY REWARDS BALANCE
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', margin: '4px 0 0 0', lineHeight: 1 }}>
              {currentPoints} <span style={{ fontSize: '1.2rem', fontWeight: '700', opacity: 0.9 }}>PTS</span>
            </h2>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.18)', padding: '10px 16px', borderRadius: '12px', backdropFilter: 'blur(8px)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.9, fontWeight: '700' }}>EARNING RATE</span>
            <strong style={{ fontSize: '0.95rem' }}>₹10 Spent = 1 Point 🎁</strong>
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', opacity: 0.95, lineHeight: 1.5, background: 'rgba(0, 0, 0, 0.15)', padding: '10px 14px', borderRadius: '10px' }}>
          ✨ Continuously order at Friends Mobile to earn points! Redeem points for <strong>10%, 15%, 20% OFF and Flat ₹200 OFF Coupons</strong>.
        </div>
      </div>

      {/* Claimable Reward Coupons Section */}
      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gift size={18} color="#FF5500" /> Available Points Redemption Coupons
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {REWARD_COUPONS.map(coupon => {
            const isClaimed = claimedCoupons.some(c => c.code === coupon.code);
            const canAfford = currentPoints >= coupon.pointsRequired;

            return (
              <div 
                key={coupon.id} 
                style={{
                  background: coupon.bgGradient,
                  border: `1.5px solid ${coupon.badgeColor}`,
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ background: coupon.badgeColor, color: '#ffffff', fontSize: '0.68rem', fontWeight: '900', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    {coupon.title}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#FF5500' }}>
                    {coupon.pointsRequired} PTS
                  </span>
                </div>

                <div style={{ margin: '6px 0 14px 0' }}>
                  <strong style={{ fontSize: '1.2rem', display: 'block', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                    {coupon.code}
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    {coupon.desc} (Min. Order ₹{coupon.minOrderValue})
                  </p>
                </div>

                {isClaimed ? (
                  <button
                    type="button"
                    onClick={() => handleCopyCode(coupon.code)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #22c55e',
                      background: 'rgba(34,197,94,0.1)',
                      color: '#22c55e',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={14} /> {copiedCode === coupon.code ? 'Copied!' : 'Claimed - Copy Code'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClaimCoupon(coupon)}
                    disabled={!canAfford}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: canAfford ? '#FF5500' : 'var(--border-color)',
                      color: canAfford ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={14} /> {canAfford ? `Claim for ${coupon.pointsRequired} PTS` : `Need ${coupon.pointsRequired - currentPoints} More PTS`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Points History Log */}
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 12px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={16} color="#FF5500" /> Reward Points History Log
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pointHistory.slice(0, 5).map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-primary)' }}>{item.title}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.date}</span>
              </div>
              <span style={{ fontWeight: '900', fontSize: '0.88rem', color: item.type === 'credit' ? '#22c55e' : '#ef4444' }}>
                {item.type === 'credit' ? `+${item.points} PTS` : `-${item.points} PTS`}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
