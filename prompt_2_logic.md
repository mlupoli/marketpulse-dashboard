# PROMPT 2: MarketPulse Dashboard - Application Logic & Agent Architecture

## Context
You are a senior backend/systems architect specializing in modular agent-based systems. Create the complete application logic for "MarketPulse" - a financial dashboard that aggregates news, market data, and generates intelligent alerts using a 3-agent architecture.

## Technical Requirements

### Stack
- **Runtime**: Node.js (v18+) OR browser-compatible JavaScript
- **Language**: JavaScript/TypeScript (use JSDoc for types if JS)
- **Architecture**: Modular agent system with provider abstraction
- **Storage**: In-memory (no database for demo)
- **APIs**: Free/public endpoints only (no API keys required)

### Design Principles
1. **Modularity**: Each agent is an independent module with clear interfaces
2. **Substitutability**: Data providers are pluggable (easy to swap sources)
3. **Resilience**: Graceful degradation, caching, fallbacks
4. **Simplicity**: Demo-grade, not production (optimize for clarity)
5. **Explainability**: Rule-based logic that's auditable

---

## Data Contracts (TypeScript-style)

### Core Types

```typescript
// NEWS
interface NewsItem {
  id: string;                    // Unique ID (hash of title+source+date)
  title: string;
  url: string;
  source: string;                // e.g., "Il Sole 24 Ore"
  publishedAt: string;           // ISO 8601 timestamp
  snippet: string;               // 150-300 chars
  tags: string[];                // Extracted keywords
}

// MARKETS
type AssetType = "equity" | "index" | "crypto" | "commodity";

interface MarketAsset {
  id: string;                    // Unique ID (type:symbol)
  type: AssetType;
  symbol: string;                // e.g., "AAPL", "BTC", "^GSPC"
  name: string;                  // Full name
  price: number;
  currency: string;              // "USD", "EUR", etc.
  change24hPct: number;          // Percentage change
  asOf: string;                  // ISO 8601 timestamp
}

// ALERTS
type Severity = "low" | "medium" | "high";
type TimeHorizon = "days" | "weeks" | "months";

interface AlertItem {
  id: string;                    // Unique ID (timestamp-based)
  severity: Severity;
  title: string;                 // Short headline (max 80 chars)
  thesis: string;                // Full explanation (200-500 chars)
  confidence: number;            // 0.0 to 1.0
  horizon: TimeHorizon;
  assetRefs: string[];           // Array of MarketAsset.id
  newsRefs: string[];            // Array of NewsItem.id
  createdAt: string;             // ISO 8601 timestamp
}

// API RESPONSES
interface NewsResponse {
  items: NewsItem[];
  asOf: string;
}

interface MarketsResponse {
  assets: MarketAsset[];
  asOf: string;
}

interface AlertsResponse {
  alerts: AlertItem[];
  asOf: string;
}

interface RefreshResponse {
  news: NewsItem[];
  markets: MarketAsset[];
  alerts: AlertItem[];
  asOf: string;
}
```

---

## Agent Architecture

### System Overview

```
┌──────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                       │
│  (Coordinates agents, handles caching, API layer)   │
└────────┬──────────────────┬──────────────────┬───────┘
         │                  │                  │
    ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
    │  NEWS    │      │ MARKET   │      │ ANALYSIS │
    │  AGENT   │      │  AGENT   │      │  AGENT   │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                  │                  │
    ┌────▼─────┐      ┌────▼─────┐            │
    │   RSS    │      │CoinGecko │            │
    │ Provider │      │ Provider │    (uses news + markets)
    └──────────┘      └──────────┘
         │                  │
    ┌────▼─────┐      ┌────▼─────┐
    │ ANSA RSS │      │ Yahoo    │
    └──────────┘      │ Finance  │
                      └──────────┘
```

### Agent Responsibilities

1. **NewsAgent**: Fetch, normalize, deduplicate, tag news
2. **MarketAgent**: Fetch, normalize, cache market prices
3. **AnalysisAgent**: Generate alerts from news + market data

---

## 1. NewsAgent

### Purpose
Aggregate Italian financial news from multiple RSS feeds, normalize data, extract tags, and deduplicate.

### Interface

