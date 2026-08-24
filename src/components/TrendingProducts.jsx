import React, { useEffect } from 'react';
import { Heart, ShoppingBag, ArrowRight, Share2 } from 'lucide-react';
import { getProductTitle } from '../data/translations';

const defaultUnsplashMap = {
  1: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
  2: 'https://images.unsplash.com/photo-1609592424009-f80640857380?q=80&w=600&auto=format&fit=crop',
  3: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
  4: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=600&auto=format&fit=crop',
  5: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=600&auto=format&fit=crop'
};

export default function TrendingProducts({ products, wishlist, onToggleWishlist, onAddToCart, searchQuery, onSelectProduct, onOpenShop, t = (k) => k }) {
  // Preload all product images into memory for instant rendering
  useEffect(() => {
    products.forEach(p => {
      if (p.img) {
        const img = new Image();
        img.src = p.img;
      }
      if (defaultUnsplashMap[p.id]) {
        const fallback = new Image();
        fallback.src = defaultUnsplashMap[p.id];
      }
    });
  }, [products]);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductImgError = (e, prod) => {
    e.target.src = defaultUnsplashMap[prod?.id] || 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop';
  };

  return (
    <section className="trending-section" id="products">
      <div className="container">
        
        <div className="section-header">
          <h2 className="section-title">{t('trendingTitle') || 'TRENDING PRODUCTS'}</h2>
          <button 
            type="button" 
            onClick={() => onOpenShop && onOpenShop('All')} 
            className="view-all-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {t('viewAll') || 'View All'} <ArrowRight size={16} />
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No products found matching "{searchQuery}".
          </p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((prod) => {
              const isLiked = wishlist.includes(prod.id);
              return (
                <div key={prod.id} className="product-card">
                  <span className="discount-badge">{prod.discount}</span>
                  
                  <div 
                    className="prod-img-wrap" 
                    onClick={() => onOpenShop ? onOpenShop(prod.category || 'All') : onSelectProduct(prod)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={prod.img} 
                      onError={(e) => handleProductImgError(e, prod)} 
                      alt={prod.title} 
                      loading="eager"
                      decoding="async"
                    />
                  </div>

                  <h3 
                    className="prod-title" 
                    onClick={() => onOpenShop ? onOpenShop(prod.category || 'All') : onSelectProduct(prod)}
                    style={{ cursor: 'pointer' }}
                  >
                    {prod.title}
                  </h3>
                  
                  {prod.reviews > 0 && (
                    <div className="rating">
                      <span className="stars">
                        {Array.from({ length: 5 }, (_, idx) => (
                          idx < Math.round(prod.rating || 5) ? '★' : '☆'
                        )).join('')}
                      </span>
                      <span className="rating-count">({prod.reviews})</span>
                    </div>
                  )}

                  <div className="price-row">
                    <div className="prices">
                      <span className="current-price">₹{prod.price.toLocaleString('en-IN')}</span>
                      <span className="original-price">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="card-actions">
                      <button 
                        type="button"
                        className="wishlist-icon-btn"
                        onClick={() => onSelectProduct(prod)}
                        title="Share Product"
                        style={{ color: '#FF5500' }}
                      >
                        <Share2 size={16} color="#FF5500" />
                      </button>

                      <button 
                        className={`wishlist-icon-btn ${isLiked ? 'liked' : ''}`}
                        onClick={() => onToggleWishlist(prod)}
                        title="Add to Wishlist"
                      >
                        <Heart size={18} fill={isLiked ? '#FF5500' : 'none'} color={isLiked ? '#FF5500' : 'currentColor'} />
                      </button>

                      <button 
                        className="add-cart-btn"
                        onClick={() => onAddToCart(prod)}
                        title="Add to Cart"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
