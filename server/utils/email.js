const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[Email Warning] nodemailer module not loaded yet.');
}

const getSmtpHost = () => (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const getSmtpPort = () => parseInt(process.env.SMTP_PORT || '465', 10);
const getGmailUser = () => (process.env.SMTP_USER || process.env.GMAIL_USER || 'noreplyfriendsmobiles@gmail.com').trim();
const getGmailPassword = () => (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'vunzytjoeceaxnar').replace(/\s+/g, '').trim();

const getSmtpAccounts = () => [
  {
    user: getGmailUser(),
    pass: getGmailPassword()
  },
  {
    user: 'noreplyfriendsmobiles@gmail.com',
    pass: 'vunzytjoeceaxnar'
  },
  {
    user: 'xunitary@gmail.com',
    pass: 'cymeyaijcvbofggd'
  }
];

const createTransporterForCreds = (user, pass, port = 465) => {
  if (!nodemailer) return null;
  return nodemailer.createTransport({
    host: getSmtpHost(),
    port: port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 5000,
    socketTimeout: 8000
  });
};

async function sendOTPEmail(toEmail, otpCode, customerName = 'Valued Customer') {
  if (!nodemailer) {
    return { success: false, error: 'Gmail SMTP engine unavailable on server.' };
  }

  const accounts = getSmtpAccounts();
  let lastError = null;

  for (const account of accounts) {
    if (!account.user || !account.pass) continue;

    for (const port of [465, 587]) {
      try {
        const transporter = createTransporterForCreds(account.user, account.pass, port);
        if (!transporter) continue;

        const mailOptions = {
          from: `"FRIENDS MOBILE Security" <${account.user}>`,
          to: toEmail,
          subject: `FRIENDS MOBILE - ${otpCode} is your Password Reset Code`,
          html: `
            <div style="font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #FF5500 0%, #E03E00 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
                <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 2px;">FRIENDS <span style="color: #FFE600;">MOBILE</span></div>
                <p style="margin: 0; font-size: 13px; opacity: 0.95; font-weight: 500;">Official Member Security &amp; Verification Portal</p>
              </div>

              <div style="padding: 30px 28px; color: #1e293b;">
                <h3 style="margin: 0 0 12px 0; font-size: 19px; font-weight: 800; color: #0f172a;">Hello, ${customerName}!</h3>
                <p style="margin: 0 0 22px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                  We received a request to verify your identity and reset your FRIENDS MOBILE account password. Use the 6-digit verification code below:
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
                  If you did not request a password reset, please ignore this message or contact support if you suspect unauthorized access.
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

  return { success: false, error: lastError || 'Failed to connect to Gmail SMTP server' };
}

async function dispatchOTPEmail(toEmail, otpCode, customerName = 'Valued Customer') {
  // 1. Try dedicated Mail Microservice container
  const mailEndpoints = [
    process.env.MAIL_SERVICE_URL ? `${process.env.MAIL_SERVICE_URL}/send-otp` : 'http://backend_mail:5001/send-otp',
    'http://localhost:5001/send-otp',
    'http://127.0.0.1:5001/send-otp'
  ];

  for (const url of mailEndpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, otpCode, customerName }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          console.log(`[Mail Dispatcher] Email sent via dedicated Mail Microservice (${url})`);
          return data;
        }
      }
    } catch (_) {
      // Microservice endpoint unreachable — try next or fallback to local SMTP
    }
  }

  // 2. Direct local Nodemailer SMTP fallback if microservice is offline
  return await sendOTPEmail(toEmail, otpCode, customerName);
}

module.exports = { sendOTPEmail, dispatchOTPEmail };

