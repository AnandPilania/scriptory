import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import open from 'open';
import chalk from 'chalk';
import { getConfig, saveConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(process.cwd(), 'scriptory');

export async function startServer(port = 6767) {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, '../public')));

    async function ensureDocsDir() {
        try {
            await fs.mkdir(DOCS_DIR, { recursive: true });
        } catch (error) {
            console.error('Error creating docs directory:', error);
        }
    }

    async function getDocFolders() {
        try {
            const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
            const folders = [];

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const configPath = path.join(DOCS_DIR, entry.name, 'config.json');
                    try {
                        const configData = await fs.readFile(configPath, 'utf8');
                        const config = JSON.parse(configData);
                        folders.push({ id: entry.name, ...config });
                    } catch (error) {
                        folders.push({ id: entry.name, title: entry.name, icon: '📄' });
                    }
                }
            }
            return folders;
        } catch (error) {
            return [];
        }
    }

    async function getCodeFiles(dir, baseDir = dir, files = []) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(baseDir, fullPath);

                if (relativePath.includes('node_modules') ||
                    relativePath.includes('.git') ||
                    relativePath.includes('scriptory') ||
                    relativePath.startsWith('.')) {
                    continue;
                }

                if (entry.isDirectory()) {
                    await getCodeFiles(fullPath, baseDir, files);
                } else {
                    const ext = path.extname(entry.name);
                    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.css', '.html', '.json', '.md', '.mdx'];
                    if (codeExtensions.includes(ext)) {
                        files.push({ path: relativePath, name: entry.name });
                    }
                }
            }
            return files;
        } catch (error) {
            return files;
        }
    }

    // API Routes
    app.post('/api/init', async (req, res) => {
        try {
            await ensureDocsDir();
            const config = await getConfig();
            config.initialized = true;
            await saveConfig(config);
            res.json({ success: true, message: 'Project initialized successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/config', async (req, res) => {
        try {
            const config = await getConfig();
            res.json(config);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/api/config', async (req, res) => {
        try {
            const currentConfig = await getConfig();
            const newConfig = { ...currentConfig, ...req.body };
            await saveConfig(newConfig);
            res.json(newConfig);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/documents', async (req, res) => {
        try {
            const folders = await getDocFolders();
            res.json(folders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/documents/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const docPath = path.join(DOCS_DIR, id);
            const configPath = path.join(docPath, 'config.json');
            const contentPath = path.join(docPath, 'content.mdx');

            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);

            let content = '';
            try {
                content = await fs.readFile(contentPath, 'utf8');
            } catch (error) {
                content = '';
            }

            res.json({ id, ...config, content });
        } catch (error) {
            res.status(404).json({ error: 'Document not found' });
        }
    });

    app.post('/api/documents', async (req, res) => {
        try {
            const { title, icon = '📄', content = '' } = req.body;
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const docPath = path.join(DOCS_DIR, id);

            await fs.mkdir(docPath, { recursive: true });

            const config = { title, icon };
            await fs.writeFile(path.join(docPath, 'config.json'), JSON.stringify(config, null, 2));
            await fs.writeFile(path.join(docPath, 'content.mdx'), content);

            res.json({ id, ...config, content });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/api/documents/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { title, icon, content } = req.body;
            const docPath = path.join(DOCS_DIR, id);

            const configPath = path.join(docPath, 'config.json');
            const contentPath = path.join(docPath, 'content.mdx');

            if (title !== undefined || icon !== undefined) {
                const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
                const newConfig = {
                    ...currentConfig,
                    ...(title !== undefined && { title }),
                    ...(icon !== undefined && { icon })
                };
                await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
            }

            if (content !== undefined) {
                await fs.writeFile(contentPath, content);
            }

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete('/api/documents/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const docPath = path.join(DOCS_DIR, id);
            await fs.rm(docPath, { recursive: true, force: true });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/code-files', async (req, res) => {
        try {
            const files = await getCodeFiles(process.cwd());
            res.json(files);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/code-files/*', async (req, res) => {
        try {
            const filePath = path.join(process.cwd(), req.params[0]);

            const resolvedPath = path.resolve(filePath);
            const projectPath = path.resolve(process.cwd());
            if (!resolvedPath.startsWith(projectPath)) {
                return res.status(403).json({ error: 'Access denied' });
            }

            const content = await fs.readFile(filePath, 'utf8');
            res.json({ content });
        } catch (error) {
            res.status(404).json({ error: 'File not found' });
        }
    });

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', version: '0.1.8' });
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    app.listen(port, () => {
        console.log(chalk.green('🚀 scriptory server running'));
        console.log(chalk.cyan(`📝 Web interface: http://localhost:${port}`));
        console.log(chalk.cyan(`📁 Documentation: ${DOCS_DIR}`));
        console.log(chalk.gray(`\nPress Ctrl+C to stop`));

        open(`http://localhost:${port}`);
    });
}
