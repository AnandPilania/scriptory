import { Link, useParams } from 'react-router-dom';
import { Trash2, FileText } from 'lucide-react';

export default function DocumentItem({ document, onDelete }) {
    const { id: currentId } = useParams();
    const isActive = currentId === document.id;

    return (
        <div className="group relative">
            <Link
                to={`/document/${document.id}`}
                className={[
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm',
                    isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                ].join(' ')}
            >
                <span className="text-base leading-none shrink-0">
                    {document.icon || <FileText className="w-4 h-4" />}
                </span>
                <span className="flex-1 truncate">{document.title}</span>
            </Link>

            <button
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                onClick={(e) => {
                    e.preventDefault();
                    if (confirm(`Delete "${document.title}"?`)) onDelete(document.id);
                }}
                title="Delete document"
            >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
        </div>
    );
}
