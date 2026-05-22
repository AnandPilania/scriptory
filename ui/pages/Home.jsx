import { Link } from 'react-router-dom';
import { FileText, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { useConfig } from '@/hooks/useConfig';
import { useState } from 'react';
import NewDocumentDialog from '@/components/documents/NewDocumentDialog';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { documents, loading, createDocument } = useDocuments();
    const { config, initProject } = useConfig();
    const navigate = useNavigate();
    const [showNew, setShowNew] = useState(false);

    const handleInit = async () => {
        try {
            await initProject();
            window.location.reload();
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (data) => {
        const newDoc = await createDocument(data);
        setShowNew(false);
        navigate(`/document/${newDoc.id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-sm text-gray-400 animate-pulse">Loading…</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="max-w-lg w-full text-center">
                {/* Logo */}
                <div className="mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Scriptory</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Your team's documentation workspace
                    </p>
                </div>

                {!config.initialized ? (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Initialize Project
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Create a <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">/scriptory</code> folder
                            in this directory to start storing docs.
                        </p>
                        <Button onClick={handleInit} size="lg" className="w-full">
                            Initialize Project
                        </Button>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No documents yet
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Create your first document or use a template to get started.
                        </p>
                        <Button onClick={() => setShowNew(true)} size="lg" className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            New Document
                        </Button>
                    </div>
                ) : (
                    <div className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Documents</span>
                            <Button variant="ghost" size="sm" onClick={() => setShowNew(true)}>
                                <Plus className="w-4 h-4 mr-1" />
                                New
                            </Button>
                        </div>
                        {documents.slice(0, 8).map(doc => (
                            <Link
                                key={doc.id}
                                to={`/document/${doc.id}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                                <span className="text-xl">{doc.icon}</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.title}</span>
                                <FileText className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                            </Link>
                        ))}
                    </div>
                )}

                {/* Shortcuts hint */}
                <p className="mt-4 text-xs text-gray-400">
                    Press <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">⌘K</kbd> to search
                </p>
            </div>

            <NewDocumentDialog open={showNew} onOpenChange={setShowNew} onSubmit={handleCreate} />
        </div>
    );
}
