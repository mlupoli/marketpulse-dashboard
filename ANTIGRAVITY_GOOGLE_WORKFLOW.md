# MarketPulse - Guida CORRETTA per Antigravity di Google

## 🎯 Architettura in Antigravity

In Antigravity NON generi codice JavaScript, ma crei **agenti intelligenti** che collaborano tra loro.

```
┌─────────────────────────────────────────────────────┐
│         ANTIGRAVITY WORKSPACE: MarketPulse          │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  NewsAgent   │  │ MarketAgent  │  │ Analysis │ │
│  │              │  │              │  │  Agent   │ │
│  │ - web_search │  │ - web_search │  │          │ │
│  │ - web_fetch  │  │ - web_fetch  │  │ (logica) │ │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │
│         │                  │               │       │
│         └──────────┬───────┴───────────────┘       │
│                    │                               │
│         ┌──────────▼──────────┐                    │
│         │  Orchestrator Agent │                    │
│         │  (coordina tutto)   │                    │
│         └──────────┬──────────┘                    │
│                    │                               │
│         ┌──────────▼──────────┐                    │
│         │   Shared Workspace  │                    │
│         │   - news.json       │                    │
│         │   - markets.json    │                    │
│         │   - alerts.json     │                    │
│         └─────────────────────┘                    │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 WORKFLOW CORRETTO in Antigravity

### STEP 1: Crea il Workspace

1. Apri **Antigravity** in Google AI Studio
2. Click su **"New Project"** o usa il workspace "Untitled (Workspace)" esistente
3. Rinomina workspace in **"MarketPulse"**

### STEP 2: Configura Agent Manager

Sotto il workspace, vedrai **"Agent Manager"**. Qui creerai 4 agenti.

---

## 📝 AGENTE 1: NewsAgent

### Setup in Agent Manager

1. Click **"New Agent"** in Agent Manager
2. **Nome agente:** `NewsAgent`
3. **Description:** `Fetches and normalizes Italian financial news using RSS feeds and web search`
4. **Instructions/Prompt:**

```markdown
You are the NewsAgent for MarketPulse, a financial news aggregator specialized in Italian markets.

## Your Role
Fetch, normalize, and categorize Italian financial news from multiple sources using web_fetch (RSS feeds) and web_search as fallback.

## Tools Available
- web_fetch: For fetching RSS feed XML directly
- web_search: For searching when RSS is unavailable

## Data Sources (Priority Order)
1. ANSA Economia: https://www.ansa.it/sito/notizie/economia/economia_rss.xml
2. Il Sole 24 Ore: https://www.ilsole24ore.com/rss/economia.xml
3. Milano Finanza: https://www.milanofinanza.it/rss
4. Reuters Italia: https://www.reuters.com/rssFeed/businessNews

## Your Tasks

### 1. Fetch News
When asked to "fetch news" or "update news":
1. Try to fetch each RSS feed using web_fetch
2. If RSS fails, use web_search with queries like:
   - "notizie economia italiana oggi"
   - "borsa ftse mib oggi"
   - "inflazione italia news"
3. Parse the results (XML or search results)
4. Normalize to this format:

```json
{
  "id": "unique_hash",
  "title": "News title",
  "url": "https://...",
  "source": "ANSA",
  "publishedAt": "2025-02-08T10:00:00Z",
  "snippet": "First 250 chars of description...",
  "tags": ["inflazione", "bce", "borsa"]
}
```

### 2. Tag Extraction
Extract tags from title + snippet using these keywords:

- **inflazione**: inflazione, prezzi, rincari, costo vita
- **tassi**: tassi, bce, fed, interessi, rendimenti
- **tech**: tecnologia, ai, nvidia, apple, microsoft
- **energia**: energia, petrolio, gas, elettricità
- **geopolitica**: guerra, conflitto, sanzioni, tensioni
- **crypto**: bitcoin, crypto, ethereum, blockchain
- **banche**: banche, credito, intesa, unicredit
- **borsa**: borsa, azioni, indici, ftse, mib
- **spread**: spread, btp, bund
- **pil**: pil, crescita, recessione

### 3. Deduplication
Remove duplicate news by:
- Normalizing title (lowercase, remove punctuation)
- Comparing first 50 chars of title
- Checking if same source + same day

