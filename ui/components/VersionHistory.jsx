import { useEffect, useState } from 'react';
import { useVersions } from '@/hooks/useVersions';
import { Button } from '@/components/ui/button';
import { History, RotateCcw, Eye, X, Clock } from 'lucide-react';

function timeAgo(isoString) {
    if (!isoString) return '';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function VersionHistory({ docId, currentContent, onRestore, onClose }) {
    const { versions, loading, fetchVersions, getVersion, restoreVersion } = useVersions(docId);
    const [previewing, setPreviewing] = useState(null); // { ts, content }
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    const handlePreview = async (ts) => {
        try {
            const v = await getVersion(ts);
            setPreviewing({ ts, content: v.content, message: v.message, savedAt: v.savedAt });
        } catch {
            // ignore
        }
    };

    const handleRestore = async (ts) => {
        if (!confirm('Restore this version? The current content will be saved as a new version first.')) return;
        try {
            setRestoring(true);
            await restoreVersion(ts);
            onRestore?.();
            onClose?.();
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-sm">Version History</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Body */}
            {previewing ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                        <span>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {previewing.message} · {timeAgo(previewing.savedAt)}
                        </span>
                        <button onClick={() => setPreviewing(null)} className="underline">back</button>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {previewing.content}
                        </pre>
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleRestore(previewing.ts)}
                            disabled={restoring}
                        >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            {restoring ? 'Restoring…' : 'Restore this version'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading…</div>
                    ) : versions.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p>No versions yet.</p>
                            <p className="text-xs mt-1">Versions are saved automatically when you save the document.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {versions.map((v, i) => (
                                <li key={v.ts} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                {v.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {timeAgo(v.savedAt)}
                                                {i === 0 && (
                                                    <span className="ml-1 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px]">
                                                        latest
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                title="Preview"
                                                onClick={() => handlePreview(v.ts)}
                                            >
                                                <Eye className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                title="Restore"
                                                onClick={() => handleRestore(v.ts)}
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
