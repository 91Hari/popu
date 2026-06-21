'use strict';

/**
 * Email Service
 *
 * Sends transactional emails via SMTP (nodemailer).
 * All sends are logged to the email_logs table.
 *
 * Required env vars for SMTP delivery:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
 *   SMTP_FROM_EMAIL, SMTP_FROM_NAME
 *
 * Without SMTP env vars the service falls back to console logging (dev mode).
 */

const nodemailer = require('nodemailer');
const pool       = require('../config/db');

// ── Transporter ──────────────────────────────────────────────────────────────

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

const transporter = createTransporter();

// ── Internal log writer ───────────────────────────────────────────────────────

async function logEmail({ recipient, subject, status, errorMessage = null }) {
  try {
    await pool.query(
      `INSERT INTO email_logs (recipient, subject, status, error_message)
       VALUES ($1, $2, $3, $4)`,
      [recipient, subject, status, errorMessage]
    );
  } catch (err) {
    // Never let logging failure surface to callers
    console.error('[EmailService] Failed to write email_log:', err.message);
  }
}

// ── Public: send password reset email ────────────────────────────────────────

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@popu.com';
  const fromName  = process.env.SMTP_FROM_NAME  || 'PO.PU Support';
  const from      = `"${fromName}" <${fromEmail}>`;
  const subject   = 'Reset your PO.PU password';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your PO.PU Password</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1B5E20;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;
                         letter-spacing:2px;">PO.PU</h1>
              <p style="margin:4px 0 0;color:#A5D6A7;font-size:13px;">
                Your Home Food Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#333;font-size:16px;margin:0 0 8px;">
                Hello <strong>${escapeHtml(name)}</strong>,
              </p>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 28px;">
                We received a request to reset the password for your PO.PU account.
                Click the button below to choose a new password.
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 28px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:#FF6D00;color:#ffffff;
                              padding:14px 40px;border-radius:8px;font-size:16px;
                              font-weight:700;text-decoration:none;
                              letter-spacing:0.5px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry note -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#FFF8E1;border-left:4px solid #FFC107;
                            border-radius:4px;margin:0 0 24px;">
                <tr>
                  <td style="padding:14px 16px;color:#795548;font-size:14px;">
                    ⏱ This link expires in <strong>15 minutes</strong> and can only be used once.
                  </td>
                </tr>
              </table>

              <p style="color:#888;font-size:13px;margin:0 0 8px;">
                If you did not request a password reset, you can safely ignore this email.
                Your account remains secure.
              </p>
              <p style="color:#888;font-size:13px;margin:0;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0;">
                <a href="${resetUrl}"
                   style="color:#1B5E20;font-size:13px;word-break:break-all;">
                  ${resetUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eee;
                       text-align:center;">
              <p style="margin:0;color:#aaa;font-size:12px;">
                © ${new Date().getFullYear()} PO.PU · Home Food Platform
              </p>
              <p style="margin:4px 0 0;color:#aaa;font-size:12px;">
                You received this email because a password reset was requested for your account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Hello ${name},`,
    '',
    'We received a request to reset your PO.PU password.',
    '',
    'Reset your password here:',
    resetUrl,
    '',
    'This link expires in 15 minutes and can only be used once.',
    '',
    'If you did not request this, you can safely ignore this email.',
    '',
    '— PO.PU Support',
  ].join('\n');

  // ── Send via SMTP ──────────────────────────────────────────────────────────
  if (transporter) {
    try {
      await transporter.sendMail({ from, to, subject, html, text });
      console.log(`[EmailService] Sent "${subject}" to ${to}`);
      await logEmail({ recipient: to, subject, status: 'sent' });
      return;
    } catch (err) {
      console.error(`[EmailService] SMTP error for ${to}: ${err.message}`);
      await logEmail({ recipient: to, subject, status: 'failed', errorMessage: err.message });
      // Do not throw — caller gets a safe generic success response
      return;
    }
  }

  // ── Dev fallback: no SMTP configured ─────────────────────────────────────
  console.log('\n──────────────────────────────────────────────');
  console.log(' [EmailService] DEV FALLBACK — SMTP not configured');
  console.log(` To      : ${to}`);
  console.log(` Subject : ${subject}`);
  console.log(` Link    : ${resetUrl}`);
  console.log('──────────────────────────────────────────────\n');
  await logEmail({ recipient: to, subject, status: 'skipped',
                   errorMessage: 'SMTP not configured — logged to console' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendPasswordResetEmail };
