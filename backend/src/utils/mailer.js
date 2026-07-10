'use strict';

/**
 * Email utility — sends transactional emails via nodemailer.
 * Configure SMTP_* env vars for production.
 * Falls back to console logging in development.
 */

let nodemailer;
try { nodemailer = require('nodemailer'); } catch { /* optional dep */ }

function createTransporter() {
  if (!nodemailer || !process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const from = process.env.SMTP_FROM || 'noreply@popu.co.in';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#1B5E20;margin-bottom:4px;">PO.PU — Password Reset</h2>
      <p style="color:#555;margin-top:0;">Hi <strong>${name}</strong>,</p>
      <p style="color:#555;">You requested to reset your PO.PU password. Click the button below:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}"
           style="background:#1B5E20;color:#fff;padding:14px 32px;border-radius:8px;
                  text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color:#888;font-size:13px;">This link expires in <strong>15 minutes</strong> and can only be used once.</p>
      <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#aaa;font-size:11px;">Or copy this link: ${resetUrl}</p>
    </div>`;

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({ from, to, subject: 'Reset your PO.PU password', html });
      console.log(`[Mailer] Reset email sent to ${to}`);
      return;
    } catch (err) {
      console.error(`[Mailer] SMTP error: ${err.message} — falling back to console`);
    }
  }
  // Dev / SMTP-not-configured fallback
  console.log('\n📧 [Password Reset Email]');
  console.log(`   To      : ${to}`);
  console.log(`   Link    : ${resetUrl}`);
  console.log(`   Expires : 15 minutes\n`);
}

module.exports = { sendPasswordResetEmail };
