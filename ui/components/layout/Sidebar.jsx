import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Plus, Settings as SettingsIcon, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDocuments } from '@/hooks/useDocuments'
import DocumentList from '../documents/DocumentList'
import NewDocumentDialog from '../documents/NewDocumentDialog'

export default function Sidebar({ isOpen, onOpenSearch }) {
    const { documents, createDocument, deleteDocument } = useDocuments()
    const [showNewDialog, setShowNewDialog] = useState(false)
    const navigate = useNavigate()

    const handleCreate = async (data) => {
        const newDoc = await createDocument(data)
        setShowNewDialog(false)
        navigate(`/document/${newDoc.id}`)
    }

    return (
        <motion.aside
            animate={{ width: isOpen ? 220 : 0, minWidth: isOpen ? 220 : 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 35 }}
            className="sidebar flex flex-col overflow-hidden shrink-0"
        >
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(99,102,241,0.2)' }}>
                    <BookOpen className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                </div>
                <Link to="/" className="text-sm font-semibold tracking-wide whitespace-nowrap" style={{ color: 'var(--sidebar-fg)' }}>
                    scriptory
                </Link>
            </div>

            {/* Actions */}
            <div className="flex-1 overflow-y-auto px-2 py-3">
                {/* Search */}
                <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                    onClick={onOpenSearch}
                    className="sidebar-item w-full mb-1"
                >
                    <Search className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span className="opacity-60 text-xs">Search…</span>
                    <span className="ml-auto text-xs opacity-30 font-mono">⌘K</span>
                </motion.button>

                {/* New document */}
                <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowNewDialog(true)}
                    className="sidebar-item w-full mb-2"
                >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>New document</span>
                    <span className="ml-auto text-xs opacity-30 font-mono">⌘N</span>
                </motion.button>

                {documents.length > 0 && (
                    <p className="sidebar-section-label">Pages</p>
                )}

                <DocumentList documents={documents} onDelete={deleteDocument} />
            </div>

            {/* Footer */}
            <div className="px-2 py-2 border-t shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
                <Link to="/settings">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                        <div className="sidebar-item">
                            <SettingsIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>Settings</span>
                        </div>
                    </motion.div>
                </Link>
            </div>

            <NewDocumentDialog open={showNewDialog} onOpenChange={setShowNewDialog} onSubmit={handleCreate} />
        </motion.aside>
    )
}