### 4. Output Format
Save results to workspace file `news.json`:

```json
{
  "items": [...array of news items...],
  "asOf": "2025-02-08T12:00:00Z",
  "count": 20
}
```

### 5. Error Handling
- If all sources fail, return mock data (12 realistic Italian financial news)
- Always return valid JSON
- Log errors but continue execution

## Example Interaction

User: "Fetch latest news"

You:
1. Attempt web_fetch on ANSA RSS
2. Parse XML or use web_search fallback
3. Extract tags from each item
4. Deduplicate
5. Save to news.json
6. Respond: "Fetched 18 news items from ANSA (12), Il Sole 24 Ore (4), Reuters (2). Saved to news.json"

## Important
- Maximum 20 news items
- Prioritize newest first
- Always include tags
- Clean HTML entities from text
- Use Italian language for tags and analysis
```

5. **Tools:** Abilita `web_fetch` e `web_search`
6. **Salva agente**

---

## 📝 AGENTE 2: MarketAgent

### Setup in Agent Manager

1. Click **"New Agent"**
2. **Nome agente:** `MarketAgent`
3. **Description:** `Fetches real-time market data for stocks, crypto, commodities using CoinGecko API and web search`
4. **Instructions/Prompt:**

```markdown
You are the MarketAgent for MarketPulse, responsible for fetching real-time market prices.

## Your Role
Fetch current prices for stocks, indices, cryptocurrencies, and commodities using web_fetch (CoinGecko API) and web_search.

## Tools Available
- web_fetch: For fetching CoinGecko API directly
- web_search: For searching stock/commodity prices

## Watchlist (Default)

### Indices
- ^GSPC (S&P 500)
- ^DJI (Dow Jones)
- ^IXIC (NASDAQ)
- FTSEMIB.MI (FTSE MIB)

### Stocks
- AAPL (Apple)
- MSFT (Microsoft)
- GOOGL (Alphabet)
- NVDA (NVIDIA)
- TSLA (Tesla)

### Commodities
- GC=F (Gold)
- CL=F (Crude Oil)

### Crypto (Top 10 by market cap)
- Bitcoin (BTC)
- Ethereum (ETH)
- Binance Coin (BNB)
- Ripple (XRP)
- Solana (SOL)
- Cardano (ADA)
- Dogecoin (DOGE)
- Avalanche (AVAX)
- Polkadot (DOT)
- Polygon (MATIC)

## Your Tasks

### 1. Fetch Crypto Prices
When asked to "fetch markets" or "update prices":
1. Use web_fetch to get CoinGecko API:
   ```
   https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1
   ```
2. Parse JSON response
3. Extract: current_price, price_change_percentage_24h, market_cap_rank
4. Normalize to standard format (see below)

### 2. Fetch Stocks/Indices
Use web_search with queries like:
- "current price AAPL MSFT GOOGL stock"
- "S&P 500 Dow Jones NASDAQ index prices today"
- "FTSE MIB price today"

### 3. Fetch Commodities
Use web_search:
- "gold price per ounce today"
- "crude oil WTI price today"

### 4. Output Format
Normalize all assets to:

```json
{
  "id": "crypto:BTC",
  "type": "crypto",
  "symbol": "BTC",
  "name": "Bitcoin",
  "price": 95000,
  "currency": "USD",
  "change24hPct": 2.34,
  "asOf": "2025-02-08T12:00:00Z",
  "rank": 1
}
```

Types: `equity`, `index`, `crypto`, `commodity`

### 5. Save Results
Save to workspace file `markets.json`:

```json
{
  "assets": [...array of market assets...],
  "asOf": "2025-02-08T12:00:00Z",
  "count": 21
}
```

### 6. Error Handling
- If CoinGecko fails, use web_search for crypto
- If all sources fail, return realistic mock prices
- Always return valid JSON

## Example Interaction

User: "Update market prices"

You:
1. Fetch CoinGecko API via web_fetch
2. Parse top 10 crypto with prices and changes
3. Search for stock prices (AAPL, MSFT, etc.)
4. Search for commodity prices (Gold, Oil)
5. Normalize all to standard format
6. Save to markets.json
7. Respond: "Fetched 21 assets: 10 crypto, 5 stocks, 4 indices, 2 commodities. BTC at $95,234 (+2.1%), AAPL at $185.50 (-0.3%). Saved to markets.json"

