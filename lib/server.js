import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import open from 'open';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getConfig, saveConfig } from './config.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(process.cwd(), 'doclific');
const ANALYTICS_DIR = path.join(DOCS_DIR, '.analytics');
const SEARCH_INDEX_FILE = path.join(DOCS_DIR, '.search-index.json');
const COLLECTIONS_FILE = path.join(DOCS_DIR, '.collections.json');
const WEBHOOKS_FILE = path.join(DOCS_DIR, '.webhooks.json');

export async function startServer(port = 6767) {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, '../public')));

    // ============================================
    // ANALYTICS SYSTEM
    // ============================================

    class AnalyticsEngine {
        constructor() {
            this.viewsFile = path.join(ANALYTICS_DIR, 'views.json');
            this.editsFile = path.join(ANALYTICS_DIR, 'edits.json');
            this.contributorsFile = path.join(ANALYTICS_DIR, 'contributors.json');
        }

        async ensureAnalyticsDir() {
            await fs.mkdir(ANALYTICS_DIR, { recursive: true });
        }

        async trackView(docId, metadata = {}) {
            await this.ensureAnalyticsDir();
            const views = await this.getViews();

            if (!views[docId]) {
                views[docId] = { count: 0, history: [], firstView: new Date().toISOString() };
            }

            views[docId].count++;
            views[docId].lastView = new Date().toISOString();
            views[docId].history.push({
                timestamp: new Date().toISOString(),
                ...metadata
            });

            // Keep only last 1000 views per document
            if (views[docId].history.length > 1000) {
                views[docId].history = views[docId].history.slice(-1000);
            }

            await fs.writeFile(this.viewsFile, JSON.stringify(views, null, 2));
        }

        async trackEdit(docId, author, changeSize = 0) {
            await this.ensureAnalyticsDir();
            const edits = await this.getEdits();

            const edit = {
                docId,
                author,
                timestamp: new Date().toISOString(),
                changeSize
            };

            edits.push(edit);

            // Keep only last 10000 edits
            if (edits.length > 10000) {
                await fs.writeFile(this.editsFile, JSON.stringify(edits.slice(-10000), null, 2));
            } else {
                await fs.writeFile(this.editsFile, JSON.stringify(edits, null, 2));
            }

            // Update contributors
            await this.updateContributor(author, docId);
        }

        async updateContributor(author, docId) {
            const contributors = await this.getContributors();

            if (!contributors[author]) {
                contributors[author] = {
                    name: author,
                    edits: 0,
                    documents: new Set(),
                    firstEdit: new Date().toISOString()
                };
            }

            contributors[author].edits++;
            contributors[author].documents = Array.from(new Set([
                ...(Array.isArray(contributors[author].documents) ? contributors[author].documents : []),
                docId
            ]));
            contributors[author].lastEdit = new Date().toISOString();

            // Convert Set to Array for JSON serialization
            const serializable = {};
            for (const [key, value] of Object.entries(contributors)) {
                serializable[key] = {
                    ...value,
                    documents: Array.isArray(value.documents) ? value.documents : Array.from(value.documents)
                };
            }

            await fs.writeFile(this.contributorsFile, JSON.stringify(serializable, null, 2));
        }

        async getViews() {
            try {
                const data = await fs.readFile(this.viewsFile, 'utf8');
                return JSON.parse(data);
            } catch {
                return {};
            }
        }

        async getEdits() {
            try {
                const data = await fs.readFile(this.editsFile, 'utf8');
                return JSON.parse(data);
            } catch {
                return [];
            }
        }

        async getContributors() {
            try {
                const data = await fs.readFile(this.contributorsFile, 'utf8');
                return JSON.parse(data);
            } catch {
                return {};
            }
        }

        async getMostViewed(limit = 10) {
            const views = await this.getViews();
            return Object.entries(views)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, limit)
                .map(([id, data]) => ({ id, ...data }));
        }

        async getActivityHeatmap(days = 90) {
            const edits = await this.getEdits();
            const heatmap = {};
            const now = new Date();

            for (let i = 0; i < days; i++) {
                const date = new Date(now - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];
                heatmap[dateStr] = 0;
            }

            edits.forEach(edit => {
                const date = edit.timestamp.split('T')[0];
                if (heatmap[date] !== undefined) {
                    heatmap[date]++;
                }
            });

            return heatmap;
        }

        async getTimeToWrite(docId) {
            const edits = await this.getEdits();
            const docEdits = edits.filter(e => e.docId === docId);

            if (docEdits.length < 2) return null;

            const firstEdit = new Date(docEdits[0].timestamp);
            const lastEdit = new Date(docEdits[docEdits.length - 1].timestamp);

            return {
                totalTime: lastEdit - firstEdit,
                edits: docEdits.length,
                averageInterval: (lastEdit - firstEdit) / docEdits.length
            };
        }
    }

    const analytics = new AnalyticsEngine();

    // ============================================
    // GIT INTEGRATION
    // ============================================

    class GitManager {
        async isGitRepo() {
            try {
                await execAsync('git rev-parse --git-dir', { cwd: process.cwd() });
                return true;
            } catch {
                return false;
            }
        }

        async getBranches() {
            const { stdout } = await execAsync('git branch -a', { cwd: process.cwd() });
            return stdout.split('\n')
                .map(b => b.trim())
                .filter(b => b)
                .map(b => ({
                    name: b.replace('* ', '').replace('remotes/origin/', ''),
                    current: b.startsWith('*')
                }));
        }

        async getDiff(filePath, fromCommit = 'HEAD~1', toCommit = 'HEAD') {
            const { stdout } = await execAsync(
                `git diff ${fromCommit} ${toCommit} -- "${filePath}"`,
                { cwd: process.cwd() }
            );
            return stdout;
        }

        async getCommitHistory(filePath, limit = 50) {
            const { stdout } = await execAsync(
                `git log --follow --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso -n ${limit} -- "${filePath}"`,
                { cwd: process.cwd() }
            );

            return stdout.split('\n').filter(Boolean).map(line => {
                const [hash, author, email, date, message] = line.split('|');
                return { hash, author, email, date, message };
            });
        }

        async generateChangelog(fromTag, toTag = 'HEAD') {
            const { stdout } = await execAsync(
                `git log ${fromTag}..${toTag} --pretty=format:"%h|%s|%an" --no-merges`,
                { cwd: process.cwd() }
            );

            const commits = stdout.split('\n').filter(Boolean).map(line => {
                const [hash, message, author] = line.split('|');
                return { hash, message, author };
            });

            const categorized = {
                features: commits.filter(c => c.message.toLowerCase().match(/^feat|feature/)),
                fixes: commits.filter(c => c.message.toLowerCase().match(/^fix|bug/)),
                docs: commits.filter(c => c.message.toLowerCase().match(/^doc/)),
                others: commits.filter(c => !c.message.toLowerCase().match(/^(feat|fix|doc)/))
            };

            return categorized;
        }

        async generateReleaseNotes(version, fromTag, toTag = 'HEAD') {
            const changelog = await this.generateChangelog(fromTag, toTag);
            const { stdout: stats } = await execAsync(
                `git diff --shortstat ${fromTag}..${toTag}`,
                { cwd: process.cwd() }
            );

            let notes = `# Release Notes - v${version}\n\n`;
            notes += `**Released:** ${new Date().toISOString().split('T')[0]}\n`;
            notes += `**Changes:** ${stats.trim()}\n\n`;

            if (changelog.features.length > 0) {
                notes += `## ✨ Features\n\n`;
                changelog.features.forEach(c => {
                    notes += `- ${c.message} (${c.hash}) by ${c.author}\n`;
                });
                notes += `\n`;
            }

            if (changelog.fixes.length > 0) {
                notes += `## 🐛 Bug Fixes\n\n`;
                changelog.fixes.forEach(c => {
                    notes += `- ${c.message} (${c.hash}) by ${c.author}\n`;
                });
                notes += `\n`;
            }

            if (changelog.docs.length > 0) {
                notes += `## 📚 Documentation\n\n`;
                changelog.docs.forEach(c => {
                    notes += `- ${c.message} (${c.hash}) by ${c.author}\n`;
                });
                notes += `\n`;
            }

            return notes;
        }

        async getPRDocumentation(prNumber) {
            // This would integrate with GitHub/GitLab API
            // For now, returning a template
            return {
                number: prNumber,
                title: `PR #${prNumber}`,
                description: 'Pull request documentation',
                files: [],
                commits: []
            };
        }
    }

    const gitManager = new GitManager();

    // ============================================
    // SEARCH ENGINE
    // ============================================

    class SearchEngine {
        constructor() {
            this.index = {};
            this.searchHistory = [];
            this.savedSearches = {};
        }

        async loadIndex() {
            try {
                const data = await fs.readFile(SEARCH_INDEX_FILE, 'utf8');
                const parsed = JSON.parse(data);
                this.index = parsed.index || {};
                this.searchHistory = parsed.history || [];
                this.savedSearches = parsed.saved || {};
            } catch {
                this.index = {};
            }
        }

        async saveIndex() {
            await fs.writeFile(SEARCH_INDEX_FILE, JSON.stringify({
                index: this.index,
                history: this.searchHistory.slice(-100),
                saved: this.savedSearches
            }, null, 2));
        }

        async indexDocument(id, title, content, tags = [], metadata = {}) {
            const words = this.tokenize(`${title} ${content} ${tags.join(' ')}`);

            this.index[id] = {
                title,
                words: [...new Set(words)],
                tags,
                metadata: {
                    ...metadata,
                    indexed: new Date().toISOString(),
                    wordCount: words.length
                }
            };

            await this.saveIndex();
        }

        tokenize(text) {
            return text
                .toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2);
        }

        async search(query, filters = {}) {
            await this.loadIndex();

            // Parse search shortcuts
            const parsed = this.parseQuery(query);

            const results = [];
            const searchWords = this.tokenize(parsed.text);

            for (const [id, doc] of Object.entries(this.index)) {
                let score = 0;

                // Tag filter
                if (parsed.tag && !doc.tags.includes(parsed.tag)) continue;

                // Date filter
                if (filters.from || filters.to) {
                    const docDate = new Date(doc.metadata.indexed);
                    if (filters.from && docDate < new Date(filters.from)) continue;
                    if (filters.to && docDate > new Date(filters.to)) continue;
                }

                // Author filter
                if (filters.author && doc.metadata.author !== filters.author) continue;

                // Calculate relevance score
                searchWords.forEach(word => {
                    if (doc.title.toLowerCase().includes(word)) score += 10;
                    if (doc.words.includes(word)) score += 1;
                    if (doc.tags.some(tag => tag.toLowerCase().includes(word))) score += 5;
                });

                if (score > 0) {
                    results.push({ id, score, ...doc });
                }
            }

            // Save to history
            this.searchHistory.push({
                query,
                timestamp: new Date().toISOString(),
                resultsCount: results.length
            });
            await this.saveIndex();

            return results.sort((a, b) => b.score - a.score);
        }

        parseQuery(query) {
            const tagMatch = query.match(/tag:(\w+)/);
            const authorMatch = query.match(/author:(\w+)/);

            let text = query;
            if (tagMatch) text = text.replace(tagMatch[0], '').trim();
            if (authorMatch) text = text.replace(authorMatch[0], '').trim();

            return {
                text,
                tag: tagMatch ? tagMatch[1] : null,
                author: authorMatch ? authorMatch[1] : null
            };
        }

        async saveSearch(name, query, filters = {}) {
            this.savedSearches[name] = { query, filters, created: new Date().toISOString() };
            await this.saveIndex();
        }

        async getSavedSearches() {
            await this.loadIndex();
            return this.savedSearches;
        }

        async getSearchHistory() {
            await this.loadIndex();
            return this.searchHistory.slice(-50).reverse();
        }
    }

    const searchEngine = new SearchEngine();

    // ============================================
    // QUALITY CHECKER
    // ============================================

    class QualityChecker {
        async checkSpelling(text) {
            // Basic spell check - would integrate with a real spell checker
            const commonMisspellings = {
                'teh': 'the',
                'recieve': 'receive',
                'occured': 'occurred',
                'seperate': 'separate'
            };

            const issues = [];
            const words = text.toLowerCase().split(/\s+/);

            words.forEach((word, index) => {
                if (commonMisspellings[word]) {
                    issues.push({
                        type: 'spelling',
                        word,
                        suggestion: commonMisspellings[word],
                        position: index
                    });
                }
            });

            return issues;
        }

        async checkGrammar(text) {
            const issues = [];

            // Basic grammar checks
            const sentences = text.split(/[.!?]+/);
            sentences.forEach((sentence, index) => {
                // Check capitalization
                if (sentence.trim() && !/^[A-Z]/.test(sentence.trim())) {
                    issues.push({
                        type: 'grammar',
                        issue: 'Sentence should start with capital letter',
                        sentence: sentence.trim(),
                        position: index
                    });
                }
            });

            return issues;
        }

        calculateReadability(text) {
            const sentences = text.split(/[.!?]+/).filter(Boolean);
            const words = text.split(/\s+/).filter(Boolean);
            const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);

            const avgWordsPerSentence = words.length / sentences.length;
            const avgSyllablesPerWord = syllables / words.length;

            // Flesch Reading Ease
            const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

            return {
                score: Math.max(0, Math.min(100, fleschScore)),
                sentences: sentences.length,
                words: words.length,
                avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
                level: this.getReadabilityLevel(fleschScore)
            };
        }

        countSyllables(word) {
            word = word.toLowerCase();
            if (word.length <= 3) return 1;
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            const syllables = word.match(/[aeiouy]{1,2}/g);
            return syllables ? syllables.length : 1;
        }

        getReadabilityLevel(score) {
            if (score >= 90) return 'Very Easy';
            if (score >= 80) return 'Easy';
            if (score >= 70) return 'Fairly Easy';
            if (score >= 60) return 'Standard';
            if (score >= 50) return 'Fairly Difficult';
            if (score >= 30) return 'Difficult';
            return 'Very Difficult';
        }

        async checkSEO(title, content, metadata = {}) {
            const issues = [];
            const suggestions = [];

            // Title length
            if (title.length < 30) {
                suggestions.push('Title is too short. Aim for 50-60 characters.');
            } else if (title.length > 60) {
                suggestions.push('Title is too long. Keep it under 60 characters.');
            }

            // Content length
            const wordCount = content.split(/\s+/).length;
            if (wordCount < 300) {
                suggestions.push('Content is short. Aim for at least 300 words.');
            }

            // Headings
            const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
            if (headings.length === 0) {
                suggestions.push('Add headings (H1, H2, H3) to structure your content.');
            }

            // Meta description
            if (!metadata.description || metadata.description.length < 120) {
                suggestions.push('Add a meta description (120-160 characters).');
            }

            return { issues, suggestions };
        }

        async checkBrokenLinks(content) {
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const links = [];
            let match;

            while ((match = linkRegex.exec(content)) !== null) {
                links.push({
                    text: match[1],
                    url: match[2],
                    valid: await this.isLinkValid(match[2])
                });
            }

            return links.filter(link => !link.valid);
        }

        async isLinkValid(url) {
            // Basic validation - in production, would actually fetch URLs
            try {
                new URL(url);
                return !url.includes('broken') && !url.includes('404');
            } catch {
                return false;
            }
        }
    }

    const qualityChecker = new QualityChecker();

    // ============================================
    // ORGANIZATION SYSTEM
    // ============================================

    class OrganizationManager {
        async getCollections() {
            try {
                const data = await fs.readFile(COLLECTIONS_FILE, 'utf8');
                return JSON.parse(data);
            } catch {
                return {
                    folders: [],
                    pinned: [],
                    recentlyViewed: [],
                    starred: []
                };
            }
        }

        async saveCollections(collections) {
            await fs.writeFile(COLLECTIONS_FILE, JSON.stringify(collections, null, 2));
        }

        async createFolder(name, parentId = null) {
            const collections = await this.getCollections();
            const folder = {
                id: `folder-${Date.now()}`,
                name,
                parentId,
                documents: [],
                created: new Date().toISOString()
            };
            collections.folders.push(folder);
            await this.saveCollections(collections);
            return folder;
        }

        async addToFolder(folderId, docId) {
            const collections = await this.getCollections();
            const folder = collections.folders.find(f => f.id === folderId);
            if (folder && !folder.documents.includes(docId)) {
                folder.documents.push(docId);
                await this.saveCollections(collections);
            }
        }

        async pinDocument(docId) {
            const collections = await this.getCollections();
            if (!collections.pinned.includes(docId)) {
                collections.pinned.push(docId);
                await this.saveCollections(collections);
            }
        }

        async starDocument(docId) {
            const collections = await this.getCollections();
            if (!collections.starred.includes(docId)) {
                collections.starred.push(docId);
                await this.saveCollections(collections);
            }
        }

        async trackRecentView(docId) {
            const collections = await this.getCollections();
            collections.recentlyViewed = collections.recentlyViewed.filter(id => id !== docId);
            collections.recentlyViewed.unshift(docId);
            collections.recentlyViewed = collections.recentlyViewed.slice(0, 20);
            await this.saveCollections(collections);
        }
    }

    const orgManager = new OrganizationManager();

    // ============================================
    // WEBHOOK SYSTEM
    // ============================================

    class WebhookManager {
        async getWebhooks() {
            try {
                const data = await fs.readFile(WEBHOOKS_FILE, 'utf8');
                return JSON.parse(data);
            } catch {
                return [];
            }
        }

        async saveWebhooks(webhooks) {
            await fs.writeFile(WEBHOOKS_FILE, JSON.stringify(webhooks, null, 2));
        }

        async registerWebhook(url, events = []) {
            const webhooks = await this.getWebhooks();
            webhooks.push({
                id: `webhook-${Date.now()}`,
                url,
                events,
                created: new Date().toISOString()
            });
            await this.saveWebhooks(webhooks);
        }

        async trigger(event, data) {
            const webhooks = await this.getWebhooks();
            const relevantWebhooks = webhooks.filter(wh =>
                wh.events.includes(event) || wh.events.includes('*')
            );

            for (const webhook of relevantWebhooks) {
                try {
                    await fetch(webhook.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
                    });
                } catch (error) {
                    console.error(`Webhook failed: ${webhook.url}`, error);
                }
            }
        }
    }

    const webhookManager = new WebhookManager();

    // Continue with API routes in next artifact...

    return { app, analytics, gitManager, searchEngine, qualityChecker, orgManager, webhookManager };
}
