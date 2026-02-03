import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfig } from '@/hooks/useConfig'

export default function Settings() {
  const { config, updateConfig, loading } = useConfig()
  const [deeplinkPrefix, setDeeplinkPrefix] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (config.DEEPLINK_PREFIX) {
      setDeeplinkPrefix(config.DEEPLINK_PREFIX)
    }
  }, [config])

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateConfig({
        ...config,
        DEEPLINK_PREFIX: deeplinkPrefix
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="deeplink">Deeplink Prefix</Label>
          <Input
            id="deeplink"
            type="text"
            value={deeplinkPrefix}
            onChange={(e) => setDeeplinkPrefix(e.target.value)}
            placeholder="vscode://file"
          />
          <p className="text-sm text-gray-500">
            Set a custom prefix for deep linking to code files in your editor.
            Example: <code className="bg-gray-100 px-2 py-1 rounded">vscode://file</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          {saved && (
            <span className="text-sm text-green-600">✓ Settings saved!</span>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">About Scriptory</h2>
        <p className="text-sm text-gray-700 mb-2">
          Scriptory is an internal documentation tool with a Notion-like editor.
          Version 0.0.4
        </p>
        <div className="space-y-1 text-sm text-gray-600">
          <p>• 📝 Markdown & MDX support</p>
          <p>• 📁 File-based storage</p>
          <p>• 🔍 Code file browsing</p>
          <p>• ⚡ Fast and local</p>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Save Document</span>
            <code className="bg-gray-200 px-2 py-1 rounded">Ctrl+S / Cmd+S</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Toggle Preview</span>
            <code className="bg-gray-200 px-2 py-1 rounded">Ctrl+P / Cmd+P</code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">New Document</span>
            <code className="bg-gray-200 px-2 py-1 rounded">Ctrl+N / Cmd+N</code>
          </div>
        </div>
      </div>
    </div>
  )
}
