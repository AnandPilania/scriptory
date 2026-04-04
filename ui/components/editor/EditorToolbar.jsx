import { Save, Eye, EyeOff, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EditorToolbar({ onSave, onTogglePreview, onCodeBrowser, isPreview, saving }) {
    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={onCodeBrowser}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Browse and insert a code file"
            >
                <Code className="w-3.5 h-3.5" />
                Insert code
            </button>

            <button
                onClick={onTogglePreview}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Toggle preview (⌘P)"
            >
                {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {isPreview ? 'Edit' : 'Preview'}
            </button>

            <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 rounded-md transition-colors"
                title="Save (⌘S)"
            >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save'}
            </button>
        </div>
    )
}
