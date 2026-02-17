/**
 * Mock Provider for Stock Data (simulating Yahoo Finance)
 */
class YahooFinanceProvider {
    constructor(mockMode = true) {
        this.mockMode = mockMode;
    }

    /**
     * Fetch stock data for a list of symbols
     * @param {Array<{symbol: string, type: string, name: string}>} symbolsRef 
     * @returns {Promise<Object[]>}
     */
    async fetchStocks(symbolsRef) {
        if (this.mockMode) {
            return this.fetchMockStocks(symbolsRef);
        }
        // Real implementation would go here (requires proxy or backend for Yahoo Finance due to CORS)
        return this.fetchMockStocks(symbolsRef);
    }

    /**
     * Generate realistic mock data
     */
    async fetchMockStocks(symbolsRef) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return symbolsRef.map(s => {
            let basePrice = s.price || 100;
            if (!s.price) {
                if (s.type === 'index') basePrice = 4000;
                if (s.type === 'commodity' && s.symbol.includes('Gold')) basePrice = 2000;
                if (s.symbol === 'AAPL') basePrice = 180;
            }

            const randomChange = (Math.random() - 0.5) * 4; // -2% to +2%

            const price = basePrice * (1 + randomChange / 100);

            return {
                ...s,
                price: price,
                change24hPct: randomChange,
                high24h: price * (1 + Math.random() * 0.02),
                low24h: price * (1 - Math.random() * 0.02),
                volume: Math.floor(Math.random() * 100000000),
                marketCap: Math.floor(Math.random() * 1000000000000)
            };
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = YahooFinanceProvider;
} else {
    window.YahooFinanceProvider = YahooFinanceProvider;
}
