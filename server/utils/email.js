const nodemailer = require('nodemailer');

let cachedTransporter = null;

const isMailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_PASS);

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  if (!isMailConfigured()) {
    throw new Error('Missing GMAIL_USER or GMAIL_PASS environment variables');
  }
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
  return cachedTransporter;
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

/**
 * Email the account owner that their account was just signed in to.
 * @param {string} toEmail
 * @param {string} recipientName
 * @param {{ ip?: string, userAgent?: string, timestamp?: string }} meta
 */
async function sendLoginNotification(toEmail, recipientName, meta = {}) {
  const transporter = getTransporter();
  const rows = [
    ['Time', meta.timestamp || new Date().toISOString()],
    ['IP address', meta.ip || 'Unknown'],
    ['Device', meta.userAgent || 'Unknown'],
  ]
    .map(([label, value]) => `<li><strong>${label}:</strong> ${escapeHtml(value)}</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin: 0 0 12px; font-size: 18px;">New sign-in to your account</h2>
      <p>Hi ${escapeHtml(recipientName || 'there')},</p>
      <p>Your Leave Management account was just signed in to.</p>
      <ul>${rows}</ul>
      <p>If this was you, no action is needed. If you don't recognise this activity, change your password and contact your administrator.</p>
    </div>
  `;

  return transporter.sendMail({
    from: `Leave Management <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'New sign-in to your Leave Management account',
    html,
  });
}

module.exports = { sendLoginNotification, isMailConfigured, escapeHtml };
