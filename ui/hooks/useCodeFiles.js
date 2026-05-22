import { useState } from 'react';
import { codeFilesApi } from '../services/api';

export function useCodeFiles() {
    const [codeFiles, setCodeFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCodeFiles = async () => {
        try {
            setLoading(true);
            const res = await codeFilesApi.getAll();
            setCodeFiles(res.data);
        } catch (e) {
            console.error('Error fetching code files:', e);
        } finally {
            setLoading(false);
        }
    };

    const getCodeFileContent = async (filePath) => {
        const res = await codeFilesApi.getOne(filePath);
        return res.data.content;
    };

    return { codeFiles, loading, fetchCodeFiles, getCodeFileContent };
}
