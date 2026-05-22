import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Link2, Copy, Check, Globe, EyeOff, ExternalLink } from 'lucide-react'

export default function ShareDialog({ open, onOpenChange, shareInfo, onEnable, onDisable, loading }) {
    const [copied, setCopied] = useState(false)

    const copyUrl = () => {
        if (!shareInfo?.url) return
        navigator.clipboard.writeText(shareInfo.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
                <DialogHeader className="px-5 pt-5 pb-0">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Globe className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        Share document
                    </DialogTitle>
                </DialogHeader>

                <div className="px-5 py-5">
                    {/* Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                {shareInfo ? 'Sharing enabled' : 'Share via link'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {shareInfo ? 'Anyone with the link can view this document.' : 'Generate a read-only public link.'}
                            </p>
                        </div>

                        <motion.button
                            onClick={shareInfo ? onDisable : onEnable}
                            disabled={loading}
                            whileTap={{ scale: 0.95 }}
                            className={`relative w-11 h-6 rounded-full transition-colors ${shareInfo ? 'bg-indigo-500' : 'bg-gray-200'}`}
                        >
                            <motion.div
                                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs"
                                animate={{ x: shareInfo ? 22 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {shareInfo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-0">
                                            <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-xs font-mono text-gray-600 truncate">
                                                {shareInfo.url}
                                            </span>
                                        </div>
                                        <motion.button
                                            onClick={copyUrl}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.93 }}
                                            className="px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                                            style={{
                                                background: copied ? '#dcfce7' : '#6366f1',
                                                color: copied ? '#16a34a' : '#fff'
                                            }}
                                        >
                                            <AnimatePresence mode="wait">
                                                {copied ? (
                                                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                                                        <Check className="w-3.5 h-3.5" /> Copied
                                                    </motion.span>
                                                ) : (
                                                    <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                                                        <Copy className="w-3.5 h-3.5" /> Copy
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>

                                    <a
                                        href={shareInfo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Open share link
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="px-5 pb-5">
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <EyeOff className="w-3 h-3" />
                        Viewers can read but cannot edit this document.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
