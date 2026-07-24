const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[Email Warning] nodemailer module not loaded yet.');
}

const getGmailUser = () => (process.env.GMAIL_USER || 'xunitary@gmail.com').trim();
const getGmailPassword = () => (process.env.GMAIL_APP_PASSWORD || 'cymeyaijcvbofggd').replace(/\s+/g, '').trim();

const createTransporter = (port = 465) => {
  if (!nodemailer) return null;
  const user = getGmailUser();
  const pass = getGmailPassword();

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    socketTimeout: 8000
  });
};

async function sendOTPEmail(toEmail, otpCode, customerName = 'Valued Customer') {
  try {
    let transporter = createTransporter(465);
    if (!transporter) {
      console.error(`[Email Critical Error] Nodemailer module or transporter unavailable for ${toEmail}`);
      return { success: false, error: 'Gmail SMTP engine unavailable on server.' };
    }

    const senderEmail = getGmailUser();
    const mailOptions = {
      from: `"FRIENDS MOBILE Security" <${senderEmail}>`,
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
                <strong>Time Sensitive:</strong> This code will expire in <strong>2 minutes</strong>. Please verify promptly.
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
            Need help? Call Helpline: <strong style="color: #ff5500;">+91 74485 78507</strong>
          </div>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Success] OTP sent via Port 465 to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (port465Err) {
      console.warn(`[Email Port 465 Retry] Retrying via Port 587 STARTTLS... Error: ${port465Err.message}`);
      const transporter587 = createTransporter(587);
      const info587 = await transporter587.sendMail(mailOptions);
      console.log(`[Email Success] OTP sent via Port 587 to ${toEmail}. Message ID: ${info587.messageId}`);
      return { success: true, messageId: info587.messageId };
    }
  } catch (err) {
    console.error(`[Email Error] Failed to send OTP to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendOTPEmail };
