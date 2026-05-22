import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import open from 'open';
import chalk from 'chalk';
import { createRequire } from 'module';
import { getConfig, saveConfig, getDocsDir } from './config.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 80);
}

/** Ensure a resolved path stays inside an allowed root — prevents path traversal */
function assertSafe(resolvedPath, root) {
    if (!resolvedPath.startsWith(path.resolve(root))) {
        const err = new Error('Access denied');
        err.status = 403;
        throw err;
    }
}

async function readJsonFile(filePath, fallback = {}) {
    try {
        return JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch {
        return fallback;
    }
}

async function writeJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ─── Document helpers ───────────────────────────────────────────────────────

async function getDocFolders(DOCS_DIR) {
    try {
        const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
        const folders = [];
        for (const entry of entries) {
            if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
            const configPath = path.join(DOCS_DIR, entry.name, 'config.json');
            const config = await readJsonFile(configPath, { title: entry.name, icon: '📄' });
            folders.push({ id: entry.name, ...config });
        }
        return folders;
    } catch {
        return [];
    }
}

async function loadDocument(DOCS_DIR, id) {
    const docPath = path.join(DOCS_DIR, id);
    assertSafe(path.resolve(docPath), DOCS_DIR);

    const config = await readJsonFile(path.join(docPath, 'config.json'));
    if (!config.title) throw Object.assign(new Error('Document not found'), { status: 404 });

    let content = '';
    try { content = await fs.readFile(path.join(docPath, 'content.mdx'), 'utf8'); } catch { }

    return { id, ...config, content };
}

// ─── Version helpers ─────────────────────────────────────────────────────────

async function saveVersion(DOCS_DIR, id, content, message = 'Auto-save') {
    const versionsDir = path.join(DOCS_DIR, '.versions', id);
    await fs.mkdir(versionsDir, { recursive: true });

    // Keep last 20 versions
    const existing = (await fs.readdir(versionsDir).catch(() => []))
        .filter(f => f.endsWith('.json'))
        .sort();

    if (existing.length >= 20) {
        await fs.rm(path.join(versionsDir, existing[0])).catch(() => { });
    }

    const ts = Date.now();
    await writeJsonFile(path.join(versionsDir, `${ts}.json`), {
        ts,
        message,
        content,
        savedAt: new Date().toISOString(),
    });

    return ts;
}

async function listVersions(DOCS_DIR, id) {
    const versionsDir = path.join(DOCS_DIR, '.versions', id);
    try {
        const files = (await fs.readdir(versionsDir))
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();

        return Promise.all(
            files.map(async (f) => {
                const v = await readJsonFile(path.join(versionsDir, f));
                return { ts: v.ts, message: v.message, savedAt: v.savedAt };
            })
        );
    } catch {
        return [];
    }
}

// ─── Code-file helpers ───────────────────────────────────────────────────────

const CODE_EXTENSIONS = new Set([
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs',
    '.c', '.cpp', '.h', '.css', '.html', '.json', '.md', '.mdx',
    '.sh', '.yaml', '.yml', '.toml', '.env.example',
]);

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.cache']);

async function collectCodeFiles(dir, baseDir = dir, files = []) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const rel = path.relative(baseDir, path.join(dir, entry.name));
            const parts = rel.split(path.sep);

            if (parts.some(p => SKIP_DIRS.has(p) || p.startsWith('.'))) continue;

            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await collectCodeFiles(full, baseDir, files);
            } else if (CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
                files.push({ path: rel, name: entry.name });
            }
        }
    } catch { }
    return files;
}

// ─── Full-text search ────────────────────────────────────────────────────────

