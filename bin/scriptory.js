#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { checkForUpdates, performUpdate } from '../lib/updater.js';
import { getConfig, setConfig } from '../lib/config.js';
import { startServer } from '../lib/server.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
    .name('scriptory')
    .description('Internal documentation tool with Notion-like editor')
    .version(packageJson.version);

// Default command: Start server
program
    .argument('[port]', 'Port to run server on', '6767')
    .option('-p, --port <port>', 'Port to listen on', '6767')
    .action(async (portArg, options) => {
        await checkAndUpdate();
        const port = options.port || portArg;
        await startServer(port);
    });

// Init command
program
    .command('init')
    .description('Initialize a new scriptory project in current directory')
    .action(async () => {
        await checkAndUpdate();
        const docsDir = path.join(process.cwd(), 'scriptory');

        try {
            await fs.mkdir(docsDir, { recursive: true });

            const sampleId = 'getting-started';
            const samplePath = path.join(docsDir, sampleId);
            await fs.mkdir(samplePath, { recursive: true });

            const sampleConfig = { title: 'Getting Started', icon: '🚀' };
            const sampleContent = `# Welcome to scriptory

This is your first documentation page!

## Features

- 📝 Notion-like editor
- 📁 Organized documentation
- 🔍 Easy navigation
- ⚡ Fast and local

Start editing this page or create new ones from the sidebar.`;

            await fs.writeFile(
                path.join(samplePath, 'config.json'),
                JSON.stringify(sampleConfig, null, 2)
            );

            await fs.writeFile(path.join(samplePath, 'content.mdx'), sampleContent);

            console.log(chalk.green('✓ Project initialized successfully!'));
            console.log(chalk.cyan(`📁 Documentation folder created at: ${docsDir}`));
            console.log(chalk.cyan(`\n💡 Run 'scriptory' to start the server`));
        } catch (error) {
            console.error(chalk.red('Error initializing project:'), error.message);
            process.exit(1);
        }
    });

// Get config command
program
    .command('get <key>')
    .description('Get a configuration value')
    .action(async (key) => {
        await checkAndUpdate();
        const config = await getConfig();
        const validKeys = ['DEEPLINK_PREFIX'];

        if (!validKeys.includes(key)) {
            console.error(chalk.red(`Invalid key: ${key}`));
            console.log(chalk.cyan(`Valid keys: ${validKeys.join(', ')}`));
            process.exit(1);
        }

        const value = config[key] || '';
        console.log(chalk.cyan(`${key}: `) + (value || chalk.gray('(not set)')));
    });

// Set config command
program
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action(async (key, value) => {
        await checkAndUpdate();
        const validKeys = ['DEEPLINK_PREFIX'];

        if (!validKeys.includes(key)) {
            console.error(chalk.red(`Invalid key: ${key}`));
            console.log(chalk.cyan(`Valid keys: ${validKeys.join(', ')}`));
            process.exit(1);
        }

        await setConfig(key, value);
        console.log(chalk.green(`✓ ${key} set to: ${value}`));
    });

// Version command
program
    .command('version')
    .description('Show scriptory version')
    .action(() => {
        console.log(chalk.cyan(`scriptory v${packageJson.version}`));
    });

// Update command
program
    .command('update')
    .description('Check for updates and install latest version')
    .action(async () => {
        console.log(chalk.cyan('Checking for updates...'));
        const hasUpdate = await checkForUpdates(true);

        if (hasUpdate) {
            console.log(chalk.cyan('Installing update...'));
            await performUpdate();
        } else {
            console.log(chalk.green('✓ Already on latest version'));
        }
    });

async function checkAndUpdate() {
    const hasUpdate = await checkForUpdates(false);
    if (hasUpdate) {
        console.log(chalk.yellow('⚠ Update available! Installing...'));
        await performUpdate();
        console.log(chalk.green('✓ Updated to latest version. Please run your command again.'));
        process.exit(0);
    }
}

program.parse();
