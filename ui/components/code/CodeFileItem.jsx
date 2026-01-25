import { Code } from 'lucide-react';

export default function CodeFileItem({ file, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-gray-50"
        >
            <Code className="h-4 w-4 text-gray-500" />
            <span className="font-mono text-sm">{file.path}</span>
        </button>
    );
}
