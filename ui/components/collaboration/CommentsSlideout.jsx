import { useState } from 'react';
import { MessageSquare, Send, X, Reply, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function CommentsSlideout({
    isOpen,
    comments = [],
    onAddComment,
    onAddReply,
    onDeleteComment,
    onClose,
}) {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleSubmit = () => {
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment('');
        }
    };

    const handleReply = (commentId) => {
        if (replyText.trim()) {
            onAddReply(commentId, replyText);
            setReplyText('');
            setReplyingTo(null);
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
            )}

            <div
                className={cn(
                    'fixed top-0 right-0 z-50 flex h-full w-96 flex-col border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-950',
                    isOpen ? 'translate-x-0' : 'translate-x-full',
                )}
            >
                <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:border-gray-800 dark:from-blue-950 dark:to-purple-950">
                    <h3 className="flex items-center gap-2 font-semibold">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Comments ({comments.length})
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <div className="py-12 text-center text-gray-500">
                                <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                <p className="text-sm font-medium">No comments yet</p>
                                <p className="mt-1 text-xs">Start the conversation!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="space-y-2">
                                    <div className="rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800">
                                        <div className="mb-2 flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                                                    {comment.author?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{comment.author}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={() => onDeleteComment(comment.id)}
                                            >
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>

                                        {comment.lineNumber && (
                                            <div className="mb-2 rounded border-l-2 border-blue-400 bg-blue-50 p-2 text-xs dark:bg-blue-950/50">
                                                <div className="mb-1 font-medium text-blue-600 dark:text-blue-400">
                                                    Line {comment.lineNumber}
                                                </div>
                                                <code className="text-gray-700 dark:text-gray-300">
                                                    {comment.codeContext}
                                                </code>
                                            </div>
                                        )}

                                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setReplyingTo(comment.id)}
                                        >
                                            <Reply className="mr-1 h-3 w-3" />
                                            Reply
                                        </Button>
                                    </div>

                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="ml-8 space-y-2">
                                            {comment.replies.map((reply) => (
                                                <div
                                                    key={reply.id}
                                                    className="rounded-lg border-l-2 border-green-400 bg-gray-100 p-3 dark:bg-gray-800"
                                                >
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-xs font-bold text-white">
                                                            {reply.author?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-medium">{reply.author}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(reply.createdAt).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {reply.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {replyingTo === comment.id && (
                                        <div className="ml-8 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                                            <Textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write a reply..."
                                                className="mb-2 resize-none text-sm"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReply(comment.id)}
                                                    disabled={!replyText.trim()}
                                                >
                                                    Reply
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyText('');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <Separator />
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="mb-2 resize-none bg-white dark:bg-gray-950"
                        rows={3}
                    />
                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                        disabled={!newComment.trim()}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Post Comment
                    </Button>
                </div>
            </div>
        </>
    );
}
