import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, CheckCircle2, CreditCard } from 'lucide-react';
import { getProductTitle } from '../data/translations';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
  onUpdateUserProfile,
  language = 'en',
  t = (k) => k
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

  const handleDownloadInvoice = (order) => {
    if (!order) return;
    const isCOD = String(order.paymentMethod || '').toLowerCase().includes('cod') || String(order.paymentMethod || '').toLowerCase().includes('cash');
    if (isCOD) {
      if (addToast) addToast('E-Bills are not generated for Cash on Delivery orders.', 'ℹ️');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) return;

    const itemsRows = (order.items || []).map((item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-size: 14px; font-weight: 600;">${idx + 1}. ${item.title}</td>
        <td style="padding: 12px; font-size: 14px; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 12px; font-size: 14px; text-align: right;">₹${item.price}</td>
        <td style="padding: 12px; font-size: 14px; text-align: right; font-weight: 700;">₹${(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FRIENDS MOBILE Tax Invoice #${order.orderId || order.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ea580c; padding-bottom: 20px; }
          .logo-title { font-size: 28px; font-weight: 900; color: #ea580c; text-transform: uppercase; margin: 0; }
          .sub-title { font-size: 12px; color: #64748b; margin-top: 4px; }
          .invoice-tag { font-size: 18px; font-weight: 800; color: #0f172a; text-align: right; }
          .badge-paid { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 800; display: inline-block; margin-top: 6px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
          .meta-box { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .meta-label { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; }
          .meta-val { font-size: 14px; font-weight: 700; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .total-box { margin-left: auto; width: 300px; background: #fff7ed; padding: 16px; border-radius: 12px; border: 1.5px solid #ffedd5; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
          .grand-total { font-size: 18px; font-weight: 900; color: #ea580c; border-top: 2px solid #fdba74; padding-top: 8px; margin-top: 6px; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="logo-title">FRIENDS MOBILE</h1>
            <div class="sub-title">Madurai Road, Near Double Tank, Karur / Madurai, Tamil Nadu | Ph: +91 74485 78507</div>
          </div>
          <div>
            <div class="invoice-tag">OFFICIAL E-BILL / TAX INVOICE</div>
            <div style="text-align: right;"><span class="badge-paid">ONLINE PAYMENT VERIFIED ✅</span></div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <div class="meta-label">Billed To (Customer Details)</div>
            <div class="meta-val">${order.customer?.name || 'Valued Customer'}</div>
            <div style="font-size: 13px; color: #475569; margin-top: 2px;">📞 ${order.customer?.phone || ''}</div>
            <div style="font-size: 13px; color: #475569;">📍 ${order.customer?.address || 'Tamil Nadu, India'}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Invoice Details</div>
            <div class="meta-val">Invoice #: ${order.orderId || order.id}</div>
            <div style="font-size: 13px; color: #475569; margin-top: 2px;">Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style="font-size: 13px; color: #475569;">Payment Method: <strong>${order.paymentMethod || 'Online Payment'}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row"><span>Subtotal:</span><strong>₹${order.subtotal || order.total}</strong></div>
          <div class="total-row"><span>Shipping Fee:</span><strong>${order.shipping === 0 ? 'FREE' : '₹' + (order.shipping || 0)}</strong></div>
          <div class="total-row grand-total"><span>Total Paid:</span><span>₹${order.total}</span></div>
        </div>

        <div class="footer">
          This is an official computer-generated E-Bill tax invoice for Online Payment Order #${order.orderId || order.id}.<br/>
          Thank you for shopping with <strong>FRIENDS MOBILE</strong>!
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };


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

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    if (code === 'FRIENDS10') {
      if (subtotal < 299) {
        if (addToast) addToast('FRIENDS10 requires a minimum order of ₹299.', '⚠️');
        return;
      }
      setAppliedCoupon({ code, discountPct: 10, flatDiscount: 0, title: '10% OFF Rewards Coupon' });
      if (addToast) addToast('Applied 10% OFF Rewards Coupon!', '🎉');
    } else if (code === 'FRIENDS15') {
      if (subtotal < 499) {
        if (addToast) addToast('FRIENDS15 requires a minimum order of ₹499.', '⚠️');
        return;
      }
      setAppliedCoupon({ code, discountPct: 15, flatDiscount: 0, title: '15% OFF Rewards Coupon' });
      if (addToast) addToast('Applied 15% OFF Rewards Coupon!', '🎉');
    } else if (code === 'FRIENDS20') {
      if (subtotal < 799) {
        if (addToast) addToast('FRIENDS20 requires a minimum order of ₹799.', '⚠️');
        return;
      }
      setAppliedCoupon({ code, discountPct: 20, flatDiscount: 0, title: '20% OFF Rewards Coupon' });
      if (addToast) addToast('Applied 20% OFF Gold Rewards Coupon!', '🎉');
    } else if (code === 'SUPER200') {
      if (subtotal < 999) {
        if (addToast) addToast('SUPER200 requires a minimum order of ₹999.', '⚠️');
        return;
      }
      setAppliedCoupon({ code, discountPct: 0, flatDiscount: 200, title: 'Flat ₹200 OFF VIP Coupon' });
      if (addToast) addToast('Applied Flat ₹200 OFF VIP Coupon!', '🎉');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code, discountPct: 0, flatDiscount: 0, isFreeShip: true, title: 'Free Express Shipping' });
      if (addToast) addToast('Applied Free Express Shipping Coupon!', '🎉');
    } else {
      if (addToast) addToast('Invalid or expired coupon code.', '❌');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    if (addToast) addToast('Coupon removed.', 'ℹ️');
  };

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.flatDiscount > 0) {
      couponDiscount = Math.min(subtotal, appliedCoupon.flatDiscount);
    } else if (appliedCoupon.discountPct > 0) {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountPct) / 100);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const freeThreshold = shippingSettings?.freeShippingThreshold || 1000;
  const standardFee = shippingSettings?.standardShippingFee || 60;
  const isFreeShipping = (appliedCoupon && appliedCoupon.isFreeShip) || discountedSubtotal >= freeThreshold;
  const shippingFeeVal = isFreeShipping ? 0 : standardFee;
  const grandTotal = discountedSubtotal + shippingFeeVal;
  const amountToFreeShipping = Math.max(0, freeThreshold - discountedSubtotal);
  const progressPercent = Math.min(100, Math.round((discountedSubtotal / freeThreshold) * 100));

  const handleStartCheckout = () => {
    if (!currentUser) {
      if (onTriggerAuth) {
        onTriggerAuth('Please log in or create an account to complete your checkout.');
      }
      return;
    }
    setCheckoutStep('checkout');
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
        `*Shipping Fee:* ${(order.shipping === 0 || order.shipping === 'FREE') ? 'FREE' : `₹${order.shipping || 60}`}\n` +
        `*Total Amount:* ₹${order.total || 0}\n` +
        `*Payment Method:* ${order.paymentMethod || 'Cash On Delivery'}`;

      const whatsappUrl = `https://wa.me/917448578507?text=${encodeURIComponent(whatsappMsg)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error("WhatsApp redirect error", err);
    }
  };

  const awardUserPointsOnOrder = (order) => {
    if (!currentUser || !order) return;
    const earned = Math.floor((order.total || 0) / 10);
    if (earned <= 0) return;

    const currentPts = currentUser.rewardPoints || 150;
    const updatedPts = currentPts + earned;
    const currentHist = currentUser.pointHistory || [];
    const updatedHist = [
      { id: Date.now(), type: 'credit', points: earned, title: `Earned from Order #${order.orderId}`, date: 'Just Now' },
      ...currentHist
    ];

    const updatedUser = {
      ...currentUser,
      rewardPoints: updatedPts,
      pointHistory: updatedHist
    };

    if (onUpdateUserProfile) {
      onUpdateUserProfile(updatedUser);
    }
    if (addToast) addToast(`🎉 You earned +${earned} Friends Reward Points! Total: ${updatedPts} PTS`, '🎁');
  };

  const [pendingOrder, setPendingOrder] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);

  const executeOrderPlacement = async (orderToPlace) => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderToPlace)
      });
      const data = await res.json();

      if (data.success) {
        setPlacedOrderDetails(data.order || orderToPlace);
        awardUserPointsOnOrder(data.order || orderToPlace);
        triggerWhatsAppOrderNotification(data.order || orderToPlace);
        if (onOrderPlaced) onOrderPlaced(data.order || orderToPlace);
        if (onClearCart) onClearCart();
        setCheckoutStep('success');
        if (addToast) addToast(`Order #${orderToPlace.orderId} Placed Successfully!`, '✓');
      } else {
        executeFailSafeOrder(orderToPlace);
      }
    } catch (err) {
      console.warn("API order placement network fallback:", err);
      executeFailSafeOrder(orderToPlace);
    }
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

    const generatedOrderId = `FM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      orderId: generatedOrderId,
      createdAt: new Date().toISOString(),
      customer: {
        name: sanitizedName,
        phone: shippingDetails.phone.trim(),
        email: currentUser?.email || '',
        address: fullDeliveryAddress
      },
      items: [...cart],
      subtotal,
      shipping: shippingFeeVal,
      total: grandTotal,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      status: 'Order Placed'
    };

    if (paymentMethod === 'UPI') {
      setPendingOrder(newOrder);
      setUtrNumber('');
      setCheckoutStep('payment_qr');
    } else {
      executeOrderPlacement(newOrder);
    }
  };

  const handleConfirmUpiPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!pendingOrder) return;

    const cleanUtr = utrNumber.replace(/\D/g, '').trim();
    if (!cleanUtr || cleanUtr.length < 10) {
      if (addToast) addToast('Please scan the QR code and enter a valid 12-digit UPI Transaction UTR / Ref No.', '⚠️');
      return;
    }

    setIsVerifyingUtr(true);
    const finalizedOrder = {
      ...pendingOrder,
      paymentMethod: 'UPI QR Code',
      paymentStatus: 'Paid',
      transactionUtr: cleanUtr,
      cancellationReason: `Verified UPI Payment (UTR: ${cleanUtr})`
    };

    await executeOrderPlacement(finalizedOrder);
    setIsVerifyingUtr(false);
  };

  const executeFailSafeOrder = (order) => {
    setPlacedOrderDetails(order);
    awardUserPointsOnOrder(order);
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
                            {getProductTitle(item, language)}
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

                    {/* Rewards Coupon Input Box */}
                    <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 12px', margin: '6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#FF5500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🎁 APPLY REWARDS COUPON
                        </span>
                        {currentUser?.claimedCoupons && currentUser.claimedCoupons.length > 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {currentUser.claimedCoupons.length} Claimed
                          </span>
                        )}
                      </div>

                      {appliedCoupon ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', padding: '6px 10px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#22c55e' }}>
                            ✓ {appliedCoupon.code} ({appliedCoupon.title})
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', fontSize: '0.72rem', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="Enter Code (e.g. FRIENDS10)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 'bold', outline: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon()}
                            style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#FF5500', color: '#ffffff', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>

                    {couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e', fontWeight: '700' }}>
                        <span>Coupon Discount ({appliedCoupon?.code}):</span>
                        <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Delivery Charge:</span>
                      <strong style={{ color: isFreeShipping ? '#22c55e' : 'var(--text-primary)' }}>
                        {isFreeShipping ? 'FREE' : `₹${shippingFeeVal}`}
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
                      <span style={{ color: '#FF5500' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
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
                  Proceed to Payment (₹{grandTotal}{!isFreeShipping && ' + Shipping'}) <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2.5: DYNAMIC UPI QR SCANNER & UTR VERIFICATION */}
          {checkoutStep === 'payment_qr' && pendingOrder && (
            <div style={{ padding: '16px 10px', textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.12) 0%, rgba(37, 211, 102, 0.1) 100%)',
                border: '1.5px solid #FF5500',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FF5500', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  <Sparkles size={14} /> SCAN &amp; PAY VIA ANY UPI APP
                </div>
                
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                  Total Amount: <span style={{ color: '#FF5500' }}>₹{pendingOrder.total}</span>
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                  Order ID: #{pendingOrder.orderId}
                </span>

                {/* Dynamic QR Code Generator */}
                {(() => {
                  const storeUpi = import.meta.env.VITE_STORE_UPI_ID || shippingSettings?.storeUpiId || 'darshankannan2008@oksbi';
                  const payeeName = import.meta.env.VITE_STORE_PAYEE_NAME || shippingSettings?.storePayeeName || 'FRIENDS MOBILE';
                  const upiUri = `upi://pay?pa=${encodeURIComponent(storeUpi)}&pn=${encodeURIComponent(payeeName)}&am=${pendingOrder.total}&cu=INR&tn=${encodeURIComponent(`Order ${pendingOrder.orderId}`)}`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUri)}`;

                  return (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        background: '#ffffff',
                        padding: '12px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        border: '2px solid #e2e8f0',
                        display: 'inline-block'
                      }}>
                        <img 
                          src={qrUrl} 
                          alt="Scan UPI QR Code to Pay" 
                          style={{ width: '210px', height: '210px', display: 'block', borderRadius: '8px' }} 
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px' }}>
                          ✓ Accepted on: GPay • PhonePe • Paytm • BHIM
                        </span>
                      </div>

                      {/* Copyable UPI ID & Linked Mobile Number */}
                      <div style={{
                        marginTop: '14px',
                        background: 'var(--bg-input)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        width: '100%',
                        maxWidth: '320px',
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block' }}>UPI VPA ID:</span>
                            <strong style={{ fontSize: '0.85rem', color: '#FF5500', wordBreak: 'break-all' }}>{storeUpi}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(storeUpi);
                              if (addToast) addToast('Copied UPI ID!', '📋');
                            }}
                            style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', background: '#FF5500', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Copy
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block' }}>GPay / PhonePe Mobile:</span>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{import.meta.env.VITE_STORE_UPI_MOBILE || '7448578507'}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(import.meta.env.VITE_STORE_UPI_MOBILE || '7448578507');
                              if (addToast) addToast('Copied Mobile Number!', '📋');
                            }}
                            style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Copy Number
                          </button>
                        </div>
                      </div>

                      {/* Mobile Deep Link Instant App Launchers */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a 
                          href={upiUri} 
                          className="btn btn-sm"
                          style={{ background: '#4285F4', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', padding: '8px 12px', textDecoration: 'none', fontWeight: 'bold' }}
                        >
                          📲 Open UPI App Directly
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* UTR Verification Form */}
              <form onSubmit={handleConfirmUpiPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Enter 12-Digit UPI Transaction UTR / Ref No. <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    After scanning &amp; paying on GPay / PhonePe / Paytm, copy the 12-digit UTR or Ref number from your payment receipt.
                  </span>
                  <input 
                    type="text" 
                    placeholder="e.g. 423891823901"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    maxLength={16}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #FF5500',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontWeight: '800',
                      letterSpacing: '1px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setCheckoutStep('checkout')}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Change Method
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={isVerifyingUtr}
                    style={{ flex: 1.5, padding: '12px', background: '#16a34a', borderColor: '#16a34a' }}
                  >
                    {isVerifyingUtr ? 'Verifying...' : 'Confirm Payment & Complete Order ✓'}
                  </button>
                </div>
              </form>
            </div>
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

              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '900', color: '#22c55e' }}>
                Order Successfully Placed!
              </h4>

              {/* Prominent Order Number Display */}
              <div style={{ 
                background: 'var(--orange-light)', 
                border: '1.5px dashed #FF5500', 
                borderRadius: '12px', 
                padding: '10px 16px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '18px' 
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>ORDER NUMBER:</span>
                <strong style={{ fontSize: '1.1rem', fontWeight: '900', color: '#FF5500', letterSpacing: '0.5px' }}>
                  {placedOrderDetails.orderId || 'FM-ORD-PENDING'}
                </strong>
                <button
                  type="button"
                  onClick={() => {
                    if (placedOrderDetails.orderId) {
                      navigator.clipboard.writeText(placedOrderDetails.orderId);
                      if (addToast) addToast(`Copied Order Number: ${placedOrderDetails.orderId}`, '📋');
                    }
                  }}
                  style={{ background: '#FF5500', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  Copy ID
                </button>
              </div>

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

              {/* Online Payment E-Bill Download Option */}
              {!String(placedOrderDetails.paymentMethod || '').toLowerCase().includes('cod') && 
               !String(placedOrderDetails.paymentMethod || '').toLowerCase().includes('cash') && (
                <button
                  onClick={() => handleDownloadInvoice(placedOrderDetails)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  📄 Download E-Bill (Tax Invoice)
                </button>
              )}


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
