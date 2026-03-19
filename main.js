/**
 * AI Weekly Digest — Frontend Logic
 */

const loadingOverlay = document.getElementById('loadingOverlay');
const newsGrid = document.getElementById('newsGrid');
const weekDates = document.getElementById('weekDates');
const totalArticles = document.getElementById('totalArticles');
const generatedTime = document.getElementById('generatedTime');
const btnGenerate = document.getElementById('btnGenerate');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.getElementById('btnLoading');
const shareModal = document.getElementById('shareModal');
const emailInput = document.getElementById('emailInput');
const emailStatus = document.getElementById('emailStatus');
const btnSendEmail = document.getElementById('btnSendEmail');
const copyLinkInput = document.getElementById('copyLinkInput');

let currentDigest = null;

/**
 * Format a date string to readable format.
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a date range for the header badge.
 */
function formatWeekRange(from, to) {
    const f = new Date(from);
    const t = new Date(to);
    const opts = { month: 'short', day: 'numeric' };
    return `${f.toLocaleDateString('en-US', opts)} — ${t.toLocaleDateString('en-US', opts)}, ${t.getFullYear()}`;
}

/**
 * Get relative time string.
 */
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);

    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(dateStr);
}

/**
 * Render a single article card.
 */
function renderArticle(article) {
    return `
    <a class="article-card" href="${article.link}" target="_blank" rel="noopener noreferrer">
      <div class="article-source">
        <span class="article-source-icon">${article.sourceIcon || '📄'}</span>
        <span>${article.source}</span>
        <span class="article-date">${timeAgo(article.date)}</span>
      </div>
      <div class="article-title">${escapeHtml(article.title)}</div>
      ${article.description ? `<div class="article-desc">${escapeHtml(article.description)}</div>` : ''}
    </a>
  `;
}

/**
 * Render a category section.
 */
function renderCategory(key, category) {
    const count = category.articles.length;
    const articlesHTML = count > 0
        ? category.articles.map(renderArticle).join('')
        : `<div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>No articles found this week</p>
       </div>`;

    return `
    <section class="category-section" data-category="${key}">
      <div class="category-header">
        <h2 class="category-title">${category.label}</h2>
        <span class="category-count">${count} article${count !== 1 ? 's' : ''}</span>
      </div>
      <div class="article-list">
        ${articlesHTML}
      </div>
    </section>
  `;
}

/**
 * Escape HTML entities to prevent XSS.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Render the full digest.
 */
function renderDigest(digest) {
    currentDigest = digest;

    // Update header
    weekDates.textContent = formatWeekRange(digest.weekRange.from, digest.weekRange.to);
    totalArticles.textContent = digest.totalArticles;

    // Generated time
    const genDate = new Date(digest.generatedAt);
    generatedTime.textContent = genDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Render summary
    renderSummary(digest);

    // Render categories
    const categoryOrder = ['bigTech', 'techNews', 'research', 'startupsVC'];
    newsGrid.innerHTML = categoryOrder
        .map((key) => {
            const cat = digest.categories[key];
            return cat ? renderCategory(key, cat) : '';
        })
        .join('');

    // Update share link
    copyLinkInput.value = window.location.href;
    updateSocialLinks();
}

/* ====================================
   Witty Summary Generator 🍿
   ==================================== */

const CATEGORY_OPENERS = {
    bigTech: [
        '🏢 <strong>Big Tech is at it again.</strong>',
        '🏢 <strong>The tech giants aren\'t sleeping.</strong>',
        '🏢 <strong>Silicon Valley had a busy week.</strong>',
        '🏢 <strong>Big Tech dropped some bombshells.</strong>',
    ],
    techNews: [
        '📰 <strong>The newsroom is buzzing.</strong>',
        '📰 <strong>Headlines were 🔥 this week.</strong>',
        '📰 <strong>Tech Twitter had opinions.</strong>',
        '📰 <strong>It was a newsworthy week.</strong>',
    ],
    research: [
        '🔬 <strong>The nerds delivered.</strong>',
        '🔬 <strong>Peer-reviewed and press-released.</strong>',
        '🔬 <strong>Lab coats were earned this week.</strong>',
        '🔬 <strong>From the ivory towers of AI research:</strong>',
    ],
    startupsVC: [
        '🚀 <strong>Startup szn continues.</strong>',
        '🚀 <strong>VCs are writing checks again.</strong>',
        '🚀 <strong>Founders are shipping.</strong>',
        '🚀 <strong>The startup grind never stops.</strong>',
    ],
};

