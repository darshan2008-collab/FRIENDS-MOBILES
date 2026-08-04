import React from 'react';

export default function CompanyLogo({ size = 36, className = "logo-icon" }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {/* Background Orange Circle with Thin Black Border */}
      <circle cx="50" cy="50" r="46" fill="#FF5500" stroke="#000000" strokeWidth="2.5" />
      
      {/* Top Black Dot - Perfectly Centered */}
      <circle cx="50" cy="23" r="9" fill="#000000" />
      
      {/* Stylized Bottom 'U' Emblem - Perfectly Symmetrical */}
      <path 
        d="M 24 41 H 39 V 58 C 39 65 44 71 50 71 C 56 71 61 65 61 58 V 41 H 76 V 58 C 76 73 65 86 50 86 C 35 86 24 73 24 58 Z" 
        fill="#000000" 
      />
    </svg>
  );
}
