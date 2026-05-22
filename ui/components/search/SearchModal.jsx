import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, X } from 'lucide-react'
import { useSearch } from '@/hooks/useSearch'

function Highlight({ text = '', query = '' }) {
    if (!query.trim()) return <span>{text}</span>
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return <span>{text}</span>
    return (
        <span>
            {text.slice(0, idx)}
            <mark className="bg-indigo-100 text-indigo-800 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </span>
    )
}

export default function SearchModal({ open, onClose }) {
    const { query, setQuery, results, loading, clear } = useSearch()
    const inputRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (open) { setTimeout(() => inputRef.current?.focus(), 60); clear() }
    }, [open])

    // ⌘K / Ctrl+K global shortcut handled by parent
    const go = (id) => {
        navigate(`/document/${id}`)
        clear()
        onClose()
    }

    const handleKey = (e) => {
        if (e.key === 'Escape') { clear(); onClose() }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                        className="fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                            top: '18vh', left: '50%', transform: 'translateX(-50%)',
                            width: '100%', maxWidth: 520,
                            border: '1px solid rgba(0,0,0,0.08)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Input */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Search documents…"
                                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden bg-transparent"
                            />
                            {query && (
                                <button onClick={clear} className="text-gray-300 hover:text-gray-500 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <kbd className="text-xs text-gray-300 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 font-mono">
                                Esc
                            </kbd>
                        </div>

                        {/* Results */}
                        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                            {loading && (
                                <div className="flex items-center justify-center py-8">
                                    <motion.div
                                        className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                                    />
                                </div>
                            )}

                            {!loading && query && results.length === 0 && (
                                <div className="flex flex-col items-center gap-2 py-10 text-center">
                                    <Search className="w-6 h-6 text-gray-200" />
                                    <p className="text-sm text-gray-400">No documents found for "{query}"</p>
                                </div>
                            )}

                            {!loading && !query && (
                                <div className="py-6 text-center">
                                    <p className="text-xs text-gray-400">Start typing to search all your documents</p>
                                </div>
                            )}

                            <motion.div
                                variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
                                initial="initial"
                                animate="animate"
                            >
                                {results.map(r => (
                                    <motion.button
                                        key={r.id}
                                        variants={{ initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } }}
                                        onClick={() => go(r.id)}
                                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors group"
                                    >
                                        <span className="text-lg shrink-0 mt-0.5">{r.icon || '📄'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-700">
                                                <Highlight text={r.title} query={query} />
                                            </p>
                                            {r.snippet && (
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                                                    <Highlight text={r.snippet} query={query} />
                                                </p>
                                            )}
                                        </div>
                                        <FileText className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-1 group-hover:text-indigo-400 transition-colors" />
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>

                        {/* Footer */}
                        {results.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-2">
                                <span className="text-xs text-gray-400">{results.length} result{results.length !== 1 ? 's' : ''}</span>
                                <span className="flex-1" />
                                <kbd className="text-[10px] text-gray-300 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">↑↓</kbd>
                                <span className="text-[10px] text-gray-300">navigate</span>
                                <kbd className="text-[10px] text-gray-300 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">↵</kbd>
                                <span className="text-[10px] text-gray-300">open</span>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
