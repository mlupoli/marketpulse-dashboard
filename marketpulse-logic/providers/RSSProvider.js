/**
 * Base class for RSS feed providers
 */
class RSSProvider {
    /**
     * @param {string} feedUrl 
     * @param {string} sourceName 
     */
    constructor(feedUrl, sourceName) {
        this.feedUrl = feedUrl;
        this.sourceName = sourceName;
    }

    /**
     * Fetch and parse RSS feed
     * @returns {Promise<Object[]>} Raw feed items
     */
    async fetch() {
        try {
            // In a real browser environment, CORS might be an issue.
            // We'll use a CORS proxy if running in browser, or direct fetch if in Node (though Node fetch needs a polyfill or v18+)
            // For this demo, we assume direct fetch works or we're in a permissive environment.

            const response = await fetch(this.feedUrl);
            if (!response.ok) throw new Error(`Failed to fetch RSS: ${response.statusText}`);

            const text = await response.text();
            return this.parseRSS(text);
        } catch (error) {
            console.error(`RSS fetch error for ${this.sourceName}:`, error);
            return [];
        }
    }

    /**
     * Simple XML to JSON parser for RSS
     * @param {string} xmlText 
     * @returns {Object[]}
     */
    parseRSS(xmlText) {
        const items = [];

        // Basic regex-based parser for demo purposes (robust XML parsing requires DOMParser or xml2js)
        // <item>...</item>
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null) {
            const itemContent = match[1];

            const titleMatch = itemContent.match(/<title>(.*?)<\/title>/);
            const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
            const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
            const descriptionMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);

            // Handle CDATA sections if present
            const clean = (str) => str ? str.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';

            items.push({
                title: clean(titleMatch ? titleMatch[1] : ''),
                link: clean(linkMatch ? linkMatch[1] : ''),
                pubDate: clean(pubDateMatch ? pubDateMatch[1] : ''),
                contentSnippet: clean(descriptionMatch ? descriptionMatch[1] : '')
            });
        }

        return items;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RSSProvider;
} else {
    window.RSSProvider = RSSProvider;
}
