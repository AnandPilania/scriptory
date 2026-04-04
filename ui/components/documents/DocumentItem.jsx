import { Link, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

export default function DocumentItem({ document, onDelete }) {
    const { id: currentId } = useParams()
    const isActive = currentId === document.id

    return (
        <div className="group relative">
            <Link
                to={`/document/${document.id}`}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
                <span className="text-sm leading-none">{document.icon}</span>
                <span className="flex-1 truncate">{document.title}</span>
            </Link>

            <button
                onClick={(e) => { e.preventDefault(); onDelete(document.id) }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity"
                title="Delete document"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    )
}
