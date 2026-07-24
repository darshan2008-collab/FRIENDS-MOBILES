import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, User, LogOut, PackageCheck, Clock, MapPin, Phone, Mail, 
  CheckCircle2, ShieldCheck, Tag, CreditCard, Star, ArrowRight, Heart, 
  Sparkles, MessageCircle, HelpCircle, Copy, Truck, Lock
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
      : `${window.location.protocol}//${window.location.host}/api`) 
  : '/api');

export default function UserAccountModal({ isOpen, onClose, user, orders: allOrders, onLogout, addToast }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses' | 'offers' | 'support'
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState('');

  // Address management state
  const [addresses, setAddresses] = useState(() => {
    if (user?.address && !user.address.includes('Double Tank')) {
      return [{ id: 1, title: 'Primary Delivery Address (Default)', address: user.address, isDefault: true }];
    }
    return [];
  });
  const [newAddressText, setNewAddressText] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Sync user saved address
  useEffect(() => {
    if (user?.address && !user.address.includes('Double Tank')) {
      setAddresses([{ id: 1, title: 'Primary Delivery Address (Default)', address: user.address, isDefault: true }]);
    }
  }, [user]);

  // ✅ Get user's orders from parent state (instant) + also try API
  useEffect(() => {
    if (isOpen && user) {
      // First: instantly filter from parent orders prop
      const userPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
      const userEmail = (user.email || '').toLowerCase().trim();

      if (allOrders && allOrders.length > 0) {
        const filtered = allOrders.filter(order => {
          const orderPhone = (order.customer?.phone || '').replace(/\D/g, '').slice(-10);
          const orderEmail = (order.customer?.email || '').toLowerCase().trim();
          return (
            (userPhone && orderPhone === userPhone) ||
            (userEmail && orderEmail === userEmail)
          );
        });
        if (filtered.length > 0) {
          setUserOrders(filtered);
        }
      }

      // Also check localStorage for session orders
      try {
        const stored = JSON.parse(localStorage.getItem('fm_user_orders') || '[]');
        if (stored.length > 0) {
          const sessionFiltered = stored.filter(order => {
            const orderPhone = (order.customer?.phone || '').replace(/\D/g, '').slice(-10);
            return userPhone && orderPhone === userPhone;
          });
          if (sessionFiltered.length > 0) {
            setUserOrders(prev => {
              const existingIds = new Set(prev.map(o => o.orderId));
              const newOnes = sessionFiltered.filter(o => !existingIds.has(o.orderId));
              return [...newOnes, ...prev];
            });
          }
        }
      } catch {}

      // Also fetch from API in background
      fetchUserOrders();
    }
  }, [isOpen, user, allOrders]);

  const fetchUserOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    const key = user.phone || user.email;
    try {
      const res = await fetch(`${API_BASE}/orders/user/${key}`);
      const data = await res.json();
      if (data.success && data.orders && data.orders.length > 0) {
        // Merge API orders with what we already have
        setUserOrders(prev => {
          const existingIds = new Set(prev.map(o => o.orderId));
          const newFromApi = data.orders.filter(o => !existingIds.has(o.orderId));
          return [...newFromApi, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      }
    } catch {
      // silently fail - we already have prop-based orders
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const getStatusStep = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('out for delivery')) return 3;
    if (s.includes('shipped')) return 2;
    if (s.includes('processing')) return 1;
    return 0; // Order Placed
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    if (addToast) addToast(`Coupon code "${code}" copied!`, '🎟️');
    setTimeout(() => setCopiedCoupon(''), 3000);
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    const newAddr = {
      id: Date.now(),
      title: 'Secondary Address',
      address: newAddressText.trim(),
      isDefault: false
    };
    setAddresses([...addresses, newAddr]);
    setNewAddressText('');
    setIsAddingAddress(false);
    if (addToast) addToast('New shipping address saved!', '📍');
  };

  const activeOrdersCount = userOrders.filter(o => !o.status?.toLowerCase().includes('delivered')).length;

  return (
    <div className="full-page-user-dashboard">
      {/* Top Sticky Header */}
      <header className="dash-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <CompanyLogo size={32} />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(0.85rem, 3.2vw, 1.25rem)', fontWeight: '900', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              FRIENDS <span style={{ color: '#FF5500' }}>MOBILE</span> PORTAL
            </h2>
            <span className="admin-subtitle-mobile-hide" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Customer Executive Dashboard</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button 
            onClick={() => {
              onLogout();
              onClose();
            }}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid #ef4444',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Log Out Account"
          >
            <LogOut size={15} /> <span className="close-btn-label">Logout</span>
          </button>

          <button 
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: 'none',
              background: '#FF5500',
              color: '#ffffff',
              fontWeight: '800',
              cursor: 'pointer',
              fontSize: '0.78rem',
              flexShrink: 0
            }}
          >
            <X size={16} /> <span className="close-btn-label">Store</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Portal Container */}
      <div className="dash-portal-bg">
        <div className="dash-container">

          {/* User Welcome Banner Card */}
          <div className="dash-welcome-card">
            <div className="dash-welcome-profile-info">
              <div className="dash-user-avatar">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="dash-user-title-row">
                  <h2 className="dash-user-name">Hi, {user.name}</h2>
                </div>
                <div className="dash-user-info-list">
                  <span className="dash-user-info-item">
                    <Phone size={13} style={{ color: 'var(--primary-orange)' }} /> {user.phone}
                  </span>
                  <span className="dash-user-info-item">
                    <Mail size={13} style={{ color: 'var(--primary-orange)' }} /> {user.email || 'Registered Customer'}
                  </span>
                  <span className="dash-user-info-item">
                    <MapPin size={13} style={{ color: 'var(--primary-orange)' }} /> Madurai, Tamil Nadu
                  </span>
                </div>
              </div>
            </div>

            <div className="dash-welcome-actions">
              <button 
                onClick={() => setActiveTab('offers')}
                className="btn-coupon-view"
              >
                <Tag size={15} /> View My Coupons
              </button>
            </div>
          </div>

          {/* Stats Metrics Cards Grid */}
          <div className="dash-stats-grid">
            <div className="dash-stat-card" onClick={() => setActiveTab('orders')}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="dash-stat-label">Total Orders</span>
                <h3 className="dash-stat-value">{userOrders.length}</h3>
              </div>
              <ShoppingBag size={18} className="dash-stat-icon-right" />
            </div>

            <div className="dash-stat-card" onClick={() => setActiveTab('orders')}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="dash-stat-label">Active Deliveries</span>
                <h3 className="dash-stat-value">{activeOrdersCount}</h3>
              </div>
              <Truck size={18} className="dash-stat-icon-right" />
            </div>

            <div className="dash-stat-card" onClick={() => setActiveTab('offers')}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="dash-stat-label">Reward Points</span>
                <h3 className="dash-stat-value">₹450</h3>
              </div>
              <Star size={18} className="dash-stat-icon-right" />
            </div>

            <div className="dash-stat-card" onClick={() => setActiveTab('offers')}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="dash-stat-label">Active Vouchers</span>
                <h3 className="dash-stat-value">3 Available</h3>
              </div>
              <Tag size={18} className="dash-stat-icon-right" />
            </div>
          </div>

          {/* Main Dashboard Grid: Sidebar Navigation + Workspace */}
          <div className="dash-main-layout">
            
            {/* Sidebar Navigation */}
            <div className="dash-sidebar">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`dash-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <ShoppingBag size={18} /> My Orders &amp; Tracking
              </button>

              <button 
                onClick={() => setActiveTab('profile')}
                className={`dash-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User size={18} /> Profile &amp; Security
              </button>

              <button 
                onClick={() => setActiveTab('addresses')}
                className={`dash-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              >
                <MapPin size={18} /> Delivery Addresses
              </button>

              <button 
                onClick={() => setActiveTab('offers')}
                className={`dash-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
              >
                <Tag size={18} /> Exclusive Coupons
              </button>

              <button 
                onClick={() => setActiveTab('support')}
                className={`dash-nav-item ${activeTab === 'support' ? 'active' : ''}`}
              >
                <HelpCircle size={18} /> Help Desk &amp; Support
              </button>

              <hr style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />

              <button 
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="dash-nav-item"
                style={{ color: '#ef4444' }}
              >
                <LogOut size={18} /> Log Out Account
              </button>
            </div>

            {/* Main Content Workspace */}
            <div className="dash-workspace-card">

              {/* TAB 1: ORDERS & TRACKING */}
              {activeTab === 'orders' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>Order History</h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Review your past purchases</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#FF5500', background: 'var(--orange-light)', padding: '6px 14px', borderRadius: '20px' }}>
                      {userOrders.length} Orders Placed
                    </span>
                  </div>

                  {isLoading ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading your order history...</p>
                  ) : userOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-input)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                        <ShoppingBag size={56} color="var(--text-muted)" />
                      </div>
                      <h3 style={{ margin: '0 0 8px 0', fontWeight: '800' }}>No Orders Found Yet</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
                        You haven't placed any mobile or accessory orders with FRIENDS MOBILE yet. Explore our latest collection today!
                      </p>
                      <button className="auth-submit-btn" onClick={onClose} style={{ width: 'auto', padding: '12px 30px', margin: '0 auto' }}>
                        START SHOPPING NOW <ArrowRight size={18} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {userOrders.map((order, idx) => {
                        return (
                          <div key={order.orderId || idx} style={{ background: 'var(--bg-input)', borderRadius: '18px', border: '1px solid var(--border-color)', padding: '24px' }}>
                            
                            {/* Order Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                              <div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Purchase Date</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                  <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </strong>
                                  <span style={{ fontSize: '0.75rem', background: 'var(--orange-light)', color: '#FF5500', padding: '3px 10px', borderRadius: '12px', fontWeight: '800' }}>
                                    {order.status || 'Order Placed'}
                                  </span>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Amount</span>
                                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)' }}>₹{order.total}</div>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                  {order.paymentMethod || 'UPI Paid'}
                                </span>
                              </div>
                            </div>

                            {/* Items Purchased List */}
                            <div style={{ marginTop: '20px' }}>
                              <h5 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Items in Package:</h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {order.items && order.items.map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    {item.img ? (
                                      <img src={item.img} alt="" style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '8px' }} />
                                    ) : (
                                      <div style={{ width: '46px', height: '46px', background: 'var(--bg-input)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ShoppingBag size={20} color="#FF5500" />
                                      </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{item.title}</div>
                                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity || 1}</div>
                                    </div>
                                    <div style={{ fontWeight: '800', color: '#FF5500', fontSize: '0.98rem' }}>
                                      ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Pricing Summary Breakdown */}
                            <div style={{ marginTop: '16px', background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Subtotal:</span>
                                <strong>₹{order.subtotal?.toLocaleString('en-IN')}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Shipping:</span>
                                {order.shipping === 'Pending' ? (
                                  <strong style={{ color: 'var(--primary-orange)' }}>Pending Calculation (Admin checking Pincode)</strong>
                                ) : (
                                  <strong>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</strong>
                                )}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: '800', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '4px', color: 'var(--text-primary)' }}>
                                <span>Total Amount:</span>
                                <span>₹{order.total?.toLocaleString('en-IN')}{order.shipping === 'Pending' && ' + Shipping (TBD)'}</span>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PROFILE & SECURITY */}
              {activeTab === 'profile' && (
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: '800' }}>Personal Account Profile</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Manage your verified customer profile information</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <User size={22} color="#FF5500" />
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Full Name</span>
                          <strong style={{ fontSize: '1.05rem' }}>{user?.name || 'Customer'}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Phone size={22} color="#FF5500" />
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Mobile Phone</span>
                          <strong style={{ fontSize: '1.05rem' }}>{user?.phone || 'Not provided'}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Mail size={22} color="#FF5500" />
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                          <strong style={{ fontSize: '1.05rem' }}>{user?.email || 'Not provided'}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShieldCheck size={22} color="#10b981" />
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Security Verification</span>
                          <strong style={{ fontSize: '1.05rem', color: '#10b981' }}>Verified Customer ✓</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 85, 0, 0.06)', border: '1px solid rgba(255, 85, 0, 0.2)', padding: '20px', borderRadius: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#FF5500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={18} /> Account Protection &amp; Security
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Your Friends Mobile account is protected with 256-bit encryption. Your mobile number and delivery data are strictly confidential.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: ADDRESSES */}
              {activeTab === 'addresses' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>Saved Delivery Addresses</h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Manage shipping destinations for fast checkout</span>
                    </div>
                    <button 
                      onClick={() => setIsAddingAddress(!isAddingAddress)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#FF5500',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isAddingAddress ? 'Cancel' : '+ Add New Address'}
                    </button>
                  </div>

                  {isAddingAddress && (
                    <form onSubmit={handleAddAddressSubmit} style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Enter Delivery Address</label>
                      <textarea 
                        rows={3}
                        placeholder="House No, Street, Landmark, City, State - Pincode"
                        value={newAddressText}
                        onChange={(e) => setNewAddressText(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          marginBottom: '14px'
                        }}
                      />
                      <button type="submit" className="auth-submit-btn" style={{ width: 'auto', padding: '10px 24px' }}>
                        Save Address
                      </button>
                    </form>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {addresses.map(addr => (
                      <div key={addr.id} style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '14px' }}>
                          <MapPin size={22} color="#FF5500" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '0.95rem' }}>{addr.title}</strong>
                              {addr.isDefault && (
                                <span style={{ fontSize: '0.7rem', background: '#FF5500', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                              {addr.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: COUPONS & OFFERS */}
              {activeTab === 'offers' && (
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: '800' }}>Your Available Coupons &amp; Vouchers</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Apply these codes at checkout for instant savings</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="dash-coupon-card">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Tag size={18} color="#FF5500" />
                          <strong style={{ fontSize: '1.1rem', color: '#FF5500' }}>FRIENDS10</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600' }}>10% Instant Discount on Accessories</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valid on orders above ₹499</span>
                      </div>
                      <button 
                        onClick={() => handleCopyCoupon('FRIENDS10')}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#FF5500',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Copy size={16} /> {copiedCoupon === 'FRIENDS10' ? 'COPIED!' : 'COPY CODE'}
                      </button>
                    </div>

                    <div className="dash-coupon-card">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Truck size={18} color="#10b981" />
                          <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>FREESHIP</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600' }}>Free Express Shipping Across Tamil Nadu</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No minimum order required</span>
                      </div>
                      <button 
                        onClick={() => handleCopyCoupon('FREESHIP')}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#10b981',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Copy size={16} /> {copiedCoupon === 'FREESHIP' ? 'COPIED!' : 'COPY CODE'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SUPPORT & HELP DESK */}
              {activeTab === 'support' && (
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: '800' }}>Friends Mobile Help Desk</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Need assistance with your order or product advice?</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                    <div style={{ background: 'var(--bg-input)', padding: '24px', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                        <MessageCircle size={26} />
                      </div>
                      <h4 style={{ margin: '0 0 6px 0' }}>WhatsApp Instant Support</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Chat directly with our Madurai store executive</p>
                      <a 
                        href="https://wa.me/917448578507" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          background: '#25D366',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          fontSize: '0.88rem'
                        }}
                      >
                        <MessageCircle size={16} /> Open WhatsApp Chat
                      </a>
                    </div>

                    <div style={{ background: 'var(--bg-input)', padding: '24px', borderRadius: '18px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255, 85, 0, 0.15)', color: '#FF5500', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                        <Phone size={26} />
                      </div>
                      <h4 style={{ margin: '0 0 6px 0' }}>Phone Helpline</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Mon - Sat: 9:30 AM to 9:00 PM</p>
                      <strong style={{ fontSize: '1.1rem', color: '#FF5500', display: 'block' }}>+91 74485 78507</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
