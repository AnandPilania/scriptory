import { motion, AnimatePresence } from 'framer-motion'
import { staggerContainer } from '@/components/motion/variants'
import DocumentItem from './DocumentItem'

export default function DocumentList({ documents, onDelete }) {
    if (documents.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 py-6 text-center"
                style={{ color: 'var(--sidebar-muted)' }}
            >
                <p className="text-xs">No documents yet.</p>
            </motion.div>
        )
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-px"
        >
            <AnimatePresence mode="popLayout">
                {documents.map(doc => (
                    <DocumentItem key={doc.id} document={doc} onDelete={onDelete} />
                ))}
            </AnimatePresence>
        </motion.div>
    )
}
