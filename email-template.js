/**
 * Builds a beautiful HTML email template from the digest data.
 */
export function buildEmailHTML(digest) {
    const weekRange = `${formatEmailDate(digest.weekRange.from)} — ${formatEmailDate(digest.weekRange.to)}`;
    const categoryOrder = ['bigTech', 'techNews', 'research', 'startupsVC'];

    const categoryColors = {
        bigTech: '#6366f1',
        techNews: '#e5913a',
        research: '#3aaa8a',
        startupsVC: '#d95e5e',
    };

    let categoriesHTML = '';

    for (const key of categoryOrder) {
        const cat = digest.categories[key];
        if (!cat || cat.articles.length === 0) continue;

        const color = categoryColors[key] || '#6366f1';

        let articlesHTML = '';
        for (const article of cat.articles.slice(0, 6)) {
            articlesHTML += `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0eeeb;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #9e9790; margin-bottom: 4px;">
              ${article.sourceIcon || '📄'} ${escapeHtmlEmail(article.source)}
              ${article.date ? `<span style="float: right; font-size: 10px;">${formatEmailDate(article.date)}</span>` : ''}
            </div>
            <a href="${article.link}" style="color: #2d2a26; text-decoration: none; font-weight: 600; font-size: 14px; line-height: 1.4;">
              ${escapeHtmlEmail(article.title)}
            </a>
            ${article.description ? `<div style="color: #6b6560; font-size: 13px; margin-top: 4px; line-height: 1.5;">${escapeHtmlEmail(article.description.substring(0, 120))}${article.description.length > 120 ? '...' : ''}</div>` : ''}
          </td>
        </tr>`;
        }

        categoriesHTML += `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eae8e4;">
        <tr>
          <td style="height: 3px; background: ${color};"></td>
        </tr>
        <tr>
          <td style="padding: 20px 24px;">
            <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 16px 0; color: #2d2a26;">
              ${cat.label}
              <span style="font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 12px; background: ${color}15; color: ${color}; margin-left: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${cat.articles.length} articles
              </span>
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${articlesHTML}
            </table>
          </td>
        </tr>
      </table>`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Weekly Digest — ${weekRange}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ef; padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f0edff, #edf5f2); border-radius: 16px; padding: 32px; text-align: center; border: 1px solid #eae8e4;">
              <div style="font-size: 40px; margin-bottom: 8px;">🧠</div>
              <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #2d2a26;">AI Weekly Digest</h1>
              <p style="color: #6b6560; margin: 6px 0 0; font-size: 14px;">Your curated snapshot of artificial intelligence</p>
              <div style="margin-top: 16px; display: inline-block; background: rgba(255,255,255,0.6); padding: 8px 18px; border-radius: 10px; border: 1px solid #eae8e4;">
                <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #5b6abf; font-weight: 700;">Week of</span>
                <br>
                <span style="font-size: 15px; font-weight: 600; color: #2d2a26;">${weekRange}</span>
              </div>
            </td>
          </tr>

          <!-- Stats -->
          <tr>
            <td style="padding: 16px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; border: 1px solid #eae8e4;">
                <tr>
                  <td align="center" style="padding: 16px;">
                    <span style="font-size: 22px; font-weight: 700; color: #2d2a26;">${digest.totalArticles}</span>
                    <span style="font-size: 11px; text-transform: uppercase; color: #9e9790; margin-left: 6px;">Articles</span>
                    <span style="color: #e0ddd8; margin: 0 12px;">|</span>
                    <span style="font-size: 22px; font-weight: 700; color: #2d2a26;">16</span>
                    <span style="font-size: 11px; text-transform: uppercase; color: #9e9790; margin-left: 6px;">Sources</span>
                    <span style="color: #e0ddd8; margin: 0 12px;">|</span>
                    <span style="font-size: 22px; font-weight: 700; color: #2d2a26;">4</span>
                    <span style="font-size: 11px; text-transform: uppercase; color: #9e9790; margin-left: 6px;">Categories</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Categories -->
          <tr>
            <td>
              ${categoriesHTML}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center; color: #9e9790; font-size: 12px;">
              <p>Auto-generated from 16+ RSS feeds</p>
              <p style="margin-top: 4px; font-size: 11px; opacity: 0.7;">AI Weekly Digest · Powered by RSS aggregation</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function formatEmailDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtmlEmail(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
