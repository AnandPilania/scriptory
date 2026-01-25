import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, RotateCcw } from 'lucide-react';

export default function VersionHistory({ documentId, onRestore, onClose }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVersions();
    }, [documentId]);

    const fetchVersions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:6767/api/documents/${documentId}/versions`);
            const data = await response.json();
            setVersions(data);
        } catch (error) {
            console.error('Error fetching versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (timestamp) => {
        try {
            const response = await fetch(`http://localhost:6767/api/documents/${documentId}/restore/${timestamp}`, {
                method: 'POST',
            });
            const data = await response.json();
            onRestore(data);
        } catch (error) {
            console.error('Error restoring version:', error);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Version History
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            <History className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>No version history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {versions.map((version, index) => (
                                <div
                                    key={version.timestamp}
                                    className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">
                                                {index === 0 ? 'Current Version' : `Version ${versions.length - index}`}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(version.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        {index > 0 && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRestore(version.timestamp)}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Restore
                                            </Button>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {version.message || 'Auto-save'}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        {version.content?.length || 0} characters
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
