import React from 'react';
import logoImg from '../assets/logo.png';

export default function CompanyLogo({ size = 36, className = "logo-icon" }) {
  return (
    <img 
      src={logoImg} 
      alt="FRIENDS MOBILE Logo" 
      className={className} 
      width={size} 
      height={size} 
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle', 
        flexShrink: 0,
        objectFit: 'contain',
        borderRadius: '50%'
      }} 
    />
  );
}
