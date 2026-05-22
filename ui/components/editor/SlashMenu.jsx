import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BLOCK_TYPES } from '@/utils/blocks'

export default function SlashMenu({ anchorRect, query = '', onSelect, onClose }) {
    const [cursor, setCursor] = useState(0)
    const listRef = useRef(null)

    const filtered = BLOCK_TYPES.filter(t =>
        t.label.toLowerCase().includes(query.toLowerCase()) ||
        t.desc.toLowerCase().includes(query.toLowerCase())
    )

    // Keyboard navigation
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); setCursor(c => Math.min(c + 1, filtered.length - 1)) }
            if (e.key === 'ArrowUp')   { e.preventDefault(); e.stopPropagation(); setCursor(c => Math.max(c - 1, 0)) }
            if (e.key === 'Enter')     { e.preventDefault(); e.stopPropagation(); if (filtered[cursor]) onSelect(filtered[cursor].type) }
            if (e.key === 'Escape')    { onClose() }
        }
        window.addEventListener('keydown', handler, true)
        return () => window.removeEventListener('keydown', handler, true)
    }, [cursor, filtered, onSelect, onClose])

    // Scroll active item into view
    useEffect(() => {
        setCursor(0)
    }, [query])

    useEffect(() => {
        const el = listRef.current?.children[cursor]
        el?.scrollIntoView({ block: 'nearest' })
    }, [cursor])

    if (!filtered.length) return null

    // Position below the caret
    const style = anchorRect
        ? {
            position: 'fixed',
            top: anchorRect.bottom + 4,
            left: Math.min(anchorRect.left, window.innerWidth - 240),
            zIndex: 9999,
        }
        : { position: 'fixed', top: '40%', left: '40%', zIndex: 9999 }

    return (
        <>
            {/* click-outside */}
            <div className="fixed inset-0 z-9998" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={style}
                className="w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
            >
                <div className="px-3 py-2 border-b border-gray-50">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Blocks</p>
                </div>
                <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 280 }}>
                    {filtered.map((t, i) => (
                        <button
                            key={t.type}
                            onClick={() => onSelect(t.type)}
                            onMouseEnter={() => setCursor(i)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                                i === cursor ? 'bg-indigo-50' : 'hover:bg-gray-50'
                            }`}
                        >
                            <span
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                                style={{
                                    background: i === cursor ? '#ede9fe' : '#f3f4f6',
                                    color: i === cursor ? '#6366f1' : '#6b7280',
                                    fontFamily: 'monospace',
                                }}
                            >
                                {t.icon}
                            </span>
                            <div className="min-w-0">
                                <p className={`text-sm font-medium truncate ${i === cursor ? 'text-indigo-700' : 'text-gray-800'}`}>
                                    {t.label}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{t.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>
        </>
    )
}
