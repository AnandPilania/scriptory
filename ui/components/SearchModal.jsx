import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '@/services/api';
import { Search, X, FileText, ArrowRight } from 'lucide-react';

export default function SearchModal({ open, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (open) {
            setQuery('');
            setResults([]);
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await searchApi.query(query);
                setResults(res.data);
                setSelected(0);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (result) => {
        navigate(`/document/${result.id}`);
        onClose();
    };

    const handleKey = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelected(s => Math.min(s + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelected(s => Math.max(s - 1, 0));
        } else if (e.key === 'Enter') {
            if (results[selected]) handleSelect(results[selected]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-xs"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        className="flex-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-hidden"
                        placeholder="Search documentation…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <kbd className="text-[10px] text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5">ESC</kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-center text-sm text-gray-500">Searching…</div>
                    )}
                    {!loading && query && results.length === 0 && (
                        <div className="p-6 text-center text-sm text-gray-500">
                            No results for <strong>"{query}"</strong>
                        </div>
                    )}
                    {!loading && results.map((r, i) => (
                        <button
                            key={r.id}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                                i === selected
                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => handleSelect(r)}
                            onMouseEnter={() => setSelected(i)}
                        >
                            <span className="text-xl leading-none mt-0.5">{r.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {r.title}
                                    </span>
                                    <ArrowRight className={`w-4 h-4 shrink-0 ml-2 ${i === selected ? 'text-blue-500' : 'text-gray-300'}`} />
                                </div>
                                {r.snippet && (
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{r.snippet}</p>
                                )}
                            </div>
                        </button>
                    ))}
                    {!loading && !query && (
                        <div className="p-4 text-center text-sm text-gray-400">
                            Type to search across all documents
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex gap-3 text-[10px] text-gray-400">
                    <span><kbd className="font-sans">↑↓</kbd> navigate</span>
                    <span><kbd className="font-sans">↵</kbd> open</span>
                    <span><kbd className="font-sans">Esc</kbd> close</span>
                </div>
            </div>
        </div>
    );
}
