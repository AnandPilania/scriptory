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
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const program = new Command();

program
    .name('scriptory')
    .description('Internal documentation tool with Notion-like editor')
    .version(packageJson.version);

program
    .command('start', { isDefault: true })
    .description('Start the scriptory server')
    .argument('[port]', 'Port to run server on', '6767')
    .option('-p, --port <port>', 'Port to listen on', '6767')
    .option('-d, --dev', 'Run in development mode (skip update check)')
    .option('--no-browser', 'Do not open browser automatically')
    .action(async (portArg, options) => {
        if (!options.dev) {
            await checkAndUpdate();
        }
        const port = options.port || portArg;
        await startServer(port, options);
    });

program
    .command('git:docs')
    .description('Generate documentation from Git changes')
    .option('-b, --branch <branch>', 'Target branch', 'HEAD')
    .option('-s, --staged', 'Include staged files only', true)
    .option('-a, --all', 'Include all changes')
    .option('-o, --output <path>', 'Output file path')
    .action(async (options) => {
        try {
            const cwd = process.cwd();

            console.log(chalk.cyan('📝 Generating documentation from Git changes...'));

            // Get git status
            const { stdout: status } = await execAsync('git status --porcelain', { cwd });

            if (!status.trim()) {
                console.log(chalk.yellow('⚠ No changes detected'));
                return;
            }

            const files = status.trim().split('\n').map(line => {
                const [status, ...pathParts] = line.trim().split(/\s+/);
                return { status, path: pathParts.join(' ') };
            });

            console.log(chalk.green(`✓ Found ${files.length} changed files`));

            // Generate docs
            const docsDir = path.join(cwd, 'scriptory');
            await fs.mkdir(docsDir, { recursive: true });

            const docId = `git-${Date.now()}`;
            const docPath = path.join(docsDir, docId);
            await fs.mkdir(docPath, { recursive: true });

            // Build content
            let content = `# Git Changes Documentation\n\n`;
            content += `**Generated:** ${new Date().toISOString()}\n`;
            content += `**Branch:** ${options.branch}\n\n`;
            content += `## Files Changed (${files.length})\n\n`;

            for (const file of files) {
                content += `### ${file.path}\n`;
                content += `**Status:** ${file.status}\n\n`;

                try {
                    const { stdout: diff } = await execAsync(`git diff HEAD -- "${file.path}"`, { cwd });
                    if (diff) {
                        content += `\`\`\`diff\n${diff}\n\`\`\`\n\n`;
                    }
                } catch (error) {
                    content += `_No diff available_\n\n`;
                }
            }

            await fs.writeFile(path.join(docPath, 'content.mdx'), content);
            await fs.writeFile(path.join(docPath, 'config.json'), JSON.stringify({
                title: `Git Changes - ${new Date().toLocaleDateString()}`,
                icon: '🔀',
                tags: ['git', 'auto-generated'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }, null, 2));

            console.log(chalk.green(`✓ Documentation generated: ${docId}`));

            if (options.output) {
                await fs.copyFile(
                    path.join(docPath, 'content.mdx'),
                    path.resolve(options.output)
                );
                console.log(chalk.green(`✓ Exported to: ${options.output}`));
            }
        } catch (error) {
            console.error(chalk.red('Error:'), error.message);
            process.exit(1);
        }
    });

// Git: Generate changelog
program
    .command('git:changelog')
    .description('Generate changelog from commits')
    .option('-f, --from <ref>', 'From commit/tag', 'HEAD~10')
    .option('-t, --to <ref>', 'To commit/tag', 'HEAD')
    .option('-o, --output <path>', 'Output file')
    .action(async (options) => {
        try {
            const cwd = process.cwd();

            console.log(chalk.cyan('📋 Generating changelog...'));

            const { stdout: commits } = await execAsync(
                `git log ${options.from}..${options.to} --pretty=format:"%h|%an|%ae|%ad|%s" --date=short`,
                { cwd }
            );

            if (!commits.trim()) {
                console.log(chalk.yellow('⚠ No commits found'));
                return;
            }

            const commitList = commits.trim().split('\n').map(line => {
                const [hash, author, email, date, message] = line.split('|');
                return { hash, author, email, date, message };
            });

            // Categorize commits
            const features = commitList.filter(c => c.message.toLowerCase().includes('feat'));
            const fixes = commitList.filter(c => c.message.toLowerCase().includes('fix'));
            const others = commitList.filter(c => !c.message.toLowerCase().match(/feat|fix/));

            let content = `# Changelog\n\n`;
            content += `**Generated:** ${new Date().toLocaleDateString()}\n`;
            content += `**Range:** ${options.from}...${options.to}\n\n`;

            if (features.length > 0) {
                content += `## 🎉 Features\n\n`;
                features.forEach(c => {
                    content += `- ${c.message} ([${c.hash}](commit/${c.hash})) - ${c.author}\n`;
                });
                content += `\n`;
            }

            if (fixes.length > 0) {
                content += `## 🐛 Bug Fixes\n\n`;
                fixes.forEach(c => {
                    content += `- ${c.message} ([${c.hash}](commit/${c.hash})) - ${c.author}\n`;
                });
                content += `\n`;
            }

            if (others.length > 0) {
                content += `## 📝 Other Changes\n\n`;
                others.forEach(c => {
                    content += `- ${c.message} ([${c.hash}](commit/${c.hash})) - ${c.author}\n`;
                });
                content += `\n`;
            }

            content += `\n**Total Commits:** ${commitList.length}\n`;

            if (options.output) {
                await fs.writeFile(options.output, content);
                console.log(chalk.green(`✓ Changelog saved to: ${options.output}`));
            } else {
                console.log(content);
            }
        } catch (error) {
            console.error(chalk.red('Error:'), error.message);
            process.exit(1);
        }
    });

// Git: Release notes
program
    .command('git:release')
    .description('Generate release notes')
    .option('-v, --version <version>', 'Version number')
    .option('-f, --from <tag>', 'From tag')
    .option('-t, --to <tag>', 'To tag', 'HEAD')
    .action(async (options) => {
        try {
            const cwd = process.cwd();
            const version = options.version || new Date().toISOString().split('T')[0];

            console.log(chalk.cyan(`📦 Generating release notes for v${version}...`));

            // Get commits
            const fromRef = options.from || `$(git describe --tags --abbrev=0)`;
            const { stdout: commits } = await execAsync(
                `git log ${fromRef}..${options.to} --pretty=format:"%h|%s|%an|%ad" --date=short`,
                { cwd }
            );

            const commitList = commits.trim().split('\n').map(line => {
                const [hash, message, author, date] = line.split('|');
                return { hash, message, author, date };
            });

            // Get changed files stats
            const { stdout: stats } = await execAsync(
                `git diff --shortstat ${fromRef}..${options.to}`,
                { cwd }
            );

            let content = `# Release Notes - v${version}\n\n`;
            content += `**Released:** ${new Date().toLocaleDateString()}\n`;
            content += `**Commits:** ${commitList.length}\n`;
            content += `**Changes:** ${stats.trim()}\n\n`;

            content += `## What's Changed\n\n`;
            commitList.forEach(c => {
                content += `- ${c.message} (${c.hash}) by @${c.author}\n`;
            });

            content += `\n## Contributors\n\n`;
            const contributors = [...new Set(commitList.map(c => c.author))];
            contributors.forEach(c => content += `- @${c}\n`);

            console.log(chalk.green('✓ Release notes generated'));
            console.log(content);
        } catch (error) {
            console.error(chalk.red('Error:'), error.message);
            process.exit(1);
        }
    });

// Analytics command
program
    .command('analytics')
    .description('Show documentation analytics')
    .option('-d, --days <days>', 'Days to analyze', '30')
    .action(async (options) => {
        try {
            const docsDir = path.join(process.cwd(), 'scriptory');
            const entries = await fs.readdir(docsDir, { withFileTypes: true });

            const stats = {
                totalDocs: 0,
                totalWords: 0,
                totalChars: 0,
                byAuthor: {},
                byTag: {},
                recentActivity: []
            };

            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    stats.totalDocs++;

                    const configPath = path.join(docsDir, entry.name, 'config.json');
                    const contentPath = path.join(docsDir, entry.name, 'content.mdx');

                    try {
                        const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
                        const content = await fs.readFile(contentPath, 'utf8');

                        stats.totalChars += content.length;
                        stats.totalWords += content.split(/\s+/).length;

                        // Track tags
                        if (config.tags) {
                            config.tags.forEach(tag => {
                                stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
                            });
                        }
                    } catch (error) {
                        // Skip invalid docs
                    }
                }
            }

            console.log(chalk.cyan('\n📊 Documentation Analytics\n'));
            console.log(chalk.green(`Total Documents: ${stats.totalDocs}`));
            console.log(chalk.green(`Total Words: ${stats.totalWords.toLocaleString()}`));
            console.log(chalk.green(`Total Characters: ${stats.totalChars.toLocaleString()}`));
            console.log(chalk.green(`Average Words/Doc: ${Math.round(stats.totalWords / stats.totalDocs)}`));

            console.log(chalk.cyan('\nTop Tags:'));
            Object.entries(stats.byTag)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .forEach(([tag, count]) => {
                    console.log(chalk.gray(`  ${tag}: ${count} documents`));
                });
        } catch (error) {
            console.error(chalk.red('Error:'), error.message);
        }
    });

