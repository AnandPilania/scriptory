# scriptory 📚

> **Advanced Internal Documentation Platform** with Notion-like Editor, Team Collaboration, and Version Control

![Version](https://img.shields.io/badge/version-0.0.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

scriptory is a modern, self-hosted documentation platform designed for development teams. It combines the power of a Notion-like block editor with advanced features like version control, team collaboration, and code integration.

## ✨ Features

### 🎨 **Notion-like Block Editor**
- **Block-based editing** with support for multiple content types
- **Slash commands** (`/`) for quick block creation
- **Drag & drop** block reordering
- **Rich text formatting**: Headings, lists, code blocks, quotes, and more
- **To-do lists** with checkboxes
- **Code blocks** with syntax highlighting
- **Real-time preview** mode

### 👥 **Team Collaboration**
- **Comments & Discussions** on documents
- **Nested replies** for threaded conversations
- **Inline comments** on specific code lines
- **@mentions** support (coming soon)
- **Team activity dashboard** showing recent edits, comments, and updates
- **Real-time collaboration** indicators

### 🔄 **Version Control**
- **Auto-save versions** on every edit
- **Version history** viewer
- **Restore previous versions** with one click
- **Diff viewer** to compare changes
- **Commit messages** for manual saves
- Keep last 20 versions automatically

### 🎯 **Developer-Friendly**
- **Code file browser** - Insert code snippets from your project
- **Syntax highlighting** for 20+ languages
- **Deeplink support** - Open files directly in your code editor
- **Templates** - API docs, test cases, bug reports, team guides
- **Tag system** for organization
- **Full-text search** across all documents

### 🎨 **Modern UI/UX**
- **Beautiful dark mode** with smooth transitions
- **Responsive design** - works on desktop, tablet, and mobile
- **Keyboard shortcuts** for power users
- **Command palette** (⌘K / Ctrl+K) for quick navigation
- **Glassmorphism** design with gradients and shadows
- **Accessible** components using Radix UI primitives

### 📁 **File Management**
- **File uploads** - Images, PDFs, documents
- **Drag & drop** file support
- **Image preview** in markdown
- **Attachment management**

## 🚀 Quick Start

### Installation

#### Quick Install
**Linux/macOS/Git Bash:**
```bash
curl -fsSL https://raw.githubusercontent.com/anandpilania/scriptory/main/scripts/install.sh | bash
```

**Windows PowerShell:**
```powershell
iwr -useb https://raw.githubusercontent.com/anandpilania/scriptory/main/scripts/install.ps1 | iex
```

**Using npm (Global Install):**
```bash
npm install -g @anandpilania/scriptory
```

**Or clone and build:**
```bash
git clone https://github.com/anandpilania/scriptory.git
cd scriptory
npm install
npm run build:frontend
npm link
```

### Initialize Project

```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize scriptory
scriptory init

# Or with a template
scriptory init --template dev   # For developers
scriptory init --template qa    # For QA teams
scriptory init --template team  # For general teams
```

### Start Server

```bash
# Start with default port (6767)
scriptory

# Or specify custom port
scriptory --port 8080

# Start without opening browser
scriptory --no-browser
```

The server will automatically open your browser to `http://localhost:6767`

## 📖 Usage Guide

### CLI Commands

```bash
# Initialize a new project
scriptory init [--template <type>]

# Start the server
scriptory [--port <port>] [--no-browser]

# Configuration management
scriptory get <key>              # Get config value
scriptory set <key> <value>      # Set config value

# Version management
scriptory version                # Show current version
scriptory update                 # Update to latest version

# Coming soon
scriptory export [--format html|pdf|markdown]
scriptory search <query>
```

### Configuration Keys

| Key               | Description                             | Example                 |
| ----------------- | --------------------------------------- | ----------------------- |
| `DEEPLINK_PREFIX` | Prefix for opening files in your editor | `vscode://file`         |
| `THEME`           | UI theme preference                     | `light`, `dark`, `auto` |
| `TEAM_NAME`       | Your team's name                        | `Engineering Team`      |

### Editor Features

#### Block Types
Type `/` to open the block menu:

- **Text** - Regular paragraph
- **Heading 1-3** - `# ## ###` or `/h1 /h2 /h3`
- **Bullet List** - `/ul` or `-`
- **Numbered List** - `/ol` or `1.`
- **To-do List** - `/todo` or `- [ ]`
- **Code Block** - `/code` or ` ``` `
- **Quote** - `/quote` or `>`
- **Divider** - `/divider` or `---`

#### Keyboard Shortcuts

| Shortcut                  | Action               |
| ------------------------- | -------------------- |
| `⌘/Ctrl + S`              | Save document        |
| `⌘/Ctrl + K`              | Open command palette |
| `⌘/Ctrl + P`              | Toggle preview       |
| `/`                       | Open block menu      |
| `Enter`                   | New block            |
| `Backspace` (empty block) | Delete block         |
| `ESC`                     | Close dialogs        |

### Collaboration

**Adding Comments:**
1. Click the "Comments" button in the toolbar
2. Type your comment in the sidebar
3. Press "Comment" to post

**Replying to Comments:**
1. Click "Reply" on any comment
2. Type your reply
3. Click "Reply" button

**Inline Code Comments:**
1. Select a code block or line
2. Click the comment icon
3. Add context-specific feedback

### Templates

scriptory comes with pre-built templates:

**Development Templates:**
- **API Documentation** - Endpoint specs, request/response examples
- **Architecture Docs** - System design, diagrams
- **Technical Specs** - Feature specifications

**QA Templates:**
- **Test Cases** - Test scenarios, steps, expected results
- **Bug Reports** - Issue tracking template
- **Test Plans** - QA planning and coverage

**Team Templates:**
- **Meeting Notes** - Structured meeting documentation
- **Team Guide** - Onboarding and processes
- **Project Overview** - High-level project information

## 🏗️ Architecture

### Project Structure

```
scriptory/
├── bin/
│   └── scriptory.js          # CLI entry point
├── lib/
│   ├── server.js            # Express server
│   ├── config.js            # Configuration management
│   └── updater.js           # Auto-update functionality
├── ui/
│   ├── components/
│   │   ├── ui/          # shadcn/ui primitives
│   │   ├── layout/      # Layout components
│   │   ├── editor/      # Notion-like editor
│   │   ├── documents/   # Document management
│   │   ├── collaboration/ # Comments, mentions
│   │   └── version-control/ # Version history
│   ├── pages/           # Route pages
│   ├── hooks/           # React hooks
│   ├── services/        # API services
│   ├── contexts/        # React contexts
│   └── utils/           # Utilities
├── public/                  # Built frontend
├── scripts/
│   └── install.sh          # Installation script
├── index.html
├── vite.config.js
├── components.json
└── package.json            # Root package
```

### Tech Stack

**Backend:**
- Node.js + Express
- File-based storage (MDX)
- Multer (file uploads)
- Marked (Markdown parsing)

**Frontend:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- shadcn/ui (components)
- Radix UI (primitives)
- Lucide React (icons)
- React Router (routing)

## 🔧 Development

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/anandpilania/scriptory.git
cd scriptory

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Build frontend
npm run build:frontend

# Link for global use (optional)
npm link
```

### Development Mode

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend (hot reload)
cd frontend
npm run dev
```

Frontend dev server runs on `http://localhost:3000` and proxies API calls to backend on port 6767.

### Building

```bash
# Build frontend for production
npm run build:frontend

# Frontend build outputs to public/
```

## 📝 File Structure

### Document Storage

```
your-project/
└── scriptory/
    ├── .uploads/           # Uploaded files
    ├── .versions/          # Version history
    │   └── {doc-id}/
    │       └── {timestamp}.json
    └── {document-id}/
        ├── config.json     # Document metadata
        ├── content.mdx     # Document content
        └── comments.json   # Comments data
```

### Config File

Located at `~/.config/scriptory/config.json`:

```json
{
  "DEEPLINK_PREFIX": "vscode://file",
  "THEME": "dark",
  "TEAM_NAME": "Engineering Team",
  "initialized": true
}
```

## 🎯 Use Cases

### For Development Teams
- **API Documentation** - Document REST/GraphQL APIs
- **Technical Specs** - Write detailed feature specifications
- **Architecture Docs** - Document system design
- **Code Reviews** - Comment on code snippets
- **Onboarding** - Create team guides

### For QA Teams
- **Test Cases** - Document test scenarios
- **Bug Reports** - Track issues with templates
- **Test Plans** - Plan testing coverage
- **Release Notes** - Document releases

### For Product Teams
- **Feature Specs** - Define product requirements
- **Meeting Notes** - Collaborative note-taking
- **User Stories** - Document user journeys
- **Roadmaps** - Plan product direction

## 🔐 Security

- **Local-first** - All data stored locally
- **No external services** - Completely self-hosted
- **File access controls** - Secure file operations
- **XSS protection** - Sanitized markdown rendering

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Use ESLint configuration
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Icon library
- Inspired by [Notion](https://notion.so)

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/anandpilania/scriptory/issues)
- **Discussions:** [GitHub Discussions](https://github.com/anandpilania/scriptory/discussions)
- **Email:** support@scriptory.com

## 🗺️ Roadmap

- [ ] Real-time collaboration with WebSockets
- [ ] Export to PDF/HTML
- [ ] Database support (PostgreSQL, MongoDB)
- [ ] User authentication and permissions
- [ ] Mobile apps (iOS, Android)
- [ ] AI-powered documentation generation
- [ ] Integration with Slack, Teams, Discord
- [ ] Custom themes and branding
- [ ] Plugin system
- [ ] Advanced analytics

## ⭐ Star History

If you find scriptory useful, please consider giving it a star on GitHub!

---

**Made with ❤️ by the scriptory Team**

[Website](https://github.com/anandpilania) • [Documentation](https://github.com/anandpilania/scriptory) • [Twitter](https://twitter.com/anandpilania)
