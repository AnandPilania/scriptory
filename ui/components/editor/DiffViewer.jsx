import { motion } from 'framer-motion'
import { Plus, Minus, FileCode, GitBranch } from 'lucide-react'

// ── Stat bar ──────────────────────────────────────────────────

function StatBar({ additions, deletions }) {
    const total = additions + deletions
    if (!total) return null
    const addPct = Math.round((additions / total) * 100)
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100 flex">
                <div className="bg-emerald-400 h-full transition-all" style={{ width: `${addPct}%` }} />
                <div className="bg-red-400 h-full transition-all" style={{ width: `${100 - addPct}%` }} />
            </div>
            <span className="text-[10px] font-mono text-emerald-600">+{additions}</span>
            <span className="text-[10px] font-mono text-red-500">-{deletions}</span>
        </div>
    )
}

// ── File summary card ─────────────────────────────────────────

function FileStat({ file, index }) {
    const ext = file.path.split('.').pop()
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="px-4 py-2.5 border-b last:border-0"
            style={{ borderColor: '#21262d' }}
        >
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                    {ext}
                </span>
                <span className="text-xs font-mono truncate flex-1" style={{ color: '#c9d1d9' }}>
                    {file.path}
                </span>
                {file.binary && (
                    <span className="text-xs text-yellow-500 shrink-0">binary</span>
                )}
            </div>
            {!file.binary && <StatBar additions={file.additions} deletions={file.deletions} />}
        </motion.div>
    )
}

// ── Diff hunk renderer ────────────────────────────────────────

function DiffHunk({ fileDiff, expanded, onToggle }) {
    const lines = fileDiff.diff.split('\n')

    const renderLine = (line, i) => {
        if (line.startsWith('diff --git') || line.startsWith('index ') ||
            line.startsWith('--- ') || line.startsWith('+++ ') ||
            line.startsWith('Binary')) {
            return null
        }

        let bg    = 'transparent'
        let color = '#8b949e'
        let Icon  = null

        if (line.startsWith('+')) { bg = 'rgba(46,160,67,0.15)'; color = '#3fb950'; Icon = Plus }
        if (line.startsWith('-')) { bg = 'rgba(248,81,73,0.15)';  color = '#f85149'; Icon = Minus }
        if (line.startsWith('@@')) { bg = 'rgba(99,102,241,0.08)'; color = '#6e7681' }

        return (
            <div key={i} className="flex items-start font-mono text-xs leading-5 px-3 group"
                style={{ background: bg }}>
                <span className="w-4 shrink-0 mt-0.5 opacity-60" style={{ color }}>
                    {Icon && <Icon className="w-2.5 h-2.5" />}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-all" style={{ color }}>
                    {line.startsWith('+') || line.startsWith('-') ? line.slice(1) : line}
                </span>
            </div>
        )
    }

    return (
        <div className="border-b last:border-0" style={{ borderColor: '#21262d' }}>
            {/* File header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
            >
                <FileCode className="w-3.5 h-3.5 shrink-0" style={{ color: '#7d8590' }} />
                <span className="text-xs font-mono flex-1 truncate" style={{ color: '#c9d1d9' }}>
                    {fileDiff.path}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                    {!fileDiff.binary && (
                        <>
                            <span className="text-[10px] font-mono text-emerald-500">+{fileDiff.additions}</span>
                            <span className="text-[10px] font-mono text-red-400">-{fileDiff.deletions}</span>
                        </>
                    )}
                    <span className="text-[10px] transition-transform" style={{
                        color: '#7d8590',
                        transform: expanded ? 'rotate(90deg)' : 'none',
                    }}>▶</span>
                </div>
            </button>

            {/* Diff lines */}
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    style={{ background: '#0d1117', borderTop: '1px solid #21262d' }}
                >
                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {lines.map(renderLine)}
                    </div>
                </motion.div>
            )}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────

export default function DiffViewer({ stat, fileDiffs, expandedFiles, onToggleFile }) {
    if (!stat && !fileDiffs?.length) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center px-6">
                <GitBranch className="w-8 h-8" style={{ color: '#30363d' }} />
                <div>
                    <p className="text-sm font-medium" style={{ color: '#7d8590' }}>No staged changes</p>
                    <p className="text-xs mt-1" style={{ color: '#484f58' }}>
                        Stage files with <code className="px-1 rounded" style={{ background: '#161b22' }}>git add</code>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Summary header */}
            {stat && (stat.totalAdd > 0 || stat.totalDel > 0) && (
                <div className="px-4 py-3 border-b" style={{ borderColor: '#21262d' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7d8590' }}>
                            {fileDiffs?.length || 0} file{(fileDiffs?.length || 0) !== 1 ? 's' : ''} changed
                        </span>
                        <div className="flex gap-3">
                            <span className="text-xs font-mono text-emerald-500">+{stat.totalAdd}</span>
                            <span className="text-xs font-mono text-red-400">-{stat.totalDel}</span>
                        </div>
                    </div>
                    <StatBar additions={stat.totalAdd} deletions={stat.totalDel} />
                </div>
            )}

            {/* Per-file hunks */}
            {(fileDiffs || []).map(fd => (
                <DiffHunk
                    key={fd.path}
                    fileDiff={fd}
                    expanded={expandedFiles?.has(fd.path)}
                    onToggle={() => onToggleFile(fd.path)}
                />
            ))}
        </div>
    )
}
