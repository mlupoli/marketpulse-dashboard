# PROMPT 1: MarketPulse Dashboard - UI Implementation

## Context
You are a senior frontend engineer specializing in React and modern web interfaces. Create a production-ready, single-file React application for "MarketPulse" - a real-time financial dashboard demo.

## Technical Requirements

### Stack
- Single HTML file with embedded React (CDN: React 18.2.0, ReactDOM 18.2.0, Babel standalone)
- Pure CSS (no external frameworks)
- TypeScript-style JSDoc comments for type safety
- No external dependencies beyond React CDN

### Design Philosophy
**Brutalist/Industrial aesthetic** with these principles:
- **Typography**: Monospace fonts (Courier New, Consolas) for data-driven look
- **Color Palette**: 
  - Background: Deep blacks (#0a0a0a, #141414, #1a1a1a)
  - Borders: Dark grays (#2a2a2a, #3a3a3a)
  - Text: Light grays (#e0e0e0, #a0a0a0, #707070)
  - Accents: Neon green (#00ff88), red (#ff3366), blue (#00aaff), yellow (#ffcc00)
- **Layout**: Grid-based, functional, sharp edges, no rounded corners
- **Motion**: Minimal, purposeful (hover states, loading states)
- **Visual Details**: Glowing borders on interactive elements, subtle shadows, data-first presentation

## Layout Structure

### Grid Layout (4 main sections)
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (sticky)                                             │
│ [MarketPulse] ..................... [Last Updated] [Refresh]│
├──────────────────┬──────────────────┬────────────────────────┤
│ A) STOCKS        │ B) CRYPTO        │ D) ALERTS (right rail) │
│    (top-left)    │    (top-right)   │    (vertical banner)   │
│                  │                  │                        │
├──────────────────┴──────────────────┤                        │
│ C) NEWS (bottom, full width)        │                        │
│                                     │                        │
│                                     │                        │
└─────────────────────────────────────┴────────────────────────┘
```

### CSS Grid Configuration
```css
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 300px;
  grid-template-rows: auto 1fr;
  gap: 1px;
}