```javascript
class NewsAgent {
  constructor(providers = []) {
    this.providers = providers;  // Array of news providers
    this.cache = new Map();      // URL -> NewsItem
  }

  /**
   * Fetch news from all providers
   * @returns {Promise<NewsResponse>}
   */
  async fetchNews() {}

  /**
   * Normalize raw feed item to NewsItem
   * @param {Object} rawItem - Raw RSS/API item
   * @returns {NewsItem}
   */
  normalizeItem(rawItem) {}

  /**
   * Extract tags from title + snippet
   * @param {string} text
   * @returns {string[]}
   */
  extractTags(text) {}

  /**
   * Deduplicate by title similarity + source + date
   * @param {NewsItem[]} items
   * @returns {NewsItem[]}
   */
  deduplicate(items) {}
}
```

### Providers to Implement

#### RSSProvider (base class)
```javascript
class RSSProvider {
  constructor(feedUrl, sourceName) {
    this.feedUrl = feedUrl;
    this.sourceName = sourceName;
  }

  /**
   * Fetch and parse RSS feed
   * @returns {Promise<Object[]>} Raw feed items
   */
  async fetch() {
    // Use fetch() to get XML
    // Parse XML to JSON (lightweight parser or regex)
    // Return array of items
  }
}
```

**Suggested RSS Feeds** (Italian financial news, free):
1. **ANSA Economia**: `https://www.ansa.it/sito/notizie/economia/economia_rss.xml`
2. **Il Sole 24 Ore**: `https://www.ilsole24ore.com/rss/economia--2.xml` (if available)
3. **Milano Finanza**: Check for RSS feed
4. **Reuters Italia**: `https://www.reuters.com/rssFeed/businessNews` (filter Italian)

**Fallback**: If RSS fails, use mock data generator.

### Tag Extraction Logic

**Keywords to detect** (case-insensitive, Italian):
- **Inflazione**: inflazione, prezzi, rincari, costo vita
- **Tassi**: tassi, BCE, Fed, interessi, rendimenti
- **Tech**: tecnologia, AI, intelligenza artificiale, digitale, software
- **Energia**: energia, petrolio, gas, elettricità
- **Geopolitica**: guerra, conflitto, sanzioni, tensioni
- **Cripto**: bitcoin, crypto, ethereum, blockchain
- **Banche**: banche, credito, finanza, mutui
- **Borsa**: borsa, azioni, indici, Ftse, S&P

**Implementation**:
```javascript
const TAG_KEYWORDS = {
  'inflazione': ['inflazione', 'prezzi', 'rincari'],
  'tassi': ['tassi', 'bce', 'fed', 'interessi'],
  'tech': ['tecnologia', 'ai', 'intelligenza artificiale', 'digitale'],
  'energia': ['energia', 'petrolio', 'gas'],
  'geopolitica': ['guerra', 'conflitto', 'sanzioni'],
  'crypto': ['bitcoin', 'crypto', 'ethereum', 'blockchain'],
  'banche': ['banche', 'credito', 'finanza'],
  'borsa': ['borsa', 'azioni', 'indici', 'ftse', 'sp500']
};

extractTags(text) {
  const lowerText = text.toLowerCase();
  const tags = new Set();
  
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      tags.add(tag);
    }
  }
  
  return Array.from(tags);
}
```

### Deduplication Logic

```javascript
deduplicate(items) {
  const seen = new Map();  // titleHash -> NewsItem
  
  for (const item of items) {
    // Create hash from normalized title + source + date (same day)
    const titleNorm = item.title.toLowerCase().replace(/[^\w\s]/g, '');
    const dateDay = item.publishedAt.split('T')[0];  // YYYY-MM-DD
    const hash = `${titleNorm}-${item.source}-${dateDay}`;
    
    if (!seen.has(hash)) {
      seen.set(hash, item);
    }
  }
  
  return Array.from(seen.values());
}
```

### Mock Data Generator

