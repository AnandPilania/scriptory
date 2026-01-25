export class DocumentAnalytics {
    constructor() {
        this.views = this.loadViews();
        this.editHistory = this.loadEditHistory();
    }

    loadViews() {
        try {
            return JSON.parse(localStorage.getItem('scriptory-views') || '{}');
        } catch {
            return {};
        }
    }

    loadEditHistory() {
        try {
            return JSON.parse(localStorage.getItem('scriptory-edits') || '[]');
        } catch {
            return [];
        }
    }

    saveViews() {
        localStorage.setItem('scriptory-views', JSON.stringify(this.views));
    }

    saveEditHistory() {
        localStorage.setItem('scriptory-edits', JSON.stringify(this.editHistory));
    }

    trackView(documentId) {
        const now = Date.now();

        if (!this.views[documentId]) {
            this.views[documentId] = {
                count: 0,
                firstView: now,
                lastView: now,
                viewTimes: []
            };
        }

        this.views[documentId].count++;
        this.views[documentId].lastView = now;
        this.views[documentId].viewTimes.push(now);

        if (this.views[documentId].viewTimes.length > 100) {
            this.views[documentId].viewTimes = this.views[documentId].viewTimes.slice(-100);
        }

        this.saveViews();
    }

    trackEdit(documentId, author, type = 'content') {
        this.editHistory.push({
            documentId,
            author,
            type,
            timestamp: Date.now()
        });

        if (this.editHistory.length > 1000) {
            this.editHistory = this.editHistory.slice(-1000);
        }

        this.saveEditHistory();
    }

    getMostViewed(limit = 10) {
        return Object.entries(this.views)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, limit)
            .map(([id, data]) => ({ id, ...data }));
    }

    getRecentEdits(limit = 50) {
        return this.editHistory
            .slice(-limit)
            .reverse();
    }

    getContributorStats() {
        const stats = {};

        this.editHistory.forEach(edit => {
            if (!stats[edit.author]) {
                stats[edit.author] = {
                    edits: 0,
                    documents: new Set()
                };
            }

            stats[edit.author].edits++;
            stats[edit.author].documents.add(edit.documentId);
        });

        return Object.entries(stats).map(([author, data]) => ({
            author,
            edits: data.edits,
            documents: data.documents.size
        })).sort((a, b) => b.edits - a.edits);
    }

    getActivityHeatmap(days = 90) {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const heatmap = {};

        this.editHistory.forEach(edit => {
            const date = new Date(edit.timestamp).toISOString().split('T')[0];
            heatmap[date] = (heatmap[date] || 0) + 1;
        });

        for (let i = 0; i < days; i++) {
            const date = new Date(now - i * oneDayMs).toISOString().split('T')[0];
            if (!heatmap[date]) {
                heatmap[date] = 0;
            }
        }

        return heatmap;
    }

    getWritingMetrics(documentId) {
        const edits = this.editHistory.filter(e => e.documentId === documentId);

        if (edits.length === 0) return null;

        const firstEdit = edits[0].timestamp;
        const lastEdit = edits[edits.length - 1].timestamp;
        const timeToWrite = lastEdit - firstEdit;

        return {
            totalEdits: edits.length,
            timeToWrite,
            averageEditInterval: timeToWrite / edits.length,
            firstEdit: new Date(firstEdit),
            lastEdit: new Date(lastEdit)
        };
    }
}
