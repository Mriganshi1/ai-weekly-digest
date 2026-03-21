import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { generateDigest, getCachedDigest } from './aggregator.js';
import { buildEmailHTML } from './email-template.js';

const app = express();
const PORT = 3055;

app.use(cors());
app.use(express.json());

// --- Email transporter ---
// Uses Ethereal (free test email) by default.
// Replace with real SMTP (Gmail, SendGrid, etc.) for production.
let transporter = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Check if real SMTP credentials are provided via env vars
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log('📧 Using custom SMTP configuration');
    } else {
        // Create Ethereal test account (emails viewable at ethereal.email)
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
        console.log('📧 Using Ethereal test email (preview links in console)');
        console.log(`   User: ${testAccount.user}`);
    }

    return transporter;
}

// --- API Routes ---

/**
 * GET /api/news — Return the latest cached digest
 */
app.get('/api/news', async (req, res) => {
    try {
        let digest = getCachedDigest();
        if (!digest) {
            console.log('No cached digest found, generating fresh...');
            digest = await generateDigest();
        }
        res.json(digest);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news digest' });
    }
});

/**
 * GET /api/generate — Force generate a fresh digest
 */
app.get('/api/generate', async (req, res) => {
    try {
        const digest = await generateDigest();
        res.json(digest);
    } catch (error) {
        console.error('Error generating digest:', error);
        res.status(500).json({ error: 'Failed to generate digest' });
    }
});

/**
 * POST /api/send-email — Send the digest via email
 */
app.post('/api/send-email', async (req, res) => {
    const { to } = req.body;

    if (!to || !to.includes('@')) {
        return res.status(400).json({ error: 'Valid email address required' });
    }

    try {
        const digest = getCachedDigest();
        if (!digest) {
            return res.status(400).json({ error: 'No digest available. Generate one first.' });
        }

        const emailTransporter = await getTransporter();
        const html = buildEmailHTML(digest);

        const info = await emailTransporter.sendMail({
            from: '"AI Weekly Digest" <digest@aiweekly.app>',
            to: to,
            subject: `🧠 AI Weekly Digest — ${digest.weekRange.from} to ${digest.weekRange.to}`,
            html: html,
        });

        console.log(`✉️  Email sent to ${to} — Message ID: ${info.messageId}`);

        // For Ethereal, provide preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`📬 Preview: ${previewUrl}`);
            return res.json({
                message: `Digest sent to ${to}! Preview available in console.`,
                previewUrl,
            });
        }

        return res.json({ message: `Digest sent successfully to ${to}!` });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Failed to send email. Check SMTP configuration.' });
    }
});

/**
 * GET /api/health — Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- Daily Cron Job ---
// Runs every day at 7:00 AM UTC
cron.schedule('0 7 * * *', async () => {
    console.log('⏰ Daily cron triggered — generating digest...');
    try {
        await generateDigest();
        console.log('✅ Daily digest generated successfully');
    } catch (error) {
        console.error('❌ Daily digest generation failed:', error);
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`\n🚀 AI Daily Digest server running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/news`);
    console.log(`🔄 Generate: http://localhost:${PORT}/api/generate`);
    console.log(`✉️  Email: POST http://localhost:${PORT}/api/send-email`);
    console.log(`⏰ Auto-generation: Every day at 7:00 AM UTC\n`);
});
