import DocumentItem from './DocumentItem';
import { FileText } from 'lucide-react';

export default function DocumentList({ documents, onDelete }) {
    if (documents.length === 0) {
        return (
            <div className="text-center py-8 px-4">
                <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No documents yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Click "New Document" to get started
                </p>
            </div>
        );
    }

    return (
        <nav className="space-y-0.5">
            {documents.map(doc => (
                <DocumentItem
                    key={doc.id}
                    document={doc}
                    onDelete={onDelete}
                />
            ))}
        </nav>
    );
}
