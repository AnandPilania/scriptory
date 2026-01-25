import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { useConfig } from '@/hooks/useConfig';

export default function Home() {
    const { documents } = useDocuments();
    const { config, initProject } = useConfig();
    const navigate = useNavigate();

    useEffect(() => {
        if (documents.length > 0) {
            navigate(`/document/${documents[0].id}`);
        }
    }, [documents, navigate]);

    const handleInit = async () => {
        try {
            await initProject();
            window.location.reload();
        } catch (error) {
            console.error('Error initializing project:', error);
        }
    };

    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-gray-400">
            <Folder className="mb-4 h-24 w-24" />
            <h1 className="mb-2 text-2xl font-semibold">Welcome to scriptory</h1>
            <p className="mb-6 text-lg">Select a document or create a new one to get started</p>

            {!config.initialized && (
                <Button onClick={handleInit} size="lg">
                    Initialize Project
                </Button>
            )}
        </div>
    );
}
