/**
 * Orchestrator bridging all agents
 */

// Import dependencies if in Node.js
let CONFIG, RSSProvider, NewsAgent, MarketAgent, CoinGeckoProvider, YahooFinanceProvider, AnalysisAgent;

if (typeof module !== 'undefined' && module.exports) {
    CONFIG = require('../config');
    RSSProvider = require('../providers/RSSProvider');
    NewsAgent = require('../agents/NewsAgent');
    CoinGeckoProvider = require('../providers/CoinGeckoProvider');
    YahooFinanceProvider = require('../providers/YahooFinanceProvider');
    MarketAgent = require('../agents/MarketAgent');
    AnalysisAgent = require('../agents/AnalysisAgent');
}

class MarketPulseOrchestrator {
    constructor() {
        // Initialize Agents with Providers
        // In a real app we'd inject these dependencies

        // News
        const rssProviders = CONFIG.rssFeeds.map(feed => new RSSProvider(feed.url, feed.source));
        this.newsAgent = new NewsAgent(rssProviders);

        // Markets
        const marketProviders = {
            crypto: new CoinGeckoProvider(),
            stocks: new YahooFinanceProvider(true), // Mock mode
            stockSymbols: CONFIG.stockSymbols
        };
        this.marketAgent = new MarketAgent(marketProviders, CONFIG);

        // Analysis
        this.analysisAgent = new AnalysisAgent();

        this.state = {
            news: [],
            assets: [],
            alerts: [],
            lastUpdated: null,
            isRefreshing: false
        };

        this.autoRefreshInterval = null;
    }

    /**
     * Initialize and start
     */
    async start() {
        await this.refresh();
        this.startAutoRefresh(CONFIG.autoRefreshInterval);
    }

    /**
     * Fetch all data and update state
     * @returns {Promise<Object>}
     */
    async refresh() {
        if (this.state.isRefreshing) return this.getState();

        this.state.isRefreshing = true;

        try {
            console.log('Orchestrator: Starting refresh...');

            // Fetch news and markets in parallel
            const [newsResponse, marketsResponse] = await Promise.all([
                this.newsAgent.fetchNews(),
                this.marketAgent.fetchMarkets()
            ]);

            console.log(`Orchestrator: Fetched ${newsResponse.items.length} news and ${marketsResponse.assets.length} assets.`);

            // Generate alerts
            const alerts = this.analysisAgent.generateAlerts(
                newsResponse.items,
                marketsResponse.assets
            );

            console.log(`Orchestrator: Generated ${alerts.length} alerts.`);

            // Update state
            this.state = {
                news: newsResponse.items,
                assets: marketsResponse.assets,
                alerts,
                lastUpdated: new Date().toISOString(),
                isRefreshing: false
            };

            return this.getState();

        } catch (error) {
            console.error('Orchestrator refresh failed:', error);
            this.state.isRefreshing = false;
            throw error;
        }
    }

    startAutoRefresh(interval) {
        this.stopAutoRefresh();
        this.autoRefreshInterval = setInterval(() => {
            this.refresh().catch(err => console.error('Auto-refresh error:', err));
        }, interval);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    getState() {
        return { ...this.state };
    }

    /**
     * Add a new asset to track
     */
    addAsset(asset) {
        return this.marketAgent.addAsset(asset);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketPulseOrchestrator;
} else {
    window.MarketPulseOrchestrator = MarketPulseOrchestrator;
}
