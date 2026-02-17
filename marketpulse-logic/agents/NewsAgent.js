/**
 * Agent responsible for fetching and processing financial news
 */
class NewsAgent {
    /**
     * @param {RSSProvider[]} providers 
     */
    constructor(providers = []) {
        this.providers = providers;
        this.cache = new Map(); // URL -> NewsItem
    }

    /**
     * Fetch news from all providers
     * @returns {Promise<Object>} NewsResponse { items, asOf }
     */
    async fetchNews() {
        const allNews = [];

        // Fetch from all providers in parallel
        const feedResults = await Promise.all(
            this.providers.map(p => p.fetch().then(items => items.map(i => ({ ...i, source: p.sourceName }))))
        );

        // Flatten results
        feedResults.forEach(items => allNews.push(...items));

        // Normalize items
        const normalized = allNews.map(item => this.normalizeItem(item));

        // Deduplicate
        const uniqueNews = this.deduplicate(normalized);

        // Sort by date desc
        uniqueNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        return {
            items: uniqueNews,
            asOf: new Date().toISOString()
        };
    }

    /**
     * Normalize raw feed item to NewsItem
     * @param {Object} rawItem 
     * @returns {Object} NewsItem
     */
    normalizeItem(rawItem) {
        const title = rawItem.title || 'No Title';
        const snippet = (rawItem.contentSnippet || '').substring(0, 300);
        const publishedAt = rawItem.pubDate ? new Date(rawItem.pubDate).toISOString() : new Date().toISOString();

        // Generate ID hash
        const idString = `${title}-${rawItem.source}-${publishedAt.split('T')[0]}`;
        // Simple hash replacement for ID (in production use real hash)
        const id = btoa(unescape(encodeURIComponent(idString))).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

        const tags = this.extractTags(title + ' ' + snippet);

        return {
            id,
            title,
            url: rawItem.link,
            source: rawItem.source,
            publishedAt,
            snippet,
            tags
        };
    }

    /**
     * Extract tags based on keywords
     * @param {string} text 
     * @returns {string[]}
     */
    extractTags(text) {
        const lowerText = text.toLowerCase();
        const tags = new Set();

        const TAG_KEYWORDS = {
            'inflazione': ['inflazione', 'prezzi', 'rincari', 'costo vita', 'inflation'],
            'tassi': ['tassi', 'bce', 'fed', 'interessi', 'rates', 'central bank'],
            'tech': ['tecnologia', 'ai', 'intelligenza artificiale', 'digitale', 'software', 'tech'],
            'energia': ['energia', 'petrolio', 'gas', 'elettricità', 'energy', 'oil'],
            'geopolitica': ['guerra', 'conflitto', 'sanzioni', 'tensioni', 'war', 'conflict'],
            'crypto': ['bitcoin', 'crypto', 'ethereum', 'blockchain'],
            'banche': ['banche', 'credito', 'finanza', 'mutui', 'banks'],
            'borsa': ['borsa', 'azioni', 'indici', 'ftse', 'sp500', 'stock market'],
            'spread': ['spread', 'btp', 'bund', 'differenziale'],
            'pil': ['pil', 'crescita', 'recessione', 'gdp']
        };

        for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
            if (keywords.some(kw => lowerText.includes(kw))) {
                tags.add(tag);
            }
        }

        return Array.from(tags);
    }

    /**
     * Deduplicate news items
     * @param {Object[]} items 
     * @returns {Object[]}
     */
    deduplicate(items) {
        const seen = new Map();

        for (const item of items) {
            // Simplified fuzzy matching logic: use stripped title + date
            const titleKey = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
            const dateKey = item.publishedAt.split('T')[0];
            const key = `${titleKey}-${dateKey}`;

            if (!seen.has(key)) {
                seen.set(key, item);
            }
        }

        return Array.from(seen.values());
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsAgent;
} else {
    window.NewsAgent = NewsAgent;
}
