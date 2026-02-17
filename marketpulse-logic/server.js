const express = require('express');
const cors = require('cors');
const path = require('path');

// Polyfill fetch for Node.js (v2 compatible)
if (!global.fetch) {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        console.warn('Fetch API not found globally and node-fetch not installed.', e);
    }
}

const { MarketPulseOrchestrator } = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicit route for root path to serve the UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Explicit route for /marketpulse_ui (no extension)
app.get('/marketpulse_ui', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
// Explicit route for /dashboard.html (legacy support)
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Initialize Orchestrator
const orchestrator = new MarketPulseOrchestrator();
orchestrator.start().then(() => {
    console.log('Orchestrator started successfully.');
    console.log('Initial state loaded.');
});

// API Routes

// Endpoint expected by dashboard.html
// /api/agents/OrchestratorAgent/query
app.post('/api/agents/OrchestratorAgent/query', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received query:', message);

        // For now, any query returns the full state
        // In a real agent system, we'd parse the message

        if (message === 'refresh all') {
            await orchestrator.refresh();
        }

        const state = orchestrator.getState();
        res.json(state);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Direct optional API for debug
app.get('/api/state', (req, res) => {
    res.json(orchestrator.getState());
});

app.post('/api/refresh', async (req, res) => {
    try {
        const state = await orchestrator.refresh();
        res.json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Asset Endpoint
app.post('/api/assets', async (req, res) => {
    try {
        const { symbol, name, type } = req.body;
        if (!symbol || !name || !type) {
            return res.status(400).json({ error: 'Missing required fields: symbol, name, type' });
        }

        const added = orchestrator.addAsset({ symbol, name, type });
        if (added) {
            console.log(`API: Added new asset ${symbol}`);
            const state = await orchestrator.refresh();
            res.json(state);
        } else {
            res.status(409).json({ error: 'Asset already exists' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/dashboard.html to view the dashboard.`);
});
