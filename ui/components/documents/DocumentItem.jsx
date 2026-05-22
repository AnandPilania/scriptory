import { Link, useParams } from 'react-router-dom'
import { Trash2, Lock } from 'lucide-react'
import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { staggerItem } from '@/components/motion/variants'

const DocumentItem = forwardRef(({ document, onDelete }, ref) => {
    const { id: currentId } = useParams()
    const isActive = currentId === document.id

    return (
        <motion.div
        ref={ref}
            variants={staggerItem}
            layout
            exit={{ opacity: 0, x: -8, height: 0 }}
            transition={{ duration: 0.15 }}
            className="group relative"
        >
            <Link
                to={`/document/${document.id}`}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
                <span className="text-sm leading-none shrink-0">{document.icon}</span>
                <span className="flex-1 truncate text-xs">{document.title}</span>
                {document.locked && (
                    <Lock className="w-2.5 h-2.5 shrink-0 opacity-40" />
                )}
            </Link>

            <button
                onClick={(e) => { e.preventDefault(); onDelete(document.id) }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-opacity"
                style={{ color: '#f87171' }}
                title="Delete document"
            >
                <Trash2 className="w-2.5 h-2.5" />
            </button>
        </motion.div>
    )
})

export default DocumentItem
