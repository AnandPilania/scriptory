export function setupRoutes(app, { analytics, gitManager, searchEngine, qualityChecker, orgManager, webhookManager }) {

    // ============================================
    // ANALYTICS ENDPOINTS
    // ============================================

    app.post('/api/analytics/track-view/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { author, sessionId } = req.body;
            await analytics.trackView(id, { author, sessionId });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/analytics/track-edit/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { author, changeSize } = req.body;
            await analytics.trackEdit(id, author || 'Anonymous', changeSize || 0);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/analytics/stats', async (req, res) => {
        try {
            const views = await analytics.getViews();
            const edits = await analytics.getEdits();
            const contributors = await analytics.getContributors();

            res.json({
                totalViews: Object.values(views).reduce((sum, v) => sum + v.count, 0),
                totalEdits: edits.length,
                totalContributors: Object.keys(contributors).length,
                uniqueDocuments: new Set(edits.map(e => e.docId)).size
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/analytics/most-viewed', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const mostViewed = await analytics.getMostViewed(limit);
            res.json(mostViewed);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/analytics/contributors', async (req, res) => {
        try {
            const contributors = await analytics.getContributors();
            const sorted = Object.entries(contributors)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.edits - a.edits);
            res.json(sorted);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/analytics/heatmap', async (req, res) => {
        try {
            const days = parseInt(req.query.days) || 90;
            const heatmap = await analytics.getActivityHeatmap(days);
            res.json(heatmap);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/analytics/time-to-write/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const timeStats = await analytics.getTimeToWrite(id);
            res.json(timeStats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ============================================
    // GIT INTEGRATION ENDPOINTS
    // ============================================

    app.get('/api/git/status', async (req, res) => {
        try {
            const isRepo = await gitManager.isGitRepo();
            if (!isRepo) {
                return res.json({ isGitRepo: false });
            }

            const branches = await gitManager.getBranches();
            res.json({
                isGitRepo: true,
                branches
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/git/branches', async (req, res) => {
        try {
            const branches = await gitManager.getBranches();
            res.json(branches);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/git/diff', async (req, res) => {
        try {
            const { filePath, from, to } = req.query;
            const diff = await gitManager.getDiff(filePath, from, to);
            res.json({ diff });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/git/history', async (req, res) => {
        try {
            const { filePath, limit } = req.query;
            const history = await gitManager.getCommitHistory(filePath, parseInt(limit) || 50);
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/git/changelog', async (req, res) => {
        try {
            const { from, to } = req.body;
            const changelog = await gitManager.generateChangelog(from, to);
            res.json(changelog);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/git/release-notes', async (req, res) => {
        try {
            const { version, from, to } = req.body;
            const notes = await gitManager.generateReleaseNotes(version, from, to);
            res.json({ notes });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/git/pr/:number', async (req, res) => {
        try {
            const { number } = req.params;
            const pr = await gitManager.getPRDocumentation(number);
            res.json(pr);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ============================================
    // SEARCH ENDPOINTS
    // ============================================

    app.get('/api/search', async (req, res) => {
        try {
            const { q, from, to, author } = req.query;
            const filters = { from, to, author };
            const results = await searchEngine.search(q, filters);
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/search/index/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content, tags, metadata } = req.body;
            await searchEngine.indexDocument(id, title, content, tags, metadata);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/search/save', async (req, res) => {
        try {
            const { name, query, filters } = req.body;
            await searchEngine.saveSearch(name, query, filters);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/search/saved', async (req, res) => {
        try {
            const saved = await searchEngine.getSavedSearches();
            res.json(saved);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/search/history', async (req, res) => {
        try {
            const history = await searchEngine.getSearchHistory();
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ============================================
    // QUALITY CHECK ENDPOINTS
    // ============================================

    app.post('/api/quality/check', async (req, res) => {
        try {
            const { title, content, metadata } = req.body;

            const [spelling, grammar, seo, brokenLinks] = await Promise.all([
                qualityChecker.checkSpelling(content),
                qualityChecker.checkGrammar(content),
                qualityChecker.checkSEO(title, content, metadata),
                qualityChecker.checkBrokenLinks(content)
            ]);

            const readability = qualityChecker.calculateReadability(content);

            res.json({
                spelling,
                grammar,
                seo,
                brokenLinks,
                readability
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/quality/readability', async (req, res) => {
        try {
            const { content } = req.body;
            const readability = qualityChecker.calculateReadability(content);
            res.json(readability);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/quality/seo', async (req, res) => {
        try {
            const { title, content, metadata } = req.body;
            const seo = await qualityChecker.checkSEO(title, content, metadata);
            res.json(seo);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ============================================
    // ORGANIZATION ENDPOINTS
    // ============================================

    app.get('/api/organization/collections', async (req, res) => {
        try {
            const collections = await orgManager.getCollections();
            res.json(collections);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/organization/folders', async (req, res) => {
        try {
            const { name, parentId } = req.body;
            const folder = await orgManager.createFolder(name, parentId);
            res.json(folder);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/organization/folders/:folderId/documents/:docId', async (req, res) => {
        try {
            const { folderId, docId } = req.params;
            await orgManager.addToFolder(folderId, docId);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/organization/pin/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await orgManager.pinDocument(id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/organization/star/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await orgManager.starDocument(id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/organization/recent/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await orgManager.trackRecentView(id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ============================================
    // WEBHOOK ENDPOINTS
    // ============================================

    app.get('/api/webhooks', async (req, res) => {
        try {
            const webhooks = await webhookManager.getWebhooks();
            res.json(webhooks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/webhooks', async (req, res) => {
        try {
            const { url, events } = req.body;
            await webhookManager.registerWebhook(url, events);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/webhooks/trigger', async (req, res) => {
        try {
            const { event, data } = req.body;
            await webhookManager.trigger(event, data);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ============================================
    // REST API FOR EXTERNAL ACCESS
    // ============================================

    app.get('/api/v1/docs', async (req, res) => {
        try {
            // Public API endpoint for external access
            const { limit, offset, tags } = req.query;
            // Implementation for paginated document listing
            res.json({
                docs: [],
                pagination: { limit, offset, total: 0 }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/v1/docs/:id', async (req, res) => {
        try {
            const { id } = req.params;
            // Public API endpoint for document access
            res.json({ id, title: '', content: '' });
        } catch (error) {
            res.status(404).json({ error: 'Document not found' });
        }
    });

    // ============================================
    // PLUGIN SYSTEM
    // ============================================

    app.post('/api/plugins/register', async (req, res) => {
        try {
            const { name, version, hooks } = req.body;
            // Plugin registration logic
            res.json({ success: true, id: `plugin-${Date.now()}` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/plugins', async (req, res) => {
        try {
            // List registered plugins
            res.json([]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ============================================
    // THEME/CUSTOMIZATION
    // ============================================

    app.get('/api/themes', async (req, res) => {
        try {
            res.json({
                themes: [
                    { id: 'light', name: 'Light', default: true },
                    { id: 'dark', name: 'Dark' },
                    { id: 'blue', name: 'Blue Ocean' },
                    { id: 'forest', name: 'Forest Green' }
                ]
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/api/themes/active', async (req, res) => {
        try {
            const { themeId } = req.body;
            // Save active theme to config
            res.json({ success: true, theme: themeId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return app;
}
