/**
 * Real Yahoo Finance Provider using yahoo-finance2
 * Fetches live market data — prices are in the native currency of the exchange.
 * European symbols (e.g. GOM.MI, SILV.MI, ^FTSEMIB.MI) return EUR prices natively.
 */

let yahooFinance = null;

async function getYahooFinance() {
    if (yahooFinance) return yahooFinance;
    try {
        const yfModule = await import('yahoo-finance2');
        const YahooFinanceExport = yfModule.default || yfModule;

        // In newer versions, the default export is the class itself.
        // We'll check if it has the 'quote' method on its prototype if it's a function,
        // or if the export itself has 'quote'.
        if (typeof YahooFinanceExport === 'function') {
            // Check if it's an instance already or needs instantiation
            if (typeof YahooFinanceExport.quote === 'function') {
                yahooFinance = YahooFinanceExport;
            } else {
                yahooFinance = new YahooFinanceExport();
            }
        } else {
            yahooFinance = YahooFinanceExport;
        }

        if (typeof yahooFinance.quote !== 'function') {
            throw new Error('Imported module does not have a quote function');
        }

        return yahooFinance;
    } catch (e) {
        console.error('YahooFinanceProvider: Failed to load/init yahoo-finance2:', e.message);
        return null;
    }
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

        for (const symbolRef of symbolsRef) {
            try {
                const result = await this.fetchSingleQuote(symbolRef);
                results.push(result);
            } catch (error) {
                console.warn(`YahooFinanceProvider: Failed to fetch ${symbolRef.symbol}:`, error.message);
                results.push(this.buildMockEntry(symbolRef));
            }
            // Small delay between EVERY request to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return results;
    }

    /**
     * Fetch a single quote from Yahoo Finance
     */
    async fetchSingleQuote(symbolRef) {
        const yf = await getYahooFinance();
        if (!yf) {
            throw new Error(`Yahoo Finance provider not available`);
        }

        const quote = await yf.quote(symbolRef.symbol, {}, { validateResult: false });

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
        // Log the incoming symbolRef to debug why price might be missing
        // console.log(`YahooFinanceProvider: Building mock for ${symbolRef.symbol}`, Object.keys(symbolRef));

        let basePrice = symbolRef.price;

        // Hardcoded fallbacks for common user requested assets if missing in config/persistence
        if (!basePrice) {
            if (symbolRef.symbol === 'IB1T.DE') basePrice = 5.64;
            else if (symbolRef.symbol === 'GOM.MI') basePrice = 50.67;
            else if (symbolRef.symbol === 'JEDI.DE') basePrice = 66.26;
            else if (symbolRef.type === 'index') basePrice = 4000;
            else basePrice = 100;
        }

        const randomChange = (Math.random() - 0.5) * 0.5; // Smaller random drift for mock
        const price = basePrice * (1 + randomChange / 100);

        console.log(`YahooFinanceProvider: [FALLBACK] ${symbolRef.symbol} basePrice: ${basePrice} -> mock: ${price.toFixed(4)}`);

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
            previousClose: basePrice,
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
