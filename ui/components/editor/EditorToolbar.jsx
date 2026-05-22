import { Button } from '@/components/ui/button';
import { Save, Eye, EyeOff, Code, MessageSquare, History, Loader2 } from 'lucide-react';

export default function EditorToolbar({
    onSave,
    onTogglePreview,
    onCodeBrowser,
    onToggleComments,
    onToggleVersions,
    isPreview,
    isSaving,
    commentCount = 0,
}) {
    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={onCodeBrowser}
                title="Insert code file"
                className="text-gray-600 dark:text-gray-300"
            >
                <Code className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Code</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={onToggleComments}
                title="Comments"
                className="text-gray-600 dark:text-gray-300"
            >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">
                    Comments{commentCount > 0 ? ` (${commentCount})` : ''}
                </span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={onToggleVersions}
                title="Version history"
                className="text-gray-600 dark:text-gray-300"
            >
                <History className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">History</span>
            </Button>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePreview}
                title={isPreview ? 'Edit mode (⌘P)' : 'Preview mode (⌘P)'}
                className="text-gray-600 dark:text-gray-300"
            >
                {isPreview ? (
                    <EyeOff className="w-4 h-4 mr-1.5" />
                ) : (
                    <Eye className="w-4 h-4 mr-1.5" />
                )}
                <span className="hidden sm:inline">{isPreview ? 'Edit' : 'Preview'}</span>
            </Button>

            <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                title="Save (⌘S)"
            >
                {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                    <Save className="w-4 h-4 mr-1.5" />
                )}
                Save
            </Button>
        </div>
    );
}
