import React from 'react';

/**
 * Animated Love Heart Wishlist Toggle
 * Features a smooth sliding toggle ball and filling animation
 * tailored with Friends Mobile brand palette and compact sizing.
 */
export default function LoveHeart({ isLiked = false, size = 'sm' }) {
  return (
    <span 
      className={`love-heart-container size-${size} ${isLiked ? 'liked' : ''}`}
      aria-hidden="true"
    >
      <span className="love-heart">
        <span className="round" />
        <span className="bottom" />
      </span>
    </span>
  );
}
