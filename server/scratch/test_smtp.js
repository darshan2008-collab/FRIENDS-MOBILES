const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const getSmtpHost = () => (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const getSmtpPort = () => parseInt(process.env.SMTP_PORT || '465', 10);
const getGmailUser = () => (process.env.SMTP_USER || process.env.GMAIL_USER || 'noreplyfriendsmobiles@gmail.com').trim();
const getGmailPassword = () => (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'fsthwswldbblrslw').replace(/\s+/g, '').trim();

const user = getGmailUser();
const pass = getGmailPassword();
const host = getSmtpHost();
const port = getSmtpPort();

console.log('====================================================');
console.log('       SMTP SMTP CONNECTION DIAGNOSTIC TEST         ');
console.log('====================================================');
console.log(`Host     : ${host}`);
console.log(`Port     : ${port}`);
console.log(`User     : ${user}`);
console.log(`Password : ${pass ? '****' + pass.slice(-4) : '(not set)'}`);
console.log('----------------------------------------------------');
console.log('Connecting to SMTP server...');

const transporter = nodemailer.createTransport({
  host: host,
  port: port,
  secure: port === 465,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000
});

transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ SMTP Connection Verification FAILED!');
    console.error('Error details:\n', error);
    console.log('\n----------------------------------------------------');
    console.log('COMMON ROOT CAUSES:');
    if (error.message.includes('535') || error.message.includes('Authentication')) {
      console.log('1. [INVALID CREDENTIALS]: The Gmail App Password is incorrect or revoked.');
      console.log('   -> Did you change your Google Account password? If yes, the app password was revoked by Google.');
      console.log('   -> Try generating a new 16-character App Password in Google Account -> Security.');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      console.log('1. [NETWORK/FIREWALL BLOCK]: The host VPS provider is blocking outbound SMTP ports 465 or 587.');
      console.log('   -> Many cloud hosts (e.g., DigitalOcean, AWS, Linode) block SMTP ports by default.');
    }
  } else {
    console.log('\n✅ SMTP Connection Verification SUCCESSFUL!');
    console.log('Server is ready to dispatch emails.');
  }
  console.log('====================================================\n');
});
