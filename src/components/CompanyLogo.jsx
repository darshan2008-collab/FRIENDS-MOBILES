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
      <circle cx="50" cy="50" r="46" fill="#F86900" stroke="#000000" strokeWidth="2.5" />
      
      {/* Top Black Dot */}
      <circle cx="51.5" cy="24" r="14" fill="#000000" />
      
      {/* Stylized Bottom Black 'U' Emblem */}
      <path 
        d="M 23 43 H 48 V 56 C 48 67 56 74 68 64 V 43 H 79 V 60 C 79 84 62 94 45 94 C 28 94 23 80 23 60 Z" 
        fill="#000000" 
      />
    </svg>
  );
}
