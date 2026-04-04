import { getFileExtension } from '@/utils/markdown'

const EXT_COLORS = {
    javascript: 'bg-yellow-100 text-yellow-700',
    typescript: 'bg-blue-100 text-blue-700',
    python:     'bg-green-100 text-green-700',
    rust:       'bg-orange-100 text-orange-700',
    go:         'bg-cyan-100 text-cyan-700',
    css:        'bg-pink-100 text-pink-700',
    html:       'bg-red-100 text-red-700',
    json:       'bg-purple-100 text-purple-700',
    markdown:   'bg-gray-100 text-gray-700',
}

export default function CodeFileItem({ file, onClick }) {
    const ext = getFileExtension(file.name)
    const colorClass = EXT_COLORS[ext] || 'bg-gray-100 text-gray-600'

    const parts = file.path.split('/')
    const fileName = parts.pop()
    const dir = parts.join('/') + (parts.length ? '/' : '')

    return (
        <button
            onClick={onClick}
            className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 flex items-center gap-3 group transition-colors"
        >
            <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 ${colorClass}`}>
                {ext}
            </span>
            <span className="text-sm font-mono min-w-0 truncate">
                <span className="text-gray-400 text-xs">{dir}</span>
                <span className="text-gray-700 group-hover:text-indigo-700">{fileName}</span>
            </span>
        </button>
    )
}