program
    .command('init')
    .description('Initialize a new scriptory project in current directory')
    .option('-t, --template <type>', 'Template type: basic, dev, qa, team', 'basic')
    .action(async () => {
        await checkAndUpdate();
        const docsDir = path.join(process.cwd(), 'scriptory');

        try {
            await fs.mkdir(docsDir, { recursive: true });

            const templates = {
                basic: [
                    { id: 'getting-started', title: 'Getting Started', icon: '🚀', content: getBasicTemplate() }
                ],
                dev: [
                    { id: 'getting-started', title: 'Getting Started', icon: '🚀', content: getBasicTemplate() },
                    { id: 'api-documentation', title: 'API Documentation', icon: '📡', content: getApiTemplate() },
                    { id: 'architecture', title: 'Architecture', icon: '🏗️', content: getArchitectureTemplate() }
                ],
                qa: [
                    { id: 'getting-started', title: 'Getting Started', icon: '🚀', content: getBasicTemplate() },
                    { id: 'test-cases', title: 'Test Cases', icon: '✅', content: getTestCaseTemplate() },
                    { id: 'bug-reports', title: 'Bug Reports', icon: '🐛', content: getBugReportTemplate() }
                ],
                team: [
                    { id: 'getting-started', title: 'Getting Started', icon: '🚀', content: getBasicTemplate() },
                    { id: 'team-guide', title: 'Team Guide', icon: '👥', content: getTeamTemplate() },
                    { id: 'meeting-notes', title: 'Meeting Notes', icon: '📝', content: getMeetingTemplate() }
                ]
            };

            const selectedTemplates = templates[options.template] || templates.basic;

            for (const template of selectedTemplates) {
                const docPath = path.join(docsDir, template.id);
                await fs.mkdir(docPath, { recursive: true });

                await fs.writeFile(
                    path.join(docPath, 'config.json'),
                    JSON.stringify({
                        title: template.title,
                        icon: template.icon,
                        tags: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }, null, 2)
                );

                await fs.writeFile(
                    path.join(docPath, 'content.mdx'),
                    template.content
                );
            }

            console.log(chalk.green('✓ Project initialized successfully!'));
            console.log(chalk.cyan(`📁 Documentation folder: ${docsDir}`));
            console.log(chalk.cyan(`📋 Template: ${options.template}`));
            console.log(chalk.cyan(`📄 Created ${selectedTemplates.length} documents`));
            console.log(chalk.cyan(`\n💡 Run 'scriptory' to start the server`));
        } catch (error) {
            console.error(chalk.red('Error initializing project:'), error.message);
            process.exit(1);
        }
    });