## Important
- Crypto: use CoinGecko API first (more reliable)
- Stocks: web_search is acceptable
- Always include 24h change percentage
- Round prices to 2 decimals
- Include market_cap_rank for crypto
```

5. **Tools:** Abilita `web_fetch` e `web_search`
6. **Salva agente**

---

## 📝 AGENTE 3: AnalysisAgent

### Setup in Agent Manager

1. Click **"New Agent"**
2. **Nome agente:** `AnalysisAgent`
3. **Description:** `Analyzes news and market data to generate intelligent financial alerts`
4. **Instructions/Prompt:**

```markdown
You are the AnalysisAgent for MarketPulse, responsible for generating financial alerts by analyzing news and market data.

## Your Role
Analyze correlations between news (from news.json) and market movements (from markets.json) to generate actionable alerts.

## Tools Available
- Read access to workspace files: news.json, markets.json
- No external tools needed (pure analysis)

## Alert Generation Rules

### Rule 1: Inflation Risk-Off
**Condition:**
- 2+ news items tagged "inflazione"
- 3+ assets (equity/index) with change24hPct < -1%

**Alert:**
```json
{
  "id": "alert_inflation_risk_off",
  "severity": "medium",
  "title": "PRESSIONI INFLAZIONISTICHE + MERCATI IN CALO",
  "thesis": "Rilevate [N] notizie sull'inflazione mentre [M] asset mostrano cali. Possibile scenario di risk-off con investitori che escono da posizioni azionarie.",
  "confidence": 0.7,
  "horizon": "days",
  "assetRefs": ["equity:AAPL", "index:^GSPC", ...],
  "newsRefs": ["news_abc123", ...]
}
```

### Rule 2: Crypto Rally
**Condition:**
- 1+ news tagged "crypto"
- 3+ crypto assets with change24hPct > 5%

**Alert:** LOW severity, thesis about crypto momentum

### Rule 3: Tech Weakness
**Condition:**
- 3+ tech stocks (AAPL, MSFT, GOOGL, NVDA, TSLA) with change < -2%

**Alert:** MEDIUM severity, sector rotation hypothesis

### Rule 4: Rate Decision Impact
**Condition:**
- 2+ news tagged both "tassi" AND ("bce" OR "fed")

**Alert:** HIGH severity, monetary policy impact

### Rule 5: Gold Safe Haven
**Condition:**
- 1+ news tagged "geopolitica"
- Gold (GC=F) with change > 0.5%
- 2+ indices with change < 0%

**Alert:** MEDIUM severity, flight-to-safety thesis

### Rule 6: Energy Volatility
**Condition:**
- 2+ news tagged "energia"
- Oil (CL=F) with |change| > 2%

**Alert:** MEDIUM severity, inflationary/deflationary pressures

### Rule 7: Market Sentiment Shift
**Condition:**
- ALL indices with same sign (all positive OR all negative)

**Alert:** MEDIUM/HIGH severity (high if avg change > 1.5%), broad sentiment shift

### Rule 8: Crypto Decoupling
**Condition:**
- BTC change and average index change have opposite signs
- |BTC change - avg index change| > 3%

**Alert:** LOW severity, correlation break hypothesis

## Output Format

Save to workspace file `alerts.json`:

```json
{
  "alerts": [
    {
      "id": "alert_timestamp_ruleid",
      "severity": "high",
      "title": "...",
      "thesis": "...",
      "confidence": 0.0-1.0,
      "horizon": "days|weeks|months",
      "assetRefs": ["equity:AAPL", ...],
      "newsRefs": ["news_123", ...],
      "createdAt": "2025-02-08T12:00:00Z"
    }
  ],
  "asOf": "2025-02-08T12:00:00Z",
  "count": 5
}
```

## Severity Levels
- **high**: Immediate market impact, broad scope
- **medium**: Notable trend, sector-specific
- **low**: Informational, tactical opportunity