```javascript
function generateMockNews(count = 20) {
  const sources = ['ANSA', 'Il Sole 24 Ore', 'Milano Finanza', 'Reuters Italia'];
  const templates = [
    { title: 'BCE conferma tassi al {rate}% nonostante pressioni', tags: ['tassi', 'bce'] },
    { title: 'Inflazione zona euro scende al {pct}%', tags: ['inflazione'] },
    { title: 'Borsa Milano chiude in {dir}: FTSE MIB {sign}{pct}%', tags: ['borsa'] },
    { title: 'Bitcoin supera i ${price}k: rally delle crypto', tags: ['crypto'] },
    { title: 'Settore tech in crescita: AI traina i mercati', tags: ['tech', 'borsa'] },
    { title: 'Prezzo petrolio a ${price} al barile', tags: ['energia'] },
    // Add 10+ more templates
  ];
  
  // Generate news items with random values
  // Return array of NewsItem
}
```

---

## 2. MarketAgent

### Purpose
Fetch real-time market data (stocks, indices, commodities, crypto), normalize, cache with TTL, and provide fallback.

### Interface

```javascript
class MarketAgent {
  constructor(providers = {}) {
    this.providers = providers;     // { stocks: Provider, crypto: Provider }
    this.cache = new Map();         // symbol -> { data, timestamp }
    this.cacheTTL = 5 * 60 * 1000;  // 5 minutes
  }

  /**
   * Fetch all market data
   * @returns {Promise<MarketsResponse>}
   */
  async fetchMarkets() {}

  /**
   * Check if cached data is still valid
   * @param {string} key
   * @returns {boolean}
   */
  isCacheValid(key) {}

  /**
   * Normalize raw market data to MarketAsset
   * @param {Object} rawData
   * @param {AssetType} type
   * @returns {MarketAsset}
   */
  normalizeAsset(rawData, type) {}
}
```

### Providers to Implement

#### CryptoProvider (CoinGecko API - free, no key)
```javascript
class CoinGeckoProvider {
  constructor() {
    this.baseUrl = 'https://api.coingecko.com/api/v3';
  }

  /**
   * Fetch top 10 crypto by market cap
   * @returns {Promise<Object[]>}
   */
  async fetchTopCrypto() {
    const url = `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1`;
    const response = await fetch(url);
    return response.json();
    
    // Returns: [{ id, symbol, name, current_price, price_change_percentage_24h, ... }]
  }
}
```

**Normalization**:
```javascript
normalizeAsset(rawData, type) {
  if (type === 'crypto') {
    return {
      id: `crypto:${rawData.symbol.toUpperCase()}`,
      type: 'crypto',
      symbol: rawData.symbol.toUpperCase(),
      name: rawData.name,
      price: rawData.current_price,
      currency: 'USD',
      change24hPct: rawData.price_change_percentage_24h || 0,
      asOf: new Date().toISOString()
    };
  }
  // ... other types
}
```

#### StocksProvider (Yahoo Finance API - free, no key)

**Option 1**: Use a free Yahoo Finance proxy:
```javascript
class YahooFinanceProvider {
  async fetchQuote(symbol) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Extract: current price, previous close, calculate change%
    // Return normalized data
  }
}
```

**Option 2**: Mock provider with realistic data:
```javascript
class MockStocksProvider {
  async fetchStocks() {
    const symbols = [
      { symbol: '^GSPC', name: 'S&P 500', type: 'index' },
      { symbol: '^DJI', name: 'Dow Jones', type: 'index' },
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'equity' },
      { symbol: 'MSFT', name: 'Microsoft', type: 'equity' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'equity' },
      { symbol: 'TSLA', name: 'Tesla Inc.', type: 'equity' },
      { symbol: 'GC=F', name: 'Gold', type: 'commodity' },
      { symbol: 'CL=F', name: 'Crude Oil', type: 'commodity' }
    ];
    
    return symbols.map(s => ({
      ...s,
      price: this.getRandomPrice(s.symbol),
      change24hPct: (Math.random() - 0.5) * 5  // -2.5% to +2.5%
    }));
  }
}
```

### Caching Implementation

