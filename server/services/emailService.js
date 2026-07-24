const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('[Email Service Warning] nodemailer module not loaded yet.');
}

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || 'xunitary@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'cymeyaijcvbofggd').replace(/\s+/g, '').trim();
  const from = (process.env.EMAIL_FROM || `"FRIENDS MOBILE Security" <${user}>`).trim();

  return { host, port, user, pass, from };
};

const createTransporter = (overridePort = null) => {
  if (!nodemailer) return null;
  const config = getSmtpConfig();
  const targetPort = overridePort || config.port;

  return nodemailer.createTransport({
    service: config.host.includes('gmail') ? 'gmail' : undefined,
    host: config.host,
    port: targetPort,
    secure: targetPort === 465,
    auth: {
      user: config.user,
      pass: config.pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    socketTimeout: 20000
  });
};

/**
 * Production-Ready Nodemailer Send Email Service
 */
async function sendEmail({ to, subject, html, text }) {
  if (!nodemailer) {
    throw new Error('Nodemailer is not installed on server.');
  }

  const config = getSmtpConfig();
  const mailOptions = {
    from: config.from,
    to: to.toLowerCase().trim(),
    subject: subject || 'Your Verification Code',
    text: text || 'Your One-Time Password (OTP) is valid for 5 minutes.',
    html: html || `<p>${text}</p>`
  };

  // Primary attempt via Port 465 (or configured port)
  try {
    const transporter = createTransporter(config.port);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service Log] Email dispatched to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (primaryErr) {
    console.warn(`[Email Service Warning] Primary port ${config.port} failed (${primaryErr.message}). Attempting fallback port 587...`);
    try {
      const fallbackTransporter = createTransporter(587);
      const info587 = await fallbackTransporter.sendMail(mailOptions);
      console.log(`[Email Service Log] Email dispatched via Port 587 fallback to ${to}. Message ID: ${info587.messageId}`);
      return { success: true, messageId: info587.messageId };
    } catch (fallbackErr) {
      console.error(`[Email Service Error] Both primary and fallback email dispatches failed to ${to}:`, fallbackErr.message);
      throw new Error(`SMTP Dispatch Failed: ${fallbackErr.message}`);
    }
  }
}

/**
 * Format & Send OTP Email
 */
async function sendOTPEmail(toEmail, otpCode, purpose = 'password_reset') {
  const subject = 'Your Verification Code';
  const textBody = `Your One-Time Password (OTP) is:\n\n${otpCode}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this code, ignore this email.`;
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #ff5500; margin: 0; font-size: 24px; font-weight: 800;">FRIENDS MOBILE</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Account Security &amp; Verification</p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #cbd5e1; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #475569; font-weight: 600;">Your One-Time Password (OTP) is:</p>
        <div style="font-size: 36px; font-weight: 900; color: #ff5500; letter-spacing: 8px; font-family: monospace;">${otpCode}</div>
      </div>

      <p style="font-size: 13px; color: #334155; line-height: 1.5; margin-bottom: 12px;">
        This OTP is valid for <strong>5 minutes</strong>.
      </p>
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
        If you did not request this code, please ignore this email.
      </p>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject,
    text: textBody,
    html: htmlBody
  });
}

module.exports = {
  sendEmail,
  sendOTPEmail
};
