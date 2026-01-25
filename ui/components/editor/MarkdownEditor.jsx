import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Bold,
    Italic,
    Code,
    Link as LinkIcon,
    Image,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Table,
    CheckSquare,
    Minus,
} from 'lucide-react';

export default function MarkdownEditor({ value, onChange, placeholder }) {
    const textareaRef = useRef(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    const insertMarkdown = (before, after = '', placeholder = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end) || placeholder;
        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            const newPos = start + before.length + selectedText.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const insertAtCursor = (text) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const newText = value.substring(0, start) + text + value.substring(start);

        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            const newPos = start + text.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const toolbarButtons = [
        { icon: Heading1, label: 'H1', action: () => insertMarkdown('# ', '', 'Heading 1') },
        { icon: Heading2, label: 'H2', action: () => insertMarkdown('## ', '', 'Heading 2') },
        { icon: Heading3, label: 'H3', action: () => insertMarkdown('### ', '', 'Heading 3') },
        { separator: true },
        { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**', 'bold text') },
        { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*', 'italic text') },
        { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`', 'code') },
        { separator: true },
        { icon: LinkIcon, label: 'Link', action: () => insertMarkdown('[', '](url)', 'link text') },
        { icon: Image, label: 'Image', action: () => insertAtCursor('![alt text](image-url)') },
        { separator: true },
        { icon: List, label: 'Bullet List', action: () => insertAtCursor('\n- ') },
        { icon: ListOrdered, label: 'Numbered List', action: () => insertAtCursor('\n1. ') },
        { icon: CheckSquare, label: 'Task List', action: () => insertAtCursor('\n- [ ] ') },
        { separator: true },
        { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ', '', 'quote') },
        { icon: Code, label: 'Code Block', action: () => insertAtCursor('\n```\n\n```\n') },
        {
            icon: Table,
            label: 'Table',
            action: () =>
                insertAtCursor('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'),
        },
        { icon: Minus, label: 'Divider', action: () => insertAtCursor('\n---\n') },
    ];

    const quickInserts = [
        { label: 'Callout Info', action: () => insertAtCursor('\n> [!INFO]\n> Information message\n') },
        { label: 'Callout Warning', action: () => insertAtCursor('\n> [!WARNING]\n> Warning message\n') },
        { label: 'Callout Error', action: () => insertAtCursor('\n> [!ERROR]\n> Error message\n') },
        {
            label: 'Details',
            action: () =>
                insertAtCursor('\n<details>\n<summary>Click to expand</summary>\n\nContent here\n</details>\n'),
        },
        { label: 'Footnote', action: () => insertAtCursor('[^1]\n\n[^1]: Footnote text') },
    ];

    return (
        <div className="mx-auto max-w-4xl">
            <div className="rounded-t-lg border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-wrap items-center gap-1">
                    {toolbarButtons.map((btn, index) => {
                        if (btn.separator) {
                            return <Separator key={`sep-${index}`} orientation="vertical" className="mx-1 h-6" />;
                        }

                        const Icon = btn.icon;
                        return (
                            <Button
                                key={btn.label}
                                variant="ghost"
                                size="sm"
                                onClick={btn.action}
                                title={btn.label}
                                className="h-8 w-8 p-0"
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        );
                    })}
                </div>

                <div className="mt-2 flex flex-wrap gap-2 border-t border-gray-200 pt-2 dark:border-gray-800">
                    <span className="mr-2 text-xs font-medium text-gray-500">Quick Insert:</span>
                    {quickInserts.map((insert) => (
                        <Button
                            key={insert.label}
                            variant="outline"
                            size="sm"
                            onClick={insert.action}
                            className="h-7 text-xs"
                        >
                            {insert.label}
                        </Button>
                    ))}
                </div>
            </div>

            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onSelect={(e) => {
                    setSelection({
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                    });
                }}
                placeholder={placeholder}
                className="min-h-[600px] resize-none rounded-t-none border-t-0 font-mono text-sm focus-visible:ring-0"
            />

            <div className="rounded-b-lg border border-t-0 border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 md:grid-cols-4 dark:text-gray-400">
                    <div>
                        <code>**bold**</code> → <strong>bold</strong>
                    </div>
                    <div>
                        <code>*italic*</code> → <em>italic</em>
                    </div>
                    <div>
                        <code>`code`</code> → <code>code</code>
                    </div>
                    <div>
                        <code>[link](url)</code> → link
                    </div>
                    <div>
                        <code># Heading</code> → Heading
                    </div>
                    <div>
                        <code>- item</code> → • item
                    </div>
                    <div>
                        <code>- [ ] task</code> → ☐ task
                    </div>
                    <div>
                        <code>&gt; quote</code> → quote
                    </div>
                </div>
            </div>

            <div className="mt-2 text-right text-xs text-gray-500">
                {value.length} characters • {value.split(/\s+/).filter(Boolean).length} words
            </div>
        </div>
    );
}
