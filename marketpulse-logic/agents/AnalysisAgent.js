/**
 * Agent responsible for generating alerts based on news and market data
 */
class AnalysisAgent {
    constructor() {
        this.rules = this.initializeRules();
    }

    /**
     * Generate alerts
     * @param {Object[]} news 
     * @param {Object[]} assets 
     * @returns {Object[]} AlertItems
     */
    generateAlerts(news, assets) {
        const alerts = [];

        for (const rule of this.rules) {
            try {
                if (rule.condition(news, assets)) {
                    const alert = rule.generator(news, assets);
                    alerts.push(alert);
                }
            } catch (error) {
                console.error(`Rule ${rule.id || 'unknown'} failed:`, error);
            }
        }

        // Sort by severity (High > Medium > Low) then Confidence
        alerts.sort((a, b) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            const diff = severityOrder[b.severity] - severityOrder[a.severity];
            if (diff !== 0) return diff;
            return b.confidence - a.confidence;
        });

        return alerts.slice(0, 10);
    }

    initializeRules() {
        return [
            // Rule 1: Inflation Risk-Off
            {
                id: 'inflation_risk_off',
                condition: (news, assets) => {
                    const inflationNewsCount = news.filter(n => n.tags.includes('inflazione')).length;
                    const decliningAssets = assets.filter(a => ['equity', 'index'].includes(a.type) && a.change24hPct < -1).length;
                    return inflationNewsCount >= 2 && decliningAssets >= 3;
                },
                generator: (news, assets) => {
                    const relevantNews = news.filter(n => n.tags.includes('inflazione'));
                    const decliningAssets = assets.filter(a => ['equity', 'index'].includes(a.type) && a.change24hPct < -1);
                    return {
                        id: `alert_${Date.now()}_inflation`,
                        severity: 'medium',
                        title: 'PRESSIONI INFLAZIONISTICHE + MERCATI IN CALO',
                        thesis: `Rilevate ${relevantNews.length} notizie sull'inflazione mentre ${decliningAssets.length} asset mostrano cali superiori all'1%. Possibile scenario di risk-off.`,
                        confidence: 0.7,
                        horizon: 'days',
                        assetRefs: decliningAssets.map(a => a.id).slice(0, 5),
                        newsRefs: relevantNews.map(n => n.id).slice(0, 3),
                        createdAt: new Date().toISOString()
                    };
                }
            },
            // Rule 2: Crypto Rally
            {
                id: 'crypto_rally',
                condition: (news, assets) => {
                    const cryptoNews = news.some(n => n.tags.includes('crypto'));
                    const pumpingCrypto = assets.filter(a => a.type === 'crypto' && a.change24hPct > 5).length;
                    return cryptoNews && pumpingCrypto >= 3;
                },
                generator: (news, assets) => {
                    const pumpingCrypto = assets.filter(a => a.type === 'crypto' && a.change24hPct > 5);
                    return {
                        id: `alert_${Date.now()}_crypto_rally`,
                        severity: 'low',
                        title: 'Rally Crypto in Corso',
                        thesis: `${pumpingCrypto.length} criptovalute mostrano guadagni superiori al 5% con notizie correlate.`,
                        confidence: 0.6,
                        horizon: 'days',
                        assetRefs: pumpingCrypto.map(a => a.id).slice(0, 5),
                        newsRefs: news.filter(n => n.tags.includes('crypto')).map(n => n.id).slice(0, 3),
                        createdAt: new Date().toISOString()
                    };
                }
            },
            // Rule 3: Tech Weakness
            {
                id: 'tech_weakness',
                condition: (news, assets) => {
                    const techSymbols = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'];
                    const weakTech = assets.filter(a => techSymbols.includes(a.symbol) && a.change24hPct < -2);
                    return weakTech.length >= 3;
                },
                generator: (news, assets) => {
                    const weakTech = assets.filter(a => ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'].includes(a.symbol) && a.change24hPct < -2);
                    return {
                        id: `alert_${Date.now()}_tech_weakness`,
                        severity: 'medium',
                        title: 'Debolezza Settore Tech',
                        thesis: `Rotazione settoriale o prese di profitto: ${weakTech.length} Big Tech in calo oltre il 2%.`,
                        confidence: 0.75,
                        horizon: 'weeks',
                        assetRefs: weakTech.map(a => a.id),
                        newsRefs: news.filter(n => n.tags.includes('tech')).map(n => n.id).slice(0, 3),
                        createdAt: new Date().toISOString()
                    };
                }
            },
            // Rule 4: Rate Decision Impact
            {
                id: 'rate_decision',
                condition: (news, assets) => {
                    return news.filter(n => n.tags.includes('tassi') && (n.tags.includes('bce') || n.tags.includes('fed') || n.title.toLowerCase().includes('bce') || n.title.toLowerCase().includes('fed'))).length >= 2;
                },
                generator: (news, assets) => {
                    const rateNews = news.filter(n => n.tags.includes('tassi'));
                    return {
                        id: `alert_${Date.now()}_rates`,
                        severity: 'high',
                        title: 'Decisione Tassi Imminente/Rilasciata',
                        thesis: 'Molteplici notizie su tassi centrali (BCE/FED). Alta volatilità attesa su tutti i mercati.',
                        confidence: 0.9,
                        horizon: 'weeks',
                        assetRefs: [],
                        newsRefs: rateNews.map(n => n.id).slice(0, 3),
                        createdAt: new Date().toISOString()
                    };
                }
            },
            // Rule 5: Gold Safe Haven
            {
                id: 'gold_safe_haven',
                condition: (news, assets) => {
                    const geoNews = news.some(n => n.tags.includes('geopolitica'));
                    const gold = assets.find(a => a.symbol === 'GC=F' || a.symbol === 'GOLD'); // handle mock symbol variance
                    const indicesDown = assets.filter(a => a.type === 'index' && a.change24hPct < 0).length;
                    return geoNews && gold && gold.change24hPct > 0.5 && indicesDown >= 2;
                },
                generator: (news, assets) => {
                    const gold = assets.find(a => a.symbol === 'GC=F' || a.symbol === 'GOLD');
                    return {
                        id: `alert_${Date.now()}_gold`,
                        severity: 'medium',
                        title: 'Fuga verso Beni Rifugio (Oro)',
                        thesis: 'Tensioni geopolitiche e indici in rosso spingono l\'oro al rialzo.',
                        confidence: 0.8,
                        horizon: 'days',
                        assetRefs: [gold.id],
                        newsRefs: news.filter(n => n.tags.includes('geopolitica')).map(n => n.id).slice(0, 3),
                        createdAt: new Date().toISOString()
                    };
                }
            },
            // Rule 6: Energy Volatility
            {
                id: 'energy_volatility',
                condition: (news, assets) => {
                    const energyNews = news.filter(n => n.tags.includes('energia')).length >= 2;
                    const oil = assets.find(a => a.symbol === 'CL=F' || a.symbol === 'OIL');
                    return energyNews && oil && Math.abs(oil.change24hPct) > 2;
                },
                generator: (news, assets) => {
                    const oil = assets.find(a => a.symbol === 'CL=F' || a.symbol === 'OIL');
                    return {
                        id: `alert_${Date.now()}_energy`,
                        severity: 'medium',
                        title: 'Volatilità Settore Energetico',
                        thesis: `Il petrolio segna una variazione del ${oil.change24hPct}%, supportata da notizie su energia/supply chain.`,
                        confidence: 0.7,
                        horizon: 'weeks',
                        assetRefs: [oil.id],
                        newsRefs: news.filter(n => n.tags.includes('energia')).map(n => n.id).slice(0, 3),
                        createdAt: new Date().toISOString()
                    };
                }
            },
            // Rule 7: Market Sentiment Shift
            {
                id: 'sentiment_shift',
                condition: (news, assets) => {
                    const indices = assets.filter(a => a.type === 'index');
                    if (indices.length < 2) return false;
                    const allPositive = indices.every(i => i.change24hPct > 0);
                    const allNegative = indices.every(i => i.change24hPct < 0);
                    return allPositive || allNegative;
                },
                generator: (news, assets) => {
                    const indices = assets.filter(a => a.type === 'index');
                    const isPositive = indices[0].change24hPct > 0;
                    const avgChange = indices.reduce((sum, i) => sum + Math.abs(i.change24hPct), 0) / indices.length;
                    const severity = avgChange > 1.5 ? 'high' : 'medium';
                    return {
                        id: `alert_${Date.now()}_sentiment`,
                        severity,
                        title: isPositive ? 'Sentiment di Mercato: RIALZISTA' : 'Sentiment di Mercato: RIBASSISTA',
                        thesis: `Tutti i principali indici si muovono nella stessa direzione (${isPositive ? '+' : '-'}). Movimento corale del mercato.`,
                        confidence: 0.85,
                        horizon: 'days',
                        assetRefs: indices.map(i => i.id),
                        newsRefs: [],
                        createdAt: new Date().toISOString()
                    };
                }
            },
            // Rule 8: Crypto Decoupling
            {
                id: 'crypto_decoupling',
                condition: (news, assets) => {
                    const btc = assets.find(a => a.symbol === 'BTC');
                    const indices = assets.filter(a => a.type === 'index');
                    if (!btc || indices.length === 0) return false;

                    const avgIndexChange = indices.reduce((sum, i) => sum + i.change24hPct, 0) / indices.length;
                    const signsOpposite = (btc.change24hPct > 0 && avgIndexChange < 0) || (btc.change24hPct < 0 && avgIndexChange > 0);
                    const diff = Math.abs(btc.change24hPct - avgIndexChange);

                    return signsOpposite && diff > 3;
                },
                generator: (news, assets) => {
                    const btc = assets.find(a => a.symbol === 'BTC');
                    return {
                        id: `alert_${Date.now()}_decoupling`,
                        severity: 'low',
                        title: 'Crypto Decoupling (Decorrelazione)',
                        thesis: `Bitcoin si muove in direzione opposta all'azionario tradizionale con un differenziale significativo (>3%).`,
                        confidence: 0.6,
                        horizon: 'days',
                        assetRefs: [btc.id],
                        newsRefs: news.filter(n => n.tags.includes('crypto')).map(n => n.id).slice(0, 3),
                        createdAt: new Date().toISOString()
                    };
                }
            }
        ];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalysisAgent;
} else {
    window.AnalysisAgent = AnalysisAgent;
}