.stocks-panel { grid-column: 1; grid-row: 1; }
.crypto-panel { grid-column: 2; grid-row: 1; }
.news-panel { grid-column: 1 / 3; grid-row: 2; }
.alerts-panel { grid-column: 3; grid-row: 1 / 3; }
```

## Component Architecture

### 1. Header Component
**Requirements**:
- Sticky position at top
- Title "MarketPulse" (uppercase, bold, neon green)
- "Last updated" badge (small, uppercase, gray background)
- Refresh button (bordered, hover glow effect)

**Props**:
```javascript
{
  lastUpdated: string,        // ISO timestamp
  onRefresh: function,        // Callback
  isRefreshing: boolean       // Loading state
}
```

**Visual States**:
- Normal: Green border on button
- Hover: Glowing border + background fill
- Disabled: 30% opacity while refreshing

---

### 2. StocksPanel Component
**Requirements**:
- Panel header with title "STOCKS / INDICES"
- Compact table/card layout
- Each asset shows: symbol, name, price, 24h change%
- Color-coded changes: green (positive), red (negative)
- Click to open detail modal

**Data Structure** (for mock/display):
```javascript
{
  id: string,
  type: "equity" | "index",
  symbol: string,           // e.g., "AAPL", "^GSPC"
  name: string,             // e.g., "Apple Inc.", "S&P 500"
  price: number,
  currency: string,         // "USD", "EUR"
  change24hPct: number,     // e.g., 2.34 or -1.56
  asOf: string              // ISO timestamp
}
```

**Visual Design**:
- Table headers: uppercase, small font, gray
- Rows: hover effect (border glow)
- Price: large, bold
- Change%: colored badge with +/- prefix
- Loading: skeleton rows (animated gradient)
- Empty state: "NO DATA AVAILABLE" message

---

### 3. CryptoPanel Component
**Requirements**:
- Panel header with title "CRYPTO TOP 10"
- List layout (more compact than stocks)
- Each crypto shows: rank, symbol, name, price, 24h change%
- Visual ranking (1-10 badges)

**Data Structure**:
```javascript
{
  id: string,
  type: "crypto",
  symbol: string,           // e.g., "BTC", "ETH"
  name: string,             // e.g., "Bitcoin", "Ethereum"
  price: number,
  currency: string,         // "USD"
  change24hPct: number,
  rank: number,             // 1-10
  asOf: string
}
```

**Visual Design**:
- Rank badges: small squares with numbers
- Symbol: bold, uppercase
- Price: right-aligned
- Animated sparkle effect on rank #1
- Horizontal dividers between items

---

### 4. NewsPanel Component
**Requirements**:
- Panel header with title "NEWS" + count badge
- Scrollable list of news cards
- Each card shows: title, source, date, snippet
- Tags displayed as small pills
- Click to open expanded modal

**Data Structure**:
```javascript
{
  id: string,
  title: string,
  url: string,
  source: string,           // e.g., "Il Sole 24 Ore"
  publishedAt: string,      // ISO timestamp
  snippet: string,          // 150-200 chars
  tags: string[]            // e.g., ["inflazione", "BCE"]
}
```

**Visual Design**:
- Cards: dark background, border on hover
- Title: bold, 1.1rem, ellipsis after 2 lines
- Source + date: small, gray, inline
- Snippet: 3 lines max with ellipsis
- Tags: inline pills, different accent colors
- Infinite scroll capability
- Loading: 5 skeleton cards

---

### 5. AlertsPanel Component
**Requirements**:
- Vertical banner on right side
- Panel header with title "ALERTS" + count badge
- Stacked alert cards with severity indicators
- Each alert shows: severity, title, confidence bar
- Click to open detail modal

**Data Structure**:
```javascript
{
  id: string,
  severity: "low" | "medium" | "high",
  title: string,
  thesis: string,           // Full explanation (for modal)
  confidence: number,       // 0-1
  horizon: "days" | "weeks" | "months",
  assetRefs: string[],      // Related asset IDs
  newsRefs: string[],       // Related news IDs
  createdAt: string
}
```

**Visual Design**:
- Severity colors: 
  - low: blue (#4a9eff)
  - medium: yellow (#ffaa00)
  - high: red (#ff3366)
- Left border: 4px solid severity color
- Title: uppercase, bold
- Confidence: horizontal bar graph
- Horizon: small badge
- Pulse animation on high severity
- Max 10 alerts visible, scroll for more

---

### 6. Modal Components

#### AssetDetailModal
**Trigger**: Click on any stock/crypto
**Content**:
- Large symbol + name
- Current price (large font)
- 24h change with trend arrow
- Timestamp "As of: [time]"
- Close button (X top-right)
- Optional: external link to source

**Animation**: Fade in + slide up from bottom

---

#### NewsDetailModal
**Trigger**: Click on news card
**Content**:
- Full title
- Source + published date
- Full snippet (not truncated)
- Tags (all visible)
- "OPEN SOURCE" button (external link)
- Close button

**Animation**: Fade in + scale from center

---

#### AlertDetailModal
**Trigger**: Click on alert card
**Content**:
- Severity badge
- Title
- Full thesis (multi-paragraph if needed)
- Confidence meter with label
- Time horizon
- **Evidence section**:
  - "Related Assets" - list symbols
  - "Related News" - list titles
- Close button

**Animation**: Slide in from right

---

## UI States Implementation

### Loading States
1. **Initial Load**: Full-screen skeleton
   - Header with pulsing refresh button
   - Skeleton rows in all panels
2. **Refresh**: Overlay spinner on panels being updated
3. **Skeleton Components**:
   - Use CSS gradient animation
   - Gray blocks matching content layout
   - Pulse effect (opacity 0.5 → 1.0)

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1.0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Error States
- Red border around affected panel
- Error message: "⚠ FAILED TO LOAD DATA"
- Retry button
- Keep old data visible if available (stale indicator)

### Empty States
- Centered message: "NO DATA AVAILABLE"
- Subtle icon or ASCII art
- Suggestion text

---

## Responsive Behavior

### Breakpoints
```css
/* Desktop: default grid */
@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr 300px;
    grid-template-rows: auto auto 1fr;
  }
  .stocks-panel { grid-column: 1; grid-row: 1; }
  .crypto-panel { grid-column: 1; grid-row: 2; }
  .news-panel { grid-column: 1; grid-row: 3; }
  .alerts-panel { grid-column: 2; grid-row: 1 / 4; }
}

@media (max-width: 768px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  /* Stack all panels vertically */
}
```

---

## Interactions & Animations

### Hover Effects
- Cards: border glow (box-shadow with accent color)
- Buttons: background fill + glow
- Links: underline + color shift

### Click Feedback
- Transform: scale(0.98)
- Duration: 100ms
- Easing: ease-out

### Auto-refresh Indicator
- Countdown timer in header: "Next refresh: 4:32"
- Progress bar under header during refresh

---

## Mock Data Requirements

Provide realistic mock data for initial render:
- 8-10 stocks (mix of tech, indices, commodities)
- 10 crypto assets (BTC, ETH, etc.)
- 15-20 news items (Italian financial news)
- 5-7 alerts (varying severity)

Use realistic Italian sources: Il Sole 24 Ore, Milano Finanza, Reuters Italia, ANSA

---

## Code Structure Template

```javascript
// Type definitions (JSDoc)
/**
 * @typedef {Object} NewsItem
 * @property {string} id
 * @property {string} title
 * // ... etc
 */

// React Components
const { useState, useEffect, useCallback } = React;

function MarketPulseApp() {
  // State management
  const [news, setNews] = useState([]);
  const [assets, setAssets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedModal, setSelectedModal] = useState(null);
  
  // Auto-refresh logic (5 min interval)
  // Component definitions
  // Render
}

// Render to DOM
ReactDOM.render(<MarketPulseApp />, document.getElementById('root'));
```

---

## Deliverable
Single HTML file named `marketpulse_ui.html` that:
1. Loads completely standalone (no external files except React CDN)
2. Shows all panels with mock data on first render
3. Implements all described components and interactions
4. Has smooth animations and transitions
5. Is responsive down to 768px width
6. Uses the brutalist/industrial design system described
7. Includes comprehensive comments for easy customization

**Key Success Criteria**:
- Clean, readable code structure
- Visually distinctive (not generic)
- Easily replaceable styling (CSS variables)
- Mock data clearly separated for easy API integration
- All interactive states implemented and visible
