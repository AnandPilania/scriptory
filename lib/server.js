import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import open from 'open';
import chalk from 'chalk';
import multer from 'multer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getConfig, saveConfig } from './config.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(process.cwd(), 'scriptory');
const UPLOADS_DIR = path.join(DOCS_DIR, '.uploads');
const VERSIONS_DIR = path.join(DOCS_DIR, '.versions');

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function startServer(port = 6767, options) {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());
    app.use('/uploads', express.static(UPLOADS_DIR));
    app.use(express.static(path.join(__dirname, '../public')));

    async function ensureDirs() {
        await fs.mkdir(DOCS_DIR, { recursive: true });
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        await fs.mkdir(VERSIONS_DIR, { recursive: true });
    }

    async function getDocFolders() {
        try {
            const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true });
            const folders = [];

            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    const configPath = path.join(DOCS_DIR, entry.name, 'config.json');
                    try {
                        const configData = await fs.readFile(configPath, 'utf8');
                        const config = JSON.parse(configData);
                        folders.push({ id: entry.name, ...config });
                    } catch (error) {
                        folders.push({
                            id: entry.name,
                            title: entry.name,
                            icon: '📄',
                            tags: [],
                            favorite: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                    }
                }
            }

            return folders.sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            );
        } catch (error) {
            return [];
        }
    }

    async function saveVersion(docId, content, message = 'Auto-save') {
        try {
            const versionDir = path.join(VERSIONS_DIR, docId);
            await fs.mkdir(versionDir, { recursive: true });

            const timestamp = Date.now();
            const versionFile = path.join(versionDir, `${timestamp}.json`);

            await fs.writeFile(versionFile, JSON.stringify({
                timestamp,
                content,
                message,
                createdAt: new Date().toISOString()
            }, null, 2));

            const versions = await fs.readdir(versionDir);
            if (versions.length > 20) {
                const sorted = versions.sort();
                for (let i = 0; i < versions.length - 20; i++) {
                    await fs.unlink(path.join(versionDir, sorted[i]));
                }
            }
        } catch (error) {
            console.error('Error saving version:', error);
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
                    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.css', '.html', '.json', '.md', '.mdx', '.yml', '.yaml'];
                    if (codeExtensions.includes(ext)) {
                        files.push({ path: relativePath, name: entry.name, ext });
                    }
                }
            }
            return files;
        } catch (error) {
            return files;
        }
    }

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
            let folders = await getDocFolders();

            if (req.query.tag) {
                folders = folders.filter(doc =>
                    doc.tags && doc.tags.includes(req.query.tag)
                );
            }

            if (req.query.favorites === 'true') {
                folders = folders.filter(doc => doc.favorite);
            }

            if (req.query.search) {
                const query = req.query.search.toLowerCase();
                folders = folders.filter(doc =>
                    doc.title.toLowerCase().includes(query) ||
                    (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query)))
                );
            }

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

            let comments = [];
            try {
                const commentsPath = path.join(docPath, 'comments.json');
                const commentsData = await fs.readFile(commentsPath, 'utf8');
                comments = JSON.parse(commentsData);
            } catch (error) {
                comments = [];
            }

            res.json({ id, ...config, content, comments });
        } catch (error) {
            res.status(404).json({ error: 'Document not found' });
        }
    });

    app.post('/api/documents', async (req, res) => {
        try {
            const { title, icon = '📄', content = '', tags = [] } = req.body;
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const docPath = path.join(DOCS_DIR, id);

            await fs.mkdir(docPath, { recursive: true });

            const config = {
                title,
                icon,
                tags,
                favorite: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await fs.writeFile(path.join(docPath, 'config.json'), JSON.stringify(config, null, 2));
            await fs.writeFile(path.join(docPath, 'content.mdx'), content);
            await fs.writeFile(path.join(docPath, 'comments.json'), JSON.stringify([], null, 2));

            res.json({ id, ...config, content, comments: [] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.put('/api/documents/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { title, icon, content, tags, favorite } = req.body;
            const docPath = path.join(DOCS_DIR, id);

            const configPath = path.join(docPath, 'config.json');
            const contentPath = path.join(docPath, 'content.mdx');

            if (title !== undefined || icon !== undefined || tags !== undefined || favorite !== undefined) {
                const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
                const newConfig = {
                    ...currentConfig,
                    ...(title !== undefined && { title }),
                    ...(icon !== undefined && { icon }),
                    ...(tags !== undefined && { tags }),
                    ...(favorite !== undefined && { favorite }),
                    updatedAt: new Date().toISOString()
                };
                await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
            }

            if (content !== undefined) {
                await fs.writeFile(contentPath, content);
                await saveVersion(id, content);
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

            const versionDir = path.join(VERSIONS_DIR, id);
            await fs.rm(versionDir, { recursive: true, force: true }).catch(() => { });

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/documents/:id/toggle-favorite', async (req, res) => {
        try {
            const { id } = req.params;
            const docPath = path.join(DOCS_DIR, id);
            const configPath = path.join(docPath, 'config.json');
            const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
            const newConfig = {
                ...currentConfig,
                ...({ favorite: !currentConfig.favorite }),
                updatedAt: new Date().toISOString()
            };

            await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/documents/:id/versions', async (req, res) => {
        try {
            const { id } = req.params;
            const versionDir = path.join(VERSIONS_DIR, id);

            const files = await fs.readdir(versionDir);
            const versions = [];

            for (const file of files.sort().reverse()) {
                const filePath = path.join(versionDir, file);
                const data = await fs.readFile(filePath, 'utf8');
                versions.push(JSON.parse(data));
            }

            res.json(versions);
        } catch (error) {
            res.json([]);
        }
    });

    app.post('/api/documents/:id/restore/:timestamp', async (req, res) => {
        try {
            const { id, timestamp } = req.params;
            const versionFile = path.join(VERSIONS_DIR, id, `${timestamp}.json`);
            const versionData = await fs.readFile(versionFile, 'utf8');
            const version = JSON.parse(versionData);

            const contentPath = path.join(DOCS_DIR, id, 'content.mdx');
            await fs.writeFile(contentPath, version.content);

            res.json({ success: true, content: version.content });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/documents/:id/comments', async (req, res) => {
        try {
            const { id } = req.params;
            const { text, author = '' } = req.body;
            const commentsPath = path.join(DOCS_DIR, id, 'comments.json');

            let comments = [];
            try {
                const data = await fs.readFile(commentsPath, 'utf8');
                comments = JSON.parse(data);
            } catch (error) {
                comments = [];
            }

            const newComment = {
                id: Date.now().toString(),
                text,
                author,
                createdAt: new Date().toISOString(),
                replies: []
            };

            comments.push(newComment);
            await fs.writeFile(commentsPath, JSON.stringify(comments, null, 2));

            res.json(newComment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.delete('/api/documents/:id/comments/:commentId', async (req, res) => {
        try {
            const { id, commentId } = req.params;
            const commentsPath = path.join(DOCS_DIR, id, 'comments.json');

            const data = await fs.readFile(commentsPath, 'utf8');
            let comments = JSON.parse(data);

            comments = comments.filter(c => c.id !== commentId);
            await fs.writeFile(commentsPath, JSON.stringify(comments, null, 2));

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/upload', upload.single('file'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const fileUrl = `/uploads/${req.file.filename}`;
            res.json({
                success: true,
                url: fileUrl,
                filename: req.file.originalname
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/search', async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) {
                return res.json([]);
            }

            const query = q.toLowerCase();
            const folders = await getDocFolders();
            const results = [];

            for (const folder of folders) {
                const contentPath = path.join(DOCS_DIR, folder.id, 'content.mdx');
                try {
                    const content = await fs.readFile(contentPath, 'utf8');

                    if (folder.title.toLowerCase().includes(query) ||
                        content.toLowerCase().includes(query) ||
                        (folder.tags && folder.tags.some(tag => tag.toLowerCase().includes(query)))) {

                        const lines = content.split('\n');
                        const matchingLines = [];

                        lines.forEach((line, index) => {
                            if (line.toLowerCase().includes(query)) {
                                matchingLines.push({
                                    line: index + 1,
                                    text: line.substring(0, 100)
                                });
                            }
                        });

                        results.push({
                            ...folder,
                            matches: matchingLines.slice(0, 3)
                        });
                    }
                } catch (error) {
                    continue;
                }
            }

            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/tags', async (req, res) => {
        try {
            const folders = await getDocFolders();
            const tagsSet = new Set();

            folders.forEach(doc => {
                if (doc.tags) {
                    doc.tags.forEach(tag => tagsSet.add(tag));
                }
            });

            const tags = Array.from(tagsSet).map(tag => ({
                name: tag,
                count: folders.filter(doc => doc.tags && doc.tags.includes(tag)).length
            }));

            res.json(tags);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/recent', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const folders = await getDocFolders();
            const recent = folders.slice(0, limit);
            res.json(recent);
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

    app.get('/api/git/status', async (req, res) => {
        try {
            const cwd = process.cwd();

            try {
                await execAsync('git rev-parse --is-inside-work-tree', { cwd });
            } catch (error) {
                return res.json({
                    isGitRepo: false,
                    message: 'Not a git repository'
                });
            }

            const { stdout: branch } = await execAsync('git branch --show-current', { cwd });
            const { stdout: author } = await execAsync('git config user.name', { cwd });
            const { stdout: lastCommit } = await execAsync('git log -1 --pretty=format:"%h - %s (%ar)"', { cwd });
            const { stdout: stagedOutput } = await execAsync('git diff --cached --name-status', { cwd });
            const staged = stagedOutput.trim() ? stagedOutput.trim().split('\n').map(line => {
                const [status, path] = line.split('\t');
                return { path, status };
            }) : [];
            const { stdout: modifiedOutput } = await execAsync('git diff --name-status', { cwd });
            const modified = modifiedOutput.trim() ? modifiedOutput.trim().split('\n').map(line => {
                const [status, path] = line.split('\t');
                return { path, status };
            }) : [];
            const { stdout: untrackedOutput } = await execAsync('git ls-files --others --exclude-standard', { cwd });
            const untracked = untrackedOutput.trim() ? untrackedOutput.trim().split('\n').map(path => ({ path, status: 'U' })) : [];

            for (const file of [...staged, ...modified]) {
                try {
                    const { stdout: stats } = await execAsync(`git diff --numstat ${file.path}`, { cwd });
                    if (stats) {
                        const [additions, deletions] = stats.split('\t');
                        file.changes = { additions: parseInt(additions), deletions: parseInt(deletions) };
                    }
                } catch (error) {
                    file.changes = { additions: 0, deletions: 0 };
                }
            }

            res.json({
                isGitRepo: true,
                branch: branch.trim(),
                author: author.trim(),
                lastCommit: lastCommit.trim(),
                staged,
                modified,
                untracked
            });
        } catch (error) {
            console.error('Error getting git status:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/git/generate-docs', async (req, res) => {
        try {
            const { files, includeStaged, includeDirty } = req.body;
            const cwd = process.cwd();

            const { stdout: branch } = await execAsync('git branch --show-current', { cwd });
            const { stdout: author } = await execAsync('git config user.name', { cwd });
            const { stdout: email } = await execAsync('git config user.email', { cwd });

            let commitMessage = '';
            try {
                const { stdout } = await execAsync('git log -1 --pretty=format:"%s"', { cwd });
                commitMessage = stdout.trim();
            } catch (error) {
                commitMessage = 'Initial changes';
            }

            let content = `# Git Changes Documentation

**Generated:** ${new Date().toLocaleString()}
**Author:** ${author.trim()} <${email.trim()}>
**Branch:** ${branch.trim()}
**Commit:** ${commitMessage}

## Summary

This documentation was automatically generated from Git changes.

**Files Changed:** ${files.length}

---

## Changed Files

`;

            for (const filePath of files) {
                try {
                    const { stdout: diff } = await execAsync(`git diff HEAD -- "${filePath}"`, { cwd });

                    let fileContent = '';
                    try {
                        fileContent = await fs.readFile(path.join(cwd, filePath), 'utf8');
                    } catch (error) {
                        fileContent = 'File not readable';
                    }

                    content += `### \`${filePath}\`

**Status:** ${includeStaged ? 'Staged' : 'Modified'}

**Changes:**

\`\`\`diff
${diff || 'No changes to display'}
\`\`\`

**Current Content:**

\`\`\`${path.extname(filePath).slice(1)}
${fileContent.length > 1000 ? fileContent.slice(0, 1000) + '\n\n... (truncated)' : fileContent}
\`\`\`

---

`;
                } catch (error) {
                    content += `### \`${filePath}\`

**Error:** Could not read file changes.

---

`;
                }
            }

            const title = `Git Changes - ${new Date().toLocaleDateString()}`;
            const id = `git-${Date.now()}`;
            const docPath = path.join(DOCS_DIR, id);

            await fs.mkdir(docPath, { recursive: true });

            const config = {
                title,
                icon: '📝',
                tags: ['git', 'auto-generated', branch.trim()],
                favorite: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await fs.writeFile(path.join(docPath, 'config.json'), JSON.stringify(config, null, 2));
            await fs.writeFile(path.join(docPath, 'content.mdx'), content);
            await fs.writeFile(path.join(docPath, 'comments.json'), JSON.stringify([], null, 2));

            res.json({
                success: true,
                documentId: id,
                title,
                filesProcessed: files.length
            });
        } catch (error) {
            console.error('Error generating git documentation:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/git/diff/:path', async (req, res) => {
        try {
            const filePath = req.params.path;
            const cwd = process.cwd();

            const { stdout: diff } = await execAsync(`git diff HEAD -- "${filePath}"`, { cwd });

            res.json({ diff });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', version: '0.1.8' });
    });

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    app.listen(port, () => {
        console.log(chalk.green(`🚀 scriptory server running on ${port}`));
        console.log(chalk.cyan(`📝 Web interface: http://localhost:${options.dev ? 3000 : port}`));
        console.log(chalk.cyan(`📁 Documentation: ${DOCS_DIR}`));
        console.log(chalk.gray(`\nPress Ctrl+C to stop`));

        if (options.openBrowser) open(`http://localhost:${options.dev ? 3000 : port}`);
    });
}
