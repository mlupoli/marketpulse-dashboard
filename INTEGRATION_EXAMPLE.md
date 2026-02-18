# Esempio di Integrazione UI + Logic

## Scenario: Browser-Only (Single HTML File)

Questo esempio mostra come integrare i due file generati da Antigravity in un'unica soluzione browser-only.

---

## File Finale: marketpulse_complete.html

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MarketPulse — Real-time Market Intelligence</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
  
  <!-- 
    CSS STYLES
    (Tutto il CSS generato da PROMPT 1)
  -->
  <style>
    /* ... tutto il CSS del prompt 1 ... */
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- 
    LOGIC LAYER
    (Tutto il JavaScript della logica generato da PROMPT 2)
  -->
  <script>
    // ==========================================
    // SECTION 1: TYPE DEFINITIONS (da Prompt 2)
    // ==========================================
    
    /**
     * @typedef {Object} NewsItem
     * @property {string} id
     * @property {string} title
     * @property {string} url
     * @property {string} source
     * @property {string} publishedAt
     * @property {string} snippet
     * @property {string[]} tags
     */
    
    /**
     * @typedef {Object} MarketAsset
     * @property {string} id
     * @property {"equity"|"index"|"crypto"|"commodity"} type
     * @property {string} symbol
     * @property {string} name
     * @property {number} price
     * @property {string} currency
     * @property {number} change24hPct
     * @property {string} asOf
     */
    
    /**
     * @typedef {Object} AlertItem
     * @property {string} id
     * @property {"low"|"medium"|"high"} severity
     * @property {string} title
     * @property {string} thesis
     * @property {number} confidence
     * @property {"days"|"weeks"|"months"} horizon
     * @property {string[]} assetRefs
     * @property {string[]} newsRefs
     * @property {string} createdAt
     */

    // ==========================================
    // SECTION 2: CONFIGURATION
    // ==========================================
    
    const CONFIG = {
      autoRefreshInterval: 5 * 60 * 1000,  // 5 minutes
      cacheTTL: 5 * 60 * 1000,
      
      rssFeeds: [
        { url: 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml', source: 'ANSA' }
      ],
      
      stockSymbols: [
        { symbol: '^GSPC', name: 'S&P 500', type: 'index' },
        { symbol: '^DJI', name: 'Dow Jones', type: 'index' },
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'equity' },
        { symbol: 'MSFT', name: 'Microsoft', type: 'equity' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'equity' },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'equity' },
        { symbol: 'GC=F', name: 'Gold', type: 'commodity' },
        { symbol: 'CL=F', name: 'Crude Oil', type: 'commodity' }
      ]
    };

    // ==========================================
    // SECTION 3: AGENTS (da Prompt 2)
    // ==========================================
    
    // NewsAgent class...
    // MarketAgent class...
    // AnalysisAgent class...
    // Orchestrator class...
    
    // (Copia tutto il codice degli agenti da marketpulse_logic.js)
    
    // ==========================================
    // SECTION 4: INITIALIZE & EXPOSE API
    // ==========================================
    
    const marketPulse = new MarketPulseOrchestrator();
    
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
    
    // Auto-initialize
    marketPulse.start();
  </script>

  <!-- 
    UI COMPONENTS
    (Tutto il React code generato da PROMPT 1, ma con API integration)
  -->
  <script type="text/babel">
    const { useState, useEffect, useCallback } = React;

    // ==========================================
    // MAIN APP COMPONENT (modificato per usare API)
    // ==========================================
    
    function MarketPulseApp() {
      const [news, setNews] = useState([]);
      const [assets, setAssets] = useState([]);
      const [alerts, setAlerts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [lastUpdated, setLastUpdated] = useState(new Date());
      const [isRefreshing, setIsRefreshing] = useState(false);
      const [selectedModal, setSelectedModal] = useState(null);
      
      // Load initial data
      useEffect(() => {
        loadData();
        
        // Optional: listen for auto-refresh events
        const interval = setInterval(() => {
          loadData(true);  // Silent refresh
        }, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
      }, []);
      
      const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        
        try {
          // Usa l'API esposta da window.marketPulseAPI
          const [newsData, marketsData, alertsData] = await Promise.all([
            window.marketPulseAPI.getNews(),
            window.marketPulseAPI.getMarkets(),
            window.marketPulseAPI.getAlerts()
          ]);
          
          setNews(newsData.items);
          setAssets(marketsData.assets);
          setAlerts(alertsData.alerts);
          setLastUpdated(new Date(newsData.asOf));
          
        } catch (err) {
          console.error('Data load failed:', err);
          setError('Impossibile caricare i dati. Riprova.');
        } finally {
          setLoading(false);
        }
      };
      
      const handleRefresh = async () => {
        setIsRefreshing(true);
        
        try {
          const data = await window.marketPulseAPI.refresh();
          setNews(data.news);
          setAssets(data.markets);
          setAlerts(data.alerts);
          setLastUpdated(new Date(data.asOf));
        } catch (err) {
          console.error('Refresh failed:', err);
          setError('Refresh fallito. Riprova.');
        } finally {
          setIsRefreshing(false);
        }
      };
      
      // Separare assets per tipo
      const stocks = assets.filter(a => a.type === 'equity' || a.type === 'index' || a.type === 'commodity');
      const crypto = assets.filter(a => a.type === 'crypto');
      
      return (
        <div className="app-container">
          <Header 
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
          
          <div className="main-grid">
            <div className="panel stocks-panel">
              <StocksPanel 
                stocks={stocks}
                loading={loading}
                error={error}
                onAssetClick={(asset) => setSelectedModal({ type: 'asset', data: asset })}
              />
            </div>
            
            <div className="panel crypto-panel">
              <CryptoPanel 
                crypto={crypto}
                loading={loading}
                error={error}
                onAssetClick={(asset) => setSelectedModal({ type: 'asset', data: asset })}
              />
            </div>
            
            <div className="panel news-panel">
              <NewsPanel 
                news={news}
                loading={loading}
                error={error}
                onNewsClick={(newsItem) => setSelectedModal({ type: 'news', data: newsItem })}
              />
            </div>
            
            <div className="panel alerts-panel">
              <AlertsPanel 
                alerts={alerts}
                loading={loading}
                error={error}
                onAlertClick={(alert) => setSelectedModal({ type: 'alert', data: alert })}
              />
            </div>
          </div>
          
          {selectedModal && (
            <Modal onClose={() => setSelectedModal(null)}>
              {selectedModal.type === 'asset' && <AssetDetail asset={selectedModal.data} />}
              {selectedModal.type === 'news' && <NewsDetail news={selectedModal.data} />}
              {selectedModal.type === 'alert' && (
                <AlertDetail 
                  alert={selectedModal.data} 
                  news={news}
                  assets={assets}
                />
              )}
            </Modal>
          )}
        </div>
      );
    }
    
    // ==========================================
    // SUB-COMPONENTS
    // (Tutti i componenti da Prompt 1: Header, StocksPanel, etc.)
    // ==========================================
    
    function Header({ lastUpdated, onRefresh, isRefreshing }) {
      // ... implementazione da Prompt 1 ...
    }
    
    function StocksPanel({ stocks, loading, error, onAssetClick }) {
      // ... implementazione da Prompt 1 ...
    }
    
    function CryptoPanel({ crypto, loading, error, onAssetClick }) {
      // ... implementazione da Prompt 1 ...
    }
    
    function NewsPanel({ news, loading, error, onNewsClick }) {
      // ... implementazione da Prompt 1 ...
    }
    
    function AlertsPanel({ alerts, loading, error, onAlertClick }) {
      // ... implementazione da Prompt 1 ...
    }
    
    function Modal({ children, onClose }) {
      // ... implementazione da Prompt 1 ...
    }
    
    function AssetDetail({ asset }) {
      // ... implementazione da Prompt 1 ...
    }
    
    function NewsDetail({ news }) {
      // ... implementazione da Prompt 1 ...
    }
    
    function AlertDetail({ alert, news, assets }) {
      // ... implementazione da Prompt 1 ...
      // Questo componente mostra le "evidenze" (linked news e assets)
    }
    
    // ==========================================
    // RENDER
    // ==========================================
    
    ReactDOM.render(<MarketPulseApp />, document.getElementById('root'));
  </script>
</body>
</html>
```

---

## Flusso di Integrazione

### 1. Inizializzazione (Page Load)

```
┌─────────────────────────────────────────────────────────┐
│  Browser loads marketpulse_complete.html                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  <script> Logic Layer inizializza                       │
│  - NewsAgent, MarketAgent, AnalysisAgent creati         │
│  - Orchestrator inizializzato                           │
│  - marketPulse.start() chiamato                         │
│    ├─> Fetch news da RSS                                │
│    ├─> Fetch markets da CoinGecko/Yahoo                 │
│    └─> Generate alerts                                  │
│  - window.marketPulseAPI esposto                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  <script type="text/babel"> React App renders           │
│  - useEffect() chiama loadData()                        │
│  - loadData() usa window.marketPulseAPI.get*()          │
│  - State aggiornato con dati reali                      │
│  - UI renderizzata                                      │
└─────────────────────────────────────────────────────────┘
```

### 2. User Click su Refresh Button

```
User clicks [REFRESH]
        │
        ▼
handleRefresh() in React
        │
        ▼
window.marketPulseAPI.refresh()
        │
        ▼
orchestrator.refresh()
        │
        ├─> newsAgent.fetchNews()
        ├─> marketAgent.fetchMarkets()
        └─> analysisAgent.generateAlerts()
        │
        ▼
Return { news, markets, alerts, asOf }
        │
        ▼
React state updated
        │
        ▼
UI re-renders with fresh data
```

### 3. Auto-Refresh (ogni 5 minuti)

```
setInterval (in React useEffect)
        │
        ▼
loadData(true)  // silent=true
        │
        ▼
window.marketPulseAPI.get*()
        │
        ▼
Return cached or fresh data
        │
        ▼
React state updated silently
        │
        ▼
UI updates senza loading spinner
```

---

## Punti Chiave dell'Integrazione

### 1. API Bridge

Il `window.marketPulseAPI` è il "ponte" tra logic layer e UI layer:

```javascript
// Logic layer (vanillaJS) espone:
window.marketPulseAPI = {
  getNews() { ... },
  getMarkets() { ... },
  getAlerts() { ... },
  refresh() { ... }
};

// UI layer (React) consuma:
const data = await window.marketPulseAPI.getNews();
```

### 2. State Management

React gestisce tutto lo state UI:
- `loading`: bool per skeleton placeholders
- `error`: string per messaggi di errore
- `news`, `assets`, `alerts`: array di dati
- `lastUpdated`: timestamp per badge
- `selectedModal`: object per modal state

### 3. Error Handling

```javascript
try {
  const data = await window.marketPulseAPI.refresh();
  setNews(data.news);
  // ...
} catch (err) {
  setError('Impossibile caricare i dati');
  // UI mostra error state
}
```

### 4. Modal Evidence Linking

Il componente `AlertDetail` accede a news e assets per mostrare le evidenze:

```javascript
function AlertDetail({ alert, news, assets }) {
  // Trova news correlate
  const relatedNews = news.filter(n => alert.newsRefs.includes(n.id));
  
  // Trova assets correlati
  const relatedAssets = assets.filter(a => alert.assetRefs.includes(a.id));
  
  return (
    <div>
      <h2>{alert.title}</h2>
      <p>{alert.thesis}</p>
      
      <h3>Evidenze: News</h3>
      {relatedNews.map(n => <div key={n.id}>{n.title}</div>)}
      
      <h3>Evidenze: Asset</h3>
      {relatedAssets.map(a => <div key={a.id}>{a.symbol}: {a.change24hPct}%</div>)}
    </div>
  );
}
```

---

## Testing dell'Integrazione

### Step 1: Verifica Logic Layer

Apri console browser e testa:

```javascript
// Test 1: API è esposta?
console.log(window.marketPulseAPI);  // Deve mostrare object con metodi

// Test 2: Fetch news
window.marketPulseAPI.getNews().then(data => console.log(data));

// Test 3: Fetch markets
window.marketPulseAPI.getMarkets().then(data => console.log(data));

// Test 4: Generate alerts
window.marketPulseAPI.getAlerts().then(data => console.log(data));
```

### Step 2: Verifica UI Rendering

Apri inspector e verifica:

```
✓ Header mostra "MarketPulse" e timestamp
✓ Stocks panel mostra lista asset (o skeleton se loading)
✓ Crypto panel mostra top 10 (o skeleton)
✓ News panel mostra news card (o skeleton)
✓ Alerts panel mostra alert card (o skeleton)
```

### Step 3: Verifica Interazioni

Clicca su:
- Asset → Modal si apre con dettagli
- News card → Modal si apre con snippet completo
- Alert card → Modal si apre con thesis + evidenze
- [X] su modal → Modal si chiude
- [REFRESH] button → Dati si ricaricano

### Step 4: Verifica Auto-Refresh

Aspetta 5 minuti e verifica che:
- Timestamp "Last updated" cambia
- Dati si aggiornano senza full page reload
- No loading spinner (refresh silenzioso)

---

## Debugging Tips

### Problem: "marketPulseAPI is not defined"

**Causa**: Logic script non è stato eseguito prima del React script  
**Fix**: Assicurati che `<script>` con logic sia PRIMA di `<script type="text/babel">`

### Problem: "Cannot read property 'items' of undefined"

**Causa**: API return undefined (fetch failed)  
**Fix**: Controlla console per errori di fetch. Verifica CORS e rate limits.

### Problem: Modal non si chiude

**Causa**: `onClose` non chiamato o state non aggiornato  
**Fix**: Verifica `onClick` sul pulsante close chiami `setSelectedModal(null)`

### Problem: Alerts non generati

**Causa**: Regole non soddisfatte (nessun news/asset match)  
**Fix**: 
1. Logga news tags: `console.log(news.map(n => n.tags))`
2. Logga asset changes: `console.log(assets.map(a => a.change24hPct))`
3. Abbassa threshold nelle regole per testing

---

## Performance Optimization

### 1. Lazy Load Modals

```javascript
const Modal = React.lazy(() => import('./Modal'));

{selectedModal && (
  <Suspense fallback={<div>Loading...</div>}>
    <Modal onClose={...}>...</Modal>
  </Suspense>
)}
```

### 2. Memoize Components

```javascript
const StocksPanel = React.memo(({ stocks, loading, error, onAssetClick }) => {
  // ... component logic
});
```

### 3. Debounce Auto-Refresh

```javascript
let refreshTimeout;
const debouncedRefresh = () => {
  clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(() => loadData(true), 300);
};
```

---

## Conclusione

Questa integrazione:
1. ✅ Unisce UI e Logic in un singolo file HTML
2. ✅ Funziona completamente in browser (no server)
3. ✅ Usa API bridge pulito (`window.marketPulseAPI`)
4. ✅ Gestisce loading, error, e refresh states
5. ✅ Supporta modal interattivi con evidence linking
6. ✅ Auto-refresh ogni 5 minuti

Pronto per essere generato con i 2 prompt Antigravity! 🚀
