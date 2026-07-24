import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, Search, Filter, ShoppingBag, Heart, Star, Smartphone, 
  Zap, Headphones, Watch, Frame, Palette, CheckCircle2, SlidersHorizontal, 
  Sparkles, ShieldCheck, ArrowUpDown, ChevronRight, Tag, RefreshCw, DollarSign
} from 'lucide-react';

export default function ShoppingPortal({ 
  isOpen, 
  onClose, 
  products = [], 
  onAddToCart, 
  wishlist = [], 
  onToggleWishlist, 
  onSelectProduct,
  initialCategory = 'All',
  cartCount = 0,
  onOpenCart
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'discount' | 'rating'
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under-500' | '500-1000' | '1000-3000' | 'above-3000'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Synchronize category when initialCategory prop changes on open
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(initialCategory || 'All');
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  // Extract all unique categories dynamically from products array
  const dynamicCategories = Array.from(
    new Set((products || []).map(p => p.category).filter(Boolean))
  );

  const standardCategories = [
    'All',
    'Mobile Phones',
    'Chargers & Cables',
    'OTG & Adapters',
    'Power Banks',
    'Earphones',
    'Smartwatches',
    'Back Covers',
    'Photo Frames',
    'Accessories'
  ];

  // Merge categories while maintaining uniqueness
  const categoryList = Array.from(
    new Set(['All', 'Wishlist', ...standardCategories.slice(1), ...dynamicCategories])
  );

  // Helper matcher for categories
  const matchesCategoryFilter = (productCategory, selCat) => {
    if (selCat === 'All') return true;
    const pCat = (productCategory || '').toLowerCase();
    const c = selCat.toLowerCase();

    if (c.includes('charger')) return pCat.includes('charger') || pCat.includes('cable');
    if (c.includes('otg') || c.includes('adapter') || c.includes('usb')) return pCat.includes('otg') || pCat.includes('adapter') || pCat.includes('usb');
    if (c.includes('mobile') || c.includes('phone')) return pCat.includes('mobile') || pCat.includes('phone') || pCat.includes('smartphone');
    if (c.includes('earphone') || c.includes('audio')) return pCat.includes('earphone') || pCat.includes('headphone') || pCat.includes('audio') || pCat.includes('airdope');
    if (c.includes('power')) return pCat.includes('power');
    if (c.includes('frame')) return pCat.includes('frame');
    if (c.includes('cover') || c.includes('case')) return pCat.includes('cover') || pCat.includes('case');
    if (c.includes('watch')) return pCat.includes('watch') || pCat.includes('band');
    return pCat.includes(c);
  };

  // Filter products by category, search, price range, and stock
  const filteredProducts = products.filter(product => {
    // 0. Wishlist Category Filter
    if (selectedCategory === 'Wishlist') {
      if (!wishlist.includes(product.id)) return false;
    } else {
      // 1. Standard Category Filter
      const matchesCategory = matchesCategoryFilter(product.category, selectedCategory);
      if (!matchesCategory) return false;
    }

    // 2. Search Query Filter
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleStr = (product.title || '').toLowerCase();
      const catStr = (product.category || '').toLowerCase();
      const descStr = (product.description || '').toLowerCase();
      matchesSearch = titleStr.includes(q) || catStr.includes(q) || descStr.includes(q);
    }

    // 3. Price Range Filter
    let matchesPrice = true;
    const p = product.price || 0;
    if (priceRange === 'under-500') matchesPrice = p < 500;
    else if (priceRange === '500-1000') matchesPrice = p >= 500 && p <= 1000;
    else if (priceRange === '1000-3000') matchesPrice = p > 1000 && p <= 3000;
    else if (priceRange === 'above-3000') matchesPrice = p > 3000;

    // 4. In Stock Filter
    const matchesStock = !inStockOnly || product.inStock;

    return matchesSearch && matchesPrice && matchesStock;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'discount') {
      const discA = parseInt((a.discount || '0').replace(/[^0-9]/g, '')) || 0;
      const discB = parseInt((b.discount || '0').replace(/[^0-9]/g, '')) || 0;
      return discB - discA;
    }
    return 0; // 'featured'
  });

  // Group products by category when "All" and no specific price filter is active
  const groupedProducts = categoryList
    .filter(cat => cat !== 'All')
    .map(cat => {
      const items = sortedProducts.filter(p => matchesCategoryFilter(p.category, cat));
      return { categoryName: cat, items };
    })
    .filter(group => group.items.length > 0);

  const getCategoryIcon = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('mobile') || c.includes('phone')) return <Smartphone size={16} color="#FF5500" />;
    if (c.includes('charger') || c.includes('otg') || c.includes('cable') || c.includes('usb')) return <Zap size={16} color="#FF5500" />;
    if (c.includes('earphone') || c.includes('audio')) return <Headphones size={16} color="#FF5500" />;
    if (c.includes('watch')) return <Watch size={16} color="#FF5500" />;
    if (c.includes('frame')) return <Frame size={16} color="#FF5500" />;
    if (c.includes('cover') || c.includes('case')) return <Palette size={16} color="#FF5500" />;
    return <Tag size={16} color="#FF5500" />;
  };

  const handleImgError = (e, fallbackSrc) => {
    e.target.src = fallbackSrc || 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop';
  };

  const handleResetAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceRange('all');
    setSortBy('featured');
    setInStockOnly(false);
  };

  return (
    <div className="full-page-shopping-portal">
      
      {/* Sticky Shopping Portal Top Header */}
      <header className="shop-header-bar">
        <div className="shop-header-left">
          <button 
            onClick={onClose}
            className="btn-back-home"
            aria-label="Back to Store"
          >
            <ArrowLeft size={18} /> <span>Back to Home</span>
          </button>

          <div className="shop-brand-logo">
            <span className="brand-title">FRIENDS<span className="brand-orange">MOBILE</span></span>
            <span className="portal-badge">PRODUCT CATALOG STORE</span>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="shop-search-wrapper">
          <Search size={18} className="shop-search-icon" />
          <input 
            type="text" 
            placeholder="Search mobile phones, chargers, USB adapters, back covers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="shop-search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="shop-header-right">
          <button 
            className="mobile-filter-toggle-btn"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <SlidersHorizontal size={18} /> Filters
          </button>

          <button className="cart-trigger-btn" onClick={onOpenCart}>
            <ShoppingBag size={20} />
            <span className="cart-text">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Category Pills Navigation Bar */}
      <div className="shop-category-pills-bar">
        <div className="shop-pills-scroll">
          {categoryList.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shop-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Collapsible Sidebar + Full-Width Product Catalog */}
      <div className={`shop-main-layout container ${isFilterOpen ? 'filter-open' : 'filter-closed'}`}>

        {/* Left Filter Sidebar (collapsible) */}
        <aside className={`shop-sidebar-panel ${isFilterOpen ? 'open' : ''} ${isMobileFilterOpen ? 'open' : ''}`} style={{ display: isFilterOpen ? 'flex' : 'none' }}>
          <div className="sidebar-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1rem', fontWeight: '850' }}>
              <Filter size={18} color="#FF5500" /> Filter Products
            </h3>
            {(selectedCategory !== 'All' || priceRange !== 'all' || searchQuery || inStockOnly) && (
              <button onClick={handleResetAllFilters} className="reset-filter-link">
                Reset All
              </button>
            )}
            <button className="mobile-sidebar-close" onClick={() => { setIsMobileFilterOpen(false); setIsFilterOpen(false); }}>
              <X size={20} />
            </button>
          </div>

          {/* Categories List Filter */}
          <div className="filter-group-card">
            <h4 className="filter-group-title">
              <Tag size={14} color="#FF5500" /> Categories
            </h4>
            <div className="category-filter-list">
              {categoryList.map(cat => {
                const count = cat === 'All' 
                  ? products.length 
                  : products.filter(p => matchesCategoryFilter(p.category, cat)).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`category-item-btn ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    <span className="cat-item-name">{cat}</span>
                    <span className="cat-item-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group-card">
            <h4 className="filter-group-title">
              <DollarSign size={14} color="#FF5500" /> Price Range
            </h4>
            <div className="price-radio-list">
              {[
                { id: 'all', label: 'All Price Ranges' },
                { id: 'under-500', label: 'Under ₹500' },
                { id: '500-1000', label: '₹500 - ₹1,000' },
                { id: '1000-3000', label: '₹1,000 - ₹3,000' },
                { id: 'above-3000', label: 'Above ₹3,000' },
              ].map(pr => (
                <label key={pr.id} className="price-radio-item">
                  <input 
                    type="radio" 
                    name="priceRange" 
                    checked={priceRange === pr.id}
                    onChange={() => setPriceRange(pr.id)}
                  />
                  <span>{pr.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="filter-group-card">
            <h4 className="filter-group-title">
              <ShieldCheck size={14} color="#FF5500" /> Availability
            </h4>
            <label className="checkbox-stock-label" style={{ padding: '4px 0' }}>
              <input 
                type="checkbox" 
                checked={inStockOnly} 
                onChange={(e) => setInStockOnly(e.target.checked)} 
              />
              <span>Show In-Stock Only</span>
            </label>
          </div>

        </aside>

        {/* Right Main Catalog Content */}
        <main className="shop-catalog-content">
          
          {/* Controls Header Bar */}
          <div className="shop-controls-bar">
            <div className="controls-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="filter-toggle-corner-btn"
                onClick={() => { setIsFilterOpen(!isFilterOpen); setIsMobileFilterOpen(!isMobileFilterOpen); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  background: isFilterOpen ? '#FF5500' : 'var(--bg-card)',
                  color: isFilterOpen ? '#ffffff' : '#FF5500',
                  border: isFilterOpen ? '1px solid #FF5500' : '1px solid var(--border-color)',
                  fontWeight: '800',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <Filter size={16} />
                {isFilterOpen ? 'Hide Filters' : 'Filters'}
                {(selectedCategory !== 'All' || priceRange !== 'all' || inStockOnly) && (
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isFilterOpen ? '#ffffff' : '#FF5500',
                    display: 'inline-block'
                  }} />
                )}
              </button>

              <h2 className="section-heading" style={{ margin: 0 }}>
                {selectedCategory === 'All' ? 'All Showroom Products' : selectedCategory}
                <span className="count-tag">({sortedProducts.length} items found)</span>
              </h2>
            </div>

            <div className="controls-right">
              <div className="sort-dropdown-wrap">
                <ArrowUpDown size={15} color="#FF5500" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select-input"
                >
                  <option value="featured">Featured / Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Catalog Display */}
          <div className="shop-catalog-area">

            {sortedProducts.length === 0 ? (
              <div className="empty-catalog-state">
                <ShoppingBag size={54} color="#FF5500" style={{ opacity: 0.5 }} />
                <h3>No products match your active filters</h3>
                <p>Try clearing your price range or search query to view more items.</p>
                <button className="btn btn-primary btn-sm" onClick={handleResetAllFilters}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              selectedCategory !== 'All' || searchQuery.trim() !== '' || priceRange !== 'all' ? (
                /* Filtered Grid View */
                <div className="products-grid-portal">
                  {sortedProducts.map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      isLiked={wishlist.includes(product.id)}
                      onToggleWishlist={onToggleWishlist}
                      onSelectProduct={onSelectProduct}
                      handleImgError={handleImgError}
                    />
                  ))}
                </div>
              ) : (
                /* Product-by-Product Grouped Category View ("All" Selected) */
                <div className="grouped-category-sections">
                  {groupedProducts.map(group => (
                    <div key={group.categoryName} className="category-group-section">
                      <div className="group-section-header">
                        <div className="group-title-box">
                          {getCategoryIcon(group.categoryName)}
                          <h3>{group.categoryName}</h3>
                          <span className="group-badge">{group.items.length} Products</span>
                        </div>
                        <button 
                          className="btn-view-category-all"
                          onClick={() => setSelectedCategory(group.categoryName)}
                        >
                          View All {group.categoryName} <ChevronRight size={16} />
                        </button>
                      </div>

                      <div className="products-grid-portal">
                        {group.items.map(product => (
                          <ProductCard 
                            key={product.id}
                            product={product}
                            onAddToCart={onAddToCart}
                            isLiked={wishlist.includes(product.id)}
                            onToggleWishlist={onToggleWishlist}
                            onSelectProduct={onSelectProduct}
                            handleImgError={handleImgError}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

/* Individual Product Card Component */
function ProductCard({ product, onAddToCart, isLiked, onToggleWishlist, onSelectProduct, handleImgError }) {
  return (
    <div className="shop-product-card">
      
      {/* Card Header & Badge */}
      <div className="card-top-bar">
        {product.discount && (
          <span className="badge-discount">{product.discount}</span>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`wishlist-btn ${isLiked ? 'liked' : ''}`}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isLiked ? '#FF5500' : 'none'} color={isLiked ? '#FF5500' : 'currentColor'} />
        </button>
      </div>

      {/* Product Image */}
      <div 
        className="card-image-box"
        onClick={() => onSelectProduct(product)}
      >
        <img 
          src={product.img} 
          alt={product.title}
          onError={(e) => handleImgError(e, product.fallback)}
          loading="lazy"
        />
      </div>

      {/* Card Details */}
      <div className="card-details-box">
        <span className="card-category-tag">{product.category || 'General'}</span>
        
        <h4 
          className="card-product-title"
          onClick={() => onSelectProduct(product)}
        >
          {product.title}
        </h4>

        {/* Rating Row */}
        <div className="card-rating-row">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={12} 
                fill={star <= Math.round(product.rating || 5) ? '#FFB800' : 'none'} 
                color="#FFB800" 
              />
            ))}
            <span className="rating-score">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
          </div>
          <span className="stock-indicator">
            <CheckCircle2 size={12} color="#22c55e" /> In Stock
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="card-price-action-row">
          <div className="price-box">
            <span className="current-price">₹{(product.price || 0).toLocaleString('en-IN')}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-mrp">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          <button 
            onClick={() => onAddToCart(product)}
            className="btn-add-cart-sm"
          >
            <ShoppingBag size={15} /> Add
          </button>
        </div>
      </div>

    </div>
  );
}
