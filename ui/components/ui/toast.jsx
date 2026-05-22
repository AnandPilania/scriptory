import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { ToastContext, useToastState } from '@/hooks/useToast'

const ICONS = {
    success: <CheckCircle className="w-4 h-4" />,
    error:   <AlertCircle className="w-4 h-4" />,
    info:    <Info className="w-4 h-4" />,
}

const STYLES = {
    success: 'bg-emerald-950 border-emerald-800 text-emerald-100 [--icon:var(--color-emerald-400)]',
    error:   'bg-red-950 border-red-800 text-red-100 [--icon:var(--color-red-400)]',
    info:    'bg-indigo-950 border-indigo-800 text-indigo-100 [--icon:var(--color-indigo-400)]',
}

function Toast({ id, message, type, onDismiss }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl min-w-[260px] max-w-sm ${STYLES[type] || STYLES.info}`}
        >
            <span className="mt-0.5 shrink-0 text-(--icon)">
                {ICONS[type] || ICONS.info}
            </span>
            <p className="text-sm flex-1 leading-relaxed">{message}</p>
            <button
                onClick={() => onDismiss(id)}
                className="mt-0.5 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    )
}

export function ToastContainer({ toasts, onDismiss }) {
    return (
        <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-2 items-end pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast {...t} onDismiss={onDismiss} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export function ToastProvider({ children }) {
    const { toasts, toast, dismiss } = useToastState()
    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    )
}
