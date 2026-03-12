'use strict';

const nodemailer = require('nodemailer');

let transporter;

async function getTransporter() {
    if (!transporter) {
        if (process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.ethereal.email') {
            // Real SMTP (e.g., Gmail, SendGrid, Mailgun)
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT, 10) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            // Ethereal (free test account — preview URL logged to console)
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log('[Mailer] Using Ethereal test account:', testAccount.user);
        }
    }
    return transporter;
}

/**
 * Send OTP email to a user.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP
 */
async function sendOtpEmail(to, otp) {
    const transport = await getTransporter();
    const info = await transport.sendMail({
        from: `"URL Shortener" <${process.env.SMTP_FROM || 'noreply@urlshortener.app'}>`,
        to,
        subject: 'Your Verification Code',
        text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0f0f12; color: #fff; border-radius: 12px;">
        <h2 style="color: #6366f1;">URL Shortener</h2>
        <p>Your one-time verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center; padding: 24px; background: #1e1e2e; border-radius: 8px; margin: 16px 0;">${otp}</div>
        <p style="color: #9ca3af; font-size: 13px;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('[Mailer] Preview URL:', previewUrl);
    }
}

module.exports = { sendOtpEmail };
