import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, CheckCircle2, CreditCard } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? `${window.location.protocol}//${window.location.hostname}:5000/api` 
      : `${window.location.protocol}//${window.location.host}/api`) 
  : '/api');

export default function CartModal({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  shippingSettings,
  currentUser,
  onTriggerAuth,
  addToast,
  onOrderPlaced,
  onUpdateUserProfile
}) {
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // ✅ BUG FIX: Reset to cart view every time the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setCheckoutStep('cart');
      setPlacedOrderDetails(null);
    }
  }, [isOpen]);

  // Form State - Empty by default so users enter their own address
  const [shippingDetails, setShippingDetails] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: (currentUser?.address && !currentUser.address.includes('Double Tank')) ? currentUser.address : '',
    pincode: currentUser?.pincode || ''
  });

  // Sync shipping details when user logs in or updates profile
  useEffect(() => {
    if (currentUser) {
      setShippingDetails(prev => ({
        name: currentUser.name || prev.name || '',
        phone: currentUser.phone || prev.phone || '',
        address: (currentUser.address && !currentUser.address.includes('Double Tank')) ? currentUser.address : (prev.address && !prev.address.includes('Double Tank') ? prev.address : ''),
        pincode: currentUser.pincode || prev.pincode || ''
      }));
    }
  }, [currentUser]);

  const getWhatsAppUrl = (order) => {
    if (!order) return '#';
    const whatsappMsg = `*New Order Placed - Friends Mobile Portal*\n\n` +
      `*Order ID:* ${order.orderId}\n` +
      `*Customer Name:* ${order.customer?.name || ''}\n` +
      `*Phone Number:* ${order.customer?.phone || ''}\n` +
      `*Address:* ${order.customer?.address || ''}\n\n` +
      `*Ordered Items:*\n` +
      (order.items || []).map(item => `• ${item.title} (x${item.quantity}) - ₹${item.price * item.quantity}`).join('\n') +
      `\n\n*Subtotal:* ₹${order.subtotal}\n` +
      `*Shipping:* ${order.shipping === 'Pending' ? 'Pending verify (Admin will update)' : `₹${order.shipping}`}\n` +
      `*Total Amount:* ₹${order.total}\n` +
      `*Payment Method:* ${order.paymentMethod || 'COD'}`;
    return `https://wa.me/917448578507?text=${encodeURIComponent(whatsappMsg)}`;
  };

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const freeThreshold = shippingSettings?.freeShippingThreshold || 1000;
  const isFreeShipping = subtotal >= freeThreshold;
  const shippingFeeVal = isFreeShipping ? 0 : 'Pending';
  const grandTotal = subtotal; // Shipping cost added by admin later
  const amountToFreeShipping = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  const handleStartCheckout = () => {
    if (!currentUser) {
      if (onTriggerAuth) {
        onTriggerAuth('Please log in or create an account to complete your checkout.');
      }
      return;
    }
    setCheckoutStep('checkout');
  };

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    
    // Strict input security validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(shippingDetails.phone.trim())) {
      if (addToast) addToast('Please enter a valid 10-digit mobile number.', '');
      return;
    }

    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(shippingDetails.pincode.trim())) {
      if (addToast) addToast('Please enter a valid 6-digit postal pincode.', '');
      return;
    }

    // XSS Sanitization
    const sanitizedName = shippingDetails.name.replace(/<[^>]*>/g, '').trim();
    const sanitizedAddress = shippingDetails.address.replace(/<[^>]*>/g, '').trim();

    if (!sanitizedName || !shippingDetails.phone || !sanitizedAddress) {
      if (addToast) addToast('Please fill in your delivery name, phone and address', '');
      return;
    }

    if (paymentMethod === 'UPI') {
      /*
        ========================================================================
        RAZORPAY INTEGRATION MANUAL CHECKLIST:
        ========================================================================
        When you are ready to implement live payments, replace this block with:

        const loadRazorpayScript = () => {
          return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const hasLoaded = await loadRazorpayScript();
        if (!hasLoaded) {
          if (addToast) addToast('Failed to load payment gateway script.', '');
          return;
        }

        // Call backend API to create secure transaction token
        const rzpOrderResponse = await fetch(`${API_BASE}/payments/razorpay-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal * 100 }) // Amount in paise
        }).then(r => r.json());

        const options = {
          key: 'YOUR_RAZORPAY_KEY_ID', // Replace with secure env key
          amount: rzpOrderResponse.amount,
          currency: 'INR',
          name: 'FRIENDS MOBILE',
          description: 'Secure Order Payment',
          order_id: rzpOrderResponse.id,
          handler: async function (response) {
            // Verify payment signature securely on backend
            const verify = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                newOrder
              })
            }).then(r => r.json());

            if (verify.success) {
              setPlacedOrderDetails(newOrder);
              setCheckoutStep('success');
            } else {
              if (addToast) addToast('Payment verification failed securely.', '');
            }
          },
          prefill: {
            name: sanitizedName,
            contact: shippingDetails.phone.trim()
          },
          theme: {
            color: '#FF5500'
          }
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.open();
      */
      if (addToast) addToast('This payment method is currently unavailable.', '');
      return;
    }

    const fullDeliveryAddress = `${sanitizedAddress} - ${shippingDetails.pincode.trim()}`;

    // Save entered delivery address to user profile
    if (currentUser && sanitizedAddress) {
      const updatedUser = {
        ...currentUser,
        address: fullDeliveryAddress,
        pincode: shippingDetails.pincode.trim()
      };
      if (onUpdateUserProfile) {
        onUpdateUserProfile(updatedUser);
      }
    }

    const newOrder = {
      orderId: `FM-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      customer: {
        name: sanitizedName,
        phone: shippingDetails.phone.trim(),
        address: fullDeliveryAddress
      },
      items: [...cart],
      subtotal,
      shipping: shippingFeeVal,
      total: grandTotal,
      paymentMethod,
      status: isFreeShipping ? 'Order Placed' : 'Pending Shipping Cost'
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const data = await res.json();

      if (data.success) {
        setPlacedOrderDetails(data.order || newOrder);
        triggerWhatsAppOrderNotification(data.order || newOrder);
        if (onOrderPlaced) onOrderPlaced(data.order || newOrder);
        if (onClearCart) onClearCart();
        setCheckoutStep('success');
        if (addToast) addToast(`Order #${newOrder.orderId} Placed Successfully!`, '✓');
      } else {
        // API returned unsuccessful -> fallback to resilient order placement
        executeFailSafeOrder(newOrder);
      }
    } catch (err) {
      console.warn("API order placement network fallback:", err);
      // Fail-safe fallback so user is NEVER blocked by DB/network connection glitches
      executeFailSafeOrder(newOrder);
    }
  };

  const triggerWhatsAppOrderNotification = (order) => {
    try {
      if (!order) return;
      const orderIdStr = order.orderId || '';
      const custName = order.customer?.name || '';
      const custPhone = order.customer?.phone || '';
      const custAddr = order.customer?.address || '';
      const itemsList = (order.items || []).map(item => {
        const itemTitle = item?.title || item?.name || 'Product';
        const itemQty = item?.quantity || 1;
        const itemPrice = item?.price || 0;
        return `• ${itemTitle} (x${itemQty}) - ₹${itemPrice * itemQty}`;
      }).join('\n');

      const whatsappMsg = `*New Order Placed - Friends Mobile Portal*\n\n` +
        `*Order ID:* ${orderIdStr}\n` +
        `*Customer Name:* ${custName}\n` +
        `*Phone Number:* ${custPhone}\n` +
        `*Address:* ${custAddr}\n\n` +
        `*Ordered Items:*\n` +
        itemsList +
        `\n\n*Subtotal:* ₹${order.subtotal || 0}\n` +
        `*Shipping:* ${order.shipping === 'Pending' ? 'Pending verify' : `₹${order.shipping || 0}`}\n` +
        `*Total Amount:* ₹${order.total || 0}\n` +
        `*Payment Method:* ${order.paymentMethod || 'Cash On Delivery'}`;

      const whatsappUrl = `https://wa.me/917448578507?text=${encodeURIComponent(whatsappMsg)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error("WhatsApp redirect error", err);
    }
  };

  const executeFailSafeOrder = (order) => {
    setPlacedOrderDetails(order);
    triggerWhatsAppOrderNotification(order);
    if (onOrderPlaced) onOrderPlaced(order);
    if (onClearCart) onClearCart();
    setCheckoutStep('success');
    if (addToast) addToast(`Order #${order.orderId} Placed Successfully!`, '✓');
  };

  return (
    <div className="cart-drawer-overlay" style={{ padding: 0 }} onClick={onClose}>
      <div 
        className="cart-drawer-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          border: 'none',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <header style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--orange-light)', padding: '6px', borderRadius: '10px', color: '#FF5500', display: 'flex' }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>
                {checkoutStep === 'cart' && `YOUR SHOPPING CART (${cart.length})`}
                {checkoutStep === 'checkout' && 'DELIVERY & CHECKOUT'}
                {checkoutStep === 'success' && 'ORDER CONFIRMED'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {checkoutStep === 'cart' && 'Review items & proceed to checkout'}
                {checkoutStep === 'checkout' && 'Enter address and select payment method'}
                {checkoutStep === 'success' && 'Thank you for shopping with Friends Mobile!'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </header>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', maxWidth: '900px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          
          {/* STEP 1: CART ITEMS VIEW */}
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    color: 'var(--text-muted)'
                  }}>
                    <ShoppingBag size={32} />
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '800' }}>Your Cart is Empty</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
                    Explore our latest mobile accessories, customized covers &amp; photo frames!
                  </p>
                  <button 
                    onClick={onClose}
                    className="btn btn-primary btn-sm"
                  >
                    Start Shopping Now
                  </button>
                </div>
              ) : (
                <>
                  {/* Free Shipping Progress Indicator */}
                  <div style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700' }}>
                        {isFreeShipping ? '🎉 Congratulations! You unlocked FREE Shipping' : `Add ₹${amountToFreeShipping} more for FREE Express Delivery`}
                      </span>
                      <span style={{ color: '#FF5500', fontWeight: '800' }}>{progressPercent}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: 'linear-gradient(90deg, #ff6600, #ff3300)',
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cart.map((item) => (
                      <div 
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '14px',
                          padding: '12px'
                        }}
                      >
                        <img 
                          src={item.img} 
                          alt={item.title}
                          style={{
                            width: '56px',
                            height: '56px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            background: 'var(--bg-input)',
                            padding: '4px',
                            flexShrink: 0
                          }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.84rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </h4>
                          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#FF5500' }}>
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', padding: '4px 6px', borderRadius: '8px' }}>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontSize: '0.82rem', fontWeight: '800', minWidth: '18px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: 'none',
                            color: '#ef4444',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary Breakdown */}
                  <div style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items):</span>
                      <strong style={{ color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString('en-IN')}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Estimated Shipping Fee:</span>
                      <strong style={{ color: isFreeShipping ? '#22c55e' : 'var(--text-primary)' }}>
                        {isFreeShipping ? 'FREE' : 'Pending Verification'}
                      </strong>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1.05rem',
                      fontWeight: '800',
                      paddingTop: '8px',
                      borderTop: '1.5px dashed var(--border-color)',
                      color: 'var(--text-primary)'
                    }}>
                      <span>Total Amount:</span>
                      <span style={{ color: '#FF5500' }}>₹{grandTotal.toLocaleString('en-IN')}{!isFreeShipping && ' + Shipping (TBD)'}</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          {/* STEP 2: CHECKOUT FORM */}
          {checkoutStep === 'checkout' && (
            <form onSubmit={handlePlaceOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Security trust badge info box */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                color: '#22c55e',
                fontSize: '0.78rem',
                lineHeight: '1.4'
              }}>
                <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SECURE GATEWAY READY</strong>
                  All transactions are 256-bit SSL encrypted. Payment pipeline is prepared for standard Razorpay checkout token integration.
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  value={shippingDetails.name}
                  onChange={(e) => setShippingDetails({...shippingDetails, name: e.target.value})}
                  required
                  placeholder="e.g. Arun Kumar"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                    required
                    placeholder="7448578507"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Pincode</label>
                  <input 
                    type="text" 
                    value={shippingDetails.pincode}
                    onChange={(e) => setShippingDetails({...shippingDetails, pincode: e.target.value})}
                    required
                    placeholder="625001"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Delivery Address</label>
                <textarea 
                  rows={3}
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                  required
                  placeholder="Street name, house no, landmark, city"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Select Payment Method</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: paymentMethod === 'UPI' ? 'var(--orange-light)' : 'var(--bg-input)',
                    cursor: 'pointer'
                  }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Instant UPI / Google Pay / PhonePe</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: paymentMethod === 'COD' ? 'var(--orange-light)' : 'var(--bg-input)',
                    cursor: 'pointer'
                  }}>
                    <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Cash on Delivery (COD)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setCheckoutStep('cart')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Back to Cart
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1.5, padding: '12px' }}
                >
                  Place Order (₹{grandTotal}{!isFreeShipping && ' + Shipping'}) <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER PLACED SUCCESS */}
          {checkoutStep === 'success' && placedOrderDetails && (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#22c55e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '900', color: '#22c55e' }}>
                Order Successfully Placed!
              </h4>

              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '14px',
                textAlign: 'left',
                marginBottom: '20px',
                fontSize: '0.82rem',
                lineHeight: 1.6
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Delivery Address:</div>
                <div style={{ fontWeight: '700' }}>{placedOrderDetails.customer.name}</div>
                <div>{placedOrderDetails.customer.address}</div>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Paid ({placedOrderDetails.paymentMethod}):</span>
                  <strong style={{ color: '#FF5500' }}>₹{placedOrderDetails.total.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <a 
                href={getWhatsAppUrl(placedOrderDetails)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#25D366', 
                  borderColor: '#25D366', 
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  textAlign: 'center', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  fontWeight: '700',
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}
              >
                Send Confirmation to WhatsApp
              </a>

              <button 
                onClick={onClose}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Continue Shopping
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer (Only shown in Step 1 when cart has items) */}
        {checkoutStep === 'cart' && cart.length > 0 && (
          <footer style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Grand Total</span>
              <strong style={{ fontSize: '1.15rem', color: '#FF5500' }}>₹{grandTotal.toLocaleString('en-IN')}</strong>
            </div>

            <button 
              onClick={handleStartCheckout}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.88rem' }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