program
    .command('export')
    .description('Export documentation to various formats')
    .option('-f, --format <type>', 'Export format: html, pdf, markdown', 'html')
    .option('-o, --output <path>', 'Output directory', './export')
    .action(async (options) => {
        console.log(chalk.cyan(`Exporting documentation as ${options.format}...`));
        console.log(chalk.yellow('Export feature coming soon!'));
    });

program
    .command('search <query>')
    .description('Search across all documents')
    .action(async (query) => {
        console.log(chalk.cyan(`Searching for: ${query}`));
        console.log(chalk.yellow('CLI search coming soon! Use web interface.'));
    });

program
    .command('get <key>')
    .description('Get a configuration value')
    .action(async (key) => {
        await checkAndUpdate();
        const config = await getConfig();
        const validKeys = ['DEEPLINK_PREFIX', 'THEME', 'TEAM_NAME'];

        if (!validKeys.includes(key)) {
            console.error(chalk.red(`Invalid key: ${key}`));
            console.log(chalk.cyan(`Valid keys: ${validKeys.join(', ')}`));
            process.exit(1);
        }

        const value = config[key] || '';
        console.log(chalk.cyan(`${key}: `) + (value || chalk.gray('(not set)')));
    });

program
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action(async (key, value) => {
        await checkAndUpdate();
        const validKeys = ['DEEPLINK_PREFIX', 'THEME', 'TEAM_NAME'];

        if (!validKeys.includes(key)) {
            console.error(chalk.red(`Invalid key: ${key}`));
            console.log(chalk.cyan(`Valid keys: ${validKeys.join(', ')}`));
            process.exit(1);
        }

        await setConfig(key, value);
        console.log(chalk.green(`✓ ${key} set to: ${value}`));
    });

