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
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Shrinkr OTP Verification</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background-color: #09090b;
                        margin: 0;
                        padding: 0;
                        color: #ffffff;
                    }
                    .container {
                        max-width: 500px;
                        margin: 40px auto;
                        background-color: #18181b;
                        border: 1px solid #27272a;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
                    }
                    .header {
                        padding: 32px 32px 24px;
                        text-align: center;
                        border-bottom: 1px solid #27272a;
                    }
                    .logo-wrapper {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 48px;
                        height: 48px;
                        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
                        border-radius: 12px;
                        margin-bottom: 16px;
                    }
                    .logo-icon {
                        color: white;
                        font-size: 24px;
                        font-weight: bold;
                        font-style: italic;
                    }
                    .title {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: #ffffff;
                        letter-spacing: -0.025em;
                    }
                    .content {
                        padding: 32px;
                        text-align: center;
                    }
                    .text {
                        margin: 0 0 24px;
                        font-size: 15px;
                        line-height: 1.6;
                        color: #a1a1aa;
                    }
                    .otp-box {
                        background-color: #27272a;
                        border: 1px solid #3f3f46;
                        border-radius: 12px;
                        padding: 24px;
                        margin-bottom: 24px;
                    }
                    .otp-code {
                        margin: 0;
                        font-size: 42px;
                        font-weight: 800;
                        letter-spacing: 12px;
                        color: #ffffff;
                        font-variant-numeric: tabular-nums;
                    }
                    .footer {
                        padding: 24px 32px;
                        background-color: #0f0f11;
                        text-align: center;
                        border-top: 1px solid #27272a;
                    }
                    .footer-text {
                        margin: 0 0 8px;
                        font-size: 13px;
                        color: #71717a;
                    }
                    .footer-link {
                        color: #4f46e5;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo-wrapper">
                            <span class="logo-icon">S</span>
                        </div>
                        <h1 class="title">Verify your email</h1>
                    </div>
                    <div class="content">
                        <p class="text">
                            Welcome to <strong>Shrinkr</strong>! Please use the verification code below to complete your sign in attempt.
                        </p>
                        <div class="otp-box">
                            <h2 class="otp-code">${otp}</h2>
                        </div>
                        <p class="text" style="font-size: 14px;">
                            This code will expire in <strong>5 minutes</strong>. If you did not request this code, please securely ignore this email.
                        </p>
                    </div>
                    <div class="footer">
                        <p class="footer-text">© ${new Date().getFullYear()} Shrinkr. All rights reserved.</p>
                        <p class="footer-text">Built with blazing fast microservices.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('[Mailer] Preview URL:', previewUrl);
    }
}

module.exports = { sendOtpEmail };
