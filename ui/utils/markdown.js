import { marked } from 'marked'
import hljs from 'highlight.js'

// Configure marked with syntax highlighting and sane defaults
const renderer = new marked.Renderer()

renderer.code = function ({ text, lang }) {
    const language = lang && hljs.getLanguage(lang) ? lang : null
    const highlighted = language
        ? hljs.highlight(text, { language }).value
        : hljs.highlightAuto(text).value
    const langLabel = language || 'text'
    return `<div class="code-block">
  <div class="code-header"><span class="code-lang">${langLabel}</span></div>
  <pre><code class="hljs language-${langLabel}">${highlighted}</code></pre>
</div>`
}

renderer.blockquote = function ({ tokens }) {
    const body = this.parser.parse(tokens)
    return `<blockquote class="md-blockquote">${body}</blockquote>`
}

marked.use({
    renderer,
    gfm: true,
    breaks: true,
})

export function renderMarkdown(text) {
    if (!text) return ''
    try {
        return marked.parse(text)
    } catch (err) {
        console.error('Markdown parse error:', err)
        return `<pre>${text}</pre>`
    }
}

export function getFileExtension(filename) {
    const ext = filename.split('.').pop()
    const extMap = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        py: 'python',
        go: 'go',
        java: 'java',
        rs: 'rust',
        cpp: 'cpp',
        c: 'c',
        sh: 'bash',
        yml: 'yaml',
        yaml: 'yaml',
        json: 'json',
        md: 'markdown',
        mdx: 'markdown',
        html: 'html',
        css: 'css',
    }
    return extMap[ext] || ext
}
