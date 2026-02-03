import { Link, useParams } from 'react-router-dom';
import { Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DocumentItem({ document, onDelete, onToggleFavorite }) {
    const { id: currentId } = useParams();
    const isActive = currentId === document.id;

    return (
        <div className="group relative">
            <Link
                to={`/document/${document.id}`}
                className={`flex items-start gap-3 rounded-xl px-3 py-3 transition-all ${
                    isActive
                        ? 'border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
                <span className="text-2xl">{document.icon}</span>
                <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{document.title}</div>
                    {document.tags && document.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {document.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="tag" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {document.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{document.tags.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {document.favorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                </div>
            </Link>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.preventDefault();
                        onToggleFavorite && onToggleFavorite(document.id);
                    }}
                >
                    <Star className={`h-4 w-4 ${document.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-red-500"
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(document.id);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
