import { useState, useEffect } from 'react';
import { configApi } from '../services/api';

export function useConfig() {
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await configApi.get();
            setConfig(res.data);
        } catch (e) {
            console.error('Error fetching config:', e);
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async (data) => {
        const res = await configApi.update(data);
        setConfig(res.data);
        return res.data;
    };

    const initProject = async () => {
        await configApi.init();
        await fetchConfig();
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return { config, loading, updateConfig, initProject, fetchConfig };
}
