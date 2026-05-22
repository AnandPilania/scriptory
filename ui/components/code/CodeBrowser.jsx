import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCodeFiles } from '@/hooks/useCodeFiles'
import CodeFileItem from './CodeFileItem'
import { Search } from 'lucide-react'

export default function CodeBrowser({ open, onOpenChange, onInsert }) {
    const { codeFiles, loading, fetchCodeFiles, getCodeFileContent } = useCodeFiles()
    const [query, setQuery] = useState('')

    useEffect(() => {
        if (open) {
            fetchCodeFiles()
            setQuery('')
        }
    }, [open])

    const filtered = codeFiles.filter(f =>
        f.path.toLowerCase().includes(query.toLowerCase())
    )

    const handleInsert = async (filePath) => {
        const content = await getCodeFileContent(filePath)
        onInsert(filePath, content)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
                <DialogHeader className="px-4 pt-4 pb-0">
                    <DialogTitle className="text-sm font-semibold">Insert code file</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative px-4 py-3">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filter files…"
                        className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                        autoFocus
                    />
                </div>

                {/* File list */}
                <div className="overflow-y-auto border-t border-gray-100" style={{ maxHeight: '360px' }}>
                    {loading ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">Loading files…</div>
                    ) : filtered.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">
                            {query ? 'No files match that filter.' : 'No code files found.'}
                        </div>
                    ) : (
                        filtered.map(file => (
                            <CodeFileItem
                                key={file.path}
                                file={file}
                                onClick={() => handleInsert(file.path)}
                            />
                        ))
                    )}
                </div>

                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400">
                        {filtered.length} file{filtered.length !== 1 ? 's' : ''}
                        {query ? ` matching "${query}"` : ''}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
