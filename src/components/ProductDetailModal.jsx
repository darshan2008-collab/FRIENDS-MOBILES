import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Heart, Star, Sparkles, User, MessageSquare, Send, Calendar, Camera, Smartphone } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ProductDetailModal({
  product,
  products = [],
  wishlist = [],
  onClose,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct
}) {
  const [reviewsList, setReviewsList] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5 });
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [zoomPhoto, setZoomPhoto] = useState(null);

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (!product) return;
    setReviewsList(product.reviewsList || []);
    setSelectedPhoto(null);
    setZoomPhoto(null);
    setSelectedImage(product.img || '');
  }, [product]);

  if (!product) return null;

  const isLiked = wishlist.includes(product.id);
  const similarProducts = (products || []).filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

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

    // Persist to server JSON database
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

      // Keep local reference updated in-memory
      product.reviewsList = updatedReviewsList;
      product.reviews = totalReviews;
      product.rating = averageRating;
    } catch (err) {
      console.error("Failed to save review dynamically to server", err);
    }
  };

  return (
    <div className="cart-drawer-overlay" style={{ zIndex: 10008 }} onClick={onClose}>
      <div 
        className="cart-drawer-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px', /* Wide detail view layout */
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Main Detail Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
             {/* Left Column: Image wrapper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: 'var(--bg-input)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: '260px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
              }}>
                <span className="discount-badge" style={{ top: '16px', left: '16px' }}>{product.discount}</span>
                <img 
                  src={selectedImage} 
                  alt={product.title} 
                  style={{ maxHeight: '220px', objectFit: 'contain', width: '100%', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop';
                  }}
                />
              </div>

              {/* Multiple Images Thumbnails row */}
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      style={{
                        background: 'var(--bg-card)',
                        border: selectedImage === imgUrl ? '2.5px solid #FF5500' : '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '4px',
                        width: '52px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedImage === imgUrl ? '0 4px 10px rgba(255, 85, 0, 0.15)' : 'none',
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
              )}
            </div>

            {/* Right Column: Meta Info */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 650, letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1.25 }}>
                {product.title}
              </h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && (
                  <span style={{ fontSize: '1rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-orange)', marginLeft: '4px' }}>
                  Save {product.discount}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '24px' }}>
                {product.description || "Premium mobile electronics & customized studio accessories from FRIENDS MOBILE. High durability with standard local brand warranty."}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, gap: '10px' }} 
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  disabled={!product.inStock}
                >
                  <ShoppingBag size={18} /> ADD TO CART
                </button>
                <button 
                  className={`wishlist-icon-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => onToggleWishlist(product)}
                  style={{ width: '46px', height: '46px', border: '1px solid var(--border-color)', borderRadius: '12px' }}
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

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 650, letterSpacing: '-0.02em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={16} /> Similar Products You May Like
              </h3>
              
              <div style={{ 
                display: 'flex', 
                gap: '14px', 
                overflowX: 'auto', 
                paddingBottom: '12px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }} className="similar-products-swipe">
                {similarProducts.map((simProd) => (
                  <div 
                    key={simProd.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(simProd);
                    }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      textAlign: 'center',
                      position: 'relative',
                      flex: '0 0 140px',
                      width: '140px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-orange)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <img 
                        src={simProd.img} 
                        alt={simProd.title} 
                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <h4 style={{ fontSize: '0.72rem', fontWeight: 600, height: '2.6em', overflow: 'hidden', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.2 }}>
                      {simProd.title.slice(0, 32)}...
                    </h4>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-orange)' }}>₹{simProd.price.toLocaleString('en-IN')}</span>
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
    </div>
  );
}
