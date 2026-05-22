import { useState, useCallback } from 'react';
import { commentsApi } from '../services/api';

export function useComments(docId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        if (!docId) return;
        try {
            setLoading(true);
            const res = await commentsApi.list(docId);
            setComments(res.data);
        } catch (e) {
            console.error('Error loading comments:', e);
        } finally {
            setLoading(false);
        }
    }, [docId]);

    const addComment = useCallback(async (text, author = 'You', lineRef = null) => {
        const res = await commentsApi.create(docId, { text, author, lineRef });
        setComments(prev => [...prev, res.data]);
        return res.data;
    }, [docId]);

    const addReply = useCallback(async (commentId, text, author = 'You') => {
        const res = await commentsApi.reply(docId, commentId, { text, author });
        setComments(prev =>
            prev.map(c =>
                c.id === commentId
                    ? { ...c, replies: [...(c.replies || []), res.data] }
                    : c
            )
        );
        return res.data;
    }, [docId]);

    const removeComment = useCallback(async (commentId) => {
        await commentsApi.delete(docId, commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
    }, [docId]);

    return { comments, loading, fetchComments, addComment, addReply, removeComment };
}
