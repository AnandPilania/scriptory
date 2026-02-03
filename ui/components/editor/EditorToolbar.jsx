import { Button } from '@/components/ui/button'
import { Save, Eye, Code } from 'lucide-react'

export default function EditorToolbar({
  onSave,
  onTogglePreview,
  onCodeBrowser,
  isPreview
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onCodeBrowser}>
        <Code className="w-4 h-4 mr-2" />
        Insert Code
      </Button>
      <Button variant="outline" size="sm" onClick={onTogglePreview}>
        <Eye className="w-4 h-4 mr-2" />
        {isPreview ? 'Edit' : 'Preview'}
      </Button>
      <Button size="sm" onClick={onSave}>
        <Save className="w-4 h-4 mr-2" />
        Save
      </Button>
    </div>
  )
}
