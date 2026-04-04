import DocumentItem from './DocumentItem'

export default function DocumentList({ documents, onDelete }) {
    if (documents.length === 0) {
        return (
            <div className="px-3 py-6 text-center" style={{ color: 'var(--sidebar-muted)' }}>
                <p className="text-xs">No documents yet.</p>
                <p className="text-xs mt-0.5 opacity-60">Click "New document" above.</p>
            </div>
        )
    }

    return (
        <div className="space-y-px">
            {documents.map(doc => (
                <DocumentItem key={doc.id} document={doc} onDelete={onDelete} />
            ))}
        </div>
    )
}