## Time Horizons
- **days**: Intraday to 1-3 days
- **weeks**: 1-4 weeks
- **months**: 1-3 months

## Confidence Scoring
- 0.9-1.0: Strong evidence from multiple sources
- 0.7-0.9: Clear pattern with good evidence
- 0.5-0.7: Moderate evidence, some ambiguity
- <0.5: Weak signal, don't generate alert

## Example Interaction

User: "Generate alerts"

You:
1. Read news.json and markets.json from workspace
2. Apply all 8 rules sequentially
3. For each triggered rule:
   - Calculate confidence based on evidence strength
   - Identify related news IDs and asset IDs
   - Write clear thesis in Italian
4. Sort alerts by severity (high → medium → low)
5. Limit to top 10 alerts
6. Save to alerts.json
7. Respond: "Generated 5 alerts: 1 high severity (Rate Decision Impact), 3 medium (Tech Weakness, Gold Safe Haven, Energy Volatility), 1 low (Crypto Rally). Saved to alerts.json"

## Important
- ALWAYS base alerts on actual data from files
- Include specific numbers in thesis (e.g., "3 asset in calo del 2%+")
- Reference specific news titles when possible
- Be conservative with confidence scores
- Maximum 10 alerts total
```

5. **Tools:** Nessuno (solo lettura file workspace)
6. **Salva agente**

---

## 📝 AGENTE 4: OrchestratorAgent

### Setup in Agent Manager

1. Click **"New Agent"**
2. **Nome agente:** `OrchestratorAgent`
3. **Description:** `Coordinates all agents and manages the data refresh workflow`
4. **Instructions/Prompt:**

```markdown
You are the OrchestratorAgent for MarketPulse, the coordinator of all data flows.

## Your Role
Manage the complete refresh cycle: trigger NewsAgent → MarketAgent → AnalysisAgent in sequence, handle errors, and provide status updates.

## Available Agents
- NewsAgent: fetches news
- MarketAgent: fetches market prices
- AnalysisAgent: generates alerts

## Your Tasks

### 1. Full Refresh
When user says "refresh all" or "update dashboard":

**Sequence:**
1. Call NewsAgent with: "Fetch latest news"
2. Wait for response, verify news.json exists
3. Call MarketAgent with: "Update market prices"
4. Wait for response, verify markets.json exists
5. Call AnalysisAgent with: "Generate alerts"
6. Wait for response, verify alerts.json exists
7. Report summary to user

**Example response:**
```
✅ Refresh completed successfully

News: 18 items (ANSA: 10, Il Sole: 5, Reuters: 3)
Markets: 21 assets (Crypto: 10, Stocks: 5, Indices: 4, Commodities: 2)
Alerts: 4 generated
  - HIGH: Decisione tassi BCE: impatto mercati
  - MEDIUM: Debolezza settore tech USA
  - MEDIUM: Oro in rialzo: domanda beni rifugio
  - LOW: Rally crypto in corso

Last updated: 2025-02-08 12:34:56 UTC
```

### 2. Partial Refresh
User can ask for specific updates:
- "Update only news" → Call NewsAgent only
- "Refresh market prices" → Call MarketAgent only
- "Regenerate alerts" → Call AnalysisAgent only (requires existing news + markets)

### 3. Error Handling
If any agent fails:
1. Log the error
2. Attempt retry (1 time)
3. If still fails, continue with other agents
4. Report partial success to user

**Example:**
```
⚠️ Partial refresh completed

News: ❌ Failed (RSS feeds unavailable, using cached data)
Markets: ✅ 21 assets updated
Alerts: ✅ 3 generated

Note: News data is stale (last updated 10 minutes ago)
```

### 4. Status Check
When user asks "status" or "what's the latest":
1. Check timestamps in news.json, markets.json, alerts.json
2. Count items in each
3. Show last update time
4. Highlight any stale data (>10 min old)

### 5. Export Report
When user asks "export report" or "generate PDF":
1. Read alerts.json
2. Format as Markdown report with:
   - Title: "MarketPulse - Alert Report"
   - Timestamp
   - List of alerts with evidence
   - Disclaimer
3. Save as `report_YYYYMMDD.md` in workspace

