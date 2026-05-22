import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Editor from '@/components/editor/Editor';
import EditorToolbar from '@/components/editor/EditorToolbar';
import MarkdownPreview from '@/components/editor/MarkdownPreview';
import CodeBrowser from '@/components/code/CodeBrowser';
import VersionHistory from '@/components/versions/VersionHistory';
import CommentsPanel from '@/components/comments/CommentsPanel';
import { useComments } from '@/hooks/useComments';
import { getFileExtension } from '@/utils/markdown';
import { Pencil, Check, X } from 'lucide-react';

const AUTOSAVE_DELAY = 30_000; // 30s

export default function EditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doc, setDoc] = useState(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('📄');
    const [editingMeta, setEditingMeta] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [showCodeBrowser, setShowCodeBrowser] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [dirty, setDirty] = useState(false);

    const { comments, fetchComments } = useComments(id);

    const autosaveTimer = useRef(null);
    const contentRef = useRef(content);
    contentRef.current = content;

    // ── Load document ──────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                const res = await documentsApi.getOne(id);
                if (cancelled) return;
                setDoc(res.data);
                setContent(res.data.content ?? '');
                setTitle(res.data.title);
                setIcon(res.data.icon);
                setDirty(false);
            } catch {
                navigate('/');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [id, navigate]);

    // ── Keyboard shortcuts ─────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (!(e.metaKey || e.ctrlKey)) return;
            if (e.key === 's') { e.preventDefault(); handleSave(); }
            if (e.key === 'p') { e.preventDefault(); setIsPreview(v => !v); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []); // eslint-disable-line — handleSave is stable via useCallback below

    // ── Autosave ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!dirty) return;
        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            handleSave(true);
        }, AUTOSAVE_DELAY);
        return () => clearTimeout(autosaveTimer.current);
    }, [dirty, content]); // eslint-disable-line

    // ── Save ───────────────────────────────────────────────────────────────
    const handleSave = useCallback(async (isAutosave = false) => {
        if (!id) return;
        try {
            setSaving(true);
            await documentsApi.update(id, {
                title,
                icon,
                content: contentRef.current,
                commitMessage: isAutosave ? 'Auto-save' : 'Manual save',
            });
            setDirty(false);
            setSavedAt(new Date());
        } catch (e) {
            console.error('Save failed:', e);
        } finally {
            setSaving(false);
        }
    }, [id, title, icon]);

    const handleContentChange = (val) => {
        setContent(val);
        setDirty(true);
    };

    const handleCodeInsert = (filePath, fileContent) => {
        const ext = getFileExtension(filePath);
        const snippet = `\n\`\`\`${ext}\n// ${filePath}\n${fileContent}\n\`\`\`\n`;
        setContent(c => c + snippet);
        setDirty(true);
    };

    const handleMetaSave = async () => {
        await handleSave();
        setEditingMeta(false);
    };

    const handleVersionRestore = async () => {
        // Reload document after restore
        const res = await documentsApi.getOne(id);
        setContent(res.data.content ?? '');
        setDirty(false);
    };

    // ── Side panel: only one open at a time ───────────────────────────────
    const openVersions = () => { setShowVersions(true); setShowComments(false); };
    const openComments = () => { setShowComments(true); setShowVersions(false); if (id) fetchComments(); };
    const closePanel = () => { setShowVersions(false); setShowComments(false); };

    const hasPanel = showVersions || showComments;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-sm animate-pulse">Loading…</div>
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden">
            {/* Main editor area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Document header */}
                <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        {/* Title area */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {editingMeta ? (
                                <>
                                    <Input
                                        value={icon}
                                        onChange={e => setIcon(e.target.value)}
                                        className="w-14 text-center text-xl px-1"
                                    />
                                    <Input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="flex-1"
                                        placeholder="Document title"
                                        onKeyDown={e => e.key === 'Enter' && handleMetaSave()}
                                        autoFocus
                                    />
                                    <Button size="icon" variant="ghost" onClick={handleMetaSave} title="Save">
                                        <Check className="w-4 h-4 text-green-600" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setEditingMeta(false)} title="Cancel">
                                        <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                </>
                            ) : (
                                <button
                                    className="flex items-center gap-2 group rounded-lg px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setEditingMeta(true)}
                                    title="Edit title"
                                >
                                    <span className="text-2xl">{icon}</span>
                                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
                                    <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                                </button>
                            )}
                        </div>

                        {/* Toolbar */}
                        <div className="shrink-0">
                            <EditorToolbar
                                onSave={() => handleSave(false)}
                                onTogglePreview={() => setIsPreview(v => !v)}
                                onCodeBrowser={() => setShowCodeBrowser(true)}
                                onToggleComments={openComments}
                                onToggleVersions={openVersions}
                                isPreview={isPreview}
                                isSaving={saving}
                                commentCount={comments.length}
                            />
                        </div>
                    </div>

                    {/* Status bar */}
                    <div className="max-w-4xl mx-auto mt-1 flex items-center gap-3 text-[11px] text-gray-400">
                        {dirty && <span className="text-amber-500">● Unsaved changes</span>}
                        {!dirty && savedAt && (
                            <span>Saved {savedAt.toLocaleTimeString()}</span>
                        )}
                        <span className="ml-auto">
                            {content.split(/\s+/).filter(Boolean).length} words · {content.length} chars
                        </span>
                    </div>
                </div>

                {/* Editor / Preview */}
                <div className="flex-1 overflow-y-auto px-6 py-8 bg-white dark:bg-gray-900">
                    {isPreview ? (
                        <MarkdownPreview content={content} />
                    ) : (
                        <Editor
                            value={content}
                            onChange={handleContentChange}
                            onSave={() => handleSave(false)}
                            placeholder={`Start writing… press / for blocks, ⌘S to save`}
                        />
                    )}
                </div>
            </div>

            {/* Side panel */}
            {hasPanel && (
                <div className="w-80 shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
                    {showVersions && (
                        <VersionHistory
                            docId={id}
                            currentContent={content}
                            onRestore={handleVersionRestore}
                            onClose={closePanel}
                        />
                    )}
                    {showComments && (
                        <CommentsPanel
                            docId={id}
                            onClose={closePanel}
                        />
                    )}
                </div>
            )}

            {/* Modals */}
            <CodeBrowser
                open={showCodeBrowser}
                onOpenChange={setShowCodeBrowser}
                onInsert={handleCodeInsert}
            />
        </div>
    );
}
