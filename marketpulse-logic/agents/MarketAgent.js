/**
 * Agent responsible for fetching and caching market data
 */
class MarketAgent {
    /**
      * @param {Object} providers { crypto, stocks }
      * @param {Object} config
      */
    constructor(providers = {}, config = {}) {
        this.providers = providers;
        this.cache = new Map();
        this.cacheTTL = config.cacheTTL || 5 * 60 * 1000;

        // Ensure stockSymbols exists
        if (!this.providers.stockSymbols) {
            this.providers.stockSymbols = [];
        }
    }

    /**
     * Add a new asset to track
     * @param {Object} asset { symbol, name, type }
     */
    addAsset(asset) {
        // Check for duplicates
        const exists = this.providers.stockSymbols.some(s => s.symbol === asset.symbol);
        if (!exists) {
            this.providers.stockSymbols.push(asset);
            this.cache.clear(); // Invalidate cache to force fetch next time
            console.log(`MarketAgent: Added new asset ${asset.symbol}`);
            return true;
        }
        return false;
    }

    /**
      * Fetch all market data
      * @returns {Promise<Object>} MarketsResponse { assets, asOf }
      */
    async fetchMarkets() {
        const now = Date.now();
        const cacheKey = 'markets:all';

        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (now - cached.timestamp < this.cacheTTL) {
                return { assets: cached.data, asOf: new Date(cached.timestamp).toISOString(), fromCache: true };
            }
        }

        try {
            // Parallel fetch
            const promises = [];
            if (this.providers.crypto) promises.push(this.providers.crypto.fetchTopCrypto(30));
            if (this.providers.stocks) promises.push(this.providers.stocks.fetchStocks(this.providers.stockSymbols || []));

            const results = await Promise.allSettled(promises);

            const assets = [];

            // Process Crypto
            if (this.providers.crypto && results[0] && results[0].status === 'fulfilled') {
                const cryptoData = results[0].value;
                assets.push(...cryptoData.map(d => this.normalizeAsset(d, 'crypto')));
            }

            // Process Stocks
            if (this.providers.stocks && results[1] && results[1].status === 'fulfilled') {
                const stocksData = results[1].value;
                // Logic handles generic assets too
                assets.push(...stocksData.map(d => this.normalizeAsset(d, d.type || 'equity')));
            }

            // Update Cache
            this.cache.set(cacheKey, { data: assets, timestamp: now });

            return {
                assets,
                asOf: new Date().toISOString()
            };

        } catch (error) {
            console.error('Market fetch failed:', error);
            // Return stale cache if available, else empty
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                return { assets: cached.data, asOf: new Date(cached.timestamp).toISOString(), stale: true };
            }
            return { assets: [], asOf: new Date().toISOString() };
        }
    }

    /**
      * Normalize raw data
      */
    normalizeAsset(rawData, type) {
        if (type === 'crypto') {
            return {
                id: `crypto:${rawData.symbol.toUpperCase()}`,
                type: 'crypto',
                symbol: rawData.symbol.toUpperCase(),
                name: rawData.name,
                price: rawData.current_price,
                currency: rawData.currency || 'EUR',
                change24hPct: rawData.price_change_percentage_24h || 0,
                high24h: rawData.high_24h,
                low24h: rawData.low_24h,
                volume: rawData.total_volume,
                marketCap: rawData.market_cap,
                asOf: new Date().toISOString()
            };
        }

        // Generic/Stock normalizer
        return {
            id: `${type}:${rawData.symbol}`,
            type: type,
            symbol: rawData.symbol,
            name: rawData.name,
            price: rawData.price,
            currency: rawData.currency || 'USD',
            change24hPct: rawData.change24hPct || 0,
            high24h: rawData.high24h,
            low24h: rawData.low24h,
            volume: rawData.volume,
            marketCap: rawData.marketCap,
            asOf: new Date().toISOString()
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketAgent;
} else {
    window.MarketAgent = MarketAgent;
}