const PUNS_AND_QUIPS = [
    'Guess the machines are <span class="pun">learning</span> something after all.',
    'That\'s what I call a <span class="pun">neural net positive</span>.',
    'Talk about a <span class="pun">deep learning</span> curve.',
    'The future is <span class="pun">artificially</span> bright.',
    'Things are getting <span class="pun">model</span>-y interesting.',
    'Time to <span class="pun">train</span> your attention on this.',
    'That\'s quite the <span class="pun">weight update</span>.',
    'This one really <span class="pun">optimizes</span> for drama.',
    'The AI arms race just got <span class="pun">param-eterized</span>.',
    'No <span class="pun">hallucinations</span> here — this is real.',
    'Another day, another <span class="pun">epoch</span>.',
    'That\'s a lot of <span class="pun">tokens</span> of appreciation.',
    'Things are <span class="pun">transforming</span> fast.',
    'The <span class="pun">gradient</span> of innovation is steep.',
    'Someone\'s <span class="pun">attention mechanism</span> is working overtime.',
    'The <span class="pun">loss function</span> of sleep continues.',
];

const FOOTER_QUIPS = [
    '🤖 Written by an RSS feed parser, not a sentient AI. Probably.',
    '📡 43 articles walked into a bar. Only the highlights survived.',
    '🧪 Side effects may include: FOMO, existential wonder, and a sudden urge to build something.',
    '☕ Best consumed with coffee and a healthy dose of techno-optimism.',
    '🍕 This digest pairs well with pizza and procrastination.',
    'No LLMs were harmed in the making of this summary. A few RSS feeds, however...',
    '🌊 Surfing the AI wave so you don\'t have to. You\'re welcome.',
];

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateSummaryBlurbs(digest) {
    const blurbs = [];
    const categories = digest.categories;

    // Big Tech summary
    if (categories.bigTech && categories.bigTech.articles.length > 0) {
        const articles = categories.bigTech.articles;
        const sources = [...new Set(articles.map(a => a.source.replace(' Blog', '').replace(' AI Blog', '')))];
        const topTitles = articles.slice(0, 2).map(a => a.title);

        let text = `${pickRandom(CATEGORY_OPENERS.bigTech)} `;
        text += `${sources.slice(0, 3).join(', ')}${sources.length > 3 ? ' & friends' : ''} `;
        text += `made moves this week. Top story: "${topTitles[0]}". `;
        text += pickRandom(PUNS_AND_QUIPS);

        blurbs.push({ emoji: '🏢', text });
    }

    // Tech News summary
    if (categories.techNews && categories.techNews.articles.length > 0) {
        const articles = categories.techNews.articles;
        const count = articles.length;
        const topTitle = articles[0].title;

        let text = `${pickRandom(CATEGORY_OPENERS.techNews)} `;
        text += `${count} stories caught our eye. `;
        text += `Leading the pack: "${topTitle}". `;

        // Topic-specific quips
        const allTitles = articles.map(a => a.title.toLowerCase()).join(' ');
        if (allTitles.includes('openai') || allTitles.includes('chatgpt')) {
            text += 'OpenAI continues to <span class="pun">prompt</span> headlines everywhere.';
        } else if (allTitles.includes('google') || allTitles.includes('gemini')) {
            text += 'Google\'s AI ambitions are anything but <span class="pun">search-engine-sized</span>.';
        } else if (allTitles.includes('apple')) {
            text += 'Looks like Apple is finally taking a <span class="pun">byte</span> of the AI pie.';
        } else {
            text += pickRandom(PUNS_AND_QUIPS);
        }

        blurbs.push({ emoji: '📰', text });
    }

    // Research summary
    if (categories.research && categories.research.articles.length > 0) {
        const articles = categories.research.articles;
        const sources = [...new Set(articles.map(a => a.source))];

        let text = `${pickRandom(CATEGORY_OPENERS.research)} `;
        text += `${articles.length} papers and posts from ${sources.slice(0, 3).join(', ')}. `;

        const allTitles = articles.map(a => a.title.toLowerCase()).join(' ');
        if (allTitles.includes('llm') || allTitles.includes('language model')) {
            text += 'LLMs are getting the <span class="pun">large</span>st share of attention, as usual.';
        } else if (allTitles.includes('robot')) {
            text += 'The robots are coming — but for now they\'re just <span class="pun">processing</span>.';
        } else {
            text += 'Publish or perish? More like <span class="pun">publish AND flourish</span>.';
        }

        blurbs.push({ emoji: '🔬', text });
    }

    // Startups summary
    if (categories.startupsVC && categories.startupsVC.articles.length > 0) {
        const articles = categories.startupsVC.articles;

        let text = `${pickRandom(CATEGORY_OPENERS.startupsVC)} `;
        text += `${articles.length} updates from the startup world. `;
        text += 'Remember: every unicorn started as a <span class="pun">seed stage pony</span>.';

        blurbs.push({ emoji: '🚀', text });
    } else {
        blurbs.push({
            emoji: '🚀',
            text: `${pickRandom(CATEGORY_OPENERS.startupsVC)} Quiet week on the startup front. Either everyone is in <span class="pun">stealth mode</span>, or they're too busy building to blog. Respect.`,
        });
    }

    return blurbs;
}

