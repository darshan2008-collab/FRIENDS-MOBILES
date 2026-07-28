import React, { useState, useEffect } from 'react';
import { Headphones } from 'lucide-react';
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
import SEOManager from './components/SEOManager';
import AIChatbotModal from './components/AIChatbotModal';
import { translations } from './data/translations';

import './styles/theme.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('fm_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const toggleLanguage = (lang) => {
    const targetLang = lang || (language === 'en' ? 'ta' : 'en');
    setLanguage(targetLang);
    try {
      localStorage.setItem('fm_language', targetLang);
    } catch (_) {}
    if (addToast) {
      addToast(targetLang === 'ta' ? 'தமிழ் மொழி தேர்வு செய்யப்பட்டது 🌐' : 'English language selected 🌐', '🌐');
    }
  };

  const t = (key) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    return (translations.en && translations.en[key]) || key;
  };

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('fm_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('fm_cart', JSON.stringify(cart));
    } catch (_) {}
  }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = (Array.isArray(cart) ? cart : []).reduce((acc, item) => acc + (parseInt(item?.quantity) || 1), 0);

  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCustomCoverOpen, setIsCustomCoverOpen] = useState(false);
  const [isCustomFrameOpen, setIsCustomFrameOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
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
    standardShippingFee: 70,
    freeShippingThreshold: 1000,
    expressShippingFee: 99,
    supportPhone: '+91 74485 78507',
    supportEmail: 'friendsmobile@gmail.com'
  });
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('fm_user_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const DEFAULT_SLIDES = [
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

  const [heroSlides, setHeroSlides] = useState(() => {
    try {
      const saved = localStorage.getItem('fm_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_SLIDES;
  });

  // Fetch banners from database on mount
  useEffect(() => {
    fetch(`${API_BASE}/banners`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.slides) && data.slides.length > 0) {
          setHeroSlides(data.slides);
          try {
            localStorage.setItem('fm_slides', JSON.stringify(data.slides));
          } catch (_) {}
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateSlides = (newSlides) => {
    const slidesToSave = newSlides || DEFAULT_SLIDES;
    setHeroSlides(slidesToSave);
    try {
      localStorage.setItem('fm_slides', JSON.stringify(slidesToSave));
    } catch (_) {}
    fetch(`${API_BASE}/banners`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides: slidesToSave })
    }).catch(() => {});
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
      threshold: 0.08,
      rootMargin: '0px 0px -15px 0px'
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const animElements = document.querySelectorAll(
      '.section-title, .section-header, .section-header h2, .category-card, .promo-card, .product-card, .service-card, .showroom-card, .footer-column, .footer-title, .scroll-reveal'
    );

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
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          try {
            localStorage.setItem('fm_user_orders', JSON.stringify(data.orders));
          } catch (_) {}
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

  const [pendingCartItem, setPendingCartItem] = useState(null);

  const handleSelectProduct = (product) => {
    if (!product) return;
    const safeTitle = (product.title || product.name || '').toLowerCase();
    const isExplicitCustomCover = (safeTitle.includes('customized back cover') || safeTitle.includes('custom print cover') || safeTitle === 'custom cover') && !safeTitle.includes('water proof');
    const isExplicitCustomFrame = (safeTitle.includes('custom photo frame') || safeTitle.includes('customized photo frame'));

    if (isExplicitCustomCover) {
      setIsCustomCoverOpen(true);
      return;
    }
    if (isExplicitCustomFrame) {
      setIsCustomFrameOpen(true);
      return;
    }
    setSelectedProduct(product);
  };

  const handleAddToCart = (product) => {
    if (!product) return;
    const safeId = String(product.id || product._id || Date.now());
    const safeTitle = product.title || product.name || 'Item';
    const titleLower = safeTitle.toLowerCase();

    const isExplicitCustomCover = (titleLower.includes('customized back cover') || titleLower.includes('custom print cover') || titleLower === 'custom cover') && !titleLower.includes('water proof');
    const isExplicitCustomFrame = (titleLower.includes('custom photo frame') || titleLower.includes('customized photo frame'));

    // Redirect to Customization Studio only for explicit 3D customizable products
    if (!product.isCustomized && !product.customizationDetails) {
      if (isExplicitCustomCover) {
        setIsCustomCoverOpen(true);
        if (selectedProduct) setSelectedProduct(null);
        if (isShopOpen) setIsShopOpen(false);
        addToast('Redirected to Back Cover Customization Studio! Select model & design.', '✨');
        return;
      }

      if (isExplicitCustomFrame) {
        setIsCustomFrameOpen(true);
        if (selectedProduct) setSelectedProduct(null);
        if (isShopOpen) setIsShopOpen(false);
        addToast('Redirected to Photo Frame Customization Studio!', '✨');
        return;
      }
    }

    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existingIndex = safePrev.findIndex(p => p && (String(p.id || p._id) === safeId));
      if (existingIndex !== -1) {
        return safePrev.map((p, idx) => idx === existingIndex ? { ...p, quantity: (p.quantity || 1) + 1 } : p);
      }
      return [...safePrev, { ...product, id: product.id || product._id || safeId, quantity: 1 }];
    });

    addToast(`Added "${String(safeTitle).slice(0, 18)}..." to Cart!`, '🛍️');
  };

  const handleUpdateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(prev => (Array.isArray(prev) ? prev : []).map(p => p && p.id === productId ? { ...p, quantity: newQty } : p));
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => (Array.isArray(prev) ? prev : []).filter(p => p && p.id !== productId));
    addToast('Item removed from cart', '🗑️');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderPlaced = (newOrder) => {
    if (!newOrder) return;
    setOrders(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const updated = [newOrder, ...safePrev.filter(o => o.orderId !== newOrder.orderId)];
      try {
        localStorage.setItem('fm_user_orders', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleToggleWishlist = (product) => {
    if (!product || !product.id) return;
    const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
    const safeTitle = product.title || product.name || 'Product';
    if (safeWishlist.includes(product.id)) {
      setWishlist(prev => (Array.isArray(prev) ? prev : []).filter(id => id !== product.id));
      addToast(`Removed "${String(safeTitle).slice(0, 15)}..." from Wishlist`, '🤍');
    } else {
      setWishlist(prev => [...(Array.isArray(prev) ? prev : []), product.id]);
      addToast(`Added "${String(safeTitle).slice(0, 15)}..." to Wishlist`, '❤️');
    }
  };

  const handleSubscribe = (email) => {
    if (email) addToast(`Subscribed ${email} to Newsletter!`, '📩');
  };

  const handleLoginSuccess = (user) => {
    if (!user) return;
    setCurrentUser(user);
    try {
      localStorage.setItem('fm_user', JSON.stringify(user));
    } catch {}
    setIsAuthOpen(false);

    if (pendingCartItem) {
      const itemToCart = pendingCartItem;
      setPendingCartItem(null);
      const safeId = String(itemToCart.id || itemToCart._id || Date.now());
      const safeTitle = itemToCart.title || itemToCart.name || 'Item';
      setCart(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const existingIndex = safePrev.findIndex(p => p && (String(p.id || p._id) === safeId));
        if (existingIndex !== -1) {
          return safePrev.map((p, idx) => idx === existingIndex ? { ...p, quantity: (p.quantity || 1) + 1 } : p);
        }
        return [...safePrev, { ...itemToCart, id: itemToCart.id || itemToCart._id || safeId, quantity: 1 }];
      });
      addToast(`Signed in & added "${String(safeTitle).slice(0, 18)}..." to Cart!`, '🛍️');
      setIsCartOpen(true);
    } else if (openCartAfterLogin) {
      setIsCartOpen(true);
      setOpenCartAfterLogin(false);
    }
  };

  const handleUpdateUserProfile = (updatedUser) => {
    if (!updatedUser) return;
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('fm_user', JSON.stringify(updatedUser));
    } catch {}
    if (updatedUser.phone || updatedUser.email) {
      fetch(`${API_BASE}/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      }).catch(() => {});
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

  // Admin Actions — Guaranteed Resilient Products Catalog Operations
  const handleAddProduct = (newProd) => {
    const prodWithId = {
      ...newProd,
      id: newProd.id || Date.now()
    };

    setProducts(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const next = [prodWithId, ...safePrev];
      try { localStorage.setItem('fm_products', JSON.stringify(next)); } catch (_) {}
      return next;
    });
    addToast(`Added "${(prodWithId.title || 'Product').slice(0, 18)}..."`, '📦');

    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodWithId)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.product) {
          setProducts(prev => {
            const next = (Array.isArray(prev) ? prev : []).map(p => p.id === prodWithId.id ? data.product : p);
            try { localStorage.setItem('fm_products', JSON.stringify(next)); } catch (_) {}
            return next;
          });
        }
      })
      .catch((err) => {
        console.warn("Product API POST fallback:", err);
      });
  };

  const handleUpdateProduct = (updatedProd) => {
    setProducts(prev => {
      const next = (Array.isArray(prev) ? prev : []).map(p => p.id === updatedProd.id ? updatedProd : p);
      try { localStorage.setItem('fm_products', JSON.stringify(next)); } catch (_) {}
      return next;
    });
    addToast(`Updated product "${(updatedProd.title || '').slice(0, 15)}..."`, '✏️');

    fetch(`${API_BASE}/products/${updatedProd.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProd)
    }).catch(() => {});
  };

  const handleDeleteProduct = (productId) => {
    setProducts(prev => {
      const next = (Array.isArray(prev) ? prev : []).filter(p => p.id !== productId);
      try { localStorage.setItem('fm_products', JSON.stringify(next)); } catch (_) {}
      return next;
    });
    addToast('Product removed from catalog', '🗑️');

    fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE'
    }).catch(() => {});
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
      <SEOManager 
        selectedProduct={selectedProduct}
        shopCategory={shopCategory}
        isCustomCoverOpen={isCustomCoverOpen}
        isCustomFrameOpen={isCustomFrameOpen}
        isShopOpen={isShopOpen}
      />
      <Header 
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        toggleLanguage={toggleLanguage}
        t={t}
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
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      <MobileDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        language={language}
        toggleLanguage={toggleLanguage}
        t={t}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthRedirectMessage('');
          setIsAuthOpen(true);
        }}
        onOpenUserAccount={() => setIsAccountOpen(true)}
        onLogout={handleLogout}
      />

      <main>
        <Hero theme={theme} slides={heroSlides} t={t} language={language} />
        <CategoryGrid onOpenShop={handleOpenShop} t={t} />
        <TrustBadges shippingSettings={shippingSettings} t={t} />
        <PromoBanners 
          onOpenCustomCover={() => setIsCustomCoverOpen(true)}
          onOpenCustomFrame={() => setIsCustomFrameOpen(true)}
          t={t}
        />
        <BrandMarquee />
        <TrendingProducts 
          products={products}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          searchQuery={searchQuery}
          onSelectProduct={handleSelectProduct}
          onOpenShop={handleOpenShop}
          t={t}
        />
        <ServicesSection t={t} />
      </main>

      <ProductDetailModal 
        product={selectedProduct}
        products={products}
        wishlist={wishlist}
        onClose={() => setSelectedProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={handleSelectProduct}
        language={language}
        t={t}
      />

      <ShoppingPortal 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        products={products}
        onAddToCart={handleAddToCart}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onSelectProduct={handleSelectProduct}
        initialCategory={shopCategory}
        cartCount={cartCount}
        onOpenCart={handleOpenCartClick}
        language={language}
        t={t}
      />

      <Footer t={t} language={language} toggleLanguage={toggleLanguage} />
      
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
        onUpdateOrders={setOrders}
      />

      <UserAuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        addToast={addToast}
        redirectMessage={authRedirectMessage}
        t={t}
      />

      <UserAccountModal 
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={currentUser}
        orders={orders}
        onLogout={handleLogout}
        addToast={addToast}
        language={language}
        t={t}
      />

      <CustomBackCoverModal 
        isOpen={isCustomCoverOpen}
        onClose={() => setIsCustomCoverOpen(false)}
        onAddToCart={handleAddToCart}
        addToast={addToast}
        t={t}
      />

      <CustomPhotoFrameModal 
        isOpen={isCustomFrameOpen}
        onClose={() => setIsCustomFrameOpen(false)}
        onAddToCart={handleAddToCart}
        addToast={addToast}
        t={t}
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
        onUpdateUserProfile={handleUpdateUserProfile}
        language={language}
        t={t}
      />

      <MobileBottomBar 
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        currentUser={currentUser}
        language={language}
        toggleLanguage={toggleLanguage}
        t={t}
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
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      <AIChatbotModal 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        orders={orders}
        products={products}
        currentUser={currentUser}
        language={language}
        t={t}
        onOpenCustomCover={() => setIsCustomCoverOpen(true)}
        onOpenCustomFrame={() => setIsCustomFrameOpen(true)}
        onOpenShop={handleOpenShop}
        onOpenUserAccount={() => setIsAccountOpen(true)}
        addToast={addToast}
      />


      <ToastContainer toasts={toasts} onRemoveToast={handleRemoveToast} />
    </div>
  );
}

