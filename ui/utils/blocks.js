// ── Block type registry ──────────────────────────────────────

export const BLOCK_TYPES = [
    { type: 'paragraph', icon: '¶', label: 'Text', desc: 'Plain paragraph', shortcut: null },
    { type: 'h1', icon: 'H1', label: 'Heading 1', desc: 'Big section heading', shortcut: '#' },
    { type: 'h2', icon: 'H2', label: 'Heading 2', desc: 'Medium section heading', shortcut: '##' },
    { type: 'h3', icon: 'H3', label: 'Heading 3', desc: 'Small section heading', shortcut: '###' },
    { type: 'bulletList', icon: '•', label: 'Bullet List', desc: 'Unordered list', shortcut: '-' },
    { type: 'numberedList', icon: '1.', label: 'Numbered List', desc: 'Ordered list', shortcut: '1.' },
    { type: 'todo', icon: '☐', label: 'To-do', desc: 'Trackable checklist item', shortcut: '[]' },
    { type: 'quote', icon: '"', label: 'Quote', desc: 'Callout or quotation', shortcut: '>' },
    { type: 'code', icon: '</>', label: 'Code', desc: 'Code block with highlights', shortcut: '```' },
    { type: 'callout', icon: '💡', label: 'Callout', desc: 'Highlighted info box', shortcut: '!!' },
    { type: 'divider', icon: '—', label: 'Divider', desc: 'Visual section break', shortcut: '---' },
]

let _counter = 0
export function createBlock(type = 'paragraph', content = '', extra = {}) {
    return { id: `b${++_counter}_${Date.now()}`, type, content, checked: false, language: 'text', ...extra }
}

// ── Markdown → Blocks ────────────────────────────────────────

export function deserializeMarkdown(markdown = '') {
    if (!markdown.trim()) return [createBlock('paragraph')]

    const lines = markdown.split('\n')
    const blocks = []
    let i = 0

    while (i < lines.length) {
        const line = lines[i]

        // Skip pure blank lines that aren't meaningful
        if (!line.trim()) { i++; continue }

        // Fenced code block
        if (line.startsWith('```')) {
            const lang = line.slice(3).trim() || 'text'
            const codeLines = []
            i++
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i])
                i++
            }
            blocks.push(createBlock('code', codeLines.join('\n'), { language: lang }))
            i++; continue
        }

        // Headings
        if (line.startsWith('### ')) { blocks.push(createBlock('h3', line.slice(4))); i++; continue }
        if (line.startsWith('## ')) { blocks.push(createBlock('h2', line.slice(3))); i++; continue }
        if (line.startsWith('# ')) { blocks.push(createBlock('h1', line.slice(2))); i++; continue }

        // Divider
        if (/^-{3,}$/.test(line.trim())) { blocks.push(createBlock('divider')); i++; continue }

        // Todo
        if (line.startsWith('- [ ] ') || line.startsWith('- [ ]\t')) { blocks.push(createBlock('todo', line.slice(6), { checked: false })); i++; continue }
        if (/^- \[x\] /i.test(line)) { blocks.push(createBlock('todo', line.slice(6), { checked: true })); i++; continue }

        // Callout (!! prefix convention)
        if (line.startsWith('!! ')) { blocks.push(createBlock('callout', line.slice(3))); i++; continue }

        // Bullet
        if (line.match(/^[-*] /)) { blocks.push(createBlock('bulletList', line.slice(2))); i++; continue }

        // Numbered
        const numMatch = line.match(/^\d+\. (.+)/)
        if (numMatch) { blocks.push(createBlock('numberedList', numMatch[1])); i++; continue }

        // Quote
        if (line.startsWith('> ')) { blocks.push(createBlock('quote', line.slice(2))); i++; continue }

        // Paragraph
        blocks.push(createBlock('paragraph', line))
        i++
    }

    return blocks.length ? blocks : [createBlock('paragraph')]
}

// ── Blocks → Markdown ────────────────────────────────────────

export function serializeBlocks(blocks) {
    const parts = []

    for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i]
        const prev = blocks[i - 1]

        // List items of the same type: no extra blank line between them
        const sameList = prev &&
            ['bulletList', 'numberedList', 'todo'].includes(b.type) &&
            prev.type === b.type

        if (i > 0 && !sameList) parts.push('')

        // Count run of same list type for numbered lists
        let listNum = 1
        if (b.type === 'numberedList') {
            for (let j = i - 1; j >= 0 && blocks[j].type === 'numberedList'; j--) listNum++
        }

        switch (b.type) {
            case 'h1': parts.push(`# ${b.content}`); break
            case 'h2': parts.push(`## ${b.content}`); break
            case 'h3': parts.push(`### ${b.content}`); break
            case 'bulletList': parts.push(`- ${b.content}`); break
            case 'numberedList': parts.push(`${listNum}. ${b.content}`); break
            case 'todo': parts.push(`- ${b.checked ? '[x]' : '[ ]'} ${b.content}`); break
            case 'quote': parts.push(`> ${b.content}`); break
            case 'callout': parts.push(`!! ${b.content}`); break
            case 'code': parts.push(`\`\`\`${b.language || 'text'}\n${b.content}\n\`\`\``); break
            case 'divider': parts.push('---'); break
            default: parts.push(b.content); break
        }
    }

    return parts.join('\n')
}