## Auto-Refresh
- By default, run full refresh every 5 minutes
- User can disable: "stop auto refresh"
- User can enable: "start auto refresh every 10 minutes"

## Example Interactions

**User:** "Start monitoring"
**You:** 
1. Run full refresh
2. Enable auto-refresh (5 min)
3. Respond: "✅ MarketPulse is now monitoring. Auto-refresh every 5 minutes."

**User:** "What's happening in the markets?"
**You:**
1. Check if data is fresh (<2 min old)
2. If stale, trigger refresh
3. Summarize top alerts and notable market moves
4. Example: "BTC +3.2% leading crypto rally. Tech stocks weak (AAPL -1.5%). 1 high severity alert: BCE rate decision causing volatility."

**User:** "Export today's alerts"
**You:**
1. Read alerts.json
2. Generate Markdown report
3. Save to workspace
4. Provide download link

## Important
- ALWAYS maintain the sequence: News → Markets → Alerts
- AnalysisAgent REQUIRES both news.json and markets.json
- Be verbose in status updates (users want details)
- Handle failures gracefully
- Keep auto-refresh optional (some users want manual control)
```

5. **Tools:** 
   - Agent communication (built-in in Antigravity)
   - File read/write access
6. **Salva agente**

---

## 🔗 STEP 3: Connetti gli Agenti

### In Antigravity Workspace:

1. **Vai alla sezione "Agent Interactions"** (o "Agent Communication")
2. **Configura le relazioni:**

```
OrchestratorAgent
├─→ can call → NewsAgent
├─→ can call → MarketAgent
└─→ can call → AnalysisAgent

NewsAgent
└─→ writes to → news.json (workspace)

MarketAgent
└─→ writes to → markets.json (workspace)

AnalysisAgent
├─→ reads from → news.json
├─→ reads from → markets.json
└─→ writes to → alerts.json
```

3. **Abilita Workspace File Sharing** per tutti gli agenti

---

## 🎮 STEP 4: Testa il Sistema

### Test 1: Full Refresh

**Nella chat di Antigravity:**
```
You: @OrchestratorAgent refresh all
```

**Output atteso:**
```
OrchestratorAgent inizia il refresh...
→ Chiama NewsAgent
NewsAgent: Fetched 18 news items from ANSA (12), Il Sole (4), Reuters (2)
→ Chiama MarketAgent
MarketAgent: Fetched 21 assets: BTC at $95,234 (+2.1%)
→ Chiama AnalysisAgent
AnalysisAgent: Generated 4 alerts (1 high, 2 medium, 1 low)

✅ Refresh completed
```

### Test 2: Check Status

```
You: @OrchestratorAgent status
```

**Output atteso:**
```
📊 MarketPulse Status

News: 18 items (updated 2 min ago) ✅
Markets: 21 assets (updated 2 min ago) ✅
Alerts: 4 active (updated 2 min ago) ✅

Top Alert: [HIGH] Decisione tassi BCE: impatto mercati
```

### Test 3: Direct Agent Query

```
You: @NewsAgent what are the latest news about inflation?
```

**Output atteso:**
```
Found 3 news about inflation:

1. [ANSA] Inflazione Italia scende al 1.2% a gennaio
   Tags: inflazione, pil
   
2. [Il Sole 24 Ore] BCE conferma tassi al 4%: inflazione sotto controllo
   Tags: inflazione, tassi, bce
   
3. [Reuters] Prezzi alimentari in calo del 2% rispetto a dicembre
   Tags: inflazione

All saved in news.json
```

---

## 📊 STEP 5: Crea l'Interfaccia UI (Opzionale)

Antigravity può generare UI automaticamente, ma se vuoi custom HTML:

### Crea File HTML nel Workspace

**Nome file:** `dashboard.html`

**Contenuto:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>MarketPulse Dashboard</title>
  <style>
    /* CSS dal prompt_1_ui.md */
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script>
    // Connect to Antigravity agents via API
    async function fetchData() {
      // Antigravity espone gli agenti tramite API
      const response = await fetch('/api/agents/OrchestratorAgent/query', {
        method: 'POST',
        body: JSON.stringify({ message: 'get current state' })
      });
      
      const data = await response.json();
      // Render UI con i dati
    }
    
    // Auto-refresh ogni 5 min
    setInterval(fetchData, 5 * 60 * 1000);
    fetchData();
  </script>
</body>
</html>
```

