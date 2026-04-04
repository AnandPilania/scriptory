import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import open from 'open';
import chalk from 'chalk';
import { createRequire } from 'module';
import { getConfig, saveConfig } from './config.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(process.cwd(), 'scriptory');

const CODE_EXTENSIONS = new Set([
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs',
    '.c', '.cpp', '.h', '.css', '.html', '.json', '.md', '.mdx',
    '.sh', '.yaml', '.yml', '.toml', '.env.example',
]);

export async function startServer(port = 6767) {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, '../public')));

    async function ensureDocsDir() {
        await fs.mkdir(DOCS_DIR, { recursive: true });
    }

    async function getDocFolders() {
        try {
            const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
            const folders = [];

            for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                const configPath = path.join(DOCS_DIR, entry.name, 'config.json');
                try {
                    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
                    folders.push({ id: entry.name, ...config });
                } catch {
                    folders.push({ id: entry.name, title: entry.name, icon: '📄' });
                }
            }
            return folders;
        } catch {
            return [];
        }
    }

    async function getCodeFiles(dir, baseDir = dir, files = []) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(baseDir, fullPath);

                if (['node_modules', '.git', 'scriptory', 'public', '.'].some(s => relativePath.startsWith(s))) {
                    continue;
                }

                if (entry.isDirectory()) {
                    await getCodeFiles(fullPath, baseDir, files);
                } else if (CODE_EXTENSIONS.has(path.extname(entry.name))) {
                    files.push({ path: relativePath, name: entry.name });
                }
            }
            return files;
        } catch {
            return files;
        }
    }

    // ── API Routes ────────────────────────────────────────────

    app.post('/api/init', async (req, res) => {
        try {
            await ensureDocsDir();
            const config = await getConfig();
            config.initialized = true;
            await saveConfig(config);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/config', async (req, res) => {
        try {
            res.json(await getConfig());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/api/config', async (req, res) => {
        try {
            const current = await getConfig();
            const updated = { ...current, ...req.body };
            await saveConfig(updated);
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/documents', async (req, res) => {
        try {
            res.json(await getDocFolders());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/documents/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const docPath = path.join(DOCS_DIR, id);
            const config = JSON.parse(await fs.readFile(path.join(docPath, 'config.json'), 'utf8'));
            let content = '';
            try { content = await fs.readFile(path.join(docPath, 'content.mdx'), 'utf8'); } catch { }
            res.json({ id, ...config, content });
        } catch {
            res.status(404).json({ error: 'Document not found' });
        }
    });

    app.post('/api/documents', async (req, res) => {
        try {
            const { title, icon = '📄', content = '' } = req.body;
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const docPath = path.join(DOCS_DIR, id);

            await fs.mkdir(docPath, { recursive: true });
            await fs.writeFile(path.join(docPath, 'config.json'), JSON.stringify({ title, icon }, null, 2));
            await fs.writeFile(path.join(docPath, 'content.mdx'), content);

            res.json({ id, title, icon, content });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/api/documents/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { title, icon, content } = req.body;
            const docPath = path.join(DOCS_DIR, id);

            if (title !== undefined || icon !== undefined) {
                const current = JSON.parse(await fs.readFile(path.join(docPath, 'config.json'), 'utf8'));
                const updated = { ...current, ...(title !== undefined && { title }), ...(icon !== undefined && { icon }) };
                await fs.writeFile(path.join(docPath, 'config.json'), JSON.stringify(updated, null, 2));
            }
            if (content !== undefined) {
                await fs.writeFile(path.join(docPath, 'content.mdx'), content);
            }

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete('/api/documents/:id', async (req, res) => {
        try {
            await fs.rm(path.join(DOCS_DIR, req.params.id), { recursive: true, force: true });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/code-files', async (req, res) => {
        try {
            res.json(await getCodeFiles(process.cwd()));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/code-files/*', async (req, res) => {
        try {
            const filePath = path.join(process.cwd(), req.params[0]);
            if (!path.resolve(filePath).startsWith(path.resolve(process.cwd()))) {
                return res.status(403).json({ error: 'Access denied' });
            }
            res.json({ content: await fs.readFile(filePath, 'utf8') });
        } catch {
            res.status(404).json({ error: 'File not found' });
        }
    });

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', version: packageJson.version });
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    app.listen(port, () => {
        console.log(chalk.green('\n🚀 scriptory is running'));
        console.log(chalk.cyan(`   http://localhost:${port}`));
        console.log(chalk.gray(`   Docs: ${DOCS_DIR}`));
        console.log(chalk.gray(`\n   Ctrl+C to stop\n`));
        open(`http://localhost:${port}`);
    });
}
