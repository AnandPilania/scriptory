import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { templatesApi } from '@/services/api';
import { FileText, Sparkles } from 'lucide-react';

export default function NewDocumentDialog({ open, onOpenChange, onSubmit }) {
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('📄');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [tab, setTab] = useState('blank'); // 'blank' | 'template'

    useEffect(() => {
        if (open) {
            setTitle('');
            setIcon('📄');
            setSelectedTemplate(null);
            setTab('blank');
            // Load templates
            templatesApi.list().then(res => setTemplates(res.data)).catch(() => {});
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        let content = '';
        if (selectedTemplate) {
            try {
                const res = await templatesApi.get(selectedTemplate.id);
                content = res.data.content;
                if (!title.trim() || title === 'Untitled') {
                    // Auto-fill title from template
                }
            } catch {}
        }

        onSubmit({ title: title.trim(), icon, content });
    };

    const handleTemplateSelect = (tpl) => {
        setSelectedTemplate(tpl);
        if (!title) {
            setTitle(tpl.title);
            setIcon(tpl.icon);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>New Document</DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    {[
                        { key: 'blank', label: 'Blank', icon: FileText },
                        { key: 'template', label: 'From Template', icon: Sparkles },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={[
                                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors',
                                tab === key
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
                            ].join(' ')}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Template picker */}
                {tab === 'template' && (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {templates.map(tpl => (
                            <button
                                key={tpl.id}
                                onClick={() => handleTemplateSelect(tpl)}
                                className={[
                                    'flex items-center gap-2 p-3 rounded-lg border text-left transition-colors',
                                    selectedTemplate?.id === tpl.id
                                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
                                ].join(' ')}
                            >
                                <span className="text-2xl">{tpl.icon}</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {tpl.title}
                                </span>
                            </button>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-2 text-center py-4 text-sm text-gray-400">
                                Loading templates…
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <div className="w-20">
                            <Label htmlFor="icon">Icon</Label>
                            <Input
                                id="icon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="mt-1 text-center text-lg"
                                placeholder="📄"
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Document title"
                                autoFocus
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button type="submit" className="flex-1" disabled={!title.trim()}>
                            Create
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
