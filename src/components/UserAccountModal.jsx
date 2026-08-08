import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, ShoppingBag, User, LogOut, PackageCheck, Clock, MapPin, Phone, Mail, 
  CheckCircle2, ShieldCheck, Tag, CreditCard, Star, ArrowRight, Heart, 
  Sparkles, MessageCircle, HelpCircle, Copy, Truck, Lock
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import RewardsTab from './RewardsTab';
import { getProductTitle } from '../data/translations';
import { getApiBaseUrl } from '../data/apiConfig';
import { copyToClipboard } from '../utils/clipboard';

const API_BASE = getApiBaseUrl();

export default function UserAccountModal({ isOpen, onClose, user, orders: allOrders, onLogout, addToast, t = (k) => k }) {
  const isTamil = false;

  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses' | 'offers' | 'support'
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState('');

  const handleCopyCoupon = async (code) => {
    if (!code) return;
    const ok = await copyToClipboard(code);
    setCopiedCoupon(code);
    if (ok && addToast) {
      addToast(`Copied Coupon Code: ${code}`, '📋');
    } else if (addToast) {
      addToast(`Coupon Code: ${code}`, '📋');
    }
    setTimeout(() => setCopiedCoupon(''), 3000);
  };

  // Cancel Order Modal State
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null);
  const [cancelReasonText, setCancelReasonText] = useState('Ordered by mistake / wrong item selected');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  const handleConfirmCancelOrder = async () => {
    if (!cancelTargetOrder) return;
    const finalReason = cancelReasonText.startsWith('Other') 
      ? (customCancelReason.trim() || 'Other reason') 
      : cancelReasonText;
    setIsCancellingOrder(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${cancelTargetOrder.orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: finalReason })
      });
      const data = await res.json();
      if (data.success) {
        if (addToast) addToast(`Order #${cancelTargetOrder.orderId} cancelled successfully!`, '🔴');
        setUserOrders(prev => prev.map(o => o.orderId === cancelTargetOrder.orderId ? { ...o, status: 'Cancelled', cancellationReason: finalReason } : o));
        setCancelTargetOrder(null);
      } else {
        if (addToast) addToast(data.message || 'Failed to cancel order', '⚠️');
      }
    } catch (err) {
      if (addToast) addToast('Network error while cancelling order', '⚠️');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  // Return Product Modal State
  const [returnTargetOrder, setReturnTargetOrder] = useState(null);
  const [returnReasonText, setReturnReasonText] = useState('Damaged / Defective Item Received');
  const [returnActionType, setReturnType] = useState('Replacement');
  const [returnNotesText, setReturnNotesText] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Client-side Styled Excel (.xls) Exporter for Customer Order History
  const handleExportUserOrdersExcel = () => {
    if (!userOrders || userOrders.length === 0) {
      if (addToast) addToast('No order history available to export!', '⚠️');
      return;
    }

    const escapeXml = (str) => {
      if (str === undefined || str === null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const rowsXml = userOrders.map((o, idx) => {
      const custName = o.customer?.name || user?.name || 'Customer';
      const custPhone = (o.customer?.phone || user?.phone) ? String(o.customer?.phone || user?.phone) : '';
      const custAddr = o.customer?.address || '';
      const itemsFormatted = (o.items || []).map(i => `${i.title || 'Product'} (x${i.quantity || 1}) - Rs.${i.price || 0}`).join('; ');
      const subtotal = parseFloat(o.subtotal || o.total || 0);
      const shipping = (o.shipping === 0 || o.shipping === '0' || o.shipping === 'FREE' || subtotal >= 1000) ? 0 : (typeof o.shipping === 'number' ? o.shipping : 60);
      const total = parseFloat(o.total || (subtotal + shipping));
      const payMethod = o.paymentMethod || 'COD';
      const payStatus = o.paymentStatus || (payMethod === 'COD' ? 'Pending' : 'Paid');
      const orderStatus = o.status || 'Order Placed';
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
      const reasonNote = o.cancellationReason || (o.returnDetails ? `${o.returnDetails.reason} (${o.returnDetails.returnType})` : '');
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      let statusBg = '#e2e8f0';
      let statusColor = '#334155';
      const statusLower = orderStatus.toLowerCase();
      if (statusLower.includes('delivered')) {
        statusBg = '#dcfce7'; statusColor = '#15803d';
      } else if (statusLower.includes('cancell')) {
        statusBg = '#fee2e2'; statusColor = '#b91c1c';
      } else if (statusLower.includes('return')) {
        statusBg = '#f3e8ff'; statusColor = '#6b21a8';
      } else if (statusLower.includes('process') || statusLower.includes('ship')) {
        statusBg = '#dbeafe'; statusColor = '#1e40af';
      }

      return `
        <tr style="height: 32px;">
          <td style="border: 1px solid #fed7aa; padding: 8px 12px; text-align: center; font-weight: bold; background-color: #fff3ed; color: #ea580c; mso-number-format:'\\@';">${escapeXml(o.orderId)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; background-color: #f8fafc; color: #334155;">${escapeXml(dateStr)}</td>
          <td style="border: 1px solid #e9d5ff; padding: 8px 12px; font-weight: bold; background-color: #f3e8ff; color: #7e22ce;">${escapeXml(custName)}</td>
          <td style="border: 1px solid #a5f3fc; padding: 8px 12px; text-align: center; font-weight: 600; background-color: #ecfeff; color: #0e7490; mso-number-format:'\\@';">${escapeXml(custPhone)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; background-color: #ffffff; color: #1e293b;">${escapeXml(custAddr)}</td>
          <td style="border: 1px solid #fef08a; padding: 8px 12px; background-color: #fefce8; color: #854d0e; font-weight: 500;">${escapeXml(itemsFormatted)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; font-weight: 600; background-color: #f1f5f9; color: #0f172a;">Rs. ${subtotal.toLocaleString('en-IN')}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${shipping === 0 ? '#dcfce7' : '#fee2e2'}; color: ${shipping === 0 ? '#15803d' : '#991b1b'};">${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</td>
          <td style="border: 1px solid #fdba74; padding: 8px 12px; text-align: right; font-weight: bold; font-size: 13px; background-color: #ffedd5; color: #c2410c;">Rs. ${total.toLocaleString('en-IN')}</td>
          <td style="border: 1px solid #bae6fd; padding: 8px 12px; text-align: center; font-weight: bold; background-color: #e0f2fe; color: #0369a1;">${escapeXml(payMethod)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${payStatus === 'Paid' ? '#d1fae5' : '#fef3c7'}; color: ${payStatus === 'Paid' ? '#047857' : '#b45309'};">${escapeXml(payStatus)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: center; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">${escapeXml(orderStatus)}</td>
          <td style="border: 1px solid #fecdd3; padding: 8px 12px; background-color: #fff1f2; color: #be123c;">${escapeXml(reasonNote)}</td>
        </tr>
      `;
    }).join('');

    const excelTemplate = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--[if gte mso 9]>
<xml>
  <x:ExcelWorkbook>
    <x:ExcelWorksheets>
      <x:ExcelWorksheet>
        <x:Name>My Order History</x:Name>
        <x:WorksheetOptions>
          <x:DisplayGridlines/>
        </x:WorksheetOptions>
      </x:ExcelWorksheet>
    </x:ExcelWorksheets>
  </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; }
  th { background-color: #FF5500; color: #ffffff; font-weight: bold; padding: 12px 10px; border: 1px solid #ea580c; text-align: center; font-size: 13px; vertical-align: middle; }
  td { vertical-align: middle; }
</style>
</head>
<body>
<table>
  <thead>
    <tr style="height: 38px;">
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Order ID</th>
      <th style="width: 170px; background-color: #FF5500; color: #ffffff;">Order Date &amp; Time</th>
      <th style="width: 180px; background-color: #FF5500; color: #ffffff;">Customer Name</th>
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Phone Number</th>
      <th style="width: 320px; background-color: #FF5500; color: #ffffff;">Delivery Address</th>
      <th style="width: 380px; background-color: #FF5500; color: #ffffff;">Purchased Products</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Subtotal (INR)</th>
      <th style="width: 120px; background-color: #FF5500; color: #ffffff;">Shipping Fee</th>
      <th style="width: 140px; background-color: #FF5500; color: #ffffff;">Grand Total (INR)</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Payment Method</th>
      <th style="width: 130px; background-color: #FF5500; color: #ffffff;">Payment Status</th>
      <th style="width: 150px; background-color: #FF5500; color: #ffffff;">Order Status</th>
      <th style="width: 250px; background-color: #FF5500; color: #ffffff;">Cancellation / Return Reason</th>
    </tr>
  </thead>
  <tbody>
    ${rowsXml}
  </tbody>
</table>
</body>
</html>`;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `FRIENDS_MOBILE_My_Orders_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (addToast) addToast('Excel Order Report downloaded successfully!', '📊');
  };

  const handleConfirmReturnOrder = async () => {
    if (!returnTargetOrder) return;
    setIsSubmittingReturn(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${returnTargetOrder.orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: returnReasonText,
          returnType: returnActionType,
          notes: returnNotesText 
        })
      });
      const data = await res.json();
      if (data.success) {
        if (addToast) addToast(`Return request for Order #${returnTargetOrder.orderId} submitted!`, '🔄');
        setUserOrders(prev => prev.map(o => o.orderId === returnTargetOrder.orderId ? {
          ...o,
          status: 'Return Requested',
          returnDetails: {
            reason: returnReasonText,
            returnType: returnActionType,
            notes: returnNotesText,
            requestedAt: new Date().toISOString()
          }
        } : o));
        setReturnTargetOrder(null);
      } else {
        if (addToast) addToast(data.message || 'Failed to submit return request', '⚠️');
      }
    } catch (err) {
      if (addToast) addToast('Network error while requesting return', '⚠️');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const [addresses, setAddresses] = useState(() => {
    if (user?.address && !user.address.includes('Double Tank')) {
      return [{ id: 1, title: 'Primary Delivery Address (Default)', address: user.address, isDefault: true }];
    }
    return [];
  });
  const [newAddressText, setNewAddressText] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  function handleDownloadInvoice(order) {
    if (!order) return;
    if (order.orderId && typeof window !== 'undefined') {
      try {
        const apiHost = getApiHost();
        const invoiceUrl = `${apiHost}/api/payments/invoice/${encodeURIComponent(order.orderId)}`;
        window.open(invoiceUrl, '_blank');
        return;
      } catch (_) {}
    }

    const isUPI = String(order.paymentMethod || '').toLowerCase().includes('upi') || 
                  String(order.paymentMethod || '').toLowerCase().includes('qr') || 
                  String(order.paymentMethod || '').toLowerCase().includes('online');

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
                <div class="meta-val">${order.customer?.name || user?.name || 'Valued Customer'}</div>
                <div class="meta-sub">📞 Phone: ${order.customer?.phone || user?.phone || 'N/A'}</div>
                <div class="meta-sub">📍 Address: ${order.shippingAddress || order.address || user?.address || 'Tamil Nadu, India'}</div>
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

  // Sync user saved address
  useEffect(() => {
    if (user?.address && !user.address.includes('Double Tank')) {
      setAddresses([{ id: 1, title: 'Primary Delivery Address (Default)', address: user.address, isDefault: true }]);
    }
  }, [user]);

  // ✅ Get user's orders from parent state (instant) + localStorage + try API
  useEffect(() => {
    if (isOpen && user) {
      const userPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
      const userEmail = (user.email || '').toLowerCase().trim();

      const combinedMap = new Map();

      // 1. Add matching orders from allOrders prop
      if (Array.isArray(allOrders)) {
        allOrders.forEach(order => {
          if (!order || !order.orderId) return;
          const orderPhone = (order.customer?.phone || '').replace(/\D/g, '').slice(-10);
          const orderEmail = (order.customer?.email || '').toLowerCase().trim();
          if ((userPhone && orderPhone === userPhone) || (userEmail && orderEmail === userEmail)) {
            combinedMap.set(order.orderId, order);
          }
        });
      }

      // 2. Add matching orders from localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('fm_user_orders') || '[]');
        if (Array.isArray(stored)) {
          stored.forEach(order => {
            if (!order || !order.orderId) return;
            const orderPhone = (order.customer?.phone || '').replace(/\D/g, '').slice(-10);
            const orderEmail = (order.customer?.email || '').toLowerCase().trim();
            if ((userPhone && orderPhone === userPhone) || (userEmail && orderEmail === userEmail)) {
              if (!combinedMap.has(order.orderId)) {
                combinedMap.set(order.orderId, order);
              }
            }
          });
        }
      } catch (_) {}

      const initialUserOrders = Array.from(combinedMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setUserOrders(initialUserOrders);

      // 3. Fetch from API in background
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
      if (data.success && Array.isArray(data.orders)) {
        setUserOrders(prev => {
          const map = new Map();
          prev.forEach(o => map.set(o.orderId, o));
          data.orders.forEach(o => map.set(o.orderId, o));
          return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        });
      }
    } catch (_) {
      // fallback already active
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

  if (!isOpen || typeof document === 'undefined') return null;
  const portalContainer = document.body || document.getElementById('root') || document.documentElement;
  if (!portalContainer) return null;

  return createPortal(
    <div className="full-page-user-dashboard">
      {/* Top Sticky Header */}
      <header className="dash-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <CompanyLogo size={32} />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(0.85rem, 3.2vw, 1.25rem)', fontWeight: '900', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              FRIENDS <span style={{ color: '#FF5500' }}>MOBILE</span> {isTamil ? 'போர்ட்டல்' : 'PORTAL'}
            </h2>
            <span className="admin-subtitle-mobile-hide" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isTamil ? 'வாடிக்கையாளர் கணக்கு மையம்' : 'Customer Executive Dashboard'}
            </span>
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
            <LogOut size={15} /> <span className="close-btn-label">{isTamil ? 'லாக்அவுட்' : 'Logout'}</span>
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
            <X size={16} /> <span className="close-btn-label">{isTamil ? 'ஸ்டோர்' : 'Store'}</span>
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
                  <h2 className="dash-user-name">{isTamil ? 'வணக்கம், ' : 'Hi, '}{user.name}</h2>
                </div>
                <div className="dash-user-info-list">
                  <span className="dash-user-info-item">
                    <Phone size={13} style={{ color: 'var(--primary-orange)' }} /> {user.phone}
                  </span>
                  <span className="dash-user-info-item">
                    <Mail size={13} style={{ color: 'var(--primary-orange)' }} /> {user.email || (isTamil ? 'பதிவுசெய்த வாடிக்கையாளர்' : 'Registered Customer')}
                  </span>
                  <span className="dash-user-info-item">
                    <MapPin size={13} style={{ color: 'var(--primary-orange)' }} /> {isTamil ? 'கரூர் / மதுரை, தமிழ்நாடு' : 'Madurai, Tamil Nadu'}
                  </span>
                </div>
              </div>
            </div>

            <div className="dash-welcome-actions">
              <button 
                onClick={() => setActiveTab('offers')}
                className="btn-coupon-view"
              >
                <Tag size={15} /> {isTamil ? 'என் கூப்பன்கள்' : 'View My Coupons'}
              </button>
            </div>
          </div>

          {/* Stats Metrics Cards Grid */}
          <div className="dash-stats-grid">
            <div className="dash-stat-card" onClick={() => setActiveTab('orders')}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="dash-stat-label">{isTamil ? 'மொத்த ஆர்டர்கள்' : 'Total Orders'}</span>
                <h3 className="dash-stat-value">{userOrders.length}</h3>
              </div>
              <ShoppingBag size={18} className="dash-stat-icon-right" />
            </div>

            <div className="dash-stat-card" onClick={() => setActiveTab('orders')}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="dash-stat-label">{isTamil ? 'நடப்பு டெலிவரிகள்' : 'Active Deliveries'}</span>
                <h3 className="dash-stat-value">{activeOrdersCount}</h3>
              </div>
              <Truck size={18} className="dash-stat-icon-right" />
            </div>

            <div className="dash-stat-card" onClick={() => setActiveTab('offers')}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="dash-stat-label">{isTamil ? 'ரிவார்டு புள்ளிகள்' : 'Reward Points'}</span>
                <h3 className="dash-stat-value">₹450</h3>
              </div>
              <Star size={18} className="dash-stat-icon-right" />
            </div>

            <div className="dash-stat-card" onClick={() => setActiveTab('offers')}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="dash-stat-label">{isTamil ? 'கூப்பன்கள்' : 'Active Vouchers'}</span>
                <h3 className="dash-stat-value">{isTamil ? '3 உள்ளது' : '3 Available'}</h3>
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
                <ShoppingBag size={18} /> {isTamil ? 'என் ஆர்டர்கள் & டிரேக்கிங்' : 'My Orders & Tracking'}
              </button>

              <button 
                onClick={() => setActiveTab('profile')}
                className={`dash-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User size={18} /> {isTamil ? 'சுயவிவரம் & பாதுகாப்பு' : 'Profile & Security'}
              </button>

              <button 
                onClick={() => setActiveTab('addresses')}
                className={`dash-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              >
                <MapPin size={18} /> {isTamil ? 'டெலிவரி முகவரிகள்' : 'Delivery Addresses'}
              </button>

              <button 
                onClick={() => setActiveTab('rewards')}
                className={`dash-nav-item ${activeTab === 'rewards' ? 'active' : ''}`}
                style={{ color: '#FF5500', fontWeight: '800' }}
              >
                <Sparkles size={18} color="#FF5500" /> {isTamil ? '🎁 பிரண்ட்ஸ் ரிவார்டுகள் (' : '🎁 Friends Rewards ('}{user?.rewardPoints || 150} {isTamil ? 'புள்ளிகள்)' : 'PTS)'}
              </button>

              <button 
                onClick={() => setActiveTab('offers')}
                className={`dash-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
              >
                <Tag size={18} /> {isTamil ? 'சிறப்பு கூப்பன்கள்' : 'Exclusive Coupons'}
              </button>

              <button 
                onClick={() => setActiveTab('support')}
                className={`dash-nav-item ${activeTab === 'support' ? 'active' : ''}`}
              >
                <HelpCircle size={18} /> {isTamil ? 'வாடிக்கையாளர் உதவி மையம்' : 'Help Desk & Support'}
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
                <LogOut size={18} /> {isTamil ? 'கணக்கில் இருந்து வெளியேற' : 'Log Out Account'}
              </button>
            </div>

            {/* Main Content Workspace */}
            <div className="dash-workspace-card">

              {/* TAB 1: ORDERS & TRACKING */}
              {activeTab === 'orders' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>{isTamil ? 'என் ஆர்டர்கள் & நேரலை டிரேக்கிங்' : 'Order History'}</h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{isTamil ? 'உங்கள் ஆர்டர்களின் விவரங்கள் மற்றும் டெலிவரி நிலை' : 'Review your past purchases'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {userOrders.length > 0 && (
                        <button
                          type="button"
                          onClick={handleExportUserOrdersExcel}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: 'none',
                            background: '#10b981',
                            color: '#ffffff',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
                          }}
                        >
                          {isTamil ? 'எக்செல் பதிவிறக்கம்' : 'Download Excel Sheet'}
                        </button>
                      )}

                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#FF5500', background: 'var(--orange-light)', padding: '6px 14px', borderRadius: '20px' }}>
                        {userOrders.length} {isTamil ? 'ஆர்டர்கள் செய்யப்பட்டுள்ளன' : 'Orders Placed'}
                      </span>
                    </div>
                  </div>

                  {isLoading ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{isTamil ? 'ஆர்டர் விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading your order history...'}</p>
                  ) : userOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-input)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        <ShoppingBag size={56} color="var(--text-muted)" />
                      </div>
                      <h3 style={{ margin: '0 0 8px 0', fontWeight: '800' }}>{isTamil ? 'நீங்கள் இதுவரை ஆர்டர் செய்யவில்லை' : 'No Orders Found Yet'}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
                        {isTamil ? 'பிரண்ட்ஸ் மொபைல் ஷோரூமில் நீங்கள் இதுவரை ஆர்டர் எதுவும் செய்யவில்லை. எங்கள் புதிய பொருட்களை இப்போதே பாருங்கள்!' : 'You haven\'t placed any mobile or accessory orders with FRIENDS MOBILE yet. Explore our latest collection today!'}
                      </p>
                      <button className="auth-submit-btn" onClick={onClose} style={{ width: 'auto', padding: '12px 30px', margin: '0 auto' }}>
                        {isTamil ? 'இப்போதே வாங்குங்கள்' : 'START SHOPPING NOW'} <ArrowRight size={18} />
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
                                  <span style={{
                                    fontSize: '0.75rem',
                                    background: (order.status || '').toLowerCase().includes('cancel') ? 'rgba(239, 68, 68, 0.15)' : (order.status || '').toLowerCase().includes('return') ? 'rgba(168, 85, 247, 0.15)' : 'var(--orange-light)',
                                    color: (order.status || '').toLowerCase().includes('cancel') ? '#ef4444' : (order.status || '').toLowerCase().includes('return') ? '#a855f7' : '#FF5500',
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontWeight: '800'
                                  }}>
                                    {(order.status || '').toLowerCase().includes('cancel') ? 'Cancelled' : order.status || 'Order Placed'}
                                  </span>
                                </div>
                                {order.cancellationReason && (
                                  <div style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '4px', fontStyle: 'italic', fontWeight: '600' }}>
                                    Cancellation Reason: {order.cancellationReason}
                                  </div>
                                )}
                                {order.returnDetails && (
                                  <div style={{ fontSize: '0.74rem', color: '#a855f7', marginTop: '4px', fontStyle: 'italic', fontWeight: '600' }}>
                                    Return Reason: {order.returnDetails.reason} ({order.returnDetails.returnType})
                                  </div>
                                )}
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
                                <span>Delivery Charge:</span>
                                <strong>{(order.shipping === 0 || order.shipping === 'FREE') ? 'FREE' : `₹${(order.shipping === 'Pending' || order.shipping === undefined || order.shipping === null) ? 60 : order.shipping}`}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: '800', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '4px', color: 'var(--text-primary)' }}>
                                <span>Total Amount:</span>
                                <span>₹{order.total?.toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            {/* Action Row: Cancel Order + Download E-Bill */}
                            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              {/* Cancel Order Action Button */}
                              {(!order.status || !['shipped', 'out for delivery', 'delivered', 'cancelled', 'return requested'].some(s => (order.status || '').toLowerCase().includes(s))) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelTargetOrder(order);
                                    setCancelReasonText('Ordered by mistake / wrong item selected');
                                  }}
                                  style={{
                                    padding: '8px 16px', borderRadius: '10px',
                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#ef4444', fontWeight: '800', fontSize: '0.8rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  {isTamil ? 'ஆர்டரை ரத்து செய்க' : 'Cancel Order'}
                                </button>
                              )}

                              {/* Return / Exchange Product Action Button */}
                              {(!order.status || !['cancelled', 'return requested', 'return approved', 'return refunded'].some(s => (order.status || '').toLowerCase().includes(s))) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReturnTargetOrder(order);
                                    setReturnReasonText('Damaged / Defective Item Received');
                                    setReturnType('Replacement');
                                    setReturnNotesText('');
                                  }}
                                  style={{
                                    padding: '8px 16px', borderRadius: '10px',
                                    border: '1px solid rgba(168, 85, 247, 0.4)',
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    color: '#a855f7', fontWeight: '800', fontSize: '0.8rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  {isTamil ? 'பொருளைத் திருப்புக / மாற்றுக' : 'Return / Exchange Product'}
                                </button>
                              )}

                              <button
                                onClick={() => handleDownloadInvoice(order)}
                                style={{
                                  padding: '8px 16px', borderRadius: '10px', border: 'none',
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  color: '#ffffff', fontWeight: '800', fontSize: '0.8rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                                }}
                              >
                                📄 {isTamil ? 'பில் பதிவிறக்கம் (Tax Invoice)' : 'Download E-Bill (Tax Invoice)'}
                              </button>
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

              {/* TAB: FRIENDS REWARDS & POINTS */}
              {activeTab === 'rewards' && (
                <RewardsTab 
                  currentUser={user}
                  onUpdateUserProfile={(updatedUser) => {
                    localStorage.setItem('fm_user', JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event('storage'));
                  }}
                  addToast={addToast}
                />
              )}

              {/* TAB 4: COUPONS & OFFERS */}
              {activeTab === 'offers' && (
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: '800' }}>Your Available Coupons &amp; Vouchers</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Apply these codes at checkout for instant savings</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Claimed Reward Coupons */}
                    {Array.isArray(user?.claimedCoupons) && user.claimedCoupons.map((c, idx) => (
                      <div key={idx} className="dash-coupon-card" style={{ border: '1.5px solid #22c55e', background: 'rgba(34,197,94,0.06)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Sparkles size={18} color="#22c55e" />
                            <strong style={{ fontSize: '1.1rem', color: '#FF5500', fontFamily: 'monospace' }}>{c.code}</strong>
                            <span style={{ fontSize: '0.7rem', background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                              REWARD OFFER
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600' }}>{c.title || `${c.code} Discount Coupon`}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valid on orders above ₹{c.minOrderValue || 299}</span>
                        </div>
                        <button 
                          onClick={() => handleCopyCoupon(c.code)}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '10px',
                            border: 'none',
                            background: copiedCoupon === c.code ? '#22c55e' : '#FF5500',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Copy size={16} /> {copiedCoupon === c.code ? 'COPIED!' : 'COPY CODE'}
                        </button>
                      </div>
                    ))}

                    <div className="dash-coupon-card">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Tag size={18} color="#FF5500" />
                          <strong style={{ fontSize: '1.1rem', color: '#FF5500' }}>FRIENDS10</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600' }}>10% Instant Discount on Accessories</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valid on orders above ₹1,000</span>
                      </div>
                      <button 
                        onClick={() => handleCopyCoupon('FRIENDS10')}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: copiedCoupon === 'FRIENDS10' ? '#22c55e' : '#FF5500',
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
                          background: copiedCoupon === 'FREESHIP' ? '#10b981' : '#FF5500',
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
                        href="https://wa.me/919344522086" 
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
                      <strong style={{ fontSize: '1.1rem', color: '#FF5500', display: 'block' }}>+91 93445 22086</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
      {/* Cancellation Reason Choice Modal */}
      {cancelTargetOrder && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)', zIndex: 100035, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(8px)', boxSizing: 'border-box'
          }}
          onClick={() => setCancelTargetOrder(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '20px', padding: '24px', maxWidth: '440px', width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isTamil ? 'ஆர்டர் ரத்து செய்தல் #' : 'Cancel Order #'}{cancelTargetOrder.orderId}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
              {isTamil ? 'இந்த ஆர்டரை நிச்சயமாக ரத்து செய்ய விரும்புகிறீர்களா? கீழே உள்ள காரணத்தைத் தேர்ந்தெடுக்கவும்:' : 'Are you sure you want to cancel this order? Please select a reason below to process your cancellation:'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {(isTamil ? [
                'தவறுதலாக ஆர்டர் செய்துவிட்டேன்',
                'டெலிவரி தாமதமாகிறது',
                'வேறு இடத்தில் குறைந்த விலையில் கிடைக்கிறது',
                'முகவரி / போன் எண் தவறு',
                'மற்ற காரணம் (கீழே எழுதவும்)'
              ] : [
                'Ordered by mistake / wrong item selected',
                'Delivery taking too long',
                'Found a better price elsewhere',
                'Incorrect shipping address / phone number',
                'Other (Write manual custom reason)'
              ]).map(reason => (
                <div key={reason}>
                  <label 
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                      borderRadius: '10px', border: cancelReasonText === reason ? '2px solid #ef4444' : '1px solid var(--border-color)',
                      background: cancelReasonText === reason ? 'rgba(239,68,68,0.08)' : 'var(--bg-input)',
                      color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="cancelReason" 
                      checked={cancelReasonText === reason} 
                      onChange={() => {
                        setCancelReasonText(reason);
                        if (!reason.includes('Other') && !reason.includes('மற்ற')) {
                          setCustomCancelReason('');
                        }
                      }}
                      style={{ accentColor: '#ef4444' }}
                    />
                    {reason}
                  </label>

                  {/* Manual Custom Reason Text Area */}
                  {(reason.includes('Other') || reason.includes('மற்ற')) && cancelReasonText === reason && (
                    <div style={{ marginTop: '8px', paddingLeft: '8px' }}>
                      <textarea
                        value={customCancelReason}
                        onChange={(e) => setCustomCancelReason(e.target.value)}
                        placeholder={isTamil ? 'உங்கள் ரத்து செய்தலுக்கான காரணத்தை எழுதவும்...' : 'Write your custom cancellation reason here...'}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #ef4444',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          outline: 'none',
                          resize: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCancelTargetOrder(null)}
                style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                {isTamil ? 'ஆர்டரைத் தொடர்க' : 'Keep Order'}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                disabled={isCancellingOrder}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}
              >
                {isCancellingOrder ? (isTamil ? 'ரத்து செய்யப்படுகிறது...' : 'Cancelling...') : (isTamil ? 'ரத்து செய்வதை உறுதிசெய்' : 'Confirm Cancellation')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Return Product Request Choice Modal */}
      {returnTargetOrder && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)', zIndex: 100036, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(8px)', boxSizing: 'border-box'
          }}
          onClick={() => setReturnTargetOrder(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '20px', padding: '24px', maxWidth: '480px', width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '800', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isTamil ? 'பொருளைத் திருப்புதல் / மாற்றுதல் #' : 'Return / Exchange Order #'}{returnTargetOrder.orderId}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
              {isTamil ? 'பொருளைத் திரும்ப அனுப்ப அல்லது மாற்ற கோரிக்கை சமர்ப்பிக்கவும். எங்கள் 7 நாள் உத்தரவாதத்தின் கீழ் 24 மணி நேரத்திற்குள் செயல்படுத்தப்படும்:' : 'Submit a return or replacement request. Our FRIENDS MOBILE support team will process your request within 24 hours under our 7-Day Guarantee:'}
            </p>

            {/* Select Return Action Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                {isTamil ? 'கோரப்படும் நடவடிக்கை:' : 'Select Requested Action:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReturnType('Replacement')}
                  style={{
                    padding: '10px', borderRadius: '10px',
                    border: returnActionType === 'Replacement' ? '2px solid #a855f7' : '1px solid var(--border-color)',
                    background: returnActionType === 'Replacement' ? 'rgba(168,85,247,0.1)' : 'var(--bg-input)',
                    color: returnActionType === 'Replacement' ? '#a855f7' : 'var(--text-primary)',
                    fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer'
                  }}
                >
                  {isTamil ? 'இலவசமாக மாற்றுக' : 'Free Replacement'}
                </button>
                <button
                  type="button"
                  onClick={() => setReturnType('Refund')}
                  style={{
                    padding: '10px', borderRadius: '10px',
                    border: returnActionType === 'Refund' ? '2px solid #a855f7' : '1px solid var(--border-color)',
                    background: returnActionType === 'Refund' ? 'rgba(168,85,247,0.1)' : 'var(--bg-input)',
                    color: returnActionType === 'Refund' ? '#a855f7' : 'var(--text-primary)',
                    fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer'
                  }}
                >
                  💳 {isTamil ? 'பணத்தை திரும்பப் பெறுக' : 'Full Refund'}
                </button>
              </div>
            </div>

            {/* Select Return Reason */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {isTamil ? 'காரணம்:' : 'Reason for Return:'}
              </label>
              {(isTamil ? [
                'பொருள் சேதமடைந்துள்ளது',
                'தவறான பொருள் வழங்கப்பட்டுள்ளது',
                'தரம் எதிர்பார்த்தபடி இல்லை',
                'அளவு / பொருத்தம் பிரச்சனை',
                'யோசனை மாறியது / தேவையில்லை'
              ] : [
                'Damaged / Defective Item Received',
                'Wrong Product / Model Delivered',
                'Item Quality Not as Expected',
                'Size / Fitting Issue',
                'Changed Mind / Don\'t Need Anymore'
              ]).map(reason => (
                <label 
                  key={reason}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                    borderRadius: '10px', border: returnReasonText === reason ? '2px solid #a855f7' : '1px solid var(--border-color)',
                    background: returnReasonText === reason ? 'rgba(168,85,247,0.08)' : 'var(--bg-input)',
                    color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  <input 
                    type="radio" 
                    name="returnReason" 
                    checked={returnReasonText === reason} 
                    onChange={() => setReturnReasonText(reason)}
                    style={{ accentColor: '#a855f7' }}
                  />
                  {reason}
                </label>
              ))}
            </div>

            {/* Additional Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                {isTamil ? 'கூடுதல் பிரச்சனை விவரங்கள் (விருப்பப்பட்டால்):' : 'Additional Issue Description (Optional):'}
              </label>
              <textarea
                value={returnNotesText}
                onChange={(e) => setReturnNotesText(e.target.value)}
                placeholder={isTamil ? 'பொருளின் பிரச்சனை குறித்து விவரிக்கவும்...' : 'Describe any specific issue with the product...'}
                style={{
                  width: '100%', height: '70px', padding: '10px', borderRadius: '10px',
                  border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', outline: 'none', fontSize: '0.8rem',
                  resize: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setReturnTargetOrder(null)}
                style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                {isTamil ? 'மூடுக' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReturnOrder}
                disabled={isSubmittingReturn}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #a855f7, #9333ea)', color: '#ffffff', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(168,85,247,0.35)' }}
              >
                {isSubmittingReturn ? (isTamil ? 'அனுப்பப்படுகிறது...' : 'Submitting...') : (isTamil ? 'ரிட்டர்ன் கோரிக்கையை அனுப்புக' : 'Submit Return Request')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    portalContainer
  );
}
