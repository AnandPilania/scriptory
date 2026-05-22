import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

function stats(content = '') {
    const text   = content.replace(/```[\s\S]*?```/g, '').replace(/[#*`_>~\[\]()!-]/g, '')
    const words  = text.trim().split(/\s+/).filter(Boolean).length
    const chars  = content.length
    const mins   = Math.max(1, Math.round(words / 200))
    return { words, chars, mins }
}

export default function EditorFooter({ content = '', docId, docTitle }) {
    const { words, chars, mins } = useMemo(() => stats(content), [content])

    const handleExport = () => {
        const url = `http://localhost:6767/api/documents/${docId}/export`
        const a = document.createElement('a')
        a.href = url
        a.download = `${(docTitle || 'document').toLowerCase().replace(/\s+/g, '-')}.md`
        a.click()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 px-6 py-1.5 border-t border-gray-100 shrink-0 select-none"
            style={{ background: '#fafafa', fontSize: 11 }}
        >
            <span className="text-gray-400">
                {words.toLocaleString()} word{words !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">
                {chars.toLocaleString()} chars
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">
                ~{mins} min read
            </span>

            <div className="flex-1" />

            <button
                onClick={handleExport}
                className="flex items-center gap-1 text-gray-400 hover:text-indigo-500 transition-colors"
                title="Export as Markdown"
            >
                <Download className="w-3 h-3" />
                Export .md
            </button>
        </motion.div>
    )
}
