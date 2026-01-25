export function renderMarkdown(text) {
    if (!text) return ''

    let html = text

    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        const imageUrl = url.startsWith('/') ? `http://localhost:6767${url}` : url
        return `<img src="${imageUrl}" alt="${alt}" class="max-w-full h-auto rounded-lg shadow-md my-4" />`
    })
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">${escapeHtml(code)}</code></pre>`
    })
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-pink-600 dark:text-pink-400">$1</code>')
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc my-2 space-y-1">$1</ul>')
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-700 dark:text-gray-300">$1</blockquote>')
    html = html.replace(/^---$/gim, '<hr class="my-8 border-gray-300 dark:border-gray-700">')
    html = html.replace(/\n/g, '<br>')

    return html
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
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
        'c': 'c',
        'html': 'html',
        'css': 'css',
        'json': 'json'
    }
    return extMap[ext] || ext
}
