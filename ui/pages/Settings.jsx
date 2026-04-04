import { useState, useEffect, useContext } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfig } from '@/hooks/useConfig'
import { LayoutContext } from '@/components/layout/MainLayout'

const SHORTCUTS = [
    { label: 'Save document',   keys: ['⌘', 'S'] },
    { label: 'Toggle preview',  keys: ['⌘', 'P'] },
    { label: 'New document',    keys: ['⌘', 'N'] },
]

export default function Settings() {
    const { config, updateConfig, loading } = useConfig()
    const { setHeaderMeta } = useContext(LayoutContext)
    const [deeplinkPrefix, setDeeplinkPrefix] = useState('')
    const [status, setStatus] = useState(null) // 'saving' | 'saved' | null

    useEffect(() => {
        setHeaderMeta({ title: 'Settings', icon: '⚙️', isDirty: false })
    }, [setHeaderMeta])

    useEffect(() => {
        if (config.DEEPLINK_PREFIX) setDeeplinkPrefix(config.DEEPLINK_PREFIX)
    }, [config])

    const handleSave = async () => {
        try {
            setStatus('saving')
            await updateConfig({ ...config, DEEPLINK_PREFIX: deeplinkPrefix })
            setStatus('saved')
            setTimeout(() => setStatus(null), 2000)
        } catch {
            setStatus(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-sm text-gray-400">Loading…</span>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto px-8 py-10">
            <h1 className="text-xl font-semibold text-gray-800 mb-6">Settings</h1>

            {/* Config */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Editor</h2>

                <div className="space-y-1.5 mb-5">
                    <Label htmlFor="deeplink" className="text-xs text-gray-500">Deeplink prefix</Label>
                    <Input
                        id="deeplink"
                        value={deeplinkPrefix}
                        onChange={(e) => setDeeplinkPrefix(e.target.value)}
                        placeholder="vscode://file"
                        className="h-8 text-sm"
                    />
                    <p className="text-xs text-gray-400">
                        Prefix for opening files in your editor.{' '}
                        <code className="bg-gray-100 px-1 rounded text-xs">vscode://file</code>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={status === 'saving'}
                        className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                    >
                        {status === 'saving' ? 'Saving…' : 'Save'}
                    </button>
                    {status === 'saved' && (
                        <span className="text-xs text-green-600 font-medium">✓ Saved</span>
                    )}
                </div>
            </section>

            {/* Shortcuts */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Keyboard shortcuts</h2>
                <div className="space-y-2.5">
                    {SHORTCUTS.map(({ label, keys }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{label}</span>
                            <div className="flex items-center gap-1">
                                {keys.map((k) => (
                                    <kbd
                                        key={k}
                                        className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono"
                                    >
                                        {k}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* About */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">About</h2>
                <p className="text-xs text-gray-400">
                    scriptory — local-first internal documentation with Markdown & MDX support.
                </p>
            </section>
        </div>
    )
}