```javascript
async fetchMarkets() {
  const now = Date.now();
  const cacheKey = 'markets:all';
  
  // Check cache
  if (this.cache.has(cacheKey)) {
    const cached = this.cache.get(cacheKey);
    if (now - cached.timestamp < this.cacheTTL) {
      return { assets: cached.data, asOf: new Date(cached.timestamp).toISOString() };
    }
  }
  
  // Fetch fresh data
  try {
    const [cryptoData, stocksData] = await Promise.all([
      this.providers.crypto.fetchTopCrypto(),
      this.providers.stocks.fetchStocks()
    ]);
    
    const assets = [
      ...cryptoData.map(d => this.normalizeAsset(d, 'crypto')),
      ...stocksData.map(d => this.normalizeAsset(d, d.type))
    ];
    
    // Update cache
    this.cache.set(cacheKey, { data: assets, timestamp: now });
    
    return { assets, asOf: new Date().toISOString() };
    
  } catch (error) {
    // Fallback to stale cache or mock data
    console.error('Market fetch failed:', error);
    return this.getFallbackData();
  }
}
```

---

## 3. AnalysisAgent

### Purpose
Generate intelligent alerts by cross-referencing news tags with market movements using rule-based heuristics.

### Interface

```javascript
class AnalysisAgent {
  constructor() {
    this.rules = this.initializeRules();
  }

  /**
   * Generate alerts from news + market data
   * @param {NewsItem[]} news
   * @param {MarketAsset[]} assets
   * @returns {AlertItem[]}
   */
  generateAlerts(news, assets) {}

  /**
   * Initialize analysis rules
   * @returns {Rule[]}
   */
  initializeRules() {}

  /**
   * Apply single rule
   * @param {Rule} rule
   * @param {NewsItem[]} news
   * @param {MarketAsset[]} assets
   * @returns {AlertItem|null}
   */
  applyRule(rule, news, assets) {}
}
```

### Rule-Based Analysis System

#### Rule Structure

```javascript
interface Rule {
  id: string;
  name: string;
  condition: (news, assets) => boolean;
  generator: (news, assets) => AlertItem;
}
```

#### Example Rules

**Rule 1: Inflation + Risk-Off → Gold Alert**
```javascript
{
  id: 'inflation_risk_off',
  name: 'Inflation Risk-Off Signal',
  
  condition: (news, assets) => {
    const hasInflationNews = news.filter(n => 
      n.tags.includes('inflazione') || n.tags.includes('tassi')
    ).length >= 2;
    
    const goldAsset = assets.find(a => a.symbol === 'GC=F');
    const spxAsset = assets.find(a => a.symbol === '^GSPC');
    
    const marketRiskOff = spxAsset && spxAsset.change24hPct < -1.0;
    
    return hasInflationNews && marketRiskOff;
  },
  
  generator: (news, assets) => {
    const relatedNews = news.filter(n => 
      n.tags.includes('inflazione') || n.tags.includes('tassi')
    ).slice(0, 3);
    
    const goldAsset = assets.find(a => a.symbol === 'GC=F');
    const spxAsset = assets.find(a => a.symbol === '^GSPC');
    
    return {
      id: `alert_${Date.now()}_inflation_risk_off`,
      severity: 'medium',
      title: 'Asset Rifugio: Oro Potrebbe Beneficiare',
      thesis: 'Notizie su inflazione/tassi combinati con sentiment risk-off sui mercati azionari tipicamente favoriscono asset rifugio come l\'oro. Dinamica osservata: pressione inflattiva + mercati azionari negativi.',
      confidence: 0.65,
      horizon: 'weeks',
      assetRefs: [goldAsset?.id, spxAsset?.id].filter(Boolean),
      newsRefs: relatedNews.map(n => n.id),
      createdAt: new Date().toISOString()
    };
  }
}
```

**Rule 2: Tech News + Tech Stocks Positive → Momentum Alert**
```javascript
{
  id: 'tech_momentum',
  name: 'Tech Sector Momentum',
  
  condition: (news, assets) => {
    const hasTechNews = news.filter(n => 
      n.tags.includes('tech')
    ).length >= 3;
    
    const techStocks = assets.filter(a => 
      ['AAPL', 'MSFT', 'GOOGL', 'TSLA'].includes(a.symbol)
    );
    
    const avgChange = techStocks.reduce((sum, s) => sum + s.change24hPct, 0) / techStocks.length;
    
    return hasTechNews && avgChange > 1.0;
  },
  
  generator: (news, assets) => {
    const techNews = news.filter(n => n.tags.includes('tech')).slice(0, 3);
    const techStocks = assets.filter(a => 
      ['AAPL', 'MSFT', 'GOOGL', 'TSLA'].includes(a.symbol)
    );
    
    return {
      id: `alert_${Date.now()}_tech_momentum`,
      severity: 'low',
      title: 'Momentum Settore Tech Positivo',
      thesis: 'Incremento di notizie su tecnologia/AI correlato con performance positiva dei principali titoli tech. Sentiment costruttivo sul settore.',
      confidence: 0.72,
      horizon: 'days',
      assetRefs: techStocks.map(s => s.id),
      newsRefs: techNews.map(n => n.id),
      createdAt: new Date().toISOString()
    };
  }
}
```

