export function renderMarkdown(text) {
    if (!text) return ''

    let html = text

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">$2</code></pre>')

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc my-2">$1</ul>')

    // Line breaks
    html = html.replace(/\n/g, '<br>')

    return html
}

export function getFileExtension(filename) {
    const ext = filename.split('.').pop()
    const extMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'go': 'go',
        'java': 'java',
        'rs': 'rust',
        'cpp': 'cpp',
        'c': 'c'
    }
    return extMap[ext] || ext
}
