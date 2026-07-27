const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[Email Warning] nodemailer module not loaded yet.');
}

const getSmtpHost = () => {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  if (host.includes('@')) {
    return 'smtp.gmail.com';
  }
  return host;
};
const getSmtpPort = () => parseInt(process.env.SMTP_PORT || '465', 10);
const getGmailUser = () => (process.env.SMTP_USER || process.env.GMAIL_USER || 'noreplyfriendsmobiles@gmail.com').trim();
const getGmailPassword = () => (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'fsthwswldbblrslw').replace(/\s+/g, '').trim();

const getSmtpAccounts = () => {
  const user = getGmailUser();
  const pass = getGmailPassword();
  if (user && pass) {
    return [{ user, pass }];
  }
  return [];
};

const createTransporterForCreds = (user, pass, port = 465) => {
  if (!nodemailer) return null;
  const host = getSmtpHost();

  // Create explicit transport with custom TLS options for container compatibility
  return nodemailer.createTransport({
    host: host.includes('gmail') ? 'smtp.gmail.com' : host,
    port: port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 3000,
    socketTimeout: 4000
  });
};

async function sendOTPEmail(toEmail, otpCode, customerName = 'Valued Customer') {
  const accounts = getSmtpAccounts();

  if (!nodemailer || accounts.length === 0) {
    console.error(`[OTP Email Error] No SMTP credentials configured. Cannot send OTP to ${toEmail}.`);
    return { success: false, error: 'SMTP email service is not configured on this server. Please contact support.' };
  }

  const configuredPort = getSmtpPort();
  const ports = configuredPort === 587 ? [587, 465] : [465, 587];
  let lastError = null;

  for (const account of accounts) {
    if (!account.user || !account.pass) continue;

    for (const port of ports) {
      try {
        console.log(`[SMTP Dispatch] Attempting send to ${toEmail} via ${account.user} on host: ${getSmtpHost()}, port: ${port}`);
        const transporter = createTransporterForCreds(account.user, account.pass, port);
        if (!transporter) continue;

        const mailOptions = {
          from: `"Friends Mobiles Store" <${account.user}>`,
          to: toEmail,
          subject: `FRIENDS MOBILE - ${otpCode} is your Verification Code`,
          text: `Hello ${customerName},\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code is valid for 5 minutes. Please do not share this code with anyone.\n\nRegards,\nFriends Mobiles Store`,
          headers: {
            'X-Priority': '1',
            'Importance': 'high'
          },
          html: `
            <div style="font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #FF5500 0%, #E03E00 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
                <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 2px;">FRIENDS <span style="color: #FFE600;">MOBILE</span></div>
                <p style="margin: 0; font-size: 13px; opacity: 0.95; font-weight: 500;">Official Member Security &amp; Verification Portal</p>
              </div>

              <div style="padding: 30px 28px; color: #1e293b;">
                <h3 style="margin: 0 0 12px 0; font-size: 19px; font-weight: 800; color: #0f172a;">Hello, ${customerName}!</h3>
                <p style="margin: 0 0 22px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                  We received a request to verify your identity. Use the 6-digit verification code below:
                </p>

                <div style="background: #fff7ed; border: 2px dashed #ff5500; border-radius: 14px; padding: 20px 16px; text-align: center; margin-bottom: 24px;">
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #c2410c; font-weight: 800; margin-bottom: 6px;">Your One-Time Verification Code</div>
                  <span style="font-size: 36px; font-weight: 900; color: #ff5500; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; display: inline-block;">${otpCode}</span>
                </div>

                <div style="background: #fff7ed; border-left: 4px solid #ff5500; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 12.5px; color: #c2410c; line-height: 1.5;">
                    <strong>Time Sensitive:</strong> This code will expire in <strong>5 minutes</strong>. Please verify promptly.
                  </p>
                </div>

                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 12.5px; color: #991b1b; line-height: 1.5;">
                    <strong>Security Tip:</strong> FRIENDS MOBILE will never ask for your OTP over phone calls or messages. Never share this code with anyone.
                  </p>
                </div>

                <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                  If you did not request this verification code, please ignore this message or contact support if you suspect unauthorized access.
                </p>
              </div>

              <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
                <strong>FRIENDS MOBILE Store</strong> • South Gandhigramam, Karur / Madurai, Tamil Nadu<br />
                Need help? Call Helpline: <strong style="color: #ff5500;">+91 93445 22086</strong>
              </div>
            </div>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Success] OTP sent via ${account.user} (Port ${port}) to ${toEmail}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId, sender: account.user };
      } catch (err) {
        console.warn(`[Email Attempt Failed] Account ${account.user} (Port ${port}): ${err.message}`);
        lastError = err.message;
      }
    }
  }

  console.error(`[OTP Email Failed] Could not send OTP to ${toEmail}. Last error: ${lastError}`);
  return { success: false, error: lastError || 'Failed to connect to Gmail SMTP server. Please check SMTP credentials.' };
}

async function sendOrderEmail(toEmail, orderDetails = {}, subjectTitle = 'FRIENDS MOBILE - Order Confirmation') {
  if (!nodemailer) {
    return { success: false, error: 'Nodemailer unavailable.' };
  }

  const configuredPort = getSmtpPort();
  const ports = configuredPort === 587 ? [587, 465] : [465, 587];
  const accounts = getSmtpAccounts();
  let lastError = null;

  const customerName = orderDetails.customer?.name || 'Valued Customer';
  const orderId = orderDetails.orderId || 'FM-ORD-XXXXXX';
  const items = orderDetails.items || [];
  const total = orderDetails.total || 0;

  const itemsHtml = items.map(item => `
    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13.5px;">
      <span><strong>${item.name || 'Mobile Accessory'}</strong> x ${item.quantity || 1}</span>
      <span style="color: #ff5500; font-weight: 700;">₹${(item.price || 0) * (item.quantity || 1)}</span>
    </div>
  `).join('');

  for (const account of accounts) {
    if (!account.user || !account.pass) continue;
    for (const port of ports) {
      try {
        const transporter = createTransporterForCreds(account.user, account.pass, port);
        if (!transporter) continue;

        const mailOptions = {
          from: `"Friends Mobiles Store" <${account.user}>`,
          to: toEmail,
          subject: `${subjectTitle} (#${orderId})`,
          text: `Hello ${customerName},\n\nOrder #${orderId} update from FRIENDS MOBILE.\nTotal: ₹${total}\nStatus: ${orderDetails.status || 'Received'}\n\nThank you for shopping with us!`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
              <div style="background: linear-gradient(135deg, #FF5500 0%, #E03E00 100%); padding: 24px; text-align: center; color: #ffffff;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 900;">FRIENDS MOBILE</h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Store Order Update</p>
              </div>

              <div style="padding: 24px; color: #1e293b;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">Hello ${customerName},</h3>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">
                  Here is the status of your order <strong>#${orderId}</strong>:
                </p>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Order Summary</div>
                  ${itemsHtml.length > 0 ? itemsHtml : '<p style="margin:0; font-size: 13px;">Items listed in order summary</p>'}
                  <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 2px solid #e2e8f0; font-size: 15px; font-weight: 800;">
                    <span>Total Amount:</span>
                    <span style="color: #ff5500;">₹${total}</span>
                  </div>
                </div>

                <div style="background: #fff7ed; border-left: 4px solid #ff5500; padding: 12px 16px; border-radius: 6px;">
                  <p style="margin: 0; font-size: 13px; color: #c2410c;">
                    <strong>Status:</strong> ${orderDetails.status || 'Order Placed'}
                  </p>
                </div>
              </div>

              <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                FRIENDS MOBILE Store • South Gandhigramam, Karur / Madurai<br />
                Customer Support: <strong>+91 93445 22086</strong>
              </div>
            </div>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Order Email Success] Sent to ${toEmail} via ${account.user}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.warn(`[Order Email Attempt Failed] Account ${account.user}: ${err.message}`);
        lastError = err.message;
      }
    }
  }

  return { success: false, error: lastError || 'Failed to dispatch order email' };
}

async function dispatchOTPEmail(toEmail, otpCode, customerName = 'Valued Customer') {
  // 1. Try primary configured dedicated Mail Microservice URL first
  const primaryEndpoint = process.env.MAIL_SERVICE_URL
    ? `${process.env.MAIL_SERVICE_URL}/send-otp`
    : 'http://backend_mail:5001/send-otp';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(primaryEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, otpCode, customerName }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        console.log(`[Mail Dispatcher] OTP sent via dedicated Mail Microservice (${primaryEndpoint})`);
        return data;
      }
    }
  } catch (_) {
    // Container microservice endpoint unreachable on backend_mail network - fallback to direct local SMTP
  }

  // 2. Direct local Nodemailer SMTP fallback if microservice is offline or returning errors
  return await sendOTPEmail(toEmail, otpCode, customerName);
}

module.exports = { sendOTPEmail, dispatchOTPEmail, sendOrderEmail };