function renderSummary(digest) {
    const summaryContent = document.getElementById('summaryContent');
    const blurbs = generateSummaryBlurbs(digest);

    let html = blurbs
        .map(
            (b) => `
        <div class="summary-blurb">
            <span class="summary-blurb-emoji">${b.emoji}</span>
            <span class="summary-blurb-text">${b.text}</span>
        </div>
    `
        )
        .join('');

    html += `<div class="summary-footer">${pickRandom(FOOTER_QUIPS)}</div>`;

    summaryContent.innerHTML = html;
}

/**
 * Fetch and display the digest.
 */
async function fetchDigest() {
    try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const digest = await res.json();
        renderDigest(digest);
    } catch (error) {
        console.error('Failed to fetch digest:', error);
        newsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; padding: 64px 20px;">
        <div class="empty-state-icon" style="font-size: 3rem;">⚠️</div>
        <p style="font-size: 1rem; margin-top: 12px;">Could not load the digest. Make sure the server is running.</p>
        <p style="margin-top: 8px;">Run <code style="background: rgba(0,0,0,0.06); padding: 4px 8px; border-radius: 4px;">npm run dev</code> to start.</p>
      </div>
    `;
    } finally {
        hideLoading();
    }
}

/**
 * Generate a fresh digest (manual trigger).
 */
async function generateDigest() {
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    btnGenerate.disabled = true;

    try {
        const res = await fetch('/api/generate');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const digest = await res.json();
        renderDigest(digest);

        // Re-trigger animations
        newsGrid.style.animation = 'none';
        newsGrid.offsetHeight;
        document.querySelectorAll('.category-section').forEach((el, i) => {
            el.style.animation = `fadeSlideUp 0.5s ease-out ${0.1 * i}s both`;
        });
    } catch (error) {
        console.error('Failed to generate digest:', error);
        alert('Failed to generate digest. Check console for details.');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btnGenerate.disabled = false;
    }
}

window.generateDigest = generateDigest;

/* ====================================
   Share Modal
   ==================================== */

function openShareModal() {
    shareModal.classList.add('active');
    emailInput.value = '';
    emailStatus.textContent = '';
    emailStatus.className = 'email-status';
}

function closeShareModal() {
    shareModal.classList.remove('active');
}

// Close modal on overlay click
shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) closeShareModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeShareModal();
});

window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;

/**
 * Send the digest via email.
 */
async function sendEmail() {
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
        emailStatus.textContent = 'Please enter a valid email address.';
        emailStatus.className = 'email-status error';
        return;
    }

    btnSendEmail.disabled = true;
    btnSendEmail.textContent = 'Sending...';
    emailStatus.textContent = '';

    try {
        const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email }),
        });

        const data = await res.json();

        if (res.ok) {
            emailStatus.textContent = `✅ ${data.message}`;
            emailStatus.className = 'email-status success';
            emailInput.value = '';
        } else {
            emailStatus.textContent = `❌ ${data.error || 'Failed to send email'}`;
            emailStatus.className = 'email-status error';
        }
    } catch (error) {
        emailStatus.textContent = '❌ Could not send email. Check server configuration.';
        emailStatus.className = 'email-status error';
    } finally {
        btnSendEmail.disabled = false;
        btnSendEmail.textContent = 'Send ✉️';
    }
}

window.sendEmail = sendEmail;

/**
 * Copy the digest link to clipboard.
 */
async function copyLink() {
    const btn = document.getElementById('btnCopyLink');
    try {
        await navigator.clipboard.writeText(copyLinkInput.value);
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    } catch {
        copyLinkInput.select();
        document.execCommand('copy');
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
        }, 2000);
    }
}

window.copyLink = copyLink;

/**
 * Build social share links based on digest summary.
 */
function updateSocialLinks() {
    if (!currentDigest) return;

    const text = `🧠 AI Weekly Digest — ${currentDigest.totalArticles} articles from ${currentDigest.weekRange.from} to ${currentDigest.weekRange.to}. Stay updated with the latest in AI!`;
    const url = window.location.href;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;

    document.getElementById('shareTwitter').href = twitterUrl;
    document.getElementById('shareLinkedIn').href = linkedInUrl;
    document.getElementById('shareWhatsApp').href = whatsAppUrl;
}

/**
 * Hide the loading overlay with animation.
 */
function hideLoading() {
    loadingOverlay.classList.add('hidden');
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
    }, 400);
}

/* ====================================
   PDF Generation & Sharing
   ==================================== */

async function downloadPDF() {
    // Format Date and Time: AI Newsletter YYYY-MM-DD HH-MM-SS
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-');
    const filename = `AI Newsletter ${dateStr} ${timeStr}`;

    // Temporarily change document title so the browser's native "Save as PDF" uses it as the filename
    const originalTitle = document.title;
    document.title = filename;

    // A slight delay ensures the browser registers the title change before opening the print dialog
    setTimeout(() => {
        window.print();

        // Restore title after a short delay (enough time for print dialog to latch onto the new title)
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    }, 100);
}
window.downloadPDF = downloadPDF;

// --- Init ---
fetchDigest();
