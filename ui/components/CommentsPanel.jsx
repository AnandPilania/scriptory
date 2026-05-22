import { useEffect, useState, useRef } from 'react';
import { useComments } from '@/hooks/useComments';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Reply, Trash2, Send } from 'lucide-react';

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function Avatar({ name }) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
    return (
        <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: `hsl(${hue}, 55%, 50%)` }}
        >
            {initials}
        </div>
    );
}

function CommentThread({ comment, onReply, onDelete }) {
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleReply = async () => {
        if (!replyText.trim()) return;
        try {
            setSubmitting(true);
            await onReply(comment.id, replyText.trim());
            setReplyText('');
            setShowReply(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            {/* Main comment */}
            <div className="flex gap-2">
                <Avatar name={comment.author} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{comment.author}</span>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-1"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.text}</p>
                    {comment.lineRef && (
                        <p className="text-[10px] text-gray-400 mt-1 font-mono">ref: {comment.lineRef}</p>
                    )}
                    <button
                        onClick={() => setShowReply(!showReply)}
                        className="mt-1 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                        <Reply className="w-3 h-3" />
                        Reply
                    </button>
                </div>
            </div>

            {/* Replies */}
            {comment.replies?.length > 0 && (
                <div className="mt-2 ml-9 space-y-2">
                    {comment.replies.map(r => (
                        <div key={r.id} className="flex gap-2">
                            <Avatar name={r.author} />
                            <div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{r.author}</span>
                                    <span className="text-[10px] text-gray-400">{timeAgo(r.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{r.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply input */}
            {showReply && (
                <div className="mt-2 ml-9 flex gap-2">
                    <input
                        className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-blue-400"
                        placeholder="Write a reply…"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply()}
                        autoFocus
                    />
                    <Button size="icon" className="h-7 w-7" onClick={handleReply} disabled={submitting || !replyText.trim()}>
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function CommentsPanel({ docId, onClose }) {
    const { comments, loading, fetchComments, addComment, addReply, removeComment } = useComments(docId);
    const [newText, setNewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleAdd = async () => {
        if (!newText.trim()) return;
        try {
            setSubmitting(true);
            await addComment(newText.trim());
            setNewText('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-sm">
                        Comments
                        {comments.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                {comments.length}
                            </span>
                        )}
                    </span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-sm text-gray-500">Loading…</div>
                ) : comments.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No comments yet.</p>
                        <p className="text-xs mt-1">Start a discussion below.</p>
                    </div>
                ) : (
                    <div className="group">
                        {comments.map(c => (
                            <CommentThread
                                key={c.id}
                                comment={c}
                                onReply={addReply}
                                onDelete={removeComment}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* New comment input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <textarea
                    ref={textareaRef}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-400 resize-none"
                    placeholder="Add a comment…"
                    rows={3}
                    value={newText}
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
                    }}
                />
                <Button
                    className="w-full mt-2"
                    size="sm"
                    onClick={handleAdd}
                    disabled={submitting || !newText.trim()}
                >
                    <Send className="w-3 h-3 mr-1" />
                    {submitting ? 'Posting…' : 'Comment'}
                </Button>
                <p className="text-[10px] text-gray-400 mt-1 text-center">⌘+Enter to submit</p>
            </div>
        </div>
    );
}
