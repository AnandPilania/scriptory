# scriptory

A lightweight, local-first internal documentation tool with a Markdown editor. Think Notion, but it runs entirely on your machine and stores everything as plain `.mdx` files in your repo.

## Install

```bash
npm install -g scriptory
```

## Usage

```bash
# Start the server (opens browser automatically)
scriptory

# On a custom port
scriptory --port 8080

# Initialise a new project in the current directory
scriptory init

# Check for updates
scriptory update

# Configure editor deeplinks (e.g. open files in VS Code)
scriptory set DEEPLINK_PREFIX vscode://file
scriptory get DEEPLINK_PREFIX
```

## How it works

Running `scriptory` in a project directory starts an Express server at `http://localhost:6767` and opens the UI in your browser. Documentation is stored inside a `scriptory/` folder in the current directory — each page is a sub-folder containing:

```
scriptory/
  getting-started/
    config.json      ← title + icon
    content.mdx      ← Markdown content
  architecture/
    config.json
    content.mdx
```

Because everything is plain files, docs live alongside your code and are committed to version control.

## Features

- **Markdown + MDX** — GFM tables, fenced code blocks with syntax highlighting
- **Insert code files** — Browse your project and embed files as code blocks in one click
- **Deep links** — Configure a prefix (e.g. `vscode://file`) to make file paths in docs clickable
- **Keyboard shortcuts** — `⌘S` to save, `⌘P` to toggle preview, `⌘N` for a new doc
- **Zero cloud** — everything stays local; no accounts, no sync, no tracking

## Development

```bash
git clone https://github.com/anandpilania/scriptory
cd scriptory
npm install

# Run backend + frontend dev servers concurrently
npm run dev
```

The frontend (Vite + React) runs on `:3000` and proxies `/api` to the backend on `:6767`.

## License

MIT
