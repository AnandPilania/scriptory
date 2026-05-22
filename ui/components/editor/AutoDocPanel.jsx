import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { slideRight, springs } from '@/components/motion/variants'
import { X, GitBranch, Sparkles, FileCode, ChevronRight, AlertCircle, RotateCcw, Plus } from 'lucide-react'
import { renderMarkdown } from '@/utils/markdown'
import axios from 'axios'

const API = (path) => `http://localhost:6767/api${path}`

function FileCheckbox({ file, checked, onChange }) {
    const ext = file.path.split('.').pop()
    return (
        <label className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 cursor-pointer group transition-colors">
            <div
                onClick={(e) => { e.preventDefault(); onChange(!checked) }}
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                    checked ? 'bg-indigo-500' : 'bg-white/10 group-hover:bg-white/15'
                }`}
            >
                {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8"><path stroke="currentColor" strokeWidth="2" d="M1 4l3 3 5-5"/></svg>}
            </div>
            <FileCode className="w-3.5 h-3.5 shrink-0" style={{ color: '#7d8590' }} />
            <span className="text-xs font-mono truncate flex-1" style={{ color: '#c9d1d9' }}>{file.path}</span>
            <span className="text-xs font-mono shrink-0 px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                {ext}
            </span>
        </label>
    )
}

function PulseLoader() {
    return (
        <div className="flex flex-col items-center gap-4 py-12">
            <div className="relative w-12 h-12">
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.2)' }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                />
                <div className="absolute inset-2 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium" style={{ color: '#c9d1d9' }}>Generating documentation…</p>
                <p className="text-xs mt-1" style={{ color: '#7d8590' }}>Claude is reading your staged files</p>
            </div>
        </div>
    )
}

export default function AutoDocPanel({ open, onClose, onInsert, onNewDoc }) {
    const [stagedFiles, setStagedFiles] = useState([])
    const [selected, setSelected] = useState(new Set())
    const [instruction, setInstruction] = useState('')
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState(null)
    const [generated, setGenerated] = useState(null) // markdown string
    const [isGitRepo, setIsGitRepo] = useState(true)

    useEffect(() => {
        if (!open) return
        setGenerated(null)
        setError(null)
        setLoading(true)
        axios.get(API('/git/staged'))
            .then(({ data }) => {
                setStagedFiles(data)
                setSelected(new Set(data.map(f => f.path)))
            })
            .catch((e) => {
                if (e.response?.status === 500) setIsGitRepo(false)
                setError('Could not read staged files. Make sure you are in a git repository with staged changes.')
            })
            .finally(() => setLoading(false))
    }, [open])

    const toggleAll = () => {
        if (selected.size === stagedFiles.length) setSelected(new Set())
        else setSelected(new Set(stagedFiles.map(f => f.path)))
    }

    const toggle = (path, checked) => {
        const next = new Set(selected)
        if (checked) next.add(path)
        else next.delete(path)
        setSelected(next)
    }

    const generate = async () => {
        setGenerating(true)
        setError(null)
        try {
            const files = stagedFiles.filter(f => selected.has(f.path))
            const { data } = await axios.post(API('/ai/generate-doc'), { files, instruction })
            setGenerated(data.markdown)
        } catch (e) {
            const msg = e.response?.data?.error || e.message
            setError(msg.includes('ANTHROPIC_API_KEY')
                ? 'Anthropic API key not set. Add it in Settings → AI.'
                : msg)
        } finally {
            setGenerating(false)
        }
    }

    const selectedCount = selected.size

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-20"
                        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        variants={slideRight}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={springs.panel}
                        className="absolute right-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden"
                        style={{
                            width: '400px',
                            background: '#0d1117',
                            borderLeft: '1px solid #21262d',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: '#21262d' }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                                <Sparkles className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold" style={{ color: '#e6edf3' }}>Auto-generate docs</h2>
                                <p className="text-xs" style={{ color: '#7d8590' }}>From your staged git files</p>
                            </div>
                            <button onClick={onClose} className="ml-auto p-1.5 rounded-md hover:bg-white/5 transition-colors" style={{ color: '#7d8590' }}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto">
                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <motion.div
                                        className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                    />
                                </div>
                            )}

                            {error && !loading && (
                                <div className="m-4 p-4 rounded-xl flex gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                                    <p className="text-xs text-red-300">{error}</p>
                                </div>
                            )}

                            {/* File picker */}
                            {!loading && stagedFiles.length > 0 && !generated && (
                                <div>
                                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: '#21262d' }}>
                                        <div className="flex items-center gap-1.5">
                                            <GitBranch className="w-3.5 h-3.5" style={{ color: '#7d8590' }} />
                                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7d8590' }}>
                                                Staged files
                                            </span>
                                        </div>
                                        <button onClick={toggleAll} className="text-xs hover:text-indigo-400 transition-colors" style={{ color: '#7d8590' }}>
                                            {selectedCount === stagedFiles.length ? 'Deselect all' : 'Select all'}
                                        </button>
                                    </div>
                                    <motion.div
                                        initial="initial"
                                        animate="animate"
                                        variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
                                        className="py-1"
                                    >
                                        {stagedFiles.map(f => (
                                            <motion.div
                                                key={f.path}
                                                variants={{ initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 } }}
                                            >
                                                <FileCheckbox
                                                    file={f}
                                                    checked={selected.has(f.path)}
                                                    onChange={(v) => toggle(f.path, v)}
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}

                            {/* No staged files */}
                            {!loading && stagedFiles.length === 0 && !error && (
                                <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
                                    <GitBranch className="w-8 h-8" style={{ color: '#30363d' }} />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: '#7d8590' }}>No staged files</p>
                                        <p className="text-xs mt-1" style={{ color: '#484f58' }}>
                                            Stage some files with <code className="px-1 rounded" style={{ background: '#161b22' }}>git add</code> to generate docs.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Instruction input */}
                            {!loading && stagedFiles.length > 0 && !generated && (
                                <div className="px-4 pt-3 pb-2">
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#7d8590' }}>
                                        Context (optional)
                                    </label>
                                    <textarea
                                        value={instruction}
                                        onChange={e => setInstruction(e.target.value)}
                                        placeholder="e.g. This adds authentication middleware..."
                                        rows={2}
                                        className="w-full text-xs rounded-lg px-3 py-2 resize-none focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                                        style={{
                                            background: '#161b22',
                                            border: '1px solid #30363d',
                                            color: '#c9d1d9',
                                        }}
                                    />
                                </div>
                            )}

                            {/* Generated preview */}
                            {generated && (
                                <div>
                                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: '#21262d' }}>
                                        <Sparkles className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7d8590' }}>Generated</span>
                                        <button
                                            onClick={() => setGenerated(null)}
                                            className="ml-auto flex items-center gap-1 text-xs hover:text-white transition-colors"
                                            style={{ color: '#7d8590' }}
                                        >
                                            <RotateCcw className="w-3 h-3" /> Regenerate
                                        </button>
                                    </div>
                                    <div
                                        className="px-5 py-4 prose-sm"
                                        style={{ color: '#c9d1d9', fontSize: '12.5px', lineHeight: 1.65 }}
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(generated) }}
                                    />
                                </div>
                            )}

                            {/* Generating loader */}
                            {generating && <PulseLoader />}
                        </div>

                        {/* Footer actions */}
                        <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: '#21262d' }}>
                            {!generated ? (
                                <motion.button
                                    onClick={generate}
                                    disabled={generating || selectedCount === 0}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
                                    style={{ background: selectedCount > 0 ? '#6366f1' : '#21262d', color: '#fff' }}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Generate ({selectedCount} {selectedCount === 1 ? 'file' : 'files'})
                                </motion.button>
                            ) : (
                                <>
                                    <motion.button
                                        onClick={() => { onInsert(generated); onClose() }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium"
                                        style={{ background: '#6366f1', color: '#fff' }}
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                        Insert here
                                    </motion.button>
                                    <motion.button
                                        onClick={() => { onNewDoc(generated); onClose() }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
                                        style={{ background: '#21262d', color: '#c9d1d9' }}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        New doc
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
