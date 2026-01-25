import { Button } from '@/components/ui/button';
import { Save, Eye, Code, History, MessageSquare, Upload, Tag, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function EditorToolbar({
    onSave,
    onTogglePreview,
    onCodeBrowser,
    onVersionHistory,
    onToggleComments,
    onUpload,
    isPreview,
    showComments,
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
                <Button variant="outline" size="sm" onClick={onUpload}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                </Button>
                <Button variant="outline" size="sm" onClick={onCodeBrowser}>
                    <Code className="mr-2 h-4 w-4" />
                    Code
                </Button>
                <Button variant="outline" size="sm" onClick={onVersionHistory}>
                    <History className="mr-2 h-4 w-4" />
                    History
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleComments}
                    className={showComments ? 'bg-blue-50 dark:bg-blue-950' : ''}
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comments
                </Button>
                <Button variant="outline" size="sm" onClick={onTogglePreview}>
                    <Eye className="mr-2 h-4 w-4" />
                    {isPreview ? 'Edit' : 'Preview'}
                </Button>
                <Button size="sm" onClick={onSave} className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
                <Button variant="outline" size="sm" onClick={onTogglePreview}>
                    <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={onSave} className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Save className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onUpload}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onCodeBrowser}>
                            <Code className="mr-2 h-4 w-4" />
                            Insert Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onVersionHistory}>
                            <History className="mr-2 h-4 w-4" />
                            Version History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onToggleComments}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Comments
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