**Rule 3: Crypto Volatility Alert**
```javascript
{
  id: 'crypto_volatility',
  name: 'High Crypto Volatility',
  
  condition: (news, assets) => {
    const btc = assets.find(a => a.symbol === 'BTC');
    const eth = assets.find(a => a.symbol === 'ETH');
    
    const highVolatility = btc && Math.abs(btc.change24hPct) > 5;
    const hasCryptoNews = news.filter(n => n.tags.includes('crypto')).length >= 1;
    
    return highVolatility || hasCryptoNews;
  },
  
  generator: (news, assets) => {
    const btc = assets.find(a => a.symbol === 'BTC');
    const cryptoNews = news.filter(n => n.tags.includes('crypto'));
    
    const severity = Math.abs(btc.change24hPct) > 10 ? 'high' : 'medium';
    
    return {
      id: `alert_${Date.now()}_crypto_volatility`,
      severity,
      title: 'Volatilità Crypto Elevata',
      thesis: `Bitcoin mostra variazione 24h del ${btc.change24hPct.toFixed(2)}%. Mercato crypto in fase di alta volatilità, potenzialmente influenzato da notizie recenti o sentiment generale.`,
      confidence: 0.58,
      horizon: 'days',
      assetRefs: [btc.id],
      newsRefs: cryptoNews.map(n => n.id),
      createdAt: new Date().toISOString()
    };
  }
}
```

**Rule 4: Energy Crisis → Oil/Gas Alert**
```javascript
{
  id: 'energy_crisis',
  name: 'Energy Market Tension',
  
  condition: (news, assets) => {
    const energyNews = news.filter(n => 
      n.tags.includes('energia') || n.tags.includes('geopolitica')
    );
    
    return energyNews.length >= 2;
  },
  
  generator: (news, assets) => {
    const energyNews = news.filter(n => 
      n.tags.includes('energia') || n.tags.includes('geopolitica')
    ).slice(0, 3);
    
    const oilAsset = assets.find(a => a.symbol === 'CL=F');
    
    return {
      id: `alert_${Date.now()}_energy_crisis`,
      severity: 'medium',
      title: 'Tensioni Mercato Energetico',
      thesis: 'Notizie su energia e/o geopolitica suggeriscono possibile pressione sui prezzi energetici. Contesto da monitorare per impatti su inflazione e settori energy-intensive.',
      confidence: 0.60,
      horizon: 'weeks',
      assetRefs: oilAsset ? [oilAsset.id] : [],
      newsRefs: energyNews.map(n => n.id),
      createdAt: new Date().toISOString()
    };
  }
}
```

**Rule 5: Banking Sector Stress**
```javascript
{
  id: 'banking_stress',
  name: 'Banking Sector Signals',
  
  condition: (news, assets) => {
    const bankingNews = news.filter(n => 
      n.tags.includes('banche') || n.tags.includes('credito')
    );
    
    return bankingNews.length >= 2;
  },
  
  generator: (news, assets) => {
    const bankingNews = news.filter(n => 
      n.tags.includes('banche') || n.tags.includes('credito')
    ).slice(0, 3);
    
    return {
      id: `alert_${Date.now()}_banking_stress`,
      severity: 'low',
      title: 'Focus Settore Bancario',
      thesis: 'Incremento notizie su settore bancario/credito. Dinamiche da seguire per impatti su liquidità e finanziamenti.',
      confidence: 0.55,
      horizon: 'weeks',
      assetRefs: [],
      newsRefs: bankingNews.map(n => n.id),
      createdAt: new Date().toISOString()
    };
  }
}
```

### Alert Generation Logic

