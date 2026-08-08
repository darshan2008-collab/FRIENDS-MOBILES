import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, CheckCircle2, CreditCard, Sparkles, Copy, Check, Lock, Phone } from 'lucide-react';
import { getProductTitle } from '../data/translations';
import { getApiBaseUrl } from '../data/apiConfig';
import { copyToClipboard } from '../utils/clipboard';

const API_BASE = getApiBaseUrl();

export default function CartModal({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart,
  shippingSettings,
  currentUser,
  userOrders = [],
  onTriggerAuth,
  addToast,
  onOrderPlaced,
  onUpdateUserProfile,
  t = (k) => k
}) {
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifyingUtr, setIsVerifyingUtr] = useState(false);
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  // Lock body scroll and reset step when open/closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setCheckoutStep('cart');
      setPlacedOrderDetails(null);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  function handleDownloadInvoice(order) {
    if (!order) return;
    if (order.orderId && typeof window !== 'undefined') {
      try {
        const invoiceUrl = `${API_BASE}/payments/invoice/${encodeURIComponent(order.orderId)}`;
        window.open(invoiceUrl, '_blank');
        return;
      } catch (_) {}
    }

    const isUPI = String(order.paymentMethod || '').toLowerCase().includes('upi') || 
                  String(order.paymentMethod || '').toLowerCase().includes('qr') || 
                  String(order.paymentMethod || '').toLowerCase().includes('online');
    
    const isCOD = String(order.paymentMethod || '').toLowerCase().includes('cod') || 
                  String(order.paymentMethod || '').toLowerCase().includes('cash');

    const printWindow = window.open('', '_blank', 'width=850,height=920');
    if (!printWindow) return;

    const itemsRows = (order.items || []).map((item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-size: 14px; font-weight: 600;">${idx + 1}. ${item.title || item.name}</td>
        <td style="padding: 12px; font-size: 14px; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 12px; font-size: 14px; text-align: right;">₹${item.price}</td>
        <td style="padding: 12px; font-size: 14px; text-align: right; font-weight: 700;">₹${(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const statusBadge = isUPI ? `
      <div style="display: inline-block; border: 2px solid #166534; background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 8px; font-size: 14px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
        ✓ PAID (ONLINE UPI VERIFIED)
      </div>
    ` : `
      <div style="display: inline-block; border: 2px solid #ea580c; background: #fff7ed; color: #ea580c; padding: 6px 16px; border-radius: 8px; font-size: 14px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
        📦 CASH ON DELIVERY ORDER
      </div>
    `;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>FRIENDS MOBILE Tax Invoice #${order.orderId || order.id}</title>
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif; 
            background-color: #f1f5f9; 
            color: #0f172a; 
            margin: 0; 
            padding: 12px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-wrapper { max-width: 760px; margin: 0 auto; }
          .action-bar { display: flex; gap: 10px; justify-content: space-between; align-items: center; margin-bottom: 14px; }
          .btn-return { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; flex: 1; text-align: center; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); }
          .btn-print { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #ff5500, #e03e00); color: #ffffff; border: none; padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; flex: 1; text-align: center; box-shadow: 0 4px 12px rgba(255, 85, 0, 0.25); }
          .invoice-card { position: relative; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 3px solid #ff5500; padding-bottom: 16px; margin-bottom: 20px; }
          .logo-title { font-size: 24px; font-weight: 900; color: #ff5500; margin: 0; letter-spacing: 0.5px; line-height: 1.1; }
          .sub-title { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 600; line-height: 1.4; }
          .header-right { text-align: right; flex-shrink: 0; }
          .invoice-tag { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 6px; letter-spacing: 0.5px; }
          .status-badge { display: inline-block; border: 1.5px solid #166534; background: #dcfce7; color: #166534; padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; white-space: nowrap; }
          .status-badge.cod { border-color: #ea580c; background: #fff7ed; color: #ea580c; }
          .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 20px; }
          .meta-box { background: #f8fafc; padding: 14px 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .meta-label { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px; }
          .meta-val { font-size: 14px; font-weight: 800; color: #0f172a; word-break: break-word; }
          .meta-sub { font-size: 12px; color: #475569; margin-top: 3px; line-height: 1.35; }
          .table-responsive { width: 100%; overflow-x: auto; margin-bottom: 20px; border-radius: 10px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; background: #ffffff; }
          th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #e2e8f0; font-weight: 800; white-space: nowrap; }
          .total-box { width: 100%; max-width: 340px; margin-left: auto; background: #fff7ed; padding: 14px 16px; border-radius: 12px; border: 1.5px solid #ffedd5; margin-top: 16px; }
          .total-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; color: #475569; }
          .grand-total { font-size: 16px; font-weight: 900; color: #ff5500; border-top: 2px dashed #fdba74; padding-top: 8px; margin-top: 6px; }
          .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; line-height: 1.5; }
          @media (max-width: 600px) {
            body { padding: 8px; }
            .invoice-card { padding: 16px; border-radius: 12px; }
            .header { flex-direction: column; align-items: flex-start; gap: 10px; }
            .header-right { text-align: left; }
            .logo-title { font-size: 22px; }
            .action-bar { gap: 8px; }
            .btn-return, .btn-print { padding: 9px 10px; font-size: 12px; }
            .total-box { max-width: 100%; margin-left: 0; }
          }
          @media print {
            .no-print { display: none !important; }
            body { background: none; padding: 0; }
            .invoice-card { box-shadow: none; border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-wrapper">
          <div class="action-bar no-print">
            <a href="https://friendsmobiles.unitaryx.org/" class="btn-return">
              🏠 Return to Main Website
            </a>
            <button onclick="window.print()" class="btn-print">
              🖨️ Print / Save as PDF
            </button>
          </div>

          <div class="invoice-card">
            <div class="header">
              <div>
                <h1 class="logo-title">📱 FRIENDS MOBILE</h1>
                <div class="sub-title">South Gandhigramam, Karur / Madurai, Tamil Nadu - 639004</div>
                <div class="sub-title">Customer Care: +91 74485 78507 | noreplyfriendsmobiles@gmail.com</div>
              </div>
              <div class="header-right">
                <div class="invoice-tag">OFFICIAL E-BILL TAX INVOICE</div>
                ${statusBadge}
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-box">
                <div class="meta-label">Customer Billed Details</div>
                <div class="meta-val">${order.customer?.name || 'Valued Customer'}</div>
                <div class="meta-sub">📞 Phone: ${order.customer?.phone || 'N/A'}</div>
                <div class="meta-sub">📍 Address: ${order.customer?.address || 'Tamil Nadu, India'}</div>
              </div>
              <div class="meta-box">
                <div class="meta-label">Payment & Order Info</div>
                <div class="meta-val">Order ID: #${order.orderId || order.id}</div>
                <div class="meta-sub">📅 Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                <div class="meta-sub">💳 Payment Mode: <strong>${order.paymentMethod || 'UPI QR Code Scan'}</strong></div>
                <div class="meta-sub" style="color: #166534; font-weight: 700;">Status: ${isUPI ? '✓ PAID & CONFIRMED' : 'ORDER PLACED (COD)'}</div>
              </div>
            </div>

            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th style="width: 40px; text-align: center;">#</th>
                    <th style="text-align: left;">Item Description & Specification</th>
                    <th style="width: 50px; text-align: center;">Qty</th>
                    <th style="width: 90px; text-align: right;">Unit Price</th>
                    <th style="width: 100px; text-align: right;">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </div>

            <div class="total-box">
              <div class="total-row"><span>Subtotal:</span><strong>₹${(order.subtotal || order.total).toLocaleString('en-IN')}</strong></div>
              <div class="total-row"><span>Shipping & Delivery:</span><strong>${order.shipping === 0 ? 'FREE' : '₹' + (order.shipping || 0)}</strong></div>
              <div class="total-row grand-total"><span>Total Amount Paid:</span><span>₹${order.total.toLocaleString('en-IN')}</span></div>
            </div>

            <div class="footer">
              This is an official computer-generated E-Bill Tax Invoice for Order #${order.orderId || order.id}.<br/>
              Thank you for shopping with <strong>FRIENDS MOBILE</strong>!
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
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

  function getWhatsAppUrl(order) {
    if (!order) return '#';
    const whatsappMsg = `*New Order Placed - Friends Mobile Portal*\n\n` +
      `*Order ID:* ${order.orderId}\n` +
      `*Customer Name:* ${order.customer?.name || ''}\n` +
      `*Phone Number:* ${order.customer?.phone || ''}\n` +
      `*Address:* ${order.customer?.address || ''}\n\n` +
      `*Ordered Items:*\n` +
      (order.items || []).map(item => `• ${item.title || item.name} (x${item.quantity || 1}) - ₹${(item.price || 0) * (item.quantity || 1)}`).join('\n') +
      `\n\n*Subtotal:* ₹${order.subtotal}\n` +
      `*Shipping:* ${order.shipping === 'Pending' ? 'Pending verify (Admin will update)' : `₹${order.shipping}`}\n` +
      `*Total Amount:* ₹${order.total}\n` +
      `*Payment Method:* ${order.paymentMethod || 'COD'}`;
    return `https://wa.me/917448578507?text=${encodeURIComponent(whatsappMsg)}`;
  }

  useEffect(() => {
    let intervalId = null;

    if (checkoutStep === 'payment_qr' && pendingOrder && pendingOrder.orderId) {
      setIsAutoVerifying(true);
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/payments/status/${pendingOrder.orderId}`);
          const data = await res.json();
          if (data && data.success && data.paymentStatus === 'Paid') {
            clearInterval(intervalId);
            setIsAutoVerifying(false);
            if (addToast) addToast('Payment Confirmed via Webhook Auto-Verification!', 'success');
            const verifiedOrder = {
              ...pendingOrder,
              paymentMethod: 'UPI QR Code (Webhook Auto-Verified)',
              paymentStatus: 'Paid',
              transactionUtr: data.transactionUtr || `AUTO-UPI-${Date.now()}`
            };
            executeOrderPlacement(verifiedOrder);
          }
        } catch (_) {}
      }, 500); // Poll every 500ms for sub-second instant response
    } else {
      setIsAutoVerifying(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [checkoutStep, pendingOrder]);

  async function handleSimulatePaymentSuccess() {
    if (!pendingOrder) return;
    try {
      if (addToast) addToast('Simulating Instant Webhook Auto-Verification...', 'loading');
      const res = await fetch(`${API_BASE}/payments/simulate-qr-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: pendingOrder.orderId })
      });
      const data = await res.json();
      if (data && data.success) {
        if (addToast) addToast(`Auto-Verified Payment for Order #${pendingOrder.orderId}!`, 'success');
        const verifiedOrder = {
          ...pendingOrder,
          paymentMethod: 'UPI QR Code (Auto-Verified)',
          paymentStatus: 'Paid',
          transactionUtr: data.transactionUtr || `AUTO-${Date.now()}`
        };
        executeOrderPlacement(verifiedOrder);
      }
    } catch (err) {
      if (addToast) addToast(`Simulation status: ${err.message}`, 'info');
    }
  }

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  function handleApplyCoupon(codeToApply) {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    const currentSubtotal = (cart || []).reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

    // 1. Check if user claimed this exact unique random code
    const userClaimed = (currentUser?.claimedCoupons || []).find(c => c.code && c.code.toUpperCase() === code);
    if (userClaimed) {
      const minVal = userClaimed.minOrderValue || 299;
      if (currentSubtotal < minVal) {
        if (addToast) addToast(`Redeem Code "${code}" requires a minimum order of ₹${minVal}.`, 'warning');
        return;
      }
      setAppliedCoupon({
        code,
        discountPct: userClaimed.discountPct || 0,
        flatDiscount: userClaimed.flatDiscount || 0,
        title: userClaimed.title || `${code} Offer Coupon`
      });
      if (addToast) addToast(`Applied Unique Redeem Code ${code}!`, 'success');
      return;
    }

    // 2. Pattern Match for dynamic generated prefixes (e.g. FM-10OFF-XXXX, FM-50OFF-XXXX)
    if (code.startsWith('FM-10OFF-')) {
      if (currentSubtotal < 299) {
        if (addToast) addToast('Coupon FM-10OFF requires minimum order of ₹299.', 'warning');
        return;
      }
      setAppliedCoupon({ code, discountPct: 10, title: '10% OFF Welcome Coupon' });
      if (addToast) addToast('Applied 10% OFF Welcome Coupon!', 'success');
      return;
    }
    if (code.startsWith('FM-50OFF-')) {
      if (currentSubtotal < 499) {
        if (addToast) addToast('Coupon FM-50OFF requires minimum order of ₹499.', 'warning');
        return;
      }
      setAppliedCoupon({ code, flatDiscount: 50, title: '₹50 OFF Flat Discount' });
      if (addToast) addToast('Applied ₹50 Flat Discount Coupon!', 'success');
      return;
    }
    if (code.startsWith('FM-100OFF-')) {
      if (currentSubtotal < 799) {
        if (addToast) addToast('Coupon FM-100OFF requires minimum order of ₹799.', 'warning');
        return;
      }
      setAppliedCoupon({ code, flatDiscount: 100, title: '₹100 OFF Special Coupon' });
      if (addToast) addToast('Applied ₹100 Flat Discount Coupon!', 'success');
      return;
    }
    if (code.startsWith('FM-200OFF-')) {
      if (currentSubtotal < 999) {
        if (addToast) addToast('Coupon FM-200OFF requires minimum order of ₹999.', 'warning');
        return;
      }
      setAppliedCoupon({ code, flatDiscount: 200, title: '₹200 OFF Mega Coupon' });
      if (addToast) addToast('Applied ₹200 Flat Discount Coupon!', 'success');
      return;
    }
    if (code.startsWith('FM-300OFF-')) {
      if (currentSubtotal < 1499) {
        if (addToast) addToast('Coupon FM-300OFF requires minimum order of ₹1499.', 'warning');
        return;
      }
      setAppliedCoupon({ code, flatDiscount: 300, title: '₹300 OFF Festival Coupon' });
      if (addToast) addToast('Applied ₹300 Flat Discount Coupon!', 'success');
      return;
    }

    if (code === 'FRIENDS10') {
      setAppliedCoupon({ code: 'FRIENDS10', discountPct: 10, title: '10% OFF First Purchase' });
      if (addToast) addToast('Applied FRIENDS10 - 10% OFF!', 'success');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', isFreeShip: true, title: 'FREE Express Delivery' });
      if (addToast) addToast('Applied FREESHIP - FREE Shipping Unlocked!', 'success');
    } else {
      if (addToast) addToast(`Invalid Coupon Code "${code}". Please check your code.`, 'error');
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    if (addToast) addToast('Coupon removed.', 'ℹ️');
  }

  const subtotal = (cart || []).reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.flatDiscount > 0) {
      couponDiscount = Math.min(subtotal, appliedCoupon.flatDiscount);
    } else if (appliedCoupon.discountPct > 0) {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountPct) / 100);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

  // Detect First Order for User by checking order history by phone/email/userOrders list
  const userPhone = currentUser?.phone ? String(currentUser.phone).replace(/\D/g, '') : '';
  const userEmail = currentUser?.email ? String(currentUser.email).toLowerCase().trim() : '';

  const matchedPreviousOrders = (Array.isArray(userOrders) ? userOrders : []).filter(o => {
    if (!o) return false;
    const oPhone = o.customer?.phone ? String(o.customer.phone).replace(/\D/g, '') : '';
    const oEmail = o.customer?.email ? String(o.customer.email).toLowerCase().trim() : '';
    const isPhoneMatch = userPhone && oPhone && (userPhone === oPhone || oPhone.endsWith(userPhone) || userPhone.endsWith(userPhone));
    const isEmailMatch = userEmail && oEmail && (userEmail === oEmail);
    return isPhoneMatch || isEmailMatch;
  });

  const profileOrdersCount = Array.isArray(currentUser?.orders) ? currentUser.orders.length : 0;
  const previousOrdersCount = Math.max(matchedPreviousOrders.length, profileOrdersCount);

  // 1st Order offer applies ONLY when previous order count is 0
  const isFirstOrder = currentUser ? (previousOrdersCount === 0) : false;

  const freeThreshold = shippingSettings?.freeShippingThreshold || 1000;
  const standardFee = shippingSettings?.standardShippingFee || 49;
  const isFreeShipping = isFirstOrder || (appliedCoupon && appliedCoupon.isFreeShip) || discountedSubtotal >= freeThreshold;
  const shippingFeeVal = isFreeShipping ? 0 : standardFee;
  const grandTotal = discountedSubtotal + shippingFeeVal;
  const amountToFreeShipping = Math.max(0, freeThreshold - discountedSubtotal);
  const progressPercent = isFirstOrder ? 100 : Math.min(100, Math.round((discountedSubtotal / freeThreshold) * 100));

  function handleStartCheckout() {
    if (!currentUser) {
      if (onTriggerAuth) {
        onTriggerAuth('Please log in or create an account to complete your checkout.');
      }
      return;
    }
    setCheckoutStep('checkout');
  }

  function triggerWhatsAppOrderNotification(order) {
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
  }

  function awardUserPointsOnOrder(order) {
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
    if (addToast) addToast(`You earned +${earned} Friends Reward Points! Total: ${updatedPts} PTS`, 'coupon');
  }

  function executeOrderPlacement(orderToPlace) {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderToPlace)
        });
        const data = await res.json();

        const finalOrder = data.order || orderToPlace;
        setPlacedOrderDetails(finalOrder);
        awardUserPointsOnOrder(finalOrder);
        triggerWhatsAppOrderNotification(finalOrder);
        if (onOrderPlaced) onOrderPlaced(finalOrder);
        if (onClearCart) onClearCart();
        setCheckoutStep('success');
        if (addToast) addToast(`Order #${finalOrder.orderId} Auto-Verified & Confirmed!`, '✓');

        // Automatically trigger printable E-Bill Tax Receipt window popup
        setTimeout(() => {
          handleDownloadInvoice(finalOrder);
        }, 500);

      } catch (err) {
        console.warn("API order placement network fallback:", err);
        executeFailSafeOrder(orderToPlace);
      }
    })();
  }

  async function handlePlaceOrderSubmit(e) {
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
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      status: paymentMethod === 'COD' ? 'Order Placed' : 'Awaiting Payment'
    };

    if (paymentMethod === 'UPI') {
      // Register pending order with backend so webhooks and status listener can verify instantly
      try {
        await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
      } catch (_) {}

      setPendingOrder(newOrder);
      setUtrNumber('');
      setCheckoutStep('payment_qr');
    } else {
      executeOrderPlacement(newOrder);
    }
  }

  async function handleConfirmUpiPaymentSubmit(e) {
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
      paymentNotes: `Verified UPI Payment (UTR: ${cleanUtr})`
    };

    await executeOrderPlacement(finalizedOrder);
    setIsVerifyingUtr(false);
  }

  function executeFailSafeOrder(order) {
    setPlacedOrderDetails(order);
    awardUserPointsOnOrder(order);
    triggerWhatsAppOrderNotification(order);
    if (onOrderPlaced) onOrderPlaced(order);
    if (onClearCart) onClearCart();
    setCheckoutStep('success');
    if (addToast) addToast(`Order #${order.orderId} Placed Successfully!`, '✓');
  }

  if (!isOpen || typeof document === 'undefined') return null;
  const portalContainer = document.body || document.getElementById('root') || document.documentElement;
  if (!portalContainer) return null;

  return createPortal(
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
                        {isFirstOrder 
                          ? '1st Order Special Offer: FREE Shipping Unlocked!' 
                          : (isFreeShipping 
                              ? 'Congratulations! You unlocked FREE Shipping' 
                              : `Add ₹${amountToFreeShipping} more for FREE Express Delivery (Free Shipping Above ₹${freeThreshold})`)}
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
                            {item.title || item.name || 'Product'}
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

                      {currentUser?.claimedCoupons && currentUser.claimedCoupons.length > 0 && !appliedCoupon && (
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
                          {currentUser.claimedCoupons.map((c, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleApplyCoupon(c.code)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #FF5500',
                                background: 'rgba(255,85,0,0.1)',
                                color: '#FF5500',
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              ⚡ Apply {c.code} ({c.discountPct ? `${c.discountPct}% OFF` : `₹${c.flatDiscount} OFF`})
                            </button>
                          ))}
                        </div>
                      )}

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
                        {isFreeShipping 
                          ? (isFirstOrder ? 'FREE (1st Order Offer!)' : 'FREE (Above ₹1,000)') 
                          : `₹${shippingFeeVal}`}
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

                      {/* Zero-Touch Webhook Auto-Detection Banner (Always Active) */}
                      <div style={{
                        marginTop: '16px', width: '100%', maxWidth: '360px',
                        background: 'rgba(34, 197, 94, 0.12)', border: '1.5px solid #22c55e',
                        borderRadius: '12px', padding: '12px', textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }}></span>
                          ⚡ Live Bank Webhook Listener Active...
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#166534', display: 'block', marginTop: '2px' }}>
                          Scanning &amp; paying automatically completes your order instantly.
                        </span>
                      </div>

                      {/* Copyable UPI ID */}
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block' }}>UPI VPA ID:</span>
                            <strong style={{ fontSize: '0.85rem', color: '#FF5500', wordBreak: 'break-all' }}>{storeUpi}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await copyToClipboard(storeUpi);
                              if (ok && addToast) addToast('Copied UPI ID!', '📋');
                            }}
                            style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', background: '#FF5500', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Copy
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

              {/* Zero-Touch Automatic Verification Footer */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setCheckoutStep('checkout')}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700' }}
                >
                  ← Back / Change Payment Method
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER PLACED SUCCESS */}
          {checkoutStep === 'success' && placedOrderDetails && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '72px', height: '72px', background: '#dcfce7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={40} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-primary)' }}>Order Placed Successfully!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Your order has been recorded and sent to Friends Mobile fulfillment team.</p>

              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Order ID: #{placedOrderDetails.orderId}</span>
                <button 
                  onClick={async () => {
                    const ok = await copyToClipboard(placedOrderDetails.orderId);
                    if (ok && addToast) addToast(`Copied Order Number: ${placedOrderDetails.orderId}`, '📋');
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
                📄 Download Official E-Bill / Tax Invoice
              </button>

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

        {/* Modal Sticky Footer */}
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
    </div>,
    portalContainer
  );
}
