import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Heart, Star, Sparkles, User, MessageSquare, Send, Calendar, Camera, Smartphone, ChevronLeft, ChevronRight, ZoomIn, Check, Zap, ShieldCheck, Share2, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { getApiBaseUrl } from '../data/apiConfig';

const API_BASE = getApiBaseUrl();
export default function ProductDetailModal({
  product,
  products = [],
  wishlist = [],
  onClose,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  t = (k) => k
}) {
  const [reviewsList, setReviewsList] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5 });
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [zoomPhoto, setZoomPhoto] = useState(null);

  const [selectedImage, setSelectedImage] = useState('');
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [selectedSize, setSelectedSize] = useState('Standard');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const horizontalScrollRef = useRef(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!product) return;
    setReviewsList(product.reviewsList || []);
    setSelectedPhoto(null);
    setSelectedImage(product.img || '');
    const titleLower = String(product.title || '').toLowerCase();
    const catLower = String(product.category || '').toLowerCase();
    const sizes = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : (catLower === 'covers' || titleLower.includes('cover') || titleLower.includes('pouch')
          ? ['Universal (Up to 6.8")', 'Standard (5.5" - 6.1")', 'Pro / Max (6.7" - 6.9")']
          : ['Standard Pack (1 Metre)', 'Pro Pack (2 Metres)', 'Extended Pack (3 Metres)']);
    setSelectedSize(sizes[0] || 'Standard');
  }, [product]);

  if (!product) return null;

  const productTitleLower = product && product.title ? String(product.title).toLowerCase() : '';
  const productCategoryLower = product && product.category ? String(product.category).toLowerCase() : '';

  const defaultSizesList = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : (productCategoryLower === 'covers' || productTitleLower.includes('cover') || productTitleLower.includes('pouch') || productTitleLower.includes('water proof') || productTitleLower.includes('waterproof')
        ? ['Universal (Up to 6.8")', 'Standard (5.5" - 6.1")', 'Pro / Max (6.7" - 6.9")']
        : ['Standard Pack (1 Metre)', 'Pro Pack (2 Metres)', 'Extended Pack (3 Metres)']
      );

  // Lock body scroll when ProductDetailModal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const galleryImages = (product.images && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [
        product.img,
        product.img,
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=600&auto=format&fit=crop'
      ].filter(Boolean);

  const scrollHorizontal = (direction) => {
    if (horizontalScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      horizontalScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isLiked = wishlist && Array.isArray(wishlist) ? wishlist.includes(product.id) : false;
  const exploreProducts = (products || []).filter(p => p && p.id !== product.id);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    const reviewToAdd = {
      id: Date.now(),
      name: newReview.name,
      comment: newReview.comment,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      photo: selectedPhoto
    };

    const updatedReviewsList = [reviewToAdd, ...reviewsList];
    setReviewsList(updatedReviewsList);
    setNewReview({ name: '', comment: '', rating: 5 });
    setSelectedPhoto(null);

    const totalReviews = updatedReviewsList.length;
    const averageRating = parseFloat(
      (updatedReviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    );

    try {
      await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewsList: updatedReviewsList,
          reviews: totalReviews,
          rating: averageRating
        })
      });

      product.reviewsList = updatedReviewsList;
      product.reviews = totalReviews;
      product.rating = averageRating;
    } catch (err) {
      console.error("Failed to save review dynamically to server", err);
    }
  };

  const getProductShareUrl = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      return `${origin}${pathname}?product=${product.id || product._id || ''}`;
    }
    return `https://friendsmobiles.co.in/?product=${product.id}`;
  };

  const shareUrl = getProductShareUrl();
  const shareTitle = product.title || 'FRIENDS MOBILE Product';
  const shareText = `🔥 Check out "${shareTitle}" on FRIENDS MOBILE for just ₹${product.price?.toLocaleString('en-IN') || ''}${product.discount ? ` (${product.discount} OFF)` : ''}!\n\nBuy now: ${shareUrl}`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  const handleNativeShare = () => {
    setIsShareModalOpen(true);
  };

  if (!product || typeof document === 'undefined') return null;
  const portalContainer = document.body || document.getElementById('root') || document.documentElement;
  if (!portalContainer) return null;

  return createPortal(
    <div className="product-detail-overlay" onClick={onClose}>
      <div 
        className="product-detail-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Header */}
        <header style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--primary-orange)', display: 'flex' }}><Sparkles size={18} /></span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
              {product.category.toUpperCase()} PRODUCT DETAILS
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button"
              onClick={handleNativeShare}
              style={{
                background: 'rgba(255, 85, 0, 0.12)',
                color: '#FF5500',
                border: '1px solid rgba(255, 85, 0, 0.3)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Share Product Link"
            >
              <Share2 size={15} color="#FF5500" /> Share Product
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', padding: '4px' }}>
              <X size={22} />
            </button>
          </div>
        </header>

        {/* Scrollable Details Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1100px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          
          {/* Main Detail Row: Amazon/Flipkart Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            
             {/* Left Column: Amazon/Flipkart Multi-Image Gallery + Magnifier Lens */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              
              {/* Vertical Side Thumbnails Strip (Desktop & Mobile) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '8px',
                      border: (selectedImage || product.img) === imgUrl ? '2px solid var(--primary-orange)' : '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      padding: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedImage === imgUrl ? '0 4px 12px rgba(255, 85, 0, 0.2)' : 'none',
                      outline: 'none'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop';
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Main Hero Product Image + Hover Magnifier Lens */}
              <div 
                style={{
                  flex: 1,
                  minWidth: '240px',
                  background: 'var(--bg-input)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  minHeight: '340px',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  cursor: 'zoom-in'
                }}
                onMouseEnter={() => setIsHoveringZoom(true)}
                onMouseLeave={() => setIsHoveringZoom(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsLightboxOpen(true)}
              >
                <span className="discount-badge" style={{ top: '16px', left: '16px', zIndex: 3 }}>{product.discount}</span>
                
                {/* Floating Product Image Share Badge (Top Right of Image) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsShareModalOpen(true);
                  }}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 5,
                    background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '7px 14px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 85, 0, 0.45)',
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.2s ease'
                  }}
                  title="Share Product Link"
                >
                  <Share2 size={15} color="#ffffff" /> Share
                </button>
                
                {/* Hover to Zoom Helper Badge */}
                <span style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 3
                }}>
                  <ZoomIn size={12} /> Hover to Zoom • Click for Fullscreen
                </span>

                <img 
                  src={selectedImage || product.img} 
                  alt={product.title} 
                  style={{
                    maxHeight: '300px',
                    objectFit: 'contain',
                    width: '100%',
                    transition: isHoveringZoom ? 'none' : 'transform 0.3s ease',
                    transform: isHoveringZoom ? 'scale(2.2)' : 'scale(1)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop';
                  }}
                />
              </div>

            </div>

            {/* Right Column: Meta Info & Amazon Size Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1.25 }}>
                {product.title}
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', color: '#ffb800', gap: '2px' }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={15} fill={i < Math.floor(product.rating || 5) ? '#ffb800' : 'none'} stroke="currentColor" />
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {product.rating || 5.0} ({reviewsList.length} reviews)
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: product.inStock ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: product.inStock ? '#10b981' : '#ef4444',
                  fontWeight: 700
                }}>
                  {product.inStock ? '● In Stock' : '○ Out of Stock'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <span style={{ fontSize: '1rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-orange)', marginLeft: '4px' }}>
                  Save {product.discount}
                </span>
              </div>

              {/* Direct Social Share Pills */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap',
                background: 'rgba(255, 85, 0, 0.05)',
                padding: '8px 12px',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 85, 0, 0.3)'
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FF5500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Share2 size={14} color="#FF5500" /> Share:
                </span>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                  }}
                  title="Share product on WhatsApp"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.487 1.332 5.003l-1.417 5.176 5.302-1.39a9.943 9.943 0 0 0 4.77 1.215h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.037-5.176-2.924-7.062a9.923 9.923 0 0 0-7.066-2.945zm.004 18.155h-.003a8.27 8.27 0 0 1-4.218-1.157l-.302-.18-3.136.822.836-3.056-.197-.314a8.27 8.27 0 0 1-1.272-4.436c0-4.568 3.717-8.283 8.286-8.283 2.213 0 4.293.862 5.858 2.428a8.243 8.243 0 0 1 2.427 5.856c0 4.569-3.718 8.284-8.281 8.284z"/></svg>
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: copiedLink ? '#22c55e' : 'var(--bg-card)',
                    color: copiedLink ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Copy direct product link"
                >
                  {copiedLink ? <CheckCircle2 size={13} color="#ffffff" /> : <Copy size={13} />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    background: '#1877F2',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Share product on Facebook"
                >
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: 'var(--bg-card)',
                    color: '#FF5500',
                    border: '1px solid #FF5500',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="More social sharing options"
                >
                  More...
                </button>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '20px' }}>
                {product.description || "Premium mobile electronics & customized studio accessories from FRIENDS MOBILE. High durability with standard local brand warranty."}
              </p>

              {/* Amazon / Flipkart Style Size / Specification Selector */}
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Select Size / Model Spec:
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#FF5500', fontWeight: '800' }}>
                    Selected: {selectedSize}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {defaultSizesList.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: selectedSize === size ? '2px solid #FF5500' : '1px solid var(--border-color)',
                        background: selectedSize === size ? 'rgba(255, 85, 0, 0.1)' : 'var(--bg-card)',
                        color: selectedSize === size ? '#FF5500' : 'var(--text-primary)',
                        fontWeight: '800',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        outline: 'none'
                      }}
                    >
                      {size}
                      {selectedSize === size && <Check size={14} color="#FF5500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, gap: '10px', height: '48px', fontSize: '0.95rem', minWidth: '180px' }} 
                  onClick={() => {
                    onAddToCart({ ...product, selectedSize });
                    onClose();
                  }}
                  disabled={!product.inStock}
                >
                  <ShoppingBag size={18} /> ADD TO CART ({selectedSize})
                </button>
                <button 
                  className={`wishlist-icon-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => onToggleWishlist(product)}
                  style={{ width: '48px', height: '48px', border: '1px solid var(--border-color)', borderRadius: '12px', flexShrink: 0 }}
                  title="Add to Wishlist"
                >
                  <Heart size={20} fill={isLiked ? '#FF5500' : 'none'} color={isLiked ? '#FF5500' : 'currentColor'} />
                </button>
                <button 
                  type="button"
                  onClick={handleNativeShare}
                  style={{ 
                    height: '48px', 
                    padding: '0 18px',
                    border: '1.5px solid #FF5500', 
                    borderRadius: '12px',
                    background: 'rgba(255, 85, 0, 0.08)',
                    color: '#FF5500',
                    fontWeight: '800',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  title="Share Product Link"
                >
                  <Share2 size={18} color="#FF5500" /> SHARE
                </button>
              </div>

              {/* Instant Social Share Bar */}
              <div style={{
                marginTop: '14px',
                padding: '12px 14px',
                background: 'var(--bg-input)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Share2 size={14} color="#FF5500" /> Quick Share:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.487 1.332 5.003l-1.417 5.176 5.302-1.39a9.943 9.943 0 0 0 4.77 1.215h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.037-5.176-2.924-7.062a9.923 9.923 0 0 0-7.066-2.945zm.004 18.155h-.003a8.27 8.27 0 0 1-4.218-1.157l-.302-.18-3.136.822.836-3.056-.197-.314a8.27 8.27 0 0 1-1.272-4.436c0-4.568 3.717-8.283 8.286-8.283 2.213 0 4.293.862 5.858 2.428a8.243 8.243 0 0 1 2.427 5.856c0 4.569-3.718 8.284-8.281 8.284z"/></svg>
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: copiedLink ? '#22c55e' : 'var(--bg-card)',
                      color: copiedLink ? '#ffffff' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {copiedLink ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.76rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    More...
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Overview & Specifications Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Sparkles size={18} color="#FF5500" /> Product Overview &amp; Specifications
            </h3>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ background: '#FF5500', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', flexShrink: 0 }}><Check size={14} /></span>
                <div>
                  <strong style={{ fontSize: '0.84rem', display: 'block', color: 'var(--text-primary)' }}>100% Genuine Quality</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tested &amp; certified with Friends Mobile guarantee</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ background: '#3b82f6', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', flexShrink: 0 }}><Zap size={14} /></span>
                <div>
                  <strong style={{ fontSize: '0.84rem', display: 'block', color: 'var(--text-primary)' }}>High Efficiency &amp; Speed</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Optimized power output &amp; high durability</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ background: '#22c55e', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', flexShrink: 0 }}><ShieldCheck size={14} /></span>
                <div>
                  <strong style={{ fontSize: '0.84rem', display: 'block', color: 'var(--text-primary)' }}>Showroom Warranty</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>6 Months official showroom support &amp; service</span>
                </div>
              </div>
            </div>

            {/* Specifications Specs Table */}
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', fontWeight: '800', fontSize: '0.84rem' }}>
                Technical Details &amp; Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', padding: '14px 16px', gap: '12px', fontSize: '0.8rem' }}>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Category:</span><strong style={{ color: 'var(--text-primary)' }}>{product.category}</strong></div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Brand:</span><strong style={{ color: 'var(--text-primary)' }}>FRIENDS MOBILE Original</strong></div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Warranty:</span><strong style={{ color: 'var(--text-primary)' }}>6 Months Showroom Warranty</strong></div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Compatibility:</span><strong style={{ color: 'var(--text-primary)' }}>Universal Android &amp; iOS</strong></div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>In The Box:</span><strong style={{ color: 'var(--text-primary)' }}>1x {product.title}, Tax Invoice</strong></div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Stock Status:</span><strong style={{ color: product.inStock ? '#22c55e' : '#ef4444' }}>{product.inStock ? 'In Stock (Ready to Dispatch)' : 'Out of Stock'}</strong></div>
              </div>
            </div>
          </div>

          {/* Similar Products You May Also Like Section */}
          {products && products.filter(p => p.category === product.category && p.id !== product.id).length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <ShoppingBag size={18} color="#FF5500" /> Similar Products You May Also Like
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(sim => (
                  <div key={sim.id} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'space-between' }}>
                    <div style={{ width: '100%', height: '120px', borderRadius: '10px', overflow: 'hidden', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={sim.img} alt={sim.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sim.title}</strong>
                      <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#FF5500', display: 'block', marginTop: '4px' }}>₹{sim.price}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectProduct && onSelectProduct(sim)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#FF5500', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 650, letterSpacing: '-0.025em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} /> Customer Feedback &amp; Reviews
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Left Form: Add Review */}
              <form onSubmit={handleReviewSubmit} style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: 'fit-content' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Write a Review</h4>
                
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Your Rating</label>
                  <div style={{ display: 'flex', color: '#ffb800', gap: '4px', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <Star 
                        key={stars} 
                        size={20} 
                        fill={(hoverRating || newReview.rating) >= stars ? '#ffb800' : 'none'} 
                        stroke="currentColor"
                        onMouseEnter={() => setHoverRating(stars)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: stars }))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    required 
                    value={newReview.name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <textarea 
                    placeholder="What did you think of the product?..." 
                    required 
                    rows="3"
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'none' }}
                  />
                </div>

                {/* Photo Upload Area */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Add Photo (Optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      border: '1px dashed var(--border-color)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: 'var(--text-secondary)'
                    }}>
                      <Camera size={14} style={{ color: 'var(--primary-orange)' }} /> {selectedPhoto ? "Change Photo" : "Upload Image"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {selectedPhoto && (
                      <div style={{ position: 'relative', width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={selectedPhoto} alt="Review Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={() => setSelectedPhoto(null)} 
                          style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', padding: '1px', cursor: 'pointer', fontSize: '8px', display: 'flex' }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', gap: '6px' }}>
                  <Send size={14} /> Submit Feedback
                </button>
              </form>

              {/* Right: Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {reviewsList.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '20px' }}>No reviews yet. Be the first to review!</p>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                          <User size={13} style={{ color: 'var(--primary-orange)' }} /> {rev.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {rev.date}
                        </span>
                      </div>
                      <div style={{ display: 'flex', color: '#ffb800', gap: '2px', marginBottom: '6px' }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? '#ffb800' : 'none'} stroke="currentColor" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rev.comment}</p>
                      {rev.photo && (
                        <div style={{ marginTop: '10px', maxWidth: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex' }}>
                          <img 
                            src={rev.photo} 
                            alt="Customer upload" 
                            style={{ width: '100%', display: 'block', maxHeight: '90px', objectFit: 'cover', cursor: 'pointer' }} 
                            onClick={() => setZoomPhoto(rev.photo)}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* Explore Other Products & Category Related Storefront Section */}
          {exploreProducts.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <Smartphone size={18} color="#FF5500" /> Explore Other Products
                </h3>

                {/* Horizontal Navigation & Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    type="button" 
                    onClick={() => scrollHorizontal('left')}
                    aria-label="Scroll left"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF5500'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => scrollHorizontal('right')}
                    aria-label="Scroll right"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF5500'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div 
                ref={horizontalScrollRef}
                className="horizontal-product-scroll"
                style={{ 
                  display: 'flex', 
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  gap: '14px', 
                  padding: '4px 4px 14px 4px',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth'
                }}
              >
                {exploreProducts.map((otherProd) => (
                  <div 
                    key={otherProd.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(otherProd);
                    }}
                    style={{
                      flex: '0 0 170px',
                      minWidth: '170px',
                      maxWidth: '170px',
                      scrollSnapAlign: 'start',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FF5500';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {otherProd.discount && (
                      <span className="badge-discount" style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.68rem', padding: '2px 6px' }}>
                        {otherProd.discount}
                      </span>
                    )}

                    <div style={{ width: '100%', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', padding: '6px' }}>
                      <img 
                        src={otherProd.img} 
                        alt={otherProd.title} 
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                    </div>

                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FF5500', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {otherProd.category || 'Product'}
                    </span>

                    <h4 style={{ fontSize: '0.78rem', fontWeight: 700, height: '2.8em', overflow: 'hidden', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.35 }}>
                      {otherProd.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', gap: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 850, color: 'var(--text-primary)' }}>
                          ₹{(otherProd.price || 0).toLocaleString('en-IN')}
                        </span>
                        {otherProd.originalPrice && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                            ₹{otherProd.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) onAddToCart(otherProd);
                        }}
                        style={{
                          background: '#FF5500',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ShoppingBag size={13} /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {zoomPhoto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100015
          }}
          onClick={() => setZoomPhoto(null)}
        >
          <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={32} />
          </button>
          <img src={zoomPhoto} alt="Review Zoom" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '12px' }} />
        </div>
      )}

      {/* Amazon / Flipkart Style Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.94)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100020,
            backdropFilter: 'blur(10px)',
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar Header */}
          <div style={{ position: 'absolute', top: '20px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', zIndex: 2 }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '800', letterSpacing: '0.5px' }}>
              {product.title} • <span style={{ color: '#FF5500' }}>Photo {lightboxIndex + 1} of {galleryImages.length}</span>
            </span>
            <button 
              onClick={() => setIsLightboxOpen(false)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newIdx = lightboxIndex === 0 ? galleryImages.length - 1 : lightboxIndex - 1;
              setLightboxIndex(newIdx);
              setSelectedImage(galleryImages[newIdx]);
            }}
            style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(135deg, #FF5500, #E03E00)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,85,0,0.5)', zIndex: 3 }}
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const newIdx = lightboxIndex === galleryImages.length - 1 ? 0 : lightboxIndex + 1;
              setLightboxIndex(newIdx);
              setSelectedImage(galleryImages[newIdx]);
            }}
            style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', background: 'linear-gradient(135deg, #FF5500, #E03E00)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,85,0,0.5)', zIndex: 3 }}
          >
            <ChevronRight size={28} />
          </button>

          {/* Center High-Res Image */}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '85vw', maxHeight: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={galleryImages[lightboxIndex] || selectedImage || product.img} 
              alt={product.title || "Enlarged Product View"} 
              style={{ maxWidth: '90%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(idx);
                  setSelectedImage(img);
                }}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  border: lightboxIndex === idx ? '2.5px solid #FF5500' : '1px solid rgba(255,255,255,0.3)',
                  background: '#000',
                  overflow: 'hidden',
                  padding: '2px',
                  cursor: 'pointer'
                }}
              >
                <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Social Media Share Modal Popover */}
      {isShareModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsShareModalOpen(false)}
        >
          <div 
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              animation: 'fadeIn 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255, 85, 0, 0.15)', padding: '10px', borderRadius: '14px', color: '#FF5500', display: 'flex' }}>
                  <Share2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Share Product
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Share direct link on WhatsApp, Facebook &amp; socials
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Product Preview Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              background: 'var(--bg-input)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}>
              <img 
                src={selectedImage || product.img} 
                alt={product.title} 
                style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '10px', background: '#fff', padding: '4px' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FF5500' }}>
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                  {product.discount && (
                    <span style={{ fontSize: '0.72rem', background: 'rgba(255,85,0,0.12)', color: '#FF5500', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
                      {product.discount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Social Channels Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', textAlign: 'center' }}>
              {/* WhatsApp */}
              <button 
                onClick={handleShareWhatsApp}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.487 1.332 5.003l-1.417 5.176 5.302-1.39a9.943 9.943 0 0 0 4.77 1.215h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.037-5.176-2.924-7.062a9.923 9.923 0 0 0-7.066-2.945zm.004 18.155h-.003a8.27 8.27 0 0 1-4.218-1.157l-.302-.18-3.136.822.836-3.056-.197-.314a8.27 8.27 0 0 1-1.272-4.436c0-4.568 3.717-8.283 8.286-8.283 2.213 0 4.293.862 5.858 2.428a8.243 8.243 0 0 1 2.427 5.856c0 4.569-3.718 8.284-8.281 8.284z"/></svg>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button 
                onClick={handleShareFacebook}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(24, 119, 242, 0.35)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Facebook</span>
              </button>

              {/* Twitter / X */}
              <button 
                onClick={handleShareTwitter}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Twitter / X</span>
              </button>

              {/* Telegram */}
              <button 
                onClick={handleShareTelegram}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#229ED9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(34, 158, 217, 0.35)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Telegram</span>
              </button>

              {/* Instagram / Direct Copy */}
              <button 
                onClick={handleCopyLink}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px rgba(220, 39, 67, 0.35)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Instagram</span>
              </button>
            </div>

            {/* Copy Direct Link Input Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Or copy unique link:
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '6px 6px 6px 14px',
                gap: '8px'
              }}>
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: copiedLink ? '#22c55e' : 'linear-gradient(135deg, #FF5500, #E03E00)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: copiedLink ? '0 4px 14px rgba(34, 197, 94, 0.4)' : '0 4px 14px rgba(255, 85, 0, 0.3)'
                  }}
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 size={16} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>,
    portalContainer
  );
}
