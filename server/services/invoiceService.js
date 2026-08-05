const fs = require('fs');
const path = require('path');

const InvoiceService = {
  // Generate HTML template for printable E-Bill Tax Invoice
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

    const itemsRows = items.map((item, idx) => {
      const title = item.title || item.name || 'Product Item';
      const qty = item.quantity || 1;
      const price = item.price || 0;
      const lineTotal = price * qty;
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="padding: 10px; font-weight: 600;">${title}</td>
          <td style="padding: 10px; text-align: center;">₹${price.toLocaleString('en-IN')}</td>
          <td style="padding: 10px; text-align: center;">${qty}</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; color: #FF5500;">₹${lineTotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Bill Invoice #${orderId} - FRIENDS MOBILE</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .action-bar { max-width: 650px; margin: 0 auto 16px auto; display: flex; gap: 12px; justify-content: space-between; align-items: center; flex-wrap: wrap; }
    .btn-return { display: inline-flex; align-items: center; gap: 8px; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); transition: background 0.2s ease; }
    .btn-return:hover { background: #1e293b; }
    .btn-print { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #FF5500, #E03E00); color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(255, 85, 0, 0.25); transition: transform 0.2s ease; }
    .btn-print:hover { transform: translateY(-1px); }
    .invoice-card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #FF5500; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-title { font-size: 24px; font-weight: 900; color: #FF5500; margin: 0; }
    .brand-subtitle { font-size: 12px; color: #64748b; margin: 2px 0 0 0; font-weight: 600; }
    .badge-paid { background: #dcfce7; color: #15803d; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; border: 1px solid #bbf7d0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f1f5f9; padding: 16px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; }
    .info-box h5 { margin: 0 0 4px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-box p { margin: 0; font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { background: #FF5500; color: #ffffff; padding: 10px; text-align: left; font-size: 12px; }
    th:first-child { border-top-left-radius: 8px; text-align: center; }
    th:last-child { border-top-right-radius: 8px; text-align: right; }
    .summary-box { background: #fff3ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; margin-top: 16px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
    .summary-row.total { font-size: 16px; font-weight: 900; color: #c2410c; border-top: 1.5px dashed #fdba74; padding-top: 8px; margin-bottom: 0; }
    .footer-note { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print { 
      .no-print { display: none !important; }
      body { background: none; padding: 0; } 
      .invoice-card { box-shadow: none; border: none; } 
    }
  </style>
</head>
<body>
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
        <h1 class="brand-title">📱 FRIENDS MOBILE</h1>
        <p class="brand-subtitle">South Gandhigramam, Karur / Madurai, Tamil Nadu • Support: +91 74485 78507</p>
      </div>
      <div>
        <span class="badge-paid">✓ OFFICIAL E-BILL / RECEIPT</span>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h5>Customer Details</h5>
        <p>${customer.name || 'Valued Customer'}</p>
        <p>📞 ${customer.phone || 'N/A'}</p>
        <p style="font-weight: 400; font-size: 12px; margin-top: 2px;">${customer.address || ''}</p>
      </div>
      <div class="info-box" style="text-align: right;">
        <h5>Invoice Details</h5>
        <p>Invoice #${orderId}</p>
        <p style="font-weight: 400;">Date: ${createdAt}</p>
        <p style="font-size: 12px; color: #16a34a; margin-top: 2px;">Method: ${paymentMethod} (${paymentStatus})</p>
        <p style="font-size: 11px; color: #64748b; font-family: monospace;">TXN Ref: ${transactionId}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Item Description</th>
          <th style="width: 90px; text-align: center;">Price</th>
          <th style="width: 50px; text-align: center;">Qty</th>
          <th style="width: 100px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>₹${subtotal.toLocaleString('en-IN')}</span>
      </div>
      <div class="summary-row">
        <span>Express Delivery Charge:</span>
        <span style="color: ${shipping === 0 ? '#15803d' : '#0f172a'}; font-weight: bold;">${shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
      </div>
      <div class="summary-row total">
        <span>Grand Total Amount Paid:</span>
        <span>₹${total.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div class="footer-note">
      <p style="margin: 0 0 4px 0;">✨ Thank you for your purchase with <strong>FRIENDS MOBILE</strong>!</p>
      <p style="margin: 0;">This is a computer-generated tax invoice and requires no signature.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;
  }
};

module.exports = InvoiceService;
