import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, Heart, Star, Sparkles, User, MessageSquare, Send, Calendar, Camera, Smartphone, ChevronLeft, ChevronRight, ZoomIn, Check } from 'lucide-react';
import { getProductTitle, getProductDesc } from '../data/translations';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function ProductDetailModal({
  product,
  products = [],
  wishlist = [],
  onClose,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  language = 'en',
  t = (k) => k
}) {
  if (!product) return null;

  const productTitleLower = product && product.title ? String(product.title).toLowerCase() : '';
  const productCategoryLower = product && product.category ? String(product.category).toLowerCase() : '';

  const defaultSizesList = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : (productCategoryLower === 'covers' || productTitleLower.includes('cover') || productTitleLower.includes('pouch') || productTitleLower.includes('water proof') || productTitleLower.includes('waterproof')
        ? ['Universal (Up to 6.8")', 'Standard (5.5" - 6.1")', 'Pro / Max (6.7" - 6.9")']
        : (productCategoryLower === 'tshirts' || productTitleLower.includes('shirt')
            ? ['S (36")', 'M (38")', 'L (40")', 'XL (42")', 'XXL (44")']
            : ['Standard Pack (1 Metre)', 'Pro Pack (2 Metres)', 'Extended Pack (3 Metres)']
          )
      );

  const [reviewsList, setReviewsList] = useState(product.reviewsList || []);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5 });
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [zoomPhoto, setZoomPhoto] = useState(null);

  const [selectedImage, setSelectedImage] = useState(product.img || '');
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [selectedSize, setSelectedSize] = useState(defaultSizesList[0] || 'Standard');

  const horizontalScrollRef = useRef(null);

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

  useEffect(() => {
    if (!product) return;
    setReviewsList(product.reviewsList || []);
    setSelectedPhoto(null);
    setSelectedImage(product.img || '');
    setSelectedSize(defaultSizesList[0] || 'Standard');
  }, [product]);

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

  return (
    <div className="cart-drawer-overlay" style={{ zIndex: 10008, padding: 0 }} onClick={onClose}>
      <div 
        className="cart-drawer-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '100vw',
          width: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Sticky Header */}
        <header style={{
          padding: '16px 24px',
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
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <X size={22} />
          </button>
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

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
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
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, gap: '10px', height: '48px', fontSize: '0.95rem' }} 
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
                  style={{ width: '48px', height: '48px', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                >
                  <Heart size={20} fill={isLiked ? '#FF5500' : 'none'} color={isLiked ? '#FF5500' : 'currentColor'} />
                </button>
              </div>
            </div>

          </div>

          {/* Customer Reviews Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 650, letterSpacing: '-0.025em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} /> Customer Feedback & Reviews
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
              alt={product.title} 
              style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}
            />
          </div>

          {/* Bottom Thumbnails Navigation Bar */}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.7)', padding: '10px 18px', borderRadius: '30px', backdropFilter: 'blur(8px)', zIndex: 2 }}>
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
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
    </div>
  );
}