async function searchDocuments(DOCS_DIR, query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const folders = await getDocFolders(DOCS_DIR);
    const results = [];

    for (const folder of folders) {
        const contentPath = path.join(DOCS_DIR, folder.id, 'content.mdx');
        let content = '';
        try { content = await fs.readFile(contentPath, 'utf8'); } catch { }

        const titleMatch = folder.title.toLowerCase().includes(q);
        const contentMatch = content.toLowerCase().includes(q);

        if (titleMatch || contentMatch) {
            // Extract a snippet around first match
            let snippet = '';
            if (contentMatch) {
                const idx = content.toLowerCase().indexOf(q);
                const start = Math.max(0, idx - 60);
                const end = Math.min(content.length, idx + 120);
                snippet = (start > 0 ? '…' : '') + content.slice(start, end).replace(/\n/g, ' ') + (end < content.length ? '…' : '');
            }
            results.push({ ...folder, snippet, titleMatch, contentMatch });
        }
    }

    return results;
}

// ─── Server ──────────────────────────────────────────────────────────────────

export async function startServer(port = 6767) {
    const app = express();
    const DOCS_DIR = await getDocsDir();

    await fs.mkdir(DOCS_DIR, { recursive: true });
    await fs.mkdir(path.join(DOCS_DIR, '.uploads'), { recursive: true });

    // Multer for file uploads
    const upload = multer({
        dest: path.join(DOCS_DIR, '.uploads'),
        limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    });

    // ── Middleware ─────────────────────────────────────────────────────────
    app.use(cors());
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(express.static(path.join(__dirname, '../public')));

    // ── Config ────────────────────────────────────────────────────────────

    app.get('/api/config', async (req, res, next) => {
        try {
            res.json(await getConfig());
        } catch (e) { next(e); }
    });

    app.put('/api/config', async (req, res, next) => {
        try {
            const current = await getConfig();
            const merged = { ...current, ...req.body };
            await saveConfig(merged);
            res.json(merged);
        } catch (e) { next(e); }
    });

    app.post('/api/init', async (req, res, next) => {
        try {
            await fs.mkdir(DOCS_DIR, { recursive: true });
            const config = await getConfig();
            config.initialized = true;
            await saveConfig(config);
            res.json({ success: true });
        } catch (e) { next(e); }
    });

    // ── Documents ─────────────────────────────────────────────────────────

    app.get('/api/documents', async (req, res, next) => {
        try {
            res.json(await getDocFolders(DOCS_DIR));
        } catch (e) { next(e); }
    });

    app.get('/api/documents/:id', async (req, res, next) => {
        try {
            res.json(await loadDocument(DOCS_DIR, req.params.id));
        } catch (e) { next(e); }
    });

    app.post('/api/documents', async (req, res, next) => {
        try {
            const { title, icon = '📄', content = '', tags = [] } = req.body;
            if (!title?.trim()) return res.status(400).json({ error: 'title is required' });

            let id = slugify(title);
            // Avoid collision
            let attempt = id;
            let counter = 1;
            while (true) {
                try {
                    await fs.access(path.join(DOCS_DIR, attempt));
                    attempt = `${id}-${counter++}`;
                } catch {
                    id = attempt;
                    break;
                }
            }

            const docPath = path.join(DOCS_DIR, id);
            await fs.mkdir(docPath, { recursive: true });

            const config = { title: title.trim(), icon, tags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            await writeJsonFile(path.join(docPath, 'config.json'), config);
            await fs.writeFile(path.join(docPath, 'content.mdx'), content);
            await writeJsonFile(path.join(docPath, 'comments.json'), []);

            res.status(201).json({ id, ...config, content });
        } catch (e) { next(e); }
    });

    app.put('/api/documents/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const docPath = path.join(DOCS_DIR, id);
            assertSafe(path.resolve(docPath), DOCS_DIR);

            const { title, icon, content, tags, commitMessage } = req.body;
            const configPath = path.join(docPath, 'config.json');
            const contentPath = path.join(docPath, 'content.mdx');

            if (title !== undefined || icon !== undefined || tags !== undefined) {
                const current = await readJsonFile(configPath);
                const updated = {
                    ...current,
                    ...(title !== undefined && { title }),
                    ...(icon !== undefined && { icon }),
                    ...(tags !== undefined && { tags }),
                    updatedAt: new Date().toISOString(),
                };
                await writeJsonFile(configPath, updated);
            }

            if (content !== undefined) {
                // Save version before overwriting
                let existing = '';
                try { existing = await fs.readFile(contentPath, 'utf8'); } catch { }
                if (existing !== content) {
                    await saveVersion(DOCS_DIR, id, existing, commitMessage || 'Auto-save');
                }
                await fs.writeFile(contentPath, content);
            }

            res.json({ success: true });
        } catch (e) { next(e); }
    });

    app.delete('/api/documents/:id', async (req, res, next) => {
        try {
            const docPath = path.join(DOCS_DIR, req.params.id);
            assertSafe(path.resolve(docPath), DOCS_DIR);
            await fs.rm(docPath, { recursive: true, force: true });
            res.json({ success: true });
        } catch (e) { next(e); }
    });

    // ── Versions ──────────────────────────────────────────────────────────

    app.get('/api/documents/:id/versions', async (req, res, next) => {
        try {
            res.json(await listVersions(DOCS_DIR, req.params.id));
        } catch (e) { next(e); }
    });

    app.get('/api/documents/:id/versions/:ts', async (req, res, next) => {
        try {
            const vFile = path.join(DOCS_DIR, '.versions', req.params.id, `${req.params.ts}.json`);
            const v = await readJsonFile(vFile);
            if (!v.content && v.content !== '') return res.status(404).json({ error: 'Version not found' });
            res.json(v);
        } catch (e) { next(e); }
    });

    app.post('/api/documents/:id/versions/:ts/restore', async (req, res, next) => {
        try {
            const { id, ts } = req.params;
            const vFile = path.join(DOCS_DIR, '.versions', id, `${ts}.json`);
            const v = await readJsonFile(vFile);
            if (!v.content && v.content !== '') return res.status(404).json({ error: 'Version not found' });

            const contentPath = path.join(DOCS_DIR, id, 'content.mdx');
            let current = '';
            try { current = await fs.readFile(contentPath, 'utf8'); } catch { }
            await saveVersion(DOCS_DIR, id, current, 'Before restore');
            await fs.writeFile(contentPath, v.content);

            // Touch updatedAt
            const configPath = path.join(DOCS_DIR, id, 'config.json');
            const config = await readJsonFile(configPath);
            config.updatedAt = new Date().toISOString();
            await writeJsonFile(configPath, config);

            res.json({ success: true });
        } catch (e) { next(e); }
    });

    // ── Comments ─────────────────────────────────────────────────────────

    app.get('/api/documents/:id/comments', async (req, res, next) => {
        try {
            const file = path.join(DOCS_DIR, req.params.id, 'comments.json');
            res.json(await readJsonFile(file, []));
        } catch (e) { next(e); }
    });

    app.post('/api/documents/:id/comments', async (req, res, next) => {
        try {
            const { author = 'Anonymous', text, lineRef } = req.body;
            if (!text?.trim()) return res.status(400).json({ error: 'text is required' });

            const file = path.join(DOCS_DIR, req.params.id, 'comments.json');
            const comments = await readJsonFile(file, []);
            const comment = {
                id: `c-${Date.now()}`,
                author,
                text: text.trim(),
                lineRef: lineRef || null,
                replies: [],
                createdAt: new Date().toISOString(),
            };
            comments.push(comment);
            await writeJsonFile(file, comments);
            res.status(201).json(comment);
        } catch (e) { next(e); }
    });

    app.post('/api/documents/:id/comments/:cid/replies', async (req, res, next) => {
        try {
            const { author = 'Anonymous', text } = req.body;
            if (!text?.trim()) return res.status(400).json({ error: 'text is required' });

            const file = path.join(DOCS_DIR, req.params.id, 'comments.json');
            const comments = await readJsonFile(file, []);
            const comment = comments.find(c => c.id === req.params.cid);
            if (!comment) return res.status(404).json({ error: 'Comment not found' });

            const reply = {
                id: `r-${Date.now()}`,
                author,
                text: text.trim(),
                createdAt: new Date().toISOString(),
            };
            comment.replies.push(reply);
            await writeJsonFile(file, comments);
            res.status(201).json(reply);
        } catch (e) { next(e); }
    });

    app.delete('/api/documents/:id/comments/:cid', async (req, res, next) => {
        try {
            const file = path.join(DOCS_DIR, req.params.id, 'comments.json');
            let comments = await readJsonFile(file, []);
            comments = comments.filter(c => c.id !== req.params.cid);
            await writeJsonFile(file, comments);
            res.json({ success: true });
        } catch (e) { next(e); }
    });

    // ── Search ────────────────────────────────────────────────────────────

    app.get('/api/search', async (req, res, next) => {
        try {
            const q = (req.query.q || '').toString().trim();
            if (!q) return res.json([]);
            res.json(await searchDocuments(DOCS_DIR, q));
        } catch (e) { next(e); }
    });

    // ── Templates ─────────────────────────────────────────────────────────

    const TEMPLATES = {
        'api-docs': {
            title: 'API Documentation',
            icon: '🔌',
            content: `# API Documentation

## Overview

Brief description of this API.

## Base URL

\`\`\`
https://api.example.com/v1
\`\`\`

## Authentication

Describe authentication method (API key, OAuth, etc.)

\`\`\`http
Authorization: Bearer YOUR_TOKEN
\`\`\`

## Endpoints

### GET /resource

Returns a list of resources.

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`page\` | integer | No | Page number (default: 1) |
| \`limit\` | integer | No | Items per page (default: 20) |

**Response**

\`\`\`json
{
  "data": [],
  "total": 0,
  "page": 1
}
\`\`\`

### POST /resource

Creates a new resource.

**Request Body**

\`\`\`json
{
  "name": "string",
  "description": "string"
}
\`\`\`

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |
`,
        },
        'test-case': {
            title: 'Test Cases',
            icon: '🧪',
            content: `# Test Cases: [Feature Name]

## Overview

Brief description of what is being tested.

## Test Environment

- **Environment:** Staging / Production
- **Browser:** Chrome 120, Firefox 121
- **Date:** ${new Date().toLocaleDateString()}

---

## TC-001: [Test Case Title]

**Priority:** High | Medium | Low
**Type:** Functional | Integration | UI

### Preconditions

- User is logged in
- Feature flag is enabled

### Steps

1. Navigate to the feature
2. Perform action A
3. Verify result

### Expected Result

The system should display X and perform Y.

### Actual Result

_Fill in after test execution_

### Status

- [ ] Pass
- [ ] Fail
- [ ] Blocked

---

## TC-002: [Test Case Title]

### Steps

1. Step 1
2. Step 2

### Expected Result

Expected outcome.

### Status

- [ ] Pass
- [ ] Fail
- [ ] Blocked
`,
        },
        'bug-report': {
            title: 'Bug Report',
            icon: '🐛',
            content: `# Bug Report

**Date:** ${new Date().toLocaleDateString()}
**Reporter:**
**Severity:** Critical | High | Medium | Low
**Status:** Open

---

## Summary

One-line description of the bug.

## Environment

- **OS:**
- **Browser/App version:**
- **Build/Commit:**

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behaviour

What should happen.

## Actual Behaviour

What actually happens.

## Screenshots / Logs

_Attach screenshots or paste relevant logs here_

\`\`\`
Error logs here
\`\`\`

## Possible Root Cause

Your hypothesis about why this is happening.

## Fix Suggestion

Suggested solution (optional).
`,
        },
        'meeting-notes': {
            title: 'Meeting Notes',
            icon: '📝',
            content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Time:**
**Attendees:**
**Facilitator:**

---

## Agenda

1. Item 1
2. Item 2
3. Item 3

---

## Discussion

### Topic 1

Notes about topic 1.

### Topic 2

Notes about topic 2.

---

## Decisions Made

- Decision 1
- Decision 2

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Task 1 | Name | Date | Open |
| Task 2 | Name | Date | Open |

## Next Meeting

**Date:**
**Topics:**
`,
        },
        'architecture': {
            title: 'Architecture Document',
            icon: '🏗️',
            content: `# Architecture: [System Name]

**Version:** 1.0
**Last Updated:** ${new Date().toLocaleDateString()}
**Authors:**

---

## 1. Overview

High-level description of the system and its purpose.

## 2. Goals & Non-Goals

### Goals
- Goal 1
- Goal 2

### Non-Goals
- Non-goal 1

## 3. System Architecture

Describe the overall architecture. Include diagrams if needed.

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│     API     │────▶│   Database  │
└─────────────┘     └─────────────┘     └─────────────┘
\`\`\`

## 4. Components

### Component 1
Description, responsibilities, interfaces.

### Component 2
Description, responsibilities, interfaces.

## 5. Data Flow

Describe how data flows through the system.

## 6. Technology Choices

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React | Component model |
| Backend | Node.js | Team familiarity |
| Database | PostgreSQL | ACID compliance |

## 7. Security Considerations

- Authentication strategy
- Authorization model
- Data encryption

## 8. Scalability

How the system scales under load.

## 9. Open Questions

- Question 1
- Question 2
`,
        },
    };

    app.get('/api/templates', (req, res) => {
        const list = Object.entries(TEMPLATES).map(([id, t]) => ({
            id,
            title: t.title,
            icon: t.icon,
        }));
        res.json(list);
    });

    app.get('/api/templates/:id', (req, res) => {
        const tpl = TEMPLATES[req.params.id];
        if (!tpl) return res.status(404).json({ error: 'Template not found' });
        res.json(tpl);
    });

    // ── File Uploads ──────────────────────────────────────────────────────

    app.post('/api/upload', upload.single('file'), async (req, res, next) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
            const { originalname, filename, mimetype, size } = req.file;
            res.json({
                filename,
                originalname,
                mimetype,
                size,
                url: `/uploads/${filename}`,
            });
        } catch (e) { next(e); }
    });

    app.use('/uploads', express.static(path.join(DOCS_DIR, '.uploads')));

    // ── Code Files ────────────────────────────────────────────────────────

    app.get('/api/code-files', async (req, res, next) => {
        try {
            res.json(await collectCodeFiles(process.cwd()));
        } catch (e) { next(e); }
    });

    app.get('/api/code-files/*', async (req, res, next) => {
        try {
            const rel = req.params[0];
            const filePath = path.normalize(path.join(process.cwd(), rel));
            assertSafe(filePath, process.cwd());
            const content = await fs.readFile(filePath, 'utf8');
            res.json({ content });
        } catch (e) { next(e); }
    });

    // ── Health ────────────────────────────────────────────────────────────

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', version, docsDir: DOCS_DIR });
    });

    // ── SPA fallback ──────────────────────────────────────────────────────

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // ── Error handler ─────────────────────────────────────────────────────

    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, _next) => {
        const status = err.status || 500;
        if (status >= 500) console.error(chalk.red('[error]'), err.message);
        res.status(status).json({ error: err.message || 'Internal server error' });
    });

    app.listen(port, () => {
        console.log(chalk.bold.green('\n📚 scriptory'));
        console.log(chalk.gray(`   v${version}\n`));
        console.log(`  ${chalk.cyan('Web:')}  http://localhost:${port}`);
        console.log(`  ${chalk.cyan('Docs:')} ${DOCS_DIR}`);
        console.log(chalk.gray('\n  Press Ctrl+C to stop\n'));
        open(`http://localhost:${port}`);
    });
}
