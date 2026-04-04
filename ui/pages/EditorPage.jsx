import { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { documentsApi } from '@/services/api'
import { Input } from '@/components/ui/input'
import Editor from '@/components/editor/Editor'
import EditorToolbar from '@/components/editor/EditorToolbar'
import MarkdownPreview from '@/components/editor/MarkdownPreview'
import CodeBrowser from '@/components/code/CodeBrowser'
import { getFileExtension } from '@/utils/markdown'
import { LayoutContext } from '@/components/layout/MainLayout'

export default function EditorPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { setHeaderMeta } = useContext(LayoutContext)

    const [doc, setDoc] = useState(null)
    const [content, setContent] = useState('')
    const [title, setTitle] = useState('')
    const [icon, setIcon] = useState('📄')
    const [savedContent, setSavedContent] = useState('')
    const [savedTitle, setSavedTitle] = useState('')

    const [isPreview, setIsPreview] = useState(false)
    const [editingMeta, setEditingMeta] = useState(false)
    const [showCodeBrowser, setShowCodeBrowser] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const isDirty = content !== savedContent || title !== savedTitle

    // Push title / dirty state to header
    useEffect(() => {
        setHeaderMeta({ title, icon, isDirty })
    }, [title, icon, isDirty, setHeaderMeta])

    useEffect(() => {
        loadDocument()
    }, [id])

    const loadDocument = async () => {
        try {
            setLoading(true)
            const { data } = await documentsApi.getOne(id)
            setDoc(data)
            setContent(data.content || '')
            setSavedContent(data.content || '')
            setTitle(data.title)
            setSavedTitle(data.title)
            setIcon(data.icon)
        } catch {
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = useCallback(async () => {
        if (saving) return
        try {
            setSaving(true)
            await documentsApi.update(id, { title, icon, content })
            setSavedContent(content)
            setSavedTitle(title)
            setEditingMeta(false)
        } catch (err) {
            console.error('Save failed:', err)
        } finally {
            setSaving(false)
        }
    }, [id, title, icon, content, saving])

    // ⌘S / Ctrl+S — save; ⌘P / Ctrl+P — toggle preview
    useEffect(() => {
        const onKey = (e) => {
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 's') { e.preventDefault(); handleSave() }
                if (e.key === 'p') { e.preventDefault(); setIsPreview(v => !v) }
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [handleSave])

    const handleCodeInsert = (filePath, fileContent) => {
        const ext = getFileExtension(filePath)
        const snippet = `\n\`\`\`${ext}\n// ${filePath}\n${fileContent}\n\`\`\`\n`
        setContent(c => c + snippet)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-sm text-gray-400">Loading…</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Document header bar */}
            <div className="flex items-center justify-between gap-4 px-8 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {editingMeta ? (
                        <>
                            <Input
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-14 text-center px-2 h-8 text-base"
                                placeholder="📄"
                            />
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Document title"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                            <button
                                onClick={() => { setTitle(savedTitle); setEditingMeta(false) }}
                                className="text-xs text-gray-400 hover:text-gray-600 px-2"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditingMeta(true)}
                            className="flex items-center gap-2 rounded px-1 hover:bg-gray-50 group"
                            title="Click to rename"
                        >
                            <span className="text-xl">{icon}</span>
                            <span className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                {title}
                            </span>
                        </button>
                    )}
                </div>

                <EditorToolbar
                    onSave={handleSave}
                    onTogglePreview={() => setIsPreview(v => !v)}
                    onCodeBrowser={() => setShowCodeBrowser(true)}
                    isPreview={isPreview}
                    saving={saving}
                />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
                {isPreview
                    ? <MarkdownPreview content={content} />
                    : (
                        <Editor
                            value={content}
                            onChange={setContent}
                            placeholder={`# ${title}\n\nStart writing in Markdown…\n\n## Heading\n\n**bold** and *italic*\n\n\`\`\`js\n// paste code here\n\`\`\``}
                        />
                    )
                }
            </div>

            <CodeBrowser
                open={showCodeBrowser}
                onOpenChange={setShowCodeBrowser}
                onInsert={handleCodeInsert}
            />
        </div>
    )
}
