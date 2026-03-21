import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SOURCES from './sources.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'AI-Weekly-Digest/1.0',
        Accept: 'application/rss+xml, application/xml, text/xml',
    },
});

const CACHE_DIR = path.join(__dirname, 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'latest-digest.json');

/**
 * Fetch a single RSS feed with error handling.
 */
async function fetchFeed(feedInfo, categoryKey) {
    try {
        const feed = await parser.parseURL(feedInfo.url);
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day limit

        const articles = (feed.items || [])
            .map((item) => ({
                title: item.title || 'Untitled',
                link: item.link || '',
                description: cleanDescription(item.contentSnippet || item.content || item.summary || ''),
                date: item.pubDate || item.isoDate || null,
                source: feedInfo.name,
                sourceIcon: feedInfo.icon,
                category: categoryKey,
            }))
            .filter((article) => {
                if (!article.date) return true; // Include articles without dates
                const articleDate = new Date(article.date);
                return articleDate >= cutoffDate;
            })
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 5); // Max 5 per feed

        return articles;
    } catch (error) {
        console.warn(`⚠️  Failed to fetch ${feedInfo.name}: ${error.message}`);
        return [];
    }
}

/**
 * Clean and truncate description text.
 */
function cleanDescription(text) {
    // Strip HTML tags
    let clean = text.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    clean = clean
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
    // Collapse whitespace
    clean = clean.replace(/\s+/g, ' ').trim();
    // Truncate
    if (clean.length > 200) {
        clean = clean.substring(0, 197) + '...';
    }
    return clean;
}

/**
 * Deduplicate articles by similar titles.
 */
function deduplicateArticles(articles) {
    const seen = new Set();
    return articles.filter((article) => {
        const normalized = article.title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        // Use first 50 chars as key to catch similar headlines
        const key = normalized.substring(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Fetch all sources and aggregate into categorized digest.
 */
export async function generateDigest() {
    console.log('📡 Fetching AI news from all sources...');
    const startTime = Date.now();

    const allPromises = [];

    for (const [categoryKey, category] of Object.entries(SOURCES)) {
        for (const feed of category.feeds) {
            allPromises.push(fetchFeed(feed, categoryKey));
        }
    }

    const results = await Promise.all(allPromises);
    const allArticles = results.flat();

    // Organize by category
    const categorized = {};
    for (const [categoryKey, category] of Object.entries(SOURCES)) {
        const categoryArticles = deduplicateArticles(
            allArticles
                .filter((a) => a.category === categoryKey)
                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        ).slice(0, 10); // Max 10 per category

        categorized[categoryKey] = {
            label: category.label,
            color: category.color,
            articles: categoryArticles,
        };
    }

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day limit

    const digest = {
        generatedAt: now.toISOString(),
        weekRange: {
            from: cutoffDate.toISOString().split('T')[0],
            to: now.toISOString().split('T')[0],
        },
        totalArticles: allArticles.length,
        categories: categorized,
    };

    // Cache to file
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(digest, null, 2));

    // Archive this week's digest
    const archiveFile = path.join(CACHE_DIR, `digest-${digest.weekRange.to}.json`);
    fs.writeFileSync(archiveFile, JSON.stringify(digest, null, 2));

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Digest generated in ${elapsed}s — ${allArticles.length} articles found`);

    return digest;
}

/**
 * Load the cached digest if available.
 */
export function getCachedDigest() {
    if (fs.existsSync(CACHE_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
            return data;
        } catch {
            return null;
        }
    }
    return null;
}
