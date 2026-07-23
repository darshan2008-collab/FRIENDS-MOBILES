import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MobileDrawer from './components/MobileDrawer';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import TrustBadges from './components/TrustBadges';
import PromoBanners from './components/PromoBanners';
import TrendingProducts from './components/TrendingProducts';
import ServicesSection from './components/ServicesSection';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import AdminModal from './components/AdminModal';
import UserAuthModal from './components/UserAuthModal';
import UserAccountModal from './components/UserAccountModal';
import CustomBackCoverModal from './components/CustomBackCoverModal';
import CustomPhotoFrameModal from './components/CustomPhotoFrameModal';
import MobileBottomBar from './components/MobileBottomBar';
import CartModal from './components/CartModal';
import ProductDetailModal from './components/ProductDetailModal';
import BrandMarquee from './components/BrandMarquee';
import ShoppingPortal from './components/ShoppingPortal';

import './styles/theme.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
      : `${window.location.protocol}//${window.location.host}/api`) 
  : '/api');

const initialProducts = [
  {
    id: 1,
    title: 'boAt Airdopes 141 Bluetooth Earbuds',
    category: 'Earphones',
    discount: '-20%',
    price: 1199,
    originalPrice: 1499,
    rating: 0,
    reviews: 0,
    inStock: true,
    img: 'images/prod_airdopes.png',
    fallback: 'http://localhost:5000/images/prod_airdopes.png',
    description: 'True Wireless Earbuds with up to 42H Playtime, Beast Mode for Low Latency Gaming, and ENx Technology for crystal clear calls.'
  },
  {
    id: 2,
    title: 'Mi 20000mAh Power Bank 3i',
    category: 'Power Banks',
    discount: '-15%',
    price: 1699,
    originalPrice: 1999,
    rating: 0,
    reviews: 0,
    inStock: true,
    img: 'images/prod_powerbank.png',
    fallback: 'http://localhost:5000/images/prod_powerbank.png',
    description: 'High capacity 20000mAh lithium polymer battery with 18W fast charging and triple port output.'
  },
  {
    id: 3,
    title: 'Portronics 20W Fast Charger',
    category: 'Chargers & Cables',
    discount: '-25%',
    price: 599,
    originalPrice: 799,
    rating: 0,
    reviews: 0,
    inStock: true,
    img: 'images/prod_charger.png',
    fallback: 'http://localhost:5000/images/prod_charger.png',
    description: 'Ultra fast 20W Type-C Power Delivery wall charger compatible with iPhone, Samsung, and Android devices.'
  },
  {
    id: 4,
    title: 'Realme Wireless 2S Neckband',
    category: 'Earphones',
    discount: '-10%',
    price: 1349,
    originalPrice: 1499,
    rating: 0,
    reviews: 0,
    inStock: true,
    img: 'images/prod_neckband.png',
    fallback: 'http://localhost:5000/images/prod_neckband.png',
    description: 'Flexible neckband earphones with 11.2mm dynamic bass boost drivers, magnetic instant connect, and fast charging.'
  },
  {
    id: 5,
    title: 'Customized Back Cover',
    category: 'Back Covers',
    discount: '-15%',
    price: 399,
    originalPrice: 499,
    rating: 0,
    reviews: 0,
    inStock: true,
    img: 'images/prod_custom_cover.png',
    fallback: 'http://localhost:5000/images/prod_custom_cover.png',
    description: 'High resolution custom printed back cover with scratch-resistant coating for all mobile phone models.'
  }
];

