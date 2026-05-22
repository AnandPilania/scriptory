import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Block from './Block'
import SlashMenu from './SlashMenu'
import { createBlock, deserializeMarkdown, serializeBlocks } from '@/utils/blocks'

// Focus helper: finds a textarea by data-block-id in the DOM.
// This avoids the forwardRef+createRef pattern that caused ref errors
// when framer-motion tried to animate already-unmounted nodes.
function focusTextarea(blockId, position = 'end') {
    requestAnimationFrame(() => {
        const el = document.querySelector(`textarea[data-block-id="${blockId}"]`)
        if (!el) return
        el.focus()
        const pos = position === 'start' ? 0 : el.value.length
        try { el.setSelectionRange(pos, pos) } catch {}
    })
}

export default function BlockEditor({ value, onChange, readOnly = false }) {
    const [blocks, setBlocks] = useState(() => deserializeMarkdown(value || ''))
    const [slashState, setSlashState] = useState(null)
    const lastEmitted = useRef(value || '')
    const containerRef = useRef(null)

    // Sync when parent pushes a new value (auto-doc insert, initial load)
    useEffect(() => {
        if (value !== lastEmitted.current) {
            lastEmitted.current = value
            setBlocks(deserializeMarkdown(value || ''))
        }
    }, [value])

    const emit = useCallback((nextBlocks) => {
        const md = serializeBlocks(nextBlocks)
        lastEmitted.current = md
        onChange(md)
    }, [onChange])

    // ── Mutations ─────────────────────────────────────────────

    const updateBlock = useCallback((id, patch) => {
        setBlocks(prev => {
            const next = prev.map(b => b.id === id ? { ...b, ...patch } : b)
            emit(next)
            return next
        })
    }, [emit])

    const insertBlock = useCallback((afterIndex, type = 'paragraph') => {
        const nb = createBlock(type)
        setBlocks(prev => {
            const next = [...prev.slice(0, afterIndex + 1), nb, ...prev.slice(afterIndex + 1)]
            emit(next)
            return next
        })
        focusTextarea(nb.id, 'start')
    }, [emit])

    const deleteBlock = useCallback((id, blocks) => {
        if (blocks.length === 1) {
            const reset = [{ ...blocks[0], content: '', type: 'paragraph' }]
            setBlocks(reset)
            emit(reset)
            return
        }
        const idx = blocks.findIndex(b => b.id === id)
        const prevBlock = blocks[idx - 1]
        const next = blocks.filter(b => b.id !== id)
        setBlocks(next)
        emit(next)
        if (prevBlock) focusTextarea(prevBlock.id, 'end')
    }, [emit])

    // ── Slash menu ────────────────────────────────────────────

    const openSlashMenu = useCallback((blockId) => {
        const el = document.querySelector(`textarea[data-block-id="${blockId}"]`)
        const rect = el?.getBoundingClientRect()
        setSlashState({ blockId, rect, query: '' })
    }, [])

    const closeSlashMenu = useCallback(() => {
        if (slashState) {
            updateBlock(slashState.blockId, { content: '' })
        }
        setSlashState(null)
    }, [slashState, updateBlock])

    const handleSlashSelect = useCallback((type) => {
        if (!slashState) return
        const { blockId } = slashState
        updateBlock(blockId, { type, content: '', language: type === 'code' ? 'javascript' : undefined })
        setSlashState(null)
        focusTextarea(blockId, 'start')
    }, [slashState, updateBlock])

    // ── Per-block handlers ────────────────────────────────────

    const handleChange = useCallback((e, blockId, blockIdx) => {
        if (readOnly) return
        const val = e.target.value
        const block = blocks[blockIdx]

        // Update slash menu query
        if (slashState?.blockId === blockId) {
            if (!val.startsWith('/')) setSlashState(null)
            else { setSlashState(s => s ? { ...s, query: val.slice(1) } : s); updateBlock(blockId, { content: val }); return }
        }

        if (block.type !== 'code') {
            if (val === '# ')   { updateBlock(blockId, { type: 'h1',          content: '' }); return }
            if (val === '## ')  { updateBlock(blockId, { type: 'h2',          content: '' }); return }
            if (val === '### ') { updateBlock(blockId, { type: 'h3',          content: '' }); return }
            if (val === '- ')   { updateBlock(blockId, { type: 'bulletList',  content: '' }); return }
            if (val === '1. ')  { updateBlock(blockId, { type: 'numberedList',content: '' }); return }
            if (val === '> ')   { updateBlock(blockId, { type: 'quote',       content: '' }); return }
            if (val === '!! ')  { updateBlock(blockId, { type: 'callout',     content: '' }); return }
            if (val === '```')  { updateBlock(blockId, { type: 'code',        content: '', language: 'text' }); return }
            if (val === '---')  { updateBlock(blockId, { type: 'divider', content: '' }); insertBlock(blockIdx, 'paragraph'); return }
            if (val === '/' && block.content === '') { updateBlock(blockId, { content: '/' }); openSlashMenu(blockId); return }
        }

        updateBlock(blockId, { content: val })
    }, [blocks, readOnly, slashState, updateBlock, insertBlock, openSlashMenu])

    const handleKeyDown = useCallback((e, blockId, blockIdx) => {
        if (readOnly) return
        const block = blocks[blockIdx]

        if (slashState && ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) return

        if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
            e.preventDefault()
            setSlashState(null)
            if (['bulletList', 'numberedList', 'todo'].includes(block.type) && block.content.trim()) {
                insertBlock(blockIdx, block.type)
            } else {
                insertBlock(blockIdx, 'paragraph')
            }
            return
        }

        if (e.key === 'Backspace' && block.content === '') {
            e.preventDefault()
            if (block.type !== 'paragraph') {
                updateBlock(blockId, { type: 'paragraph' })
            } else {
                deleteBlock(blockId, blocks)
            }
            return
        }

        if (e.key === 'Tab' && block.type === 'code') {
            e.preventDefault()
            const el = e.target
            const s = el.selectionStart
            updateBlock(blockId, { content: el.value.slice(0, s) + '  ' + el.value.slice(el.selectionEnd) })
            requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2))
            return
        }

        if (e.key === 'ArrowUp' && e.target.selectionStart === 0 && blockIdx > 0) {
            e.preventDefault(); focusTextarea(blocks[blockIdx - 1].id, 'end')
        }
        if (e.key === 'ArrowDown' && e.target.selectionStart === e.target.value.length && blockIdx < blocks.length - 1) {
            e.preventDefault(); focusTextarea(blocks[blockIdx + 1].id, 'start')
        }
    }, [blocks, readOnly, slashState, insertBlock, deleteBlock, updateBlock])

    // Number counter for ordered lists
    const listCounters = {}
    let runCount = 0
    blocks.forEach((b, i) => {
        if (b.type === 'numberedList') {
            if (i === 0 || blocks[i - 1].type !== 'numberedList') runCount = 0
            listCounters[b.id] = ++runCount
        }
    })

    return (
        <div ref={containerRef} className="block-editor relative"
            onClick={e => {
                if (e.target === containerRef.current) {
                    const last = blocks[blocks.length - 1]
                    if (!last || last.content.trim() || last.type !== 'paragraph') insertBlock(blocks.length - 1)
                    else focusTextarea(last.id, 'end')
                }
            }}>

            {blocks.map((block, index) => (
                <Block
                    key={block.id}
                    block={block}
                    blockNumber={listCounters[block.id] || index + 1}
                    onChange={e => handleChange(e, block.id, index)}
                    onKeyDown={e => handleKeyDown(e, block.id, index)}
                    onToggleTodo={() => updateBlock(block.id, { checked: !block.checked })}
                    onAddBelow={() => insertBlock(index)}
                    readOnly={readOnly}
                />
            ))}

            {/* Click-to-add space */}
            <div className="min-h-[120px] cursor-text"
                onClick={() => {
                    const last = blocks[blocks.length - 1]
                    if (!last || last.content.trim() || last.type !== 'paragraph') insertBlock(blocks.length - 1)
                    else focusTextarea(last.id, 'end')
                }}
            />

            <AnimatePresence>
                {slashState && (
                    <SlashMenu
                        anchorRect={slashState.rect}
                        query={slashState.query}
                        onSelect={handleSlashSelect}
                        onClose={closeSlashMenu}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
