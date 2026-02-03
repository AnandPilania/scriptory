import { Link, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DocumentItem({ document, onDelete }) {
  const { id: currentId } = useParams()
  const isActive = currentId === document.id

  return (
    <div className="group relative">
      <Link
        to={`/document/${document.id}`}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <span>{document.icon}</span>
        <span className="flex-1 truncate">{document.title}</span>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-8 w-8"
        onClick={(e) => {
          e.preventDefault()
          onDelete(document.id)
        }}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  )
}