export default function App() {
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCustomCoverOpen, setIsCustomCoverOpen] = useState(false);
  const [isCustomFrameOpen, setIsCustomFrameOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState('All');
  const [authRedirectMessage, setAuthRedirectMessage] = useState('');
  const [openCartAfterLogin, setOpenCartAfterLogin] = useState(false);

  const handleOpenShop = (category = 'All') => {
    setShopCategory(category);
    setIsShopOpen(true);
  };

  // Logged-in user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('fm_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return initialProducts;
  });
  const [shippingSettings, setShippingSettings] = useState({
    standardShippingFee: 49,
    freeShippingThreshold: 499,
    expressShippingFee: 99,
    supportPhone: '+91 74485 78507',
    supportEmail: 'friendsmobile@gmail.com'
  });
  const [orders, setOrders] = useState([]);

  const BANNER_STORAGE_KEY = 'friends_mobile_hero_slides_v4';

  const [heroSlides, setHeroSlides] = useState(() => {
    // Clean up old legacy keys that caused slide persistence bugs
    try {
      localStorage.removeItem('friends_mobile_hero_slides');
      localStorage.removeItem('friends_mobile_hero_slides_v2');
      localStorage.removeItem('friends_mobile_hero_slides_v3');
    } catch (e) {}

    const saved = localStorage.getItem(BANNER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saved slides", e);
      }
    }
    return [
      {
        id: 1,
        tag: 'WELCOME TO FRIENDS MOBILE',
        titleWhite: 'Your One Stop',
        titleGradient: 'Mobile Destination',
        desc: 'Premium mobile accessories, custom cases & photo frames.',
        imgSrc: '/images/hero_devices_light.png',
        btnText: 'SHOP NOW',
        btnLink: '#products'
      },
      {
        id: 2,
        tag: 'CUSTOM 3D COVERS',
        titleWhite: 'Your Style.',
        titleGradient: 'Your Cover.',
        desc: 'High-definition custom printed back covers for all models.',
        imgSrc: '/images/banner_backcover.png',
        btnText: 'CUSTOMIZE COVER',
        btnLink: '#customized-covers'
      },
      {
        id: 3,
        tag: 'DESIGNER PHOTO FRAMES',
        titleWhite: 'For Every',
        titleGradient: 'Special Memory',
        desc: 'Handcrafted custom wood frames for your special memories.',
        imgSrc: '/images/banner_photoframe.png',
        btnText: 'CREATE FRAME',
        btnLink: '#photo-frames'
      },
      {
        id: 4,
        tag: 'EXCLUSIVE ACCESSORY DEALS',
        titleWhite: 'Up to 40% Off',
        titleGradient: 'Premium Gear',
        desc: 'Get up to 40% off chargers, earbuds & smartwatches.',
        imgSrc: '/images/banner_accessories.png',
        btnText: 'EXPLORE OFFERS',
        btnLink: '#products'
      }
    ];
  });

  const handleUpdateSlides = (newSlides) => {
    setHeroSlides(newSlides);
    localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(newSlides));
  };

  // Set html data-theme attribute whenever theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // High-Performance Smooth Scroll Observer
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('heading-in-view');
        }
      });
    };

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const animElements = document.querySelectorAll('.section-title, .section-header h2, .footer-title, .promo-card');

    animElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products]);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fm_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fm_user');
    }
  }, [currentUser]);

  // Fetch backend data if available
  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
          try {
            localStorage.setItem('fm_products', JSON.stringify(data.products));
          } catch (_) {}
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/admin/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setShippingSettings(data.settings);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/admin/orders`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const handleRemoveToast = (id) => {
    setToasts((prev) => (Array.isArray(prev) ? prev.filter(t => t.id !== id) : []));
  };

  const addToast = (message, icon = '✨') => {
    if (!message) return;
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    setToasts((prev) => [...(Array.isArray(prev) ? prev : []), { id, message, icon }]);
    setTimeout(() => {
      handleRemoveToast(id);
    }, 3000);
  };

  const handleAddToCart = (product) => {
    if (!currentUser) {
      setAuthRedirectMessage('Login Required: Please sign in or create an account to add items and view your cart.');
      setOpenCartAfterLogin(true);
      setIsAuthOpen(true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    addToast(`Added "${product.title.slice(0, 18)}..." to Cart!`, '🛍️');
  };

  const handleUpdateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQty } : p));
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(p => p.id !== productId));
    addToast('Item removed from cart', '🗑️');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderPlaced = (newOrder) => {
    // Add to global orders state immediately
    setOrders(prev => [newOrder, ...prev]);
    // Persist to localStorage for UserAccountModal to pick up
    try {
      const stored = JSON.parse(localStorage.getItem('fm_user_orders') || '[]');
      localStorage.setItem('fm_user_orders', JSON.stringify([newOrder, ...stored]));
    } catch {}
  };

  const handleToggleWishlist = (product) => {
    if (wishlist.includes(product.id)) {
      setWishlist(prev => prev.filter(id => id !== product.id));
      addToast(`Removed "${product.title.slice(0, 15)}..." from Wishlist`, '🤍');
    } else {
      setWishlist(prev => [...prev, product.id]);
      addToast(`Added "${product.title.slice(0, 15)}..." to Wishlist`, '❤️');
    }
  };

  const handleSubscribe = (email) => {
    addToast(`Subscribed ${email} to Newsletter!`, '📩');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('fm_user', JSON.stringify(user));
    } catch {}
    setIsAuthOpen(false);
    
    if (openCartAfterLogin) {
      setIsCartOpen(true);
      setOpenCartAfterLogin(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('fm_user');
      localStorage.removeItem('fm_user_orders');
    } catch {}
    setIsAccountOpen(false);
    setIsCartOpen(false);
    addToast('Logged out successfully', '👋');
  };

  const handleOpenCartClick = () => {
    if (!currentUser) {
      setAuthRedirectMessage('Login Required: Please sign in or create an account to access your shopping cart.');
      setOpenCartAfterLogin(true);
      setIsAuthOpen(true);
    } else {
      setIsCartOpen(true);
    }
  };

  // Enforce mandatory login before checkout / placing orders
  const triggerCompulsoryAuth = (message) => {
    setAuthRedirectMessage(message || 'Login Required: Please sign in or create an account to place your order.');
    setIsAuthOpen(true);
  };

  // Admin Actions
  const handleAddProduct = (newProd) => {
    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          setProducts(prev => {
            const next = [...prev, data.product];
            try { localStorage.setItem('fm_products', JSON.stringify(next)); } catch (_) {}
            return next;
          });
          addToast(`Added "${data.product.title.slice(0, 15)}..."`, '📦');
        } else {
          addToast(data.message || 'Failed to add product to catalog.', 'error');
        }
      })
      .catch((err) => {
        console.error("Add product error", err);
        addToast('Connection failed. Product was not saved to database.', 'error');
      });
  };

  const handleUpdateProduct = (updatedProd) => {
    fetch(`${API_BASE}/products/${updatedProd.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProd)
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(prev => {
            const next = prev.map(p => p.id === updatedProd.id ? updatedProd : p);
            try { localStorage.setItem('fm_products', JSON.stringify(next)); } catch (_) {}
            return next;
          });
          addToast(`Updated product #${updatedProd.id}`, '✏️');
        } else {
          addToast(data.message || 'Failed to update product details.', 'error');
        }
      })
      .catch((err) => {
        console.error("Update product error", err);
        addToast('Connection failed. Product details not updated in database.', 'error');
      });
  };

  const handleDeleteProduct = (productId) => {
    fetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(prev => {
            const next = prev.filter(p => p.id !== productId);
            try { localStorage.setItem('fm_products', JSON.stringify(next)); } catch (_) {}
            return next;
          });
          addToast(`Deleted Product #${productId}`, '🗑️');
        } else {
          addToast(data.message || 'Failed to delete product from database.', 'error');
        }
      })
      .catch((err) => {
        console.error("Delete product error", err);
        addToast('Connection failed. Product not deleted from database.', 'error');
      });
  };

  const handleUpdateShippingSettings = (newSettings) => {
    fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setShippingSettings(data.settings);
          addToast('Updated Delivery & Shipping Fees!', '🚚');
        } else {
          addToast(data.message || 'Failed to update settings in database.', 'error');
        }
      })
      .catch((err) => {
        console.error("Update settings error", err);
        addToast('Connection failed. Settings not updated in database.', 'error');
      });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    fetch(`${API_BASE}/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
          addToast(`Order ${orderId} updated to "${newStatus}"`, '📍');
        } else {
          addToast(data.message || 'Failed to update order status.', 'error');
        }
      })
      .catch((err) => {
        console.error("Update order status error", err);
        addToast('Connection failed. Order status not updated in database.', 'error');
      });
  };

  const handleUpdateOrderShipping = (orderId, shippingCost) => {
    const cost = parseFloat(shippingCost) || 0;
    fetch(`${API_BASE}/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipping: cost })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(prev => prev.map(o => {
            if (o.orderId === orderId) {
              return {
                ...o,
                shipping: cost,
                total: o.subtotal + cost,
                status: o.status === 'Pending Shipping Cost' ? 'Shipping Cost Updated' : o.status
              };
            }
            return o;
          }));
          addToast(`Order ${orderId} shipping updated to ₹${cost}`, '🚚');
        } else {
          addToast(data.message || 'Failed to update shipping cost.', 'error');
        }
      })
      .catch((err) => {
        console.error("Update shipping cost error", err);
        addToast('Connection failed. Shipping cost not saved to database.', 'error');
      });
  };


  return (
    <div className="app">
      <Header 
        theme={theme}
        toggleTheme={toggleTheme}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthRedirectMessage('');
          setIsAuthOpen(true);
        }}
        onOpenUserAccount={() => setIsAccountOpen(true)}
        onOpenCart={handleOpenCartClick}
        onLogout={handleLogout}
        onOpenShop={handleOpenShop}
      />

      <MobileDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthRedirectMessage('');
          setIsAuthOpen(true);
        }}
        onOpenUserAccount={() => setIsAccountOpen(true)}
        onLogout={handleLogout}
      />

      <main>
        <Hero theme={theme} slides={heroSlides} />
        <CategoryGrid onOpenShop={handleOpenShop} />
        <TrustBadges shippingSettings={shippingSettings} />
        <PromoBanners 
          onOpenCustomCover={() => setIsCustomCoverOpen(true)}
          onOpenCustomFrame={() => setIsCustomFrameOpen(true)}
        />
        <BrandMarquee />
        <TrendingProducts 
          products={products}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          searchQuery={searchQuery}
          onSelectProduct={setSelectedProduct}
          onOpenShop={handleOpenShop}
        />
        <ServicesSection />
      </main>

      <ProductDetailModal 
        product={selectedProduct}
        products={products}
        wishlist={wishlist}
        onClose={() => setSelectedProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={setSelectedProduct}
      />

      <ShoppingPortal 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        products={products}
        onAddToCart={handleAddToCart}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onSelectProduct={setSelectedProduct}
        initialCategory={shopCategory}
        cartCount={cartCount}
        onOpenCart={handleOpenCartClick}
      />

      <Footer />
      
      <AdminModal 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        shippingSettings={shippingSettings}
        onUpdateShippingSettings={handleUpdateShippingSettings}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateShippingCost={handleUpdateOrderShipping}
        addToast={addToast}
        slides={heroSlides}
        onUpdateSlides={handleUpdateSlides}
      />

      <UserAuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        addToast={addToast}
        redirectMessage={authRedirectMessage}
      />

      <UserAccountModal 
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={currentUser}
        orders={orders}
        onLogout={handleLogout}
        addToast={addToast}
      />

      <CustomBackCoverModal 
        isOpen={isCustomCoverOpen}
        onClose={() => setIsCustomCoverOpen(false)}
        onAddToCart={handleAddToCart}
        addToast={addToast}
      />

      <CustomPhotoFrameModal 
        isOpen={isCustomFrameOpen}
        onClose={() => setIsCustomFrameOpen(false)}
        onAddToCart={handleAddToCart}
        addToast={addToast}
      />

      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        shippingSettings={shippingSettings}
        currentUser={currentUser}
        onTriggerAuth={triggerCompulsoryAuth}
        addToast={addToast}
        onOrderPlaced={handleOrderPlaced}
      />

      <MobileBottomBar 
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthRedirectMessage('');
          setIsAuthOpen(true);
        }}
        onOpenUserAccount={() => setIsAccountOpen(true)}
        onOpenCustomCover={() => setIsCustomCoverOpen(true)}
        onOpenCustomFrame={() => setIsCustomFrameOpen(true)}
        onOpenWishlist={() => {
          handleOpenShop('Wishlist');
        }}
        onOpenCart={handleOpenCartClick}
      />

      <ToastContainer toasts={toasts} onRemoveToast={handleRemoveToast} />
    </div>
  );
}
