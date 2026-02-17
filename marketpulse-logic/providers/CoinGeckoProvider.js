/**
 * Provider for CoinGecko API
 */
class CoinGeckoProvider {
    constructor() {
        this.baseUrl = 'https://api.coingecko.com/api/v3';
    }

    /**
     * Fetch top crypto by market cap
     * @param {number} limit 
     * @returns {Promise<Object[]>}
     */
    async fetchTopCrypto(limit = 10) {
        try {
            const url = `${this.baseUrl}/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`;

            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('CoinGecko rate limit reached');
                }
                throw new Error(`CoinGecko status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('CoinGecko fetch failed:', error);
            return [];
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoinGeckoProvider;
} else {
    window.CoinGeckoProvider = CoinGeckoProvider;
}