```javascript
generateAlerts(news, assets) {
  const alerts = [];
  
  // Apply each rule
  for (const rule of this.rules) {
    try {
      if (rule.condition(news, assets)) {
        const alert = rule.generator(news, assets);
        alerts.push(alert);
      }
    } catch (error) {
      console.error(`Rule ${rule.id} failed:`, error);
    }
  }
  
  // Sort by severity (high → medium → low), then by confidence
  alerts.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    return severityDiff !== 0 ? severityDiff : b.confidence - a.confidence;
  });
  
  // Limit to top 10 alerts
  return alerts.slice(0, 10);
}
```

---

## 4. Orchestrator

### Purpose
Coordinate all agents, manage global state, handle API layer, implement auto-refresh.

### Interface

```javascript
class MarketPulseOrchestrator {
  constructor() {
    this.newsAgent = new NewsAgent([/* providers */]);
    this.marketAgent = new MarketAgent({ /* providers */ });
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
   * Initialize and start auto-refresh
   */
  async start() {
    await this.refresh();
    this.startAutoRefresh(5 * 60 * 1000); // 5 minutes
  }

  /**
   * Fetch all data and update state
   * @returns {Promise<RefreshResponse>}
   */
  async refresh() {}

  /**
   * Start auto-refresh timer
   * @param {number} interval - Milliseconds
   */
  startAutoRefresh(interval) {}

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh() {}

  /**
   * Get current state
   * @returns {Object}
   */
  getState() {}
}
```

### Implementation

```javascript
class MarketPulseOrchestrator {
  async refresh() {
    if (this.state.isRefreshing) return this.getState();
    
    this.state.isRefreshing = true;
    
    try {
      // Fetch news and markets in parallel
      const [newsResponse, marketsResponse] = await Promise.all([
        this.newsAgent.fetchNews(),
        this.marketAgent.fetchMarkets()
      ]);
      
      // Generate alerts based on news + markets
      const alerts = this.analysisAgent.generateAlerts(
        newsResponse.items,
        marketsResponse.assets
      );
      
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
      console.error('Refresh failed:', error);
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
}
```

---

## 5. API Layer (Optional - for Express.js backend)

If running as Node.js server:

```javascript
const express = require('express');
const app = express();
const orchestrator = new MarketPulseOrchestrator();

// Initialize on startup
orchestrator.start();

// GET /api/news
app.get('/api/news', (req, res) => {
  const { news, lastUpdated } = orchestrator.getState();
  res.json({ items: news, asOf: lastUpdated });
});

// GET /api/markets
app.get('/api/markets', (req, res) => {
  const { assets, lastUpdated } = orchestrator.getState();
  res.json({ assets, asOf: lastUpdated });
});

// GET /api/alerts
app.get('/api/alerts', (req, res) => {
  const { alerts, lastUpdated } = orchestrator.getState();
  res.json({ alerts, asOf: lastUpdated });
});

// POST /api/refresh
app.post('/api/refresh', async (req, res) => {
  try {
    const state = await orchestrator.refresh();
    res.json({
      news: state.news,
      markets: state.assets,
      alerts: state.alerts,
      asOf: state.lastUpdated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('MarketPulse API running on :3000'));
```

---

## 6. Browser-Compatible Version

For running entirely in browser (no backend):

```javascript
// In <script> tag or separate .js file

// Import agents (assume all defined in same file or loaded via modules)

// Global orchestrator instance
const marketPulse = new MarketPulseOrchestrator();

// Expose to window for React app
window.marketPulseAPI = {
  async getNews() {
    const { news, lastUpdated } = marketPulse.getState();
    return { items: news, asOf: lastUpdated };
  },
  
  async getMarkets() {
    const { assets, lastUpdated } = marketPulse.getState();
    return { assets, asOf: lastUpdated };
  },
  
  async getAlerts() {
    const { alerts, lastUpdated } = marketPulse.getState();
    return { alerts, asOf: lastUpdated };
  },
  
  async refresh() {
    const state = await marketPulse.refresh();
    return {
      news: state.news,
      markets: state.assets,
      alerts: state.alerts,
      asOf: state.lastUpdated
    };
  },
  
  startAutoRefresh(interval = 5 * 60 * 1000) {
    marketPulse.startAutoRefresh(interval);
  },
  
  stopAutoRefresh() {
    marketPulse.stopAutoRefresh();
  }
};

// Initialize on page load
marketPulse.start();
```

