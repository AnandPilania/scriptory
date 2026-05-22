import { useState, useCallback } from 'react';
import { versionsApi } from '../services/api';

export function useVersions(docId) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVersions = useCallback(async () => {
        if (!docId) return;
        try {
            setLoading(true);
            setError(null);
            const res = await versionsApi.list(docId);
            setVersions(res.data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [docId]);

    const getVersion = useCallback(async (ts) => {
        const res = await versionsApi.get(docId, ts);
        return res.data;
    }, [docId]);

    const restoreVersion = useCallback(async (ts) => {
        await versionsApi.restore(docId, ts);
    }, [docId]);

    return { versions, loading, error, fetchVersions, getVersion, restoreVersion };
}
