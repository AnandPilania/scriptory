import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfig } from '@/hooks/useConfig';
import { Settings as SettingsIcon, Palette, Users, Bell } from 'lucide-react';

export default function Settings() {
    const { config, updateConfig, loading } = useConfig();
    const [deeplinkPrefix, setDeeplinkPrefix] = useState('');
    const [theme, setTheme] = useState('light');
    const [teamName, setTeamName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (config) {
            setDeeplinkPrefix(config.DEEPLINK_PREFIX || '');
            setTheme(config.THEME || 'light');
            setTeamName(config.TEAM_NAME || '');
        }
    }, [config]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateConfig({
                DEEPLINK_PREFIX: deeplinkPrefix,
                THEME: theme,
                TEAM_NAME: teamName,
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    return (
        <div className="mx-auto max-w-4xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                        <SettingsIcon className="h-6 w-6 text-white" />
                    </div>
                    Settings
                </h1>
                <p className="text-gray-500">Customize your scriptory experience</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6 space-y-4">
                    <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                        <h3 className="mb-4 text-lg font-semibold">General Settings</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="deeplink">Deeplink Prefix</Label>
                                <Input
                                    id="deeplink"
                                    value={deeplinkPrefix}
                                    onChange={(e) => setDeeplinkPrefix(e.target.value)}
                                    placeholder="vscode://file"
                                />
                                <p className="text-sm text-gray-500">
                                    Custom prefix for opening files in your code editor
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="appearance" className="mt-6 space-y-4">
                    <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Theme</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={theme === 'light' ? 'default' : 'outline'}
                                        onClick={() => setTheme('light')}
                                    >
                                        Light
                                    </Button>
                                    <Button
                                        variant={theme === 'dark' ? 'default' : 'outline'}
                                        onClick={() => setTheme('dark')}
                                    >
                                        Dark
                                    </Button>
                                    <Button
                                        variant={theme === 'auto' ? 'default' : 'outline'}
                                        onClick={() => setTheme('auto')}
                                    >
                                        Auto
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="team" className="mt-6 space-y-4">
                    <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <Users className="h-5 w-5" />
                            Team Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="teamName">Team Name</Label>
                                <Input
                                    id="teamName"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="My Awesome Team"
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">scriptory v0.0.2</div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </div>
    );
}
