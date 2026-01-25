import DocumentItem from './DocumentItem';

export default ({ documents, onDelete, toggleFavorite }) => {
    if (documents.length === 0) {
        return (
            <div className="py-8 text-center text-gray-500">
                <p className="text-sm">No documents yet</p>
                <p className="mt-1 text-xs">Create your first document to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {documents.map((doc) => (
                <DocumentItem key={doc.id} document={doc} onDelete={onDelete} toggleFavorite={toggleFavorite} />
            ))}
        </div>
    );
};