program
    .command('version')
    .description('Show scriptory version')
    .action(() => {
        console.log(chalk.cyan(`scriptory v${packageJson.version}`));
    });

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

function getBasicTemplate() {
    return `# Welcome to scriptory 🚀

Your modern documentation platform with team collaboration features.

## Getting Started

1. Create documents from the sidebar
2. Use Markdown for formatting
3. Add code snippets, diagrams, and images
4. Collaborate with your team

## Features

- 📝 Rich Markdown editor with live preview
- 🔍 Full-text search
- 🏷️ Tags and categories
- 💬 Comments and discussions
- 📊 Version history
- 🎨 Dark mode support

## Quick Tips

- Use \`Cmd/Ctrl + K\` for quick navigation
- Press \`Cmd/Ctrl + S\` to save
- Use \`@username\` to mention team members
- Add tags to organize documents

Happy documenting! ✨`;
}

function getApiTemplate() {
    return `# API Documentation 📡

## Overview

This document contains API endpoint documentation.

## Base URL

\`\`\`
https://api.example.com/v1
\`\`\`

## Authentication

All API requests require authentication using Bearer tokens:

\`\`\`bash
Authorization: Bearer YOUR_API_TOKEN
\`\`\`

## Endpoints

### GET /users

Retrieve a list of users.

**Parameters:**
- \`page\` (optional): Page number
- \`limit\` (optional): Items per page

**Response:**

\`\`\`json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 100
  }
}
\`\`\`

### POST /users

Create a new user.

**Request Body:**

\`\`\`json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
\`\`\`

**Response:**

\`\`\`json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "created_at": "2024-01-23T10:00:00Z"
}
\`\`\`

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request |
| 401  | Unauthorized |
| 404  | Not Found |
| 500  | Server Error |`;
}

function getArchitectureTemplate() {
    return `# System Architecture 🏗️

## Overview

High-level architecture diagram and component descriptions.

## Architecture Diagram

\`\`\`mermaid
graph TD
    A[Client] -->|HTTPS| B[Load Balancer]
    B --> C[API Gateway]
    C --> D[Auth Service]
    C --> E[User Service]
    C --> F[Data Service]
    E --> G[(Database)]
    F --> G
    F --> H[(Cache)]
\`\`\`

## Components

### Frontend Layer
- **Web Application**: React-based SPA
- **Mobile Apps**: iOS and Android native apps

### API Layer
- **API Gateway**: Routes requests and handles rate limiting
- **Auth Service**: User authentication and authorization
- **User Service**: User management and profiles
- **Data Service**: Business logic and data processing

### Data Layer
- **Primary Database**: PostgreSQL for transactional data
- **Cache**: Redis for session and frequently accessed data
- **Object Storage**: S3 for file uploads

## Technology Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Docker, Kubernetes
- **CI/CD**: GitHub Actions`;
}

function getTestCaseTemplate() {
    return `# Test Cases ✅

## Test Suite: User Authentication

### TC-001: Successful Login

**Priority:** High
**Type:** Functional
**Status:** ✅ Passed

**Preconditions:**
- User account exists
- User is logged out

**Steps:**
1. Navigate to login page
2. Enter valid username
3. Enter valid password
4. Click "Login" button

**Expected Result:**
- User is redirected to dashboard
- Success message is displayed
- Session is created

**Actual Result:**
✅ As expected

---

### TC-002: Login with Invalid Credentials

**Priority:** High
**Type:** Negative Testing
**Status:** ✅ Passed

**Preconditions:**
- User is logged out

**Steps:**
1. Navigate to login page
2. Enter invalid username
3. Enter invalid password
4. Click "Login" button

**Expected Result:**
- Error message: "Invalid credentials"
- User remains on login page
- No session is created

**Actual Result:**
✅ As expected

---

## Test Execution Summary

| Status | Count |
|--------|-------|
| ✅ Passed | 15 |
| ❌ Failed | 2 |
| ⏸️ Blocked | 1 |
| ⏭️ Skipped | 0 |

**Test Coverage:** 85%
**Last Run:** 2024-01-23`;
}

