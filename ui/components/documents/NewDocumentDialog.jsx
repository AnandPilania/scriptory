import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const templates = [
    { id: 'blank', name: 'Blank Document', icon: '📄', description: 'Start from scratch' },
    { id: 'api', name: 'API Documentation', icon: '📡', description: 'API endpoints and examples' },
    { id: 'test', name: 'Test Cases', icon: '✅', description: 'QA test documentation' },
    { id: 'bug', name: 'Bug Report', icon: '🐛', description: 'Bug tracking template' },
    { id: 'guide', name: 'User Guide', icon: '📚', description: 'Documentation guide' },
];

export default function NewDocumentDialog({ open, onOpenChange, onSubmit }) {
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('📄');
    const [selectedTemplate, setSelectedTemplate] = useState('blank');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({ title, icon, template: selectedTemplate });
        setTitle('');
        setIcon('📄');
        setSelectedTemplate('blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Document</DialogTitle>
                    <DialogDescription>...</DialogDescription>
                </DialogHeader>

                <div className="no-scrollbar -mx-4 max-h-[60vh] overflow-y-auto px-4">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="template">Template</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon</Label>
                                <Input
                                    id="icon"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="📄"
                                    className="text-center text-2xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Document title"
                                    autoFocus
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="template" className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            setSelectedTemplate(template.id);
                                            setIcon(template.icon);
                                        }}
                                        className={`rounded-lg border-2 p-4 text-left transition-all ${
                                            selectedTemplate === template.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="mb-2 text-2xl">{template.icon}</div>
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-xs text-gray-500">{template.description}</div>
                                    </button>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <Button type="submit" className="flex-1">
                        Create Document
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
