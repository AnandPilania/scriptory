import DocumentItem from './DocumentItem'

export default function DocumentList({ documents, onDelete }) {
  if (documents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">No documents yet</p>
        <p className="text-xs mt-1">Create your first document to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {documents.map(doc => (
        <DocumentItem
          key={doc.id}
          document={doc}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
