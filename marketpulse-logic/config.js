/**
 * Configuration settings for MarketPulse logic
 */
const CONFIG = {
    // Refresh intervals
    autoRefreshInterval: 5 * 60 * 1000,  // 5 minutes
    cacheTTL: 5 * 60 * 1000,             // 5 minutes

    // Data sources - Italian news only
    rssFeeds: [
        { url: 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml', source: 'ANSA' },
        { url: 'https://www.ilsole24ore.com/rss/economia--2.xml', source: 'Il Sole 24 Ore' },
        { url: 'https://www.milanofinanza.it/rss', source: 'Milano Finanza' },
        { url: 'https://www.corriere.it/rss/economia.xml', source: 'Corriere della Sera' },
        { url: 'https://www.repubblica.it/rss/economia/rss2.0.xml', source: 'La Repubblica' },
        { url: 'https://www.lastampa.it/economia/rss', source: 'La Stampa' },
        { url: 'https://www.ilgiornale.it/rss-economia.xml', source: 'Il Giornale' },
        { url: 'https://www.wallstreetitalia.com/feed/', source: 'Wall Street Italia' }
    ],

    stockSymbols: [
        // Major Indices (8)
        { symbol: '^GSPC', name: 'S&P 500', type: 'index' },
        { symbol: '^DJI', name: 'Dow Jones', type: 'index' },
        { symbol: '^IXIC', name: 'NASDAQ', type: 'index' },
        { symbol: '^FTSE', name: 'FTSE 100', type: 'index' },
        { symbol: '^N225', name: 'Nikkei 225', type: 'index' },
        { symbol: '^HSI', name: 'Hang Seng', type: 'index' },
        { symbol: '^GDAXI', name: 'DAX', type: 'index', currency: 'EUR' },
        { symbol: '^FTSEMIB.MI', name: 'FTSE MIB', type: 'index', currency: 'EUR' },

        // User Requested ETFs
        { symbol: 'GOM.MI', name: 'Gold Bullion Securities', type: 'etf', currency: 'EUR', price: 50.67 },
        { symbol: 'IB1T.DE', name: 'iShares $ Treasury Bond 1-3yr', type: 'etf', currency: 'EUR', price: 5.733 },
        { symbol: 'JEDI.DE', name: 'JPMorgan ETFs (Ireland) ICAV', type: 'etf', currency: 'EUR', price: 66.26 },
        { symbol: 'SCWX.MI', name: 'iShares MSCI World Small Cap', type: 'etf', currency: 'EUR', price: 10.554 },
        { symbol: 'SILV.MI', name: 'WisdomTree Physical Silver', type: 'etf', currency: 'EUR', price: 39.965 },
        { symbol: 'WBLK.MI', name: 'WisdomTree Physical Swiss Gold', type: 'etf', currency: 'EUR', price: 42.61 },
        { symbol: 'HY9H.MU', name: 'High Yield Corp Bond', type: 'etf', currency: 'EUR', price: 524 },
        { symbol: 'SSU.F', name: 'iShares S&P 500 Info Tech', type: 'etf', currency: 'EUR', price: 2630 },
        { symbol: 'BNKE.MI', name: 'Lyxor EURO STOXX Banks', type: 'etf', currency: 'EUR', price: 322.6 },

        // Top Stocks (25)
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'equity' },
        { symbol: 'MSFT', name: 'Microsoft', type: 'equity' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'equity' },
        { symbol: 'AMZN', name: 'Amazon', type: 'equity' },
        { symbol: 'NVDA', name: 'NVIDIA', type: 'equity' },
        { symbol: 'META', name: 'Meta Platforms', type: 'equity' },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'equity' },
        { symbol: 'BRK-B', name: 'Berkshire Hathaway', type: 'equity' },
        { symbol: 'V', name: 'Visa Inc.', type: 'equity' },
        { symbol: 'JPM', name: 'JPMorgan Chase', type: 'equity' },
        { symbol: 'WMT', name: 'Walmart', type: 'equity' },
        { symbol: 'MA', name: 'Mastercard', type: 'equity' },
        { symbol: 'PG', name: 'Procter & Gamble', type: 'equity' },
        { symbol: 'UNH', name: 'UnitedHealth', type: 'equity' },
        { symbol: 'HD', name: 'Home Depot', type: 'equity' },
        { symbol: 'DIS', name: 'Disney', type: 'equity' },
        { symbol: 'NFLX', name: 'Netflix', type: 'equity' },
        { symbol: 'ADBE', name: 'Adobe', type: 'equity' },
        { symbol: 'CRM', name: 'Salesforce', type: 'equity' },
        { symbol: 'PYPL', name: 'PayPal', type: 'equity' },
        { symbol: 'INTC', name: 'Intel', type: 'equity' },
        { symbol: 'AMD', name: 'AMD', type: 'equity' },
        { symbol: 'CSCO', name: 'Cisco', type: 'equity' },
        { symbol: 'PEP', name: 'PepsiCo', type: 'equity' },
        { symbol: 'KO', name: 'Coca-Cola', type: 'equity' },

        // Commodities
        { symbol: 'GC=F', name: 'Gold', type: 'commodity' },
        { symbol: 'CL=F', name: 'Crude Oil', type: 'commodity' }
    ],

    // Alert settings
    maxAlerts: 10,
    minConfidence: 0.5,

    // API endpoints (if using backend)
    apiBaseUrl: 'http://localhost:3000/api'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
