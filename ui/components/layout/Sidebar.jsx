import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Plus, Settings as SettingsIcon } from 'lucide-react'
import { useDocuments } from '@/hooks/useDocuments'
import DocumentList from '../documents/DocumentList'
import NewDocumentDialog from '../documents/NewDocumentDialog'

export default function Sidebar({ isOpen }) {
    const { documents, createDocument, deleteDocument } = useDocuments()
    const [showNewDialog, setShowNewDialog] = useState(false)
    const navigate = useNavigate()

    const handleCreateDocument = async (data) => {
        const newDoc = await createDocument(data)
        setShowNewDialog(false)
        navigate(`/document/${newDoc.id}`)
    }

    return (
        <aside
            className="sidebar flex flex-col overflow-hidden"
            style={{
                width: isOpen ? '220px' : '0',
                minWidth: isOpen ? '220px' : '0',
                transition: 'width 250ms ease, min-width 250ms ease',
            }}
        >
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
                <BookOpen className="w-4 h-4" style={{ color: '#818cf8' }} />
                <Link to="/" className="text-sm font-semibold tracking-wide" style={{ color: 'var(--sidebar-fg)' }}>
                    scriptory
                </Link>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-2 py-3">
                <button
                    className="sidebar-item w-full mb-1"
                    onClick={() => setShowNewDialog(true)}
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New document</span>
                    <span className="ml-auto text-xs opacity-40">⌘N</span>
                </button>

                {documents.length > 0 && (
                    <div className="sidebar-section-label">Pages</div>
                )}

                <DocumentList documents={documents} onDelete={deleteDocument} />
            </div>

            {/* Footer */}
            <div className="px-2 py-2 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
                <Link to="/settings" className="sidebar-item block">
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <span>Settings</span>
                </Link>
            </div>

            <NewDocumentDialog
                open={showNewDialog}
                onOpenChange={setShowNewDialog}
                onSubmit={handleCreateDocument}
            />
        </aside>
    )
}
