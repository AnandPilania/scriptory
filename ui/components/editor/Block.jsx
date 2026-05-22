import { useRef, useEffect } from 'react'
import { Plus, GripVertical } from 'lucide-react'

// Deliberate: NO forwardRef, NO motion.div with layout.
// The forwardRef+motion.div(layout)+useImperativeHandle triple caused React ref
// errors when framer tried to animate unmounting nodes that already lost their refs.
// Focus is now handled by BlockEditor via data-block-id querySelector — simpler & reliable.

const CFG = {
    paragraph:    { cls: 'text-gray-800 text-[15px] leading-relaxed', ph: "Type '/' for commands…" },
    h1:           { cls: 'text-[2rem] font-bold text-gray-900 leading-tight tracking-tight', ph: 'Heading 1' },
    h2:           { cls: 'text-[1.45rem] font-semibold text-gray-800 leading-snug', ph: 'Heading 2' },
    h3:           { cls: 'text-[1.15rem] font-semibold text-gray-700', ph: 'Heading 3' },
    bulletList:   { cls: 'text-[15px] text-gray-800 leading-relaxed', ph: 'List item' },
    numberedList: { cls: 'text-[15px] text-gray-800 leading-relaxed', ph: 'List item' },
    todo:         { cls: 'text-[15px] text-gray-800 leading-relaxed', ph: 'To-do item' },
    quote:        { cls: 'text-[15px] text-gray-600 italic leading-relaxed', ph: 'Quote…' },
    callout:      { cls: 'text-[15px] text-gray-800 leading-relaxed', ph: 'Callout…' },
    code:         { cls: 'font-mono text-[13px] text-emerald-300 leading-6', ph: '// Code…' },
}

function AutoTextarea({ blockId, value, onChange, onKeyDown, readOnly, placeholder, className, style, rows = 1 }) {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }, [value])

    return (
        <textarea
            ref={ref}
            data-block-id={blockId}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
            placeholder={placeholder}
            spellCheck={false}
            rows={rows}
            className={`resize-none focus:outline-hidden bg-transparent overflow-hidden ${className}`}
            style={style}
        />
    )
}

export default function Block({
    block, blockNumber, onKeyDown, onChange, onToggleTodo, onAddBelow, readOnly
}) {
    const cfg = CFG[block.type] || CFG.paragraph

    const GutterControls = !readOnly && (
        <div className="absolute left-0 top-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            <button onClick={onAddBelow}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-500 transition-colors"
                title="Add block">
                <Plus className="w-3 h-3" />
            </button>
            <div className="w-5 h-5 flex items-center justify-center text-gray-300 cursor-grab">
                <GripVertical className="w-3 h-3" />
            </div>
        </div>
    )

    // ── Divider ───────────────────────────────────────────────
    if (block.type === 'divider') {
        return (
            <div className="relative group flex items-center px-8 py-4" style={{ animation: 'fadeIn 0.12s ease' }}>
                {GutterControls}
                <hr className="flex-1 border-gray-200" />
            </div>
        )
    }

    // ── Code block ────────────────────────────────────────────
    if (block.type === 'code') {
        return (
            <div className="relative group px-8 my-3" style={{ animation: 'fadeIn 0.12s ease' }}>
                {GutterControls}
                <div className="rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                    <div className="flex items-center px-4 py-2 gap-1.5" style={{ borderBottom: '1px solid #21262d' }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(239,68,68,0.6)' }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(234,179,8,0.6)' }} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(34,197,94,0.6)' }} />
                        <span className="ml-auto text-[10px] font-mono" style={{ color: '#7d8590' }}>{block.language || 'text'}</span>
                    </div>
                    <AutoTextarea
                        blockId={block.id}
                        value={block.content}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        readOnly={readOnly}
                        placeholder={cfg.ph}
                        className={`w-full px-5 py-4 ${cfg.cls}`}
                        style={{ minHeight: 80, background: 'transparent', opacity: readOnly ? 0.6 : 1 }}
                        rows={4}
                    />
                </div>
            </div>
        )
    }

    // ── Callout ───────────────────────────────────────────────
    if (block.type === 'callout') {
        return (
            <div className="relative group px-8 my-1.5" style={{ animation: 'fadeIn 0.12s ease' }}>
                {GutterControls}
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    <span className="text-lg shrink-0">💡</span>
                    <AutoTextarea
                        blockId={block.id}
                        value={block.content}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        readOnly={readOnly}
                        placeholder={cfg.ph}
                        className={`flex-1 ${cfg.cls} text-blue-800`}
                        style={{ width: '100%', background: 'transparent' }}
                    />
                </div>
            </div>
        )
    }

    // ── All other blocks ──────────────────────────────────────
    return (
        <div className="relative group flex items-start px-8 py-0.5" style={{ animation: 'fadeIn 0.12s ease' }}>
            {GutterControls}

            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {block.type === 'bulletList' && (
                    <span className="mt-px text-indigo-400 text-base leading-relaxed select-none shrink-0">•</span>
                )}
                {block.type === 'numberedList' && (
                    <span className="text-gray-400 text-sm leading-relaxed select-none shrink-0 w-5 text-right font-mono mt-0.5">
                        {blockNumber}.
                    </span>
                )}
                {block.type === 'todo' && (
                    <button
                        onClick={onToggleTodo}
                        className={`mt-1 w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
                            block.checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-indigo-400 bg-white'
                        }`}
                    >
                        {block.checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M1 4l3 3 5-5"/>
                            </svg>
                        )}
                    </button>
                )}
                {block.type === 'quote' && (
                    <div className="w-0.5 self-stretch rounded-full shrink-0 my-0.5" style={{ background: '#6366f1' }} />
                )}

                <AutoTextarea
                    blockId={block.id}
                    value={block.content}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    readOnly={readOnly}
                    placeholder={cfg.ph}
                    className={`flex-1 w-full ${cfg.cls} ${
                        block.type === 'todo' && block.checked ? 'line-through text-gray-400' : ''
                    }`}
                    style={{
                        minHeight: '1.6rem',
                        background: 'transparent',
                        opacity: readOnly ? 0.6 : 1,
                        cursor: readOnly ? 'not-allowed' : 'text',
                    }}
                />
            </div>
        </div>
    )
}
