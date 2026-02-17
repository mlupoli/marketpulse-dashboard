/**
 * @typedef {Object} NewsItem
 * @property {string} id - Unique ID (hash of title+source+date)
 * @property {string} title
 * @property {string} url
 * @property {string} source - e.g., "Il Sole 24 Ore"
 * @property {string} publishedAt - ISO 8601 timestamp
 * @property {string} snippet - 150-300 chars
 * @property {string[]} tags - Extracted keywords
 */

/**
 * @typedef {"equity" | "index" | "crypto" | "commodity"} AssetType
 */

/**
 * @typedef {Object} MarketAsset
 * @property {string} id - Unique ID (type:symbol)
 * @property {AssetType} type
 * @property {string} symbol - e.g., "AAPL", "BTC", "^GSPC"
 * @property {string} name - Full name
 * @property {number} price
 * @property {string} currency - "USD", "EUR", etc.
 * @property {number} change24hPct - Percentage change
 * @property {number} high24h - 24h High
 * @property {number} low24h - 24h Low
 * @property {number} volume - 24h Volume
 * @property {number} marketCap - Market Capitalization
 * @property {string} asOf - ISO 8601 timestamp
 */

/**
 * @typedef {"low" | "medium" | "high"} Severity
 */

/**
 * @typedef {"days" | "weeks" | "months"} TimeHorizon
 */

/**
 * @typedef {Object} AlertItem
 * @property {string} id - Unique ID (timestamp-based)
 * @property {Severity} severity
 * @property {string} title - Short headline (max 80 chars)
 * @property {string} thesis - Full explanation (200-500 chars)
 * @property {number} confidence - 0.0 to 1.0
 * @property {TimeHorizon} horizon
 * @property {string[]} assetRefs - Array of MarketAsset.id
 * @property {string[]} newsRefs - Array of NewsItem.id
 * @property {string} createdAt - ISO 8601 timestamp
 */

/**
 * @typedef {Object} NewsResponse
 * @property {NewsItem[]} items
 * @property {string} asOf
 */

/**
 * @typedef {Object} MarketsResponse
 * @property {MarketAsset[]} assets
 * @property {string} asOf
 */

/**
 * @typedef {Object} AlertsResponse
 * @property {AlertItem[]} alerts
 * @property {string} asOf
 */

/**
 * @typedef {Object} RefreshResponse
 * @property {NewsItem[]} news
 * @property {MarketAsset[]} markets
 * @property {AlertItem[]} alerts
 * @property {string} asOf
 */
