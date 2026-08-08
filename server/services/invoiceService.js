const fs = require('fs');
const path = require('path');

const InvoiceService = {
  // Generate HTML template for printable / downloadable E-Bill Tax Invoice
  generateInvoiceHtml: (order) => {
    if (!order) return '';

    const orderId = order.orderId || 'FM-ORD-000000';
    const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
    const customer = order.customer || {};
    const items = order.items || [];
    const subtotal = order.subtotal || 0;
    const shipping = order.shipping === 0 || order.shipping === 'FREE' ? 0 : (typeof order.shipping === 'number' ? order.shipping : 60);
    const total = order.total || (subtotal + shipping);
    const paymentMethod = order.paymentMethod || 'UPI QR Code';
    const paymentStatus = order.paymentStatus || 'Paid';
    const transactionId = order.razorpayPaymentId || order.transactionUtr || `TXN-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const isUPI = String(paymentMethod || '').toLowerCase().includes('upi') || 
                  String(paymentMethod || '').toLowerCase().includes('qr') || 
                  String(paymentMethod || '').toLowerCase().includes('online');

    const itemsRows = items.map((item, idx) => {
      const title = item.title || item.name || 'Product Item';
      const qty = item.quantity || 1;
      const price = item.price || 0;
      const lineTotal = price * qty;
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 12px; text-align: center; font-weight: bold; width: 40px;">${idx + 1}</td>
          <td style="padding: 10px 12px; font-weight: 600; text-align: left;">${title}</td>
          <td style="padding: 10px 12px; text-align: center; width: 60px;">${qty}</td>
          <td style="padding: 10px 12px; text-align: right; width: 90px; white-space: nowrap;">₹${price.toLocaleString('en-IN')}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 800; color: #ff5500; width: 100px; white-space: nowrap;">₹${lineTotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>E-Bill Invoice #${orderId} - FRIENDS MOBILE</title>
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
    .invoice-wrapper {
      max-width: 760px;
      margin: 0 auto;
    }
    .action-bar {
      display: flex;
      gap: 10px;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .btn-return {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #0f172a;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      flex: 1;
      text-align: center;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
      transition: background 0.2s ease;
      cursor: pointer;
    }
    .btn-return:hover { background: #1e293b; }
    .btn-print {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: linear-gradient(135deg, #ff5500, #e03e00);
      color: #ffffff;
      border: none;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      flex: 1;
      text-align: center;
      box-shadow: 0 4px 12px rgba(255, 85, 0, 0.25);
      transition: transform 0.2s ease;
    }
    .btn-print:hover { transform: translateY(-1px); }
    .invoice-card {
      position: relative;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      border-bottom: 3px solid #ff5500;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo-title {
      font-size: 24px;
      font-weight: 900;
      color: #ff5500;
      margin: 0;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }
    .sub-title {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      font-weight: 600;
      line-height: 1.4;
    }
    .header-right {
      text-align: right;
      flex-shrink: 0;
    }
    .invoice-tag {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .status-badge {
      display: inline-block;
      border: 1.5px solid #166534;
      background: #dcfce7;
      color: #166534;
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .status-badge.cod {
      border-color: #ea580c;
      background: #fff7ed;
      color: #ea580c;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }
    .meta-box {
      background: #f8fafc;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .meta-val {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      word-break: break-word;
    }
    .meta-sub {
      font-size: 12px;
      color: #475569;
      margin-top: 3px;
      line-height: 1.35;
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
      margin-bottom: 20px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      background: #ffffff;
    }
    th {
      background: #f8fafc;
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
      font-weight: 800;
      white-space: nowrap;
    }
    .total-box {
      width: 100%;
      max-width: 340px;
      margin-left: auto;
      background: #fff7ed;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1.5px solid #ffedd5;
      margin-top: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 4px 0;
      color: #475569;
    }
    .grand-total {
      font-size: 16px;
      font-weight: 900;
      color: #ff5500;
      border-top: 2px dashed #fdba74;
      padding-top: 8px;
      margin-top: 6px;
    }
    .footer-note {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      line-height: 1.5;
    }
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
      <a href="https://friendsmobiles.unitaryx.org/" id="btn-return-link" class="btn-return">
        🏠 Return to Website
      </a>
      <button onclick="window.print()" class="btn-print">
        🖨️ Save as PDF / Print
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
          ${isUPI ? `
            <div class="status-badge">✓ PAID (ONLINE UPI VERIFIED)</div>
          ` : `
            <div class="status-badge cod">📦 CASH ON DELIVERY ORDER</div>
          `}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-box">
          <div class="meta-label">Customer Billed Details</div>
          <div class="meta-val">${customer.name || 'Valued Customer'}</div>
          <div class="meta-sub">📞 Phone: ${customer.phone || 'N/A'}</div>
          <div class="meta-sub">📍 Address: ${customer.address || 'Tamil Nadu, India'}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Payment & Order Info</div>
          <div class="meta-val">Order ID: #${orderId}</div>
          <div class="meta-sub">📅 Order Date: ${createdAt}</div>
          <div class="meta-sub">💳 Payment Mode: <strong>${paymentMethod}</strong></div>
          <div class="meta-sub" style="color: #166534; font-weight: 700;">Status: ${paymentStatus}</div>
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
        <div class="total-row"><span>Subtotal:</span><strong>₹${subtotal.toLocaleString('en-IN')}</strong></div>
        <div class="total-row"><span>Shipping & Delivery:</span><strong>${shipping === 0 ? 'FREE' : '₹' + shipping}</strong></div>
        <div class="total-row grand-total"><span>Total Amount Paid:</span><span>₹${total.toLocaleString('en-IN')}</span></div>
      </div>

      <div class="footer-note">
        This is an official computer-generated E-Bill Tax Invoice for Order #${orderId}.<br/>
        Thank you for shopping with <strong>FRIENDS MOBILE</strong>!
      </div>
    </div>
  </div>

  <script>
    (function() {
      var isAPK = typeof window !== 'undefined' && (
        window.Capacitor !== undefined ||
        window.location.protocol === 'capacitor:' ||
        window.location.protocol === 'file:' ||
        navigator.userAgent.indexOf('Capacitor') !== -1 ||
        window.location.search.indexOf('app=true') !== -1
      );

      var returnBtn = document.getElementById('btn-return-link');
      if (returnBtn) {
        if (isAPK) {
          returnBtn.innerHTML = '📱 Return to App';
          returnBtn.onclick = function(e) {
            e.preventDefault();
            if (window.history && window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
            }
          };
        } else {
          returnBtn.innerHTML = '🏠 Return to Website';
          returnBtn.href = 'https://friendsmobiles.unitaryx.org/';
        }
      }
    })();
  </script>
</body>
</html>`;
  }
};

module.exports = InvoiceService;