---

## 7. Testing & Validation

### Unit Tests (conceptual)

```javascript
// Test NewsAgent deduplication
const news = [
  { title: 'BCE aumenta tassi', source: 'ANSA', publishedAt: '2025-01-15T10:00:00Z' },
  { title: 'BCE Aumenta Tassi!', source: 'ANSA', publishedAt: '2025-01-15T11:00:00Z' }
];

const newsAgent = new NewsAgent();
const deduped = newsAgent.deduplicate(news);
console.assert(deduped.length === 1, 'Deduplication failed');

// Test MarketAgent caching
const marketAgent = new MarketAgent({ /* mock providers */ });
await marketAgent.fetchMarkets();
const cached = await marketAgent.fetchMarkets();
console.assert(cached.fromCache === true, 'Caching failed');

// Test AnalysisAgent rule triggering
const mockNews = [
  { tags: ['inflazione', 'tassi'], /* ... */ },
  { tags: ['inflazione'], /* ... */ }
];
const mockAssets = [
  { symbol: '^GSPC', change24hPct: -1.5 },
  { symbol: 'GC=F', change24hPct: 0.8 }
];

const analysisAgent = new AnalysisAgent();
const alerts = analysisAgent.generateAlerts(mockNews, mockAssets);
console.assert(alerts.length > 0, 'No alerts generated');
console.assert(alerts.some(a => a.id.includes('inflation_risk_off')), 'Expected alert not found');
```

---

## 8. Error Handling & Resilience

### Strategies

1. **Provider Failures**: 
   - Catch errors at provider level
   - Return empty array or stale cache
   - Log error, continue with other providers

2. **Network Timeouts**:
   - Set fetch timeout (e.g., 10s)
   - Implement retry logic (max 2 retries)

3. **Invalid Data**:
   - Validate schema before normalization
   - Skip malformed items, don't crash

4. **Rate Limiting**:
   - Respect API rate limits (CoinGecko: 10-50 req/min)
   - Implement exponential backoff

```javascript
async fetchWithRetry(url, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
      
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

---

## 9. Configuration

### Config Object

```javascript
const CONFIG = {
  // Refresh intervals
  autoRefreshInterval: 5 * 60 * 1000,  // 5 minutes
  cacheTTL: 5 * 60 * 1000,              // 5 minutes
  
  // Data sources
  rssFeeds: [
    { url: 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml', source: 'ANSA' },
    // Add more feeds
  ],
  
  stockSymbols: [
    { symbol: '^GSPC', name: 'S&P 500', type: 'index' },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'equity' },
    // Add more symbols
  ],
  
  // Alert settings
  maxAlerts: 10,
  minConfidence: 0.5,
  
  // API endpoints (if using backend)
  apiBaseUrl: 'http://localhost:3000/api'
};
```

---

## 10. Deliverables

### File Structure

```
marketpulse-logic/
├── agents/
│   ├── NewsAgent.js
│   ├── MarketAgent.js
│   └── AnalysisAgent.js
├── providers/
│   ├── RSSProvider.js
│   ├── CoinGeckoProvider.js
│   └── YahooFinanceProvider.js
├── orchestrator/
│   └── MarketPulseOrchestrator.js
├── config.js
├── types.js  (JSDoc type definitions)
└── index.js  (entry point)
```

**OR** single-file version: `marketpulse_logic.js` (all agents in one file)

---

## Key Success Criteria

1. **Modularity**: Each agent can be tested independently
2. **Substitutability**: Providers can be swapped without changing agent logic
3. **Resilience**: Graceful degradation with caching and fallbacks
4. **Clarity**: Code is well-commented and rule logic is explicit
5. **Demo-Ready**: Works with mock data if APIs are unavailable
6. **Type Safety**: Clear interfaces and data contracts
7. **Performance**: Caching prevents unnecessary API calls

---

## Next Steps for Integration

After implementing this logic layer:

1. Connect to UI via `window.marketPulseAPI` (browser) or REST API (server)
2. Wire up React hooks to call API methods
3. Handle loading/error states in UI based on API responses
4. Test with real RSS feeds and CoinGecko API
5. Optionally add more sophisticated analysis rules
6. Deploy as static site (GitHub Pages) or Node.js server (Vercel/Railway)
