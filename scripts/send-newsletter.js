import nodemailer from 'nodemailer';
import { generateDigest } from '../aggregator.js';
import { buildEmailHTML } from '../email-template.js';

async function sendNewsletter() {
    console.log('🚀 Starting daily newsletter bot...');

    // Check for recipient email
    const recipient = process.env.RECIPIENT_EMAIL;
    if (!recipient) {
        console.error('❌ Error: RECIPIENT_EMAIL environment variable is missing.');
        console.log('Make sure to add it to your GitHub Secrets!');
        process.exit(1);
    }

    try {
        console.log('📡 Generating fresh AI digest...');
        const digest = await generateDigest();

        if (!digest || digest.totalArticles === 0) {
            console.log('⚠️ No new articles found this week. Skipping email.');
            process.exit(0);
        }

        console.log('🎨 Compiling email HTML...');
        const html = buildEmailHTML(digest);

        // Setup Nodemailer transporter
        let transporter;
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            console.log('🔑 Connecting to custom SMTP server...');
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            console.log('⚠️ No SMTP credentials found. Using Ethereal test account.');
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
        }

        // Send Email
        console.log(`✉️ Sending email to: ${recipient}`);
        const info = await transporter.sendMail({
            from: '"AI Daily Digest" <digest@aiweekly.app>',
            to: recipient,
            subject: `🧠 AI Daily Digest — ${digest.weekRange.from} to ${digest.weekRange.to}`,
            html: html,
        });

        console.log(`✅ Newsletter sent successfully! Message ID: ${info.messageId}`);

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`📬 View Ethereal Preview: ${previewUrl}`);
        }

        // Force exit! Nodemailer's SMTP pools will otherwise keep the script hanging forever!
        process.exit(0);

    } catch (error) {
        console.error('❌ Failed to run newsletter script:', error);
        process.exit(1);
    }
}

sendNewsletter();
