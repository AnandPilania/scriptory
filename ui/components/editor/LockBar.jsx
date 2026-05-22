import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, ShieldAlert } from 'lucide-react'

export default function LockBar({ isLocked, isLockedByMe, lockedByName, onLock, onUnlock, loading }) {
    return (
        <AnimatePresence>
            {isLocked && !isLockedByMe && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="overflow-hidden"
                >
                    <div className="flex items-center gap-3 px-5 py-2.5"
                        style={{ background: 'linear-gradient(90deg, #431407, #1c0a00)', borderBottom: '1px solid rgba(251,113,133,0.2)' }}>
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-sm text-red-200 flex-1">
                            Locked by <span className="font-semibold">{lockedByName || 'a teammate'}</span> — read-only
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export function LockButton({ isLocked, isLockedByMe, onLock, onUnlock, loading, userId }) {
    if (isLocked && !isLockedByMe) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>
                <Lock className="w-3 h-3" />
                Locked
            </div>
        )
    }

    if (isLocked && isLockedByMe) {
        return (
            <motion.button
                onClick={onUnlock}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{ background: 'rgba(234,179,8,0.12)', color: '#ca8a04' }}
                title="You locked this — click to unlock"
            >
                <Lock className="w-3 h-3" />
                Locked by you
            </motion.button>
        )
    }

    return (
        <motion.button
            onClick={onLock}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Lock to prevent others from editing"
        >
            <Unlock className="w-3 h-3" />
            Lock
        </motion.button>
    )
}
