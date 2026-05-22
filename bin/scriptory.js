#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { checkForUpdates, performUpdate, CURRENT_VERSION } from '../lib/updater.js';
import { getConfig, setConfig, VALID_CONFIG_KEYS } from '../lib/config.js';
import { startServer } from '../lib/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
    .name('scriptory')
    .description('Internal documentation platform with Notion-like editor')
    .version(CURRENT_VERSION);

// ─── Default: Start server ──────────────────────────────────────────────────
program
    .option('-p, --port <port>', 'Port to listen on', '6767')
    .option('--no-browser', 'Do not open browser automatically')
    .option('--no-update-check', 'Skip update check on start')
    .action(async (options) => {
        if (options.updateCheck !== false) {
            await silentUpdateCheck();
        }
        await startServer(parseInt(options.port, 10));
    });

// ─── Init ───────────────────────────────────────────────────────────────────
program
    .command('init')
    .description('Initialize a new scriptory project in the current directory')
    .option('-t, --template <type>', 'Starter template: dev | qa | team', 'default')
    .action(async ({ template }) => {
        const docsDir = path.join(process.cwd(), 'scriptory');

        try {
            await fs.mkdir(docsDir, { recursive: true });

            const starterDocs = getStarterDocs(template);

            for (const doc of starterDocs) {
                const docPath = path.join(docsDir, doc.id);
                await fs.mkdir(docPath, { recursive: true });
                await fs.writeFile(path.join(docPath, 'config.json'), JSON.stringify({
                    title: doc.title,
                    icon: doc.icon,
                    tags: doc.tags || [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }, null, 2));
                await fs.writeFile(path.join(docPath, 'content.mdx'), doc.content);
                await fs.writeFile(path.join(docPath, 'comments.json'), '[]');
            }

            console.log(chalk.bold.green('\n✓ Project initialized!\n'));
            console.log(`  ${chalk.cyan('Docs:')} ${docsDir}`);
            console.log(`  ${chalk.cyan('Template:')} ${template}`);
            console.log(chalk.gray(`\n  Run ${chalk.white('scriptory')} to start the server\n`));
        } catch (error) {
            console.error(chalk.red('Error:'), error.message);
            process.exit(1);
        }
    });

// ─── Config get ─────────────────────────────────────────────────────────────
program
    .command('get <key>')
    .description(`Get a config value. Keys: ${VALID_CONFIG_KEYS.join(', ')}`)
    .action(async (key) => {
        if (!VALID_CONFIG_KEYS.includes(key)) {
            console.error(chalk.red(`Invalid key: ${key}`));
            console.log(chalk.cyan(`Valid keys: ${VALID_CONFIG_KEYS.join(', ')}`));
            process.exit(1);
        }
        const config = await getConfig();
        const value = config[key];
        const display = value === '' || value === undefined ? chalk.gray('(not set)') : String(value);
        console.log(`${chalk.cyan(key)}: ${display}`);
    });

// ─── Config set ─────────────────────────────────────────────────────────────
program
    .command('set <key> <value>')
    .description('Set a config value')
    .action(async (key, value) => {
        try {
            await setConfig(key, value);
            console.log(chalk.green(`✓ ${key} = ${value}`));
        } catch (error) {
            console.error(chalk.red('Error:'), error.message);
            process.exit(1);
        }
    });

// ─── Config list ────────────────────────────────────────────────────────────
program
    .command('config')
    .description('Show all current configuration')
    .action(async () => {
        const config = await getConfig();
        console.log(chalk.bold('\nscriptory configuration:\n'));
        for (const key of VALID_CONFIG_KEYS) {
            const v = config[key];
            const display = v === '' || v === undefined ? chalk.gray('(not set)') : chalk.white(String(v));
            console.log(`  ${chalk.cyan(key.padEnd(22))} ${display}`);
        }
        console.log();
    });

// ─── Update ─────────────────────────────────────────────────────────────────
program
    .command('update')
    .description('Check for and install the latest version')
    .action(async () => {
        console.log(chalk.cyan('Checking for updates...'));
        const hasUpdate = await checkForUpdates(true);
        if (hasUpdate) {
            console.log(chalk.cyan('Installing update...'));
            await performUpdate();
            console.log(chalk.green('✓ Updated. Run your command again.'));
        } else {
            console.log(chalk.green('✓ Already on the latest version'));
        }
    });

// ─── Helpers ────────────────────────────────────────────────────────────────

async function silentUpdateCheck() {
    try {
        const hasUpdate = await checkForUpdates(false);
        if (hasUpdate) {
            console.log(chalk.yellow(`\n⚡ Update available! Run ${chalk.white('scriptory update')} to install.\n`));
        }
    } catch { }
}

function getStarterDocs(template) {
    const base = [{
        id: 'getting-started',
        title: 'Getting Started',
        icon: '🚀',
        tags: ['onboarding'],
        content: `# Welcome to scriptory 📚

This is your documentation workspace.

## Quick Navigation

Use the **sidebar** to browse documents, or press **⌘K** to open the command palette.

## Editor Tips

- Press \`/\` for the block menu (headings, lists, code blocks, etc.)
- Use **Ctrl/⌘+S** to save
- Toggle preview with **Ctrl/⌘+P**
- Click **Comments** to add a team discussion
- Click **History** to browse and restore past versions

## Features

- 📝 Markdown editor with preview
- 💬 Comments & threaded replies
- 🕐 Version history with restore
- 🔍 Full-text search across all docs
- 📁 Code file browser and insertion
`,
    }];

    const byTemplate = {
        dev: [
            { id: 'api-reference', title: 'API Reference', icon: '🔌', tags: ['api'], content: '# API Reference\n\nDocument your API endpoints here.' },
            { id: 'architecture', title: 'Architecture', icon: '🏗️', tags: ['architecture'], content: '# Architecture\n\nDescribe your system architecture.' },
            { id: 'local-setup', title: 'Local Dev Setup', icon: '💻', tags: ['dev'], content: '# Local Development Setup\n\n## Prerequisites\n\n- Node.js 18+\n- ...\n\n## Steps\n\n1. Clone repo\n2. Install deps\n3. Run dev server' },
        ],
        qa: [
            { id: 'test-plan', title: 'Test Plan', icon: '📋', tags: ['qa'], content: '# Test Plan\n\n## Scope\n\n## Test Types\n\n## Schedule' },
            { id: 'test-cases', title: 'Test Cases', icon: '🧪', tags: ['qa'], content: '# Test Cases\n\n## TC-001\n\nSteps:\n1. ...\n\nExpected: ...' },
            { id: 'bug-tracker', title: 'Known Issues', icon: '🐛', tags: ['qa'], content: '# Known Issues\n\n| ID | Description | Severity | Status |\n|---|---|---|---|\n| BUG-001 | ... | High | Open |' },
        ],
        team: [
            { id: 'team-guide', title: 'Team Guide', icon: '👥', tags: ['team'], content: '# Team Guide\n\n## Processes\n\n## Rituals\n\n## Contacts' },
            { id: 'meeting-notes', title: 'Meeting Notes', icon: '📝', tags: ['team'], content: '# Meeting Notes\n\n**Date:**\n**Attendees:**\n\n## Agenda\n\n## Action Items' },
            { id: 'roadmap', title: 'Roadmap', icon: '🗺️', tags: ['team'], content: '# Roadmap\n\n## Q1\n\n- Item 1\n\n## Q2\n\n- Item 1' },
        ],
    };

    return [...base, ...(byTemplate[template] || [])];
}

program.parse();
