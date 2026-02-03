import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { documentsApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Editor from '@/components/editor/Editor'
import EditorToolbar from '@/components/editor/EditorToolbar'
import MarkdownPreview from '@/components/editor/MarkdownPreview'
import CodeBrowser from '@/components/code/CodeBrowser'
import { getFileExtension } from '@/utils/markdown'
import { Save } from 'lucide-react'

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('📄')
  const [isEditing, setIsEditing] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [showCodeBrowser, setShowCodeBrowser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadDocument()
  }, [id])

  const loadDocument = async () => {
    try {
      setLoading(true)
      const response = await documentsApi.getOne(id)
      const doc = response.data
      setDocument(doc)
      setContent(doc.content || '')
      setTitle(doc.title)
      setIcon(doc.icon)
    } catch (error) {
      console.error('Error loading document:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await documentsApi.update(id, {
        title,
        icon,
        content
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving document:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCodeInsert = (filePath, fileContent) => {
    const ext = getFileExtension(filePath)
    const snippet = `\n\`\`\`${ext}\n// ${filePath}\n${fileContent}\n\`\`\`\n`
    setContent(content + snippet)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Document Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {isEditing ? (
              <>
                <Input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-16 text-center"
                  placeholder="📄"
                />
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1"
                  placeholder="Document title"
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                <h1 className="text-xl font-semibold">{title}</h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <EditorToolbar
              onSave={handleSave}
              onTogglePreview={() => setIsPreview(!isPreview)}
              onCodeBrowser={() => setShowCodeBrowser(true)}
              isPreview={isPreview}
            />
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Metadata
              </Button>
            )}
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {isPreview ? (
          <MarkdownPreview content={content} />
        ) : (
          <Editor
            value={content}
            onChange={setContent}
            placeholder={`# ${title}

Start writing your documentation in Markdown...

## Headings
### Subheadings

**Bold text** and *italic text*

- List item 1
- List item 2

\`inline code\`

\`\`\`javascript
// Code block
function hello() {
  console.log('Hello, World!');
}
\`\`\`

Use the "Insert Code" button to add files from your project.`}
          />
        )}
      </div>

      {/* Code Browser Modal */}
      <CodeBrowser
        open={showCodeBrowser}
        onOpenChange={setShowCodeBrowser}
        onInsert={handleCodeInsert}
      />

      {/* Save Indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Save className="w-4 h-4 animate-pulse" />
          <span>Saving...</span>
        </div>
      )}
    </div>
  )
}
