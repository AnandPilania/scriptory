import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import NotionEditor from '@/components/editor/NotionEditor';
import Editor from '@/components/editor/Editor';
import MarkdownPreview from '@/components/editor/MarkdownPreview';
import EditorToolbar from '@/components/editor/EditorToolbar';
import CodeBrowser from '@/components/code/CodeBrowser';
import CommentsSlideout from '@/components/collaboration/CommentsSlideout';
import VersionHistory from '@/components/version-control/VersionHistory';
import { getFileExtension } from '@/utils/markdown';
import { Star, X, Tag as TagIcon, Sparkles, FileEdit, Code } from 'lucide-react';
import MarkdownEditor from '../components/editor/MarkdownEditor';

export default function EditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [editorMode, setEditorMode] = useState(() => {
        return localStorage.getItem('scriptory-editor-mode') || 'notion';
    });

    const [document, setDocument] = useState(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('📄');
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [favorite, setFavorite] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [showCodeBrowser, setShowCodeBrowser] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadDocument();
    }, [id]);

    const loadDocument = async () => {
        try {
            setLoading(true);
            const response = await documentsApi.getOne(id);
            const doc = response.data;
            setDocument(doc);
            setContent(doc.content || '');
            setTitle(doc.title);
            setIcon(doc.icon);
            setTags(doc.tags || []);
            setFavorite(doc.favorite || false);
            setComments(doc.comments || []);
        } catch (error) {
            console.error('Error loading document:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await documentsApi.update(id, {
                title,
                icon,
                content,
                tags,
                favorite,
            });

            setTimeout(() => setSaving(false), 1000);
        } catch (error) {
            console.error('Error saving document:', error);
            setSaving(false);
        }
    };

    const handleFileUpload = async (file) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:6767/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                return data.url;
            }
            return null;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleToolbarUpload = async () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = await handleFileUpload(file);
        if (url) {
            const isImage = file.type.startsWith('image/');
            const markdown = isImage ? `\n![${file.name}](${url})\n` : `\n[${file.name}](${url})\n`;

            setContent(content + markdown);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCodeInsert = (filePath, fileContent) => {
        const ext = getFileExtension(filePath);
        const snippet = `\n\`\`\`${ext}\n// ${filePath}\n${fileContent}\n\`\`\`\n`;
        setContent(content + snippet);
    };

    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const toggleEditorMode = () => {
        const modes = ['notion', 'markdown', 'classic'];
        const currentIndex = modes.indexOf(editorMode);
        const newMode = modes[(currentIndex + 1) % modes.length];
        setEditorMode(newMode);
        localStorage.setItem('scriptory-editor-mode', newMode);
    };

    const handleAddComment = async (text) => {
        const newComment = {
            id: Date.now().toString(),
            text,
            author: 'Current User',
            createdAt: new Date().toISOString(),
            replies: [],
        };
        setComments([...comments, newComment]);

        try {
            await fetch(`http://localhost:6767/api/documents/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment),
            });
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    };

    const handleAddReply = async (commentId, text) => {
        const reply = {
            id: Date.now().toString(),
            text,
            author: 'Current User',
            createdAt: new Date().toISOString(),
        };
        setComments(comments.map((c) => (c.id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c)));
    };

    const handleDeleteComment = async (commentId) => {
        setComments(comments.filter((c) => c.id !== commentId));

        try {
            await fetch(`http://localhost:6767/api/documents/${id}/comments/${commentId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const toggleFavorite = () => {
        setFavorite(!favorite);
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading document...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <div className="border-b border-gray-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-xl md:px-6 dark:border-gray-800 dark:bg-gray-900/80">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-4 flex flex-col items-start gap-4 md:flex-row">
                        <Input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="h-16 w-16 rounded-xl border-2 border-dashed bg-white text-center text-3xl md:h-20 md:w-20 md:text-4xl dark:bg-gray-900"
                            placeholder="📄"
                        />
                        <div className="w-full flex-1">
                            <div className="mb-2 flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-0 bg-transparent px-0 text-xl font-bold focus-visible:ring-0 md:text-2xl"
                                    placeholder="Untitled Document"
                                />
                                <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                                    <Star className={`h-5 w-5 ${favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="tag" className="gap-1">
                                        <TagIcon className="h-3 w-3" />
                                        {tag}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                                <Input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Add tag..."
                                    className="h-7 w-32 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Updated: {document?.updatedAt ? new Date(document.updatedAt).toLocaleString() : 'Never'}
                            </div>

                            <Button variant="outline" size="sm" onClick={toggleEditorMode} className="gap-2">
                                {editorMode === 'notion' ? (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Notion
                                    </>
                                ) : editorMode === 'markdown' ? (
                                    <>
                                        <Code className="h-4 w-4" />
                                        Markdown
                                    </>
                                ) : (
                                    <>
                                        <FileEdit className="h-4 w-4" />
                                        Classic
                                    </>
                                )}
                            </Button>
                        </div>

                        <EditorToolbar
                            onSave={handleSave}
                            onTogglePreview={() => setIsPreview(!isPreview)}
                            onCodeBrowser={() => setShowCodeBrowser(true)}
                            onVersionHistory={() => setShowVersions(!showVersions)}
                            onToggleComments={() => setShowComments(!showComments)}
                            onUpload={handleToolbarUpload}
                            isPreview={isPreview}
                            showComments={showComments}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {isPreview ? (
                    <MarkdownPreview content={content} />
                ) : editorMode === 'notion' ? (
                    <NotionEditor
                        value={content}
                        onChange={setContent}
                        placeholder={`# ${title || 'Start writing...'}`}
                        onUpload={handleFileUpload}
                    />
                ) : editorMode === 'markdown' ? (
                    <MarkdownEditor
                        value={content}
                        onChange={setContent}
                        placeholder={`# ${title || 'Start writing...'}\n\nUse the toolbar above for formatting...`}
                    />
                ) : (
                    <Editor
                        value={content}
                        onChange={setContent}
                        placeholder={`# ${title || 'Start writing...'}\n\nUse Markdown formatting...`}
                    />
                )}
            </div>

            <CommentsSlideout
                isOpen={showComments}
                comments={comments}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                onDeleteComment={handleDeleteComment}
                onClose={() => setShowComments(false)}
            />

            <CodeBrowser open={showCodeBrowser} onOpenChange={setShowCodeBrowser} onInsert={handleCodeInsert} />

            {showVersions && (
                <VersionHistory
                    documentId={id}
                    onRestore={(version) => {
                        setContent(version.content);
                        setShowVersions(false);
                    }}
                    onClose={() => setShowVersions(false)}
                />
            )}

            {(saving || uploading) && (
                <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white shadow-2xl">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    <span>{uploading ? 'Uploading...' : saving ? 'Saving...' : 'Saved!'}</span>
                </div>
            )}
        </div>
    );
}
