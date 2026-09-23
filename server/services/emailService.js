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
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || 'noreplyfriendsmobiles@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'fsthwswldbblrslw').replace(/\s+/g, '').trim();
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
    connectionTimeout: 3000,
    socketTimeout: 4000
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
async function sendOTPEmail(toEmail, otpCode, customerName = 'Valued Customer', purpose = 'password_reset') {
  if (customerName === 'signup' || customerName === 'register' || customerName === 'password_reset') {
    purpose = customerName;
    customerName = 'Valued Customer';
  }

  const cleanPurpose = (purpose || '').toString().toLowerCase().trim();
  const isSignup = cleanPurpose === 'signup'
    || cleanPurpose === 'register'
    || cleanPurpose === 'account_verification'
    || cleanPurpose.includes('signup')
    || cleanPurpose.includes('register')
    || cleanPurpose.includes('account')
    || (cleanPurpose.includes('verification') && !cleanPurpose.includes('reset'));

  const subject = isSignup
    ? `FRIENDS MOBILE - ${otpCode} is your Account Verification Code`
    : `FRIENDS MOBILE - ${otpCode} is your Password Reset Code`;

  const bannerSubtitle = isSignup
    ? 'Official Account Security &amp; Member Verification'
    : 'Official Member Security &amp; Password Recovery';

  const greetingTitle = isSignup
    ? `Welcome to FRIENDS MOBILE, ${customerName}!`
    : `Hello, ${customerName}!`;

  const introText = isSignup
    ? 'Thank you for choosing FRIENDS MOBILE! Use the 6-digit verification code below to verify your email address and activate your account:'
    : 'We received a request to reset your account password. Use the 6-digit verification code below to set your new password:';

  const boxLabel = isSignup
    ? 'YOUR ONE-TIME ACCOUNT VERIFICATION CODE'
    : 'YOUR ONE-TIME PASSWORD RESET CODE';

  const textBody = `Hello ${customerName},\n\nYour 6-digit verification code is: ${otpCode}\n\nPurpose: ${isSignup ? 'Account Email Verification' : 'Password Reset'}\nThis code is valid for 5 minutes.\n\nRegards,\nFriends Mobiles Store`;
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #ff5500; margin: 0; font-size: 24px; font-weight: 800;">FRIENDS MOBILE</h2>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">${bannerSubtitle}</p>
      </div>

      <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a;">${greetingTitle}</h3>
      <p style="margin: 0 0 18px 0; font-size: 13.5px; color: #475569; line-height: 1.5;">${introText}</p>

      <div style="background: #fff7ed; padding: 20px; border-radius: 10px; text-align: center; border: 2px dashed #ff5500; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #c2410c; font-weight: 800;">${boxLabel}</p>
        <div style="font-size: 36px; font-weight: 900; color: #ff5500; letter-spacing: 8px; font-family: monospace;">${otpCode}</div>
      </div>

      <p style="font-size: 12.5px; color: #334155; line-height: 1.5; margin-bottom: 12px;">
        This OTP is valid for <strong>5 minutes</strong>.
      </p>
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
        ${isSignup ? 'If you did not attempt to create an account with FRIENDS MOBILE, you can safely ignore this email.' : 'If you did not request this password reset code, please ignore this email.'}
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
