import { Link, useNavigate } from 'react-router-dom'
import { FileText, Plus, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocuments } from '@/hooks/useDocuments'
import DocumentList from '../documents/DocumentList'
import NewDocumentDialog from '../documents/NewDocumentDialog'
import { useState } from 'react'

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
    <div className={`${isOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <FileText className="w-6 h-6" />
          Scriptory
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Button
          onClick={() => setShowNewDialog(true)}
          className="w-full mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </Button>

        <DocumentList
          documents={documents}
          onDelete={deleteDocument}
        />
      </div>

      <div className="p-4 border-t border-gray-200">
        <Link to="/settings">
          <Button variant="ghost" className="w-full justify-start">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      <NewDocumentDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSubmit={handleCreateDocument}
      />
    </div>
  )
}
