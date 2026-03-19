/**
 * Curated list of AI news RSS feed sources, organized by category.
 */

const SOURCES = {
    bigTech: {
        label: '🏢 Big Tech & AI Labs',
        color: '#6366f1',
        feeds: [
            {
                name: 'OpenAI Blog',
                url: 'https://openai.com/blog/rss.xml',
                icon: '🤖',
            },
            {
                name: 'Google AI Blog',
                url: 'https://blog.google/technology/ai/rss/',
                icon: '🔍',
            },
            {
                name: 'DeepMind Blog',
                url: 'https://deepmind.google/blog/rss.xml',
                icon: '🧠',
            },
            {
                name: 'Meta AI Blog',
                url: 'https://ai.meta.com/blog/rss/',
                icon: '👤',
            },
            {
                name: 'Microsoft AI Blog',
                url: 'https://blogs.microsoft.com/ai/feed/',
                icon: '💠',
            },
            {
                name: 'NVIDIA AI Blog',
                url: 'https://blogs.nvidia.com/feed/',
                icon: '🟢',
            },
        ],
    },
    techNews: {
        label: '📰 Tech News',
        color: '#f59e0b',
        feeds: [
            {
                name: 'TechCrunch AI',
                url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
                icon: '💚',
            },
            {
                name: 'VentureBeat AI',
                url: 'https://venturebeat.com/category/ai/feed/',
                icon: '📡',
            },
            {
                name: 'The Verge AI',
                url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
                icon: '🔺',
            },
            {
                name: 'Ars Technica AI',
                url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
                icon: '🔬',
            },
            {
                name: 'WIRED AI',
                url: 'https://www.wired.com/feed/tag/ai/latest/rss',
                icon: '⚡',
            },
        ],
    },
    research: {
        label: '🔬 Research & Academia',
        color: '#10b981',
        feeds: [
            {
                name: 'MIT News AI',
                url: 'https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml',
                icon: '🎓',
            },
            {
                name: 'BAIR Blog',
                url: 'https://bair.berkeley.edu/blog/feed.xml',
                icon: '🐻',
            },
            {
                name: 'Towards Data Science',
                url: 'https://towardsdatascience.com/feed',
                icon: '📊',
            },
        ],
    },
    startupsVC: {
        label: '🚀 Startups & VC',
        color: '#ef4444',
        feeds: [
            {
                name: 'Y Combinator Blog',
                url: 'https://www.ycombinator.com/blog/rss/',
                icon: '🟠',
            },
            {
                name: 'a16z AI',
                url: 'https://a16z.com/feed/',
                icon: '💰',
            },
        ],
    },
};

export default SOURCES;
