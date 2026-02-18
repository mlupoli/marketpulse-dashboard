/**
 * Real Yahoo Finance Provider using yahoo-finance2
 * Fetches live market data — prices are in the native currency of the exchange.
 * European symbols (e.g. GOM.MI, SILV.MI, ^FTSEMIB.MI) return EUR prices natively.
 */

let yahooFinance;
if (typeof module !== 'undefined' && module.exports) {
    yahooFinance = require('yahoo-finance2').default;
}

class YahooFinanceProvider {
    constructor(mockMode = false) {
        this.mockMode = mockMode;
        // Batch size to avoid rate limiting
        this.batchSize = 10;
        // Delay between batches (ms)
        this.batchDelay = 500;
    }

    /**
     * Fetch stock data for a list of symbols
     * @param {Array<{symbol: string, type: string, name: string, currency?: string}>} symbolsRef
     * @returns {Promise<Object[]>}
     */
    async fetchStocks(symbolsRef) {
        if (this.mockMode) {
            return this.fetchMockStocks(symbolsRef);
        }
        try {
            return await this.fetchRealStocks(symbolsRef);
        } catch (error) {
            console.error('YahooFinanceProvider: Real fetch failed, falling back to mock:', error.message);
            return this.fetchMockStocks(symbolsRef);
        }
    }

    /**
     * Fetch real data from Yahoo Finance in batches
     */
    async fetchRealStocks(symbolsRef) {
        const results = [];

        // Process in batches to avoid rate limiting
        for (let i = 0; i < symbolsRef.length; i += this.batchSize) {
            const batch = symbolsRef.slice(i, i + this.batchSize);

            const batchResults = await Promise.allSettled(
                batch.map(s => this.fetchSingleQuote(s))
            );

            for (let j = 0; j < batchResults.length; j++) {
                const result = batchResults[j];
                const symbolRef = batch[j];

                if (result.status === 'fulfilled' && result.value) {
                    results.push(result.value);
                } else {
                    // On error, push with fallback mock data so the asset still appears
                    console.warn(`YahooFinanceProvider: Failed to fetch ${symbolRef.symbol}:`, result.reason?.message || 'unknown error');
                    results.push(this.buildMockEntry(symbolRef));
                }
            }

            // Delay between batches (skip delay after last batch)
            if (i + this.batchSize < symbolsRef.length) {
                await new Promise(resolve => setTimeout(resolve, this.batchDelay));
            }
        }

        return results;
    }

    /**
     * Fetch a single quote from Yahoo Finance
     */
    async fetchSingleQuote(symbolRef) {
        const quote = await yahooFinance.quote(symbolRef.symbol, {}, { validateResult: false });

        if (!quote || quote.regularMarketPrice == null) {
            throw new Error(`No price data for ${symbolRef.symbol}`);
        }

        return {
            symbol: symbolRef.symbol,
            name: symbolRef.name || quote.longName || quote.shortName || symbolRef.symbol,
            type: symbolRef.type || 'equity',
            price: quote.regularMarketPrice,
            currency: quote.currency || symbolRef.currency || 'EUR',
            change24hPct: quote.regularMarketChangePercent != null
                ? parseFloat(quote.regularMarketChangePercent.toFixed(2))
                : 0,
            high24h: quote.regularMarketDayHigh || null,
            low24h: quote.regularMarketDayLow || null,
            volume: quote.regularMarketVolume || null,
            marketCap: quote.marketCap || null,
            previousClose: quote.regularMarketPreviousClose || null
        };
    }

    /**
     * Build a mock entry as fallback when real data fails
     */
    buildMockEntry(symbolRef) {
        const basePrice = symbolRef.price || (symbolRef.type === 'index' ? 4000 : 100);
        const randomChange = (Math.random() - 0.5) * 2;
        const price = basePrice * (1 + randomChange / 100);
        return {
            symbol: symbolRef.symbol,
            name: symbolRef.name || symbolRef.symbol,
            type: symbolRef.type || 'equity',
            price,
            currency: symbolRef.currency || 'EUR',
            change24hPct: parseFloat(randomChange.toFixed(2)),
            high24h: price * 1.01,
            low24h: price * 0.99,
            volume: null,
            marketCap: null,
            previousClose: null,
            isMock: true
        };
    }

    /**
     * Generate realistic mock data (used as fallback or in mock mode)
     */
    async fetchMockStocks(symbolsRef) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return symbolsRef.map(s => this.buildMockEntry(s));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = YahooFinanceProvider;
} else {
    window.YahooFinanceProvider = YahooFinanceProvider;
}
