# MarketPulse - Prompt per Antigravity (Google AI Studio)

## Panoramica

Questo progetto fornisce **2 prompt ottimizzati** per generare una dashboard finanziaria completa chiamata "MarketPulse" usando Antigravity di Google AI Studio.

### Architettura Separata

1. **PROMPT 1** (`prompt_1_ui.md`) → Genera l'interfaccia utente
2. **PROMPT 2** (`prompt_2_logic.md`) → Genera la logica applicativa e architettura ad agenti

---

## Come Usare con Antigravity

### Step 1: Genera l'UI

1. Apri [Google AI Studio](https://aistudio.google.com/) (Antigravity)
2. Crea un nuovo prompt
3. Copia **tutto il contenuto** di `prompt_1_ui.md`
4. Incolla nel prompt di Antigravity
5. Clicca "Run" o "Generate"
6. Salva l'output come `marketpulse_ui.html`

**Risultato**: Un file HTML standalone con:
- Layout completo della dashboard
- Componenti React (Header, Stocks, Crypto, News, Alerts)
- Design brutalist/industrial
- Mock data per visualizzazione immediata
- Tutti gli stati UI (loading, error, empty, skeleton)
- Modals interattivi

---

### Step 2: Genera la Logica

1. Rimani in Google AI Studio / Antigravity
2. Crea un **nuovo prompt** (o pulisci quello precedente)
3. Copia **tutto il contenuto** di `prompt_2_logic.md`
4. Incolla nel prompt
5. Clicca "Run" o "Generate"
6. Salva l'output come `marketpulse_logic.js`

**Risultato**: File JavaScript con:
- 3 agenti (NewsAgent, MarketAgent, AnalysisAgent)
- Providers modulari (RSS, CoinGecko, Yahoo Finance)
- Orchestrator per coordinare tutto
- Sistema di caching con TTL
- Generazione alert basata su regole
- API layer (opzionale per backend)

---

### Step 3: Integrazione

Hai **2 opzioni** per integrare UI + Logic:

#### Opzione A: Browser-Only (Tutto in un file HTML)

1. Apri `marketpulse_ui.html`
2. Prima del tag `</body>`, aggiungi:
   ```html
   <script src="marketpulse_logic.js"></script>
   ```
3. Nel codice React dell'UI, sostituisci le chiamate mock con:
   ```javascript
   // Invece di usare mock data:
   const { items, asOf } = await window.marketPulseAPI.getNews();
   const { assets, asOf } = await window.marketPulseAPI.getMarkets();
   const { alerts, asOf } = await window.marketPulseAPI.getAlerts();
   
   // Per refresh manuale:
   await window.marketPulseAPI.refresh();
   ```
4. Apri `marketpulse_ui.html` nel browser → Funziona!

#### Opzione B: Node.js Backend + Frontend

**Backend**:
```bash
# Crea progetto Node.js
mkdir marketpulse-backend
cd marketpulse-backend
npm init -y
npm install express cors

# Crea server.js
```

```javascript
// server.js
const express = require('express');
const cors = require('cors');

// Importa la logica (copia codice da marketpulse_logic.js)
// ... (NewsAgent, MarketAgent, AnalysisAgent, Orchestrator)

const app = express();
app.use(cors());
app.use(express.json());

const orchestrator = new MarketPulseOrchestrator();
orchestrator.start();

app.get('/api/news', (req, res) => {
  const { news, lastUpdated } = orchestrator.getState();
  res.json({ items: news, asOf: lastUpdated });
});

app.get('/api/markets', (req, res) => {
  const { assets, lastUpdated } = orchestrator.getState();
  res.json({ assets, asOf: lastUpdated });
});

app.get('/api/alerts', (req, res) => {
  const { alerts, lastUpdated } = orchestrator.getState();
  res.json({ alerts, asOf: lastUpdated });
});

app.post('/api/refresh', async (req, res) => {
  const state = await orchestrator.refresh();
  res.json(state);
});

app.listen(3000, () => console.log('API running on http://localhost:3000'));
```

**Frontend**:
Modifica `marketpulse_ui.html` per fare fetch a `http://localhost:3000/api/*`

---

## Struttura Generata

```
marketpulse/
├── marketpulse_ui.html          # UI completa (React, CSS, componenti)
├── marketpulse_logic.js         # Logica (agenti, providers, orchestrator)
└── README.md                    # Questo file
```

**Opzionale (se usi backend)**:
```
marketpulse/
├── frontend/
│   └── marketpulse_ui.html
├── backend/
│   ├── server.js
│   ├── marketpulse_logic.js
│   └── package.json
└── README.md
```

---

## Caratteristiche Implementate

### UI (Prompt 1)
✅ Layout a griglia con 4 pannelli (Stocks, Crypto, News, Alerts)  
✅ Header sticky con titolo, last updated, refresh button  
✅ Design brutalist/industrial (monospace, neon green, dark theme)  
✅ Modals interattivi per dettagli asset/news/alert  
✅ Stati UI: loading, error, empty, skeleton placeholders  
✅ Responsive (desktop → tablet → mobile)  
✅ Animazioni CSS (hover, fade, slide)  
✅ Mock data incluso per test immediato  

### Logic (Prompt 2)
✅ **NewsAgent**: Fetch RSS, normalizzazione, tagging, deduplica  
✅ **MarketAgent**: Fetch stocks + crypto, caching TTL 5min, fallback  
✅ **AnalysisAgent**: 5+ regole euristiche per generare alert  
✅ **Orchestrator**: Coordinamento agenti, auto-refresh, API layer  
✅ Providers sostituibili (RSS, CoinGecko, Yahoo Finance)  
✅ Gestione errori e resilienza  
✅ Compatibile browser + Node.js  

---

## Fonti Dati Gratuite

### News (RSS Feeds)
- **ANSA Economia**: `https://www.ansa.it/sito/notizie/economia/economia_rss.xml`
- **Il Sole 24 Ore**: `https://www.ilsole24ore.com/rss/economia--2.xml`
- **Reuters Italia**: Verifica disponibilità RSS

### Mercati
- **CoinGecko API** (crypto): `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10`
  - Gratis, no API key
  - Rate limit: 10-50 req/min
- **Yahoo Finance** (stocks): `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}`
  - Gratis, no API key
  - Può avere rate limit variabili

**Fallback**: Se API non disponibili, i provider usano mock data realistici.

---

## Personalizzazione

### Cambiare Colori (UI)

Nel file `marketpulse_ui.html`, modifica le CSS variables:

```css
:root {
  --accent-green: #00ff88;    /* Cambia con il tuo colore */
  --accent-red: #ff3366;
  --bg-primary: #0a0a0a;
  /* etc. */
}
```

### Aggiungere Nuove Regole Alert (Logic)

Nel file `marketpulse_logic.js`, dentro `AnalysisAgent.initializeRules()`:

```javascript
{
  id: 'my_custom_rule',
  name: 'My Custom Rule',
  condition: (news, assets) => {
    // La tua logica qui
    return news.filter(n => n.tags.includes('keyword')).length > 2;
  },
  generator: (news, assets) => {
    return {
      id: `alert_${Date.now()}_custom`,
      severity: 'low',
      title: 'Titolo Alert',
      thesis: 'Spiegazione dettagliata...',
      confidence: 0.7,
      horizon: 'days',
      assetRefs: [],
      newsRefs: [],
      createdAt: new Date().toISOString()
    };
  }
}
```

### Aggiungere Nuovi Asset

Nel `CONFIG` object o nei provider mock:

```javascript
stockSymbols: [
  { symbol: 'NVDA', name: 'NVIDIA', type: 'equity' },
  { symbol: '^DJI', name: 'Dow Jones', type: 'index' },
  // Aggiungi qui
]
```

---

## Testing Locale

### Browser-Only
1. Apri `marketpulse_ui.html` nel browser
2. Dovresti vedere:
   - Header con "MarketPulse"
   - 4 pannelli con mock data
   - Click su un asset → modal si apre
   - Click refresh → dati si ricaricano

### Con Backend
```bash
cd marketpulse-backend
node server.js
```

Poi apri `marketpulse_ui.html` configurato per `http://localhost:3000`

---

## Troubleshooting

### CORS Errors (se usi backend)
**Problema**: Browser blocca fetch da `localhost:3000`  
**Soluzione**: Assicurati di usare `cors()` in Express (già incluso nell'esempio)

### API Rate Limit (CoinGecko)
**Problema**: Too many requests  
**Soluzione**: Il caching TTL di 5min riduce chiamate. Se persiste, aumenta TTL a 10min o usa mock provider.

### RSS Feed Non Carica
**Problema**: Feed XML non parsato  
**Soluzione**: Alcuni feed richiedono proxy per CORS. Usa un servizio come `https://api.allorigins.win/get?url=FEED_URL` o implementa fallback a mock data.

### Modals Non Si Aprono
**Problema**: Click handler non funziona  
**Soluzione**: Verifica che `onClick` sia collegato correttamente e che `selectedModal` state sia gestito.

---

## Deploy (Opzionale)

### Vercel (Full-stack)
```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### GitHub Pages (Solo UI statica)
1. Push `marketpulse_ui.html` su GitHub repo
2. Settings → Pages → Source: main branch
3. Assicurati di usare browser-only mode (no backend)

### Railway (Backend Node.js)
1. Connetti repo GitHub a Railway
2. Railway rileva automaticamente Node.js
3. Imposta `start` script in `package.json`: `"start": "node server.js"`

---

## Prossimi Miglioramenti

- [ ] Aggiungere grafici con Chart.js / Recharts
- [ ] Implementare sentiment analysis ML sulle news
- [ ] Integrare più provider (Finnhub, Alpha Vantage)
- [ ] Storicizzare alert e creare timeline
- [ ] Notifiche push per alert high severity
- [ ] Dark/Light theme toggle
- [ ] Multi-lingua (IT/EN)
- [ ] Export alert/report in PDF

---

## Licenza

Questo è un progetto demo/educational. I dati di mercato sono forniti "as-is" da API pubbliche. Non usare per decisioni finanziarie reali.

---

## Supporto

Per domande o issue:
1. Verifica che i prompt siano copiati completamente
2. Controlla console browser per errori JavaScript
3. Testa con mock data prima di usare API reali
4. Leggi la documentazione di CoinGecko/Yahoo Finance per rate limits

---

**Buon coding! 🚀📈**