function getBugReportTemplate() {
    return `# Bug Report 🐛

## BUG-001: Login Button Not Responsive on Mobile

**Severity:** High
**Priority:** P1
**Status:** 🔴 Open
**Assigned To:** @developer

### Description

The login button on the mobile app becomes unresponsive after multiple rapid taps.

### Steps to Reproduce

1. Open mobile app (iOS)
2. Navigate to login screen
3. Tap login button rapidly 5-6 times
4. Button stops responding

### Expected Behavior

Button should remain responsive and prevent multiple submissions with a loading state.

### Actual Behavior

Button becomes completely unresponsive. User must restart the app.

### Environment

- **Device:** iPhone 14 Pro
- **OS:** iOS 17.2
- **App Version:** 2.3.1
- **Build:** 450

### Screenshots

[Attach screenshots here]

### Logs

\`\`\`
[2024-01-23 10:15:32] ERROR: Touch event handler failed
[2024-01-23 10:15:32] ERROR: Button state locked
\`\`\`

### Additional Notes

This issue started appearing after the v2.3.0 update. Possibly related to the new debounce implementation.

### Related Issues

- Related to BUG-045
- Might be caused by fix for BUG-032`;
}

function getTeamTemplate() {
    return `# Team Guide 👥

## Team Structure

### Development Team
- **Team Lead:** @john
- **Senior Developers:** @sarah, @mike
- **Developers:** @alex, @emma, @ryan

### QA Team
- **QA Lead:** @lisa
- **QA Engineers:** @tom, @anna

### Product Team
- **Product Manager:** @david
- **Product Designer:** @maria

## Communication Channels

- **Slack:** #general, #development, #qa, #product
- **Email:** team@example.com
- **Meetings:** Daily standup at 10 AM

## Workflows

### Development Workflow

\`\`\`mermaid
graph LR
    A[Create Issue] --> B[Create Branch]
    B --> C[Develop]
    C --> D[Create PR]
    D --> E[Code Review]
    E --> F[QA Testing]
    F --> G[Merge to Main]
    G --> H[Deploy]
\`\`\`

### Code Review Process

1. Create pull request with description
2. Request review from 2+ team members
3. Address all comments
4. Get approval from QA
5. Merge when all checks pass

## Best Practices

- Write clear commit messages
- Add tests for new features
- Update documentation
- Follow code style guidelines
- Review PRs within 24 hours

## Onboarding Checklist

- [ ] Setup development environment
- [ ] Access to repositories
- [ ] Join communication channels
- [ ] Read documentation
- [ ] Complete security training
- [ ] Meet the team`;
}

function getMeetingTemplate() {
    return `# Meeting Notes 📝

## Sprint Planning - Week 4

**Date:** January 23, 2024
**Time:** 10:00 AM - 11:30 AM
**Attendees:** @john, @sarah, @mike, @lisa, @david

### Agenda

1. Sprint 3 Retrospective
2. Sprint 4 Planning
3. Technical Discussions
4. Action Items

### Sprint 3 Retrospective

**What went well:**
- Feature X delivered on time
- Improved test coverage to 85%
- Better communication within team

**What to improve:**
- Reduce PR review time
- More frequent deployments
- Better estimation accuracy

### Sprint 4 Goals

**Committed Stories:**
- USER-101: User profile page redesign (8 points)
- API-205: New authentication endpoint (5 points)
- BUG-150: Fix mobile navigation (3 points)
- TECH-75: Database optimization (5 points)

**Total Points:** 21

### Technical Discussions

**Topic: Migration to TypeScript**
- Decision: Start with new modules
- Timeline: Q1 2024
- Owner: @mike

### Action Items

- [ ] @john: Setup CI/CD pipeline improvements
- [ ] @sarah: Review and approve architecture proposal
- [ ] @lisa: Create test plan for Sprint 4
- [ ] @david: Update product roadmap

### Next Meeting

**Date:** January 30, 2024
**Time:** 10:00 AM`;
}

program.parse();
