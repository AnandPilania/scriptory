import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'

const AVATAR_COLORS = ['#818cf8','#34d399','#fb923c','#f472b6','#60a5fa','#a78bfa','#fbbf24','#4ade80']

function randomColor() {
    return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export default function NamePrompt({ onSave }) {
    const [name, setName] = useState('')
    const [color] = useState(randomColor)

    const submit = () => {
        const trimmed = name.trim()
        if (!trimmed) return
        onSave(trimmed)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-200 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center"
            >
                {/* Avatar preview */}
                <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4"
                    style={{ background: color }}
                >
                    {name.trim().charAt(0).toUpperCase() || <Users className="w-6 h-6" />}
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mb-1">What's your name?</h2>
                <p className="text-sm text-gray-400 mb-6">
                    So your teammates can see who's editing.
                </p>

                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder="Your name…"
                    maxLength={30}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 mb-4 text-center"
                />

                <button
                    onClick={submit}
                    disabled={!name.trim()}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    Let's go →
                </button>
            </motion.div>
        </motion.div>
    )
}
