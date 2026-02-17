/**
 * MarketPulse Logic Entry Point
 */

// If running in Node.js, we need to import/require manually or use a bundler.
// For this demo, we assume files are loaded or concat'd, but we maintain the exports structure.

const MarketPulseOrchestrator = (typeof module !== 'undefined' && module.exports)
    ? require('./orchestrator/MarketPulseOrchestrator')
    : window.MarketPulseOrchestrator;

// Export or expose global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MarketPulseOrchestrator
    };
} else {
    // Browser: attach to window
    window.marketPulseLogic = {
        createOrchestrator: () => new MarketPulseOrchestrator()
    };
}
