import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ICON_PRESETS = ['📄', '📝', '🚀', '🔧', '📚', '🗂️', '💡', '⚡', '🎯', '🔐']

export default function NewDocumentDialog({ open, onOpenChange, onSubmit }) {
    const [title, setTitle] = useState('')
    const [icon, setIcon] = useState('📄')

    const handleSubmit = () => {
        if (!title.trim()) return
        onSubmit({ title: title.trim(), icon })
        setTitle('')
        setIcon('📄')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit()
        if (e.key === 'Escape') onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-base">New document</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-1">
                    {/* Icon picker */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Icon</Label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {ICON_PRESETS.map((e) => (
                                <button
                                    key={e}
                                    onClick={() => setIcon(e)}
                                    className={`w-8 h-8 text-base rounded-md flex items-center justify-center transition-colors ${
                                        icon === e
                                            ? 'bg-indigo-100 ring-2 ring-indigo-400'
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                        <Input
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="or type an emoji"
                            className="h-8 text-sm text-center"
                            maxLength={2}
                        />
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Document title"
                            autoFocus
                            className="h-8 text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={handleSubmit}
                            disabled={!title.trim()}
                            className="flex-1 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-40 transition-colors"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
