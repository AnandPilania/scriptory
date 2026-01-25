import { Link, useParams } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default ({ document, onDelete, toggleFavorite }) => {
    const { id: currentId } = useParams();

    const isActive = currentId === document.id;

    return (
        <div className="group relative">
            <Link
                to={`/document/${document.id}`}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
                <span>{document.icon}</span>
                <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{document.title}</div>
                    {document.tags && document.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {document.tags.slice(0, 2).map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded bg-purple-500/10 px-2 py-0.5 text-xs text-purple-600"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
            <div className="flex items-center gap-2">
                <Button
                    variant="primary"
                    size="icon"
                    className="absolute top-1/2 right-10 h-8 w-8 -translate-y-1/2"
                    onClick={() => toggleFavorite(document.id)}
                >
                    <Star
                        className={`h-4 w-4 ${document.favorite ? 'fill-green-500 text-green-500' : 'text-red-500'}`}
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(document.id);
                    }}
                >
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </div>
        </div>
    );
};
