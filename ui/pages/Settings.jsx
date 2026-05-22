import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfig } from '@/hooks/useConfig';
import { useTheme } from '@/hooks/useTheme';
import { createRequire } from 'module'; // won't work in browser — use vite
import { Sun, Moon, Monitor, Check } from 'lucide-react';

const VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';

const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

function Section({ title, description, children }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
            </div>
            {children}
        </div>
    );
}

export default function Settings() {
    const { config, updateConfig, loading } = useConfig();
    const { theme, setTheme } = useTheme();

    const [form, setForm] = useState({
        DEEPLINK_PREFIX: '',
        TEAM_NAME: '',
        AUTO_SAVE_INTERVAL: 30,
    });
    const [saving, setSaving] = useState(false);
    const [savedKey, setSavedKey] = useState(null);

    useEffect(() => {
        if (!loading) {
            setForm({
                DEEPLINK_PREFIX: config.DEEPLINK_PREFIX || '',
                TEAM_NAME: config.TEAM_NAME || '',
                AUTO_SAVE_INTERVAL: config.AUTO_SAVE_INTERVAL ?? 30,
            });
        }
    }, [config, loading]);

    const handleSave = async (keys) => {
        try {
            setSaving(true);
            const patch = Object.fromEntries(keys.map(k => [k, form[k]]));
            await updateConfig(patch);
            setSavedKey(keys.join(','));
            setTimeout(() => setSavedKey(null), 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = async (t) => {
        setTheme(t);
        await updateConfig({ THEME: t });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-sm text-gray-400 animate-pulse">Loading settings…</div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure your Scriptory workspace</p>
            </div>

            {/* Appearance */}
            <Section title="Appearance" description="Customize how Scriptory looks.">
                <div className="flex gap-3">
                    {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => handleThemeChange(value)}
                            className={[
                                'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 transition-colors text-sm font-medium',
                                theme === value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400',
                            ].join(' ')}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Workspace */}
            <Section title="Workspace" description="Team and workspace settings.">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                            id="team-name"
                            value={form.TEAM_NAME}
                            onChange={e => setForm(f => ({ ...f, TEAM_NAME: e.target.value }))}
                            placeholder="e.g. Engineering Team"
                            className="mt-1"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleSave(['TEAM_NAME'])}
                            disabled={saving}
                        >
                            Save
                        </Button>
                        {savedKey === 'TEAM_NAME' && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Saved
                            </span>
                        )}
                    </div>
                </div>
            </Section>

            {/* Editor */}
            <Section title="Editor" description="Configure editor behaviour.">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="autosave">Auto-save interval (seconds)</Label>
                        <Input
                            id="autosave"
                            type="number"
                            min={0}
                            max={300}
                            value={form.AUTO_SAVE_INTERVAL}
                            onChange={e => setForm(f => ({ ...f, AUTO_SAVE_INTERVAL: Number(e.target.value) }))}
                            className="mt-1 w-32"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set to 0 to disable auto-save.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleSave(['AUTO_SAVE_INTERVAL'])}
                            disabled={saving}
                        >
                            Save
                        </Button>
                        {savedKey === 'AUTO_SAVE_INTERVAL' && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Saved
                            </span>
                        )}
                    </div>
                </div>
            </Section>

            {/* Integrations */}
            <Section title="Editor Integration" description="Open code files directly in your IDE.">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="deeplink">Deep-link Prefix</Label>
                        <Input
                            id="deeplink"
                            value={form.DEEPLINK_PREFIX}
                            onChange={e => setForm(f => ({ ...f, DEEPLINK_PREFIX: e.target.value }))}
                            placeholder="vscode://file"
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Examples: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">vscode://file</code>
                            {' '}<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">idea://open?file</code>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleSave(['DEEPLINK_PREFIX'])}
                            disabled={saving}
                        >
                            Save
                        </Button>
                        {savedKey === 'DEEPLINK_PREFIX' && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Saved
                            </span>
                        )}
                    </div>
                </div>
            </Section>

            {/* Keyboard shortcuts */}
            <Section title="Keyboard Shortcuts">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    {[
                        ['Save document', '⌘S'],
                        ['Toggle preview', '⌘P'],
                        ['Search', '⌘K'],
                        ['New document', '⌘N'],
                        ['Slash blocks', '/'],
                    ].map(([action, shortcut]) => (
                        <div key={action} className="contents">
                            <span className="text-gray-600 dark:text-gray-400">{action}</span>
                            <code className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 w-fit">{shortcut}</code>
                        </div>
                    ))}
                </div>
            </Section>

            {/* About */}
            <Section title="About Scriptory">
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><span className="font-medium text-gray-800 dark:text-gray-200">Version</span> {VERSION}</p>
                    <p><span className="font-medium text-gray-800 dark:text-gray-200">Storage</span> Local file system</p>
                    <p><span className="font-medium text-gray-800 dark:text-gray-200">License</span> MIT</p>
                </div>
            </Section>
        </div>
    );
}
