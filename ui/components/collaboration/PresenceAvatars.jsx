import { motion, AnimatePresence } from 'framer-motion'
import {forwardRef} from 'react'
import { popIn, springs } from '@/components/motion/variants'

function getInitial(name = '') {
    return name.trim().charAt(0).toUpperCase() || '?'
}

export const Avatar = forwardRef(({ user, ...props }, ref) => {
    return (
        <motion.div
        ref={ref}
            key={user.userId}
            variants={popIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springs.bouncy}
            className="relative group"
            style={{ zIndex: 10 - props.index, marginLeft: props.index > 0 ? '-8px' : 0 }}
        >
            {/* Avatar circle */}
            <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-white shadow-2xs select-none cursor-default"
                style={{ background: user.color, color: '#fff' }}
            >
                {getInitial(user.userName)}
            </div>

            {/* Typing pulse ring */}
            <AnimatePresence>
                {user.isTyping && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0.2, 0.7] }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full ring-2"
                        style={{ ringColor: user.color, borderColor: user.color, border: `2px solid ${user.color}` }}
                    />
                )}
            </AnimatePresence>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                style={{ background: user.color, color: '#fff' }}>
                {user.userName}
                {user.isTyping && ' · typing…'}
            </div>
        </motion.div>
    )
})

export default function PresenceAvatars({ collaborators }) {
    if (!collaborators.length) return null

    return (
        <motion.div
            className="flex items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springs.snappy}
        >
            <AnimatePresence mode="popLayout">
                {collaborators.slice(0, 5).map((user, i) => (
                    <Avatar key={user.userId} user={user} index={i} />
                ))}
            </AnimatePresence>

            {collaborators.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500 ring-2 ring-white -ml-2">
                    +{collaborators.length - 5}
                </div>
            )}
        </motion.div>
    )
}