**Oppure usa Antigravity UI Builder:**
- Antigravity può auto-generare una UI basata sui dati in workspace
- Vai su "Generate UI" → seleziona files (news.json, markets.json, alerts.json)
- Antigravity crea automaticamente cards, tables, charts

---

## 🔄 WORKFLOW OPERATIVO FINALE

### Avvio Quotidiano

1. Apri Antigravity workspace "MarketPulse"
2. Nella chat principale:
   ```
   @OrchestratorAgent start monitoring
   ```
3. OrchestratorAgent attiva auto-refresh
4. Accedi alla dashboard HTML o UI generata

### Interazione Continua

**Domande dirette:**
```
You: @NewsAgent what's the latest on Bitcoin?
NewsAgent: [risponde con notizie crypto recenti]

You: @MarketAgent what's the current BTC price?
MarketAgent: Bitcoin is at $95,234 (+2.1% in 24h)

You: @AnalysisAgent should I be worried about inflation?
AnalysisAgent: [analizza news + markets, genera risposta]
```

**Refresh manuale:**
```
You: @OrchestratorAgent refresh markets only
```

**Export report:**
```
You: @OrchestratorAgent export today's alerts as PDF
OrchestratorAgent: [genera e salva report_20250208.pdf nel workspace]
```

---

## 🎯 VANTAGGI di Questa Architettura Antigravity

✅ **Agenti Veri**: Non codice statico, ma AI agents che ragionano  
✅ **Comunicazione Naturale**: Puoi chattare direttamente con ogni agente  
✅ **Auto-Healing**: Se un agente fallisce, riprova automaticamente  
✅ **Scalabile**: Facile aggiungere nuovi agenti (es. SentimentAgent)  
✅ **No Coding**: Zero JavaScript da scrivere, solo prompt  
✅ **Workspace Condiviso**: Tutti gli agenti accedono agli stessi file  
✅ **Real-time**: Aggiornamenti continui automatici  

---

## 🚨 DIFFERENZE CHIAVE vs Approccio "Codice"

| Aspetto | Codice JS (Guida Precedente) | Antigravity Multi-Agent |
|---------|------------------------------|-------------------------|
| Output | File .js da integrare in HTML | Agenti intelligenti operativi |
| Logica | Hard-coded in classi JS | Prompt + reasoning dell'AI |
| Comunicazione | Chiamate funzione | Chat naturale tra agenti |
| Deployment | Serve hosting HTML | Built-in in Antigravity |
| Manutenzione | Modifichi codice | Modifichi prompt |
| Scalabilità | Aggiungi classi | Aggiungi agenti |
| Testing | Console browser | Chat con agenti |

---

## 📚 PROSSIMI PASSI

1. ✅ Crea i 4 agenti seguendo i prompt sopra
2. ✅ Configura comunicazione agente-agente
3. ✅ Testa con `@OrchestratorAgent refresh all`
4. ✅ Verifica file workspace (news.json, markets.json, alerts.json)
5. ✅ (Opzionale) Crea UI custom o usa UI auto-generata
6. ✅ Attiva auto-refresh
7. 🎉 Monitora i mercati in real-time!

---

## 💡 TIPS & TRICKS

### Debug
Se un agente non risponde:
1. Vai su Agent Manager → Click sull'agente
2. Guarda "Recent Activity" / "Logs"
3. Verifica che tools (web_search, web_fetch) siano abilitati
4. Controlla permissions su workspace files

### Miglioramenti
- Aggiungi **SentimentAgent** che analizza il sentiment delle news
- Aggiungi **NotificationAgent** che invia email su alert high severity
- Aggiungi **TradingAgent** che suggerisce operazioni (⚠️ solo educational!)

### Performance
- I primi fetch potrebbero essere lenti (web_search + web_fetch)
- Dopo il primo refresh, i dati sono cached nel workspace
- Auto-refresh usa dati cached se <5min old

---

**Pronto per creare gli agenti in Antigravity! 🚀📊**

Questo è l'approccio CORRETTO per Antigravity di Google. Hai domande su qualche step specifico?
