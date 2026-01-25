import { Tag, X } from 'lucide-react';

export default ({ tag, onClick, onRemove }) => (
    <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 text-sm">
        <Tag className="h-3 w-3" />
        <span onClick={onClick} className="cursor-pointer">
            {tag}
        </span>
        {onRemove && <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={onRemove} />}
    </span>
);
