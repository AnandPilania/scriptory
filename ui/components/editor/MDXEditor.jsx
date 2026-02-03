import { useState, useRef, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    FileCode,
    Video,
    Music,
    Columns,
    AlertCircle,
    Info,
    Terminal,
    ChevronRight,
    Braces,
    Hash,
    AtSign,
    Strikethrough,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    Superscript,
    Subscript,
    Palette,
    Eye,
    EyeOff,
    Split,
    Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { renderMarkdown } from '@/utils/markdown';

// Advanced MDX/Markdown features
const TOOLBAR_GROUPS = {
    text: {
        label: 'Text',
        items: [
            { icon: Heading1, label: 'H1', action: 'h1', shortcut: 'Ctrl+Alt+1' },
            { icon: Heading2, label: 'H2', action: 'h2', shortcut: 'Ctrl+Alt+2' },
            { icon: Heading3, label: 'H3', action: 'h3', shortcut: 'Ctrl+Alt+3' },
        ],
    },
    formatting: {
        label: 'Format',
        items: [
            { icon: Bold, label: 'Bold', action: 'bold', shortcut: 'Ctrl+B' },
            { icon: Italic, label: 'Italic', action: 'italic', shortcut: 'Ctrl+I' },
            { icon: Strikethrough, label: 'Strike', action: 'strike' },
            { icon: Underline, label: 'Underline', action: 'underline' },
            { icon: Highlighter, label: 'Highlight', action: 'highlight' },
            { icon: Code, label: 'Inline Code', action: 'inlineCode', shortcut: 'Ctrl+E' },
        ],
    },
    lists: {
        label: 'Lists',
        items: [
            { icon: List, label: 'Bullet List', action: 'bulletList' },
            { icon: ListOrdered, label: 'Numbered List', action: 'numberedList' },
            { icon: CheckSquare, label: 'Task List', action: 'taskList' },
        ],
    },
    blocks: {
        label: 'Blocks',
        items: [
            { icon: Quote, label: 'Quote', action: 'quote' },
            { icon: FileCode, label: 'Code Block', action: 'codeBlock' },
            { icon: Terminal, label: 'Terminal', action: 'terminal' },
            { icon: AlertCircle, label: 'Callout', action: 'callout' },
        ],
    },
    media: {
        label: 'Media',
        items: [
            { icon: LinkIcon, label: 'Link', action: 'link', shortcut: 'Ctrl+K' },
            { icon: Image, label: 'Image', action: 'image' },
            { icon: Video, label: 'Video', action: 'video' },
            { icon: Table, label: 'Table', action: 'table' },
        ],
    },
    advanced: {
        label: 'Advanced',
        items: [
            { icon: Braces, label: 'JSX Component', action: 'jsx' },
            { icon: Hash, label: 'Frontmatter', action: 'frontmatter' },
            { icon: AtSign, label: 'Mention', action: 'mention' },
            { icon: Columns, label: 'Columns', action: 'columns' },
            { icon: ChevronRight, label: 'Details', action: 'details' },
            { icon: Superscript, label: 'Superscript', action: 'superscript' },
            { icon: Subscript, label: 'Subscript', action: 'subscript' },
        ],
    },
};

const MDX_SNIPPETS = {
    // Custom MDX components
    alert: `<Alert variant="info">
  <AlertTitle>Info</AlertTitle>
  <AlertDescription>Your alert message here</AlertDescription>
</Alert>`,

    tabs: `<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`,

    accordion: `<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question?</AccordionTrigger>
    <AccordionContent>Answer here</AccordionContent>
  </AccordionItem>
</Accordion>`,

    chart: `<Chart data={chartData} type="line" />`,

    mermaid: `\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\``,

    math: `$$
E = mc^2
$$`,

    footnote: `Here's a sentence with a footnote.[^1]

[^1]: This is the footnote.`,

    admonition: `:::note
This is a note
:::

:::warning
This is a warning
:::

:::danger
This is dangerous
:::`,

    definition: `Term
: Definition of the term

Another term
: Another definition`,

    abbr: `*[HTML]: Hyper Text Markup Language
*[CSS]: Cascading Style Sheets

The HTML specification is maintained by W3C.`,
};

export default function MDXEditor({ value, onChange, placeholder, onUpload, isPreview }) {
    const textareaRef = useRef(null);
    const [viewMode, setViewMode] = useState('split'); // edit, preview, split
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [activeTab, setActiveTab] = useState('editor');
    const [stats, setStats] = useState({ chars: 0, words: 0, lines: 0 });

    useEffect(() => {
        setViewMode(isPreview ? 'preview' : 'split');
    }, [isPreview]);

    useEffect(() => {
        const chars = value.length;
        const words = value.split(/\s+/).filter(Boolean).length;
        const lines = value.split('\n').length;
        setStats({ chars, words, lines });
    }, [value]);

    const insertText = useCallback(
        (before, after = '', placeholder = '') => {
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
        },
        [value, onChange],
    );

    const handleAction = useCallback(
        (action) => {
            const actions = {
                h1: () => insertText('# ', '', 'Heading 1'),
                h2: () => insertText('## ', '', 'Heading 2'),
                h3: () => insertText('### ', '', 'Heading 3'),
                bold: () => insertText('**', '**', 'bold text'),
                italic: () => insertText('*', '*', 'italic text'),
                strike: () => insertText('~~', '~~', 'strikethrough'),
                underline: () => insertText('<u>', '</u>', 'underlined'),
                highlight: () => insertText('==', '==', 'highlighted'),
                inlineCode: () => insertText('`', '`', 'code'),
                bulletList: () => insertText('\n- ', '', 'list item'),
                numberedList: () => insertText('\n1. ', '', 'list item'),
                taskList: () => insertText('\n- [ ] ', '', 'task'),
                quote: () => insertText('> ', '', 'quote'),
                codeBlock: () => insertText('\n```javascript\n', '\n```\n', 'code here'),
                terminal: () => insertText('\n```bash\n$ ', '\n```\n', 'command'),
                callout: () => insertText('\n:::note\n', '\n:::\n', 'Note content'),
                link: () => insertText('[', '](url)', 'link text'),
                image: () => insertText('![', '](image-url)', 'alt text'),
                video: () => insertText('\n<video src="', '" controls></video>\n', 'video-url'),
                table: () =>
                    insertText('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'),
                jsx: () => insertText('\n<CustomComponent ', ' />\n', 'prop="value"'),
                frontmatter: () =>
                    insertText(
                        '---\ntitle: ',
                        '\ndate: ' + new Date().toISOString().split('T')[0] + '\n---\n',
                        'Document Title',
                    ),
                mention: () => insertText('@', '', 'username'),
                columns: () => insertText('\n<Columns count={2}>\n\n', '\n\n</Columns>\n', 'Column content'),
                details: () =>
                    insertText('\n<details>\n<summary>', '</summary>\n\nContent\n</details>\n', 'Click to expand'),
                superscript: () => insertText('<sup>', '</sup>', 'text'),
                subscript: () => insertText('<sub>', '</sub>', 'text'),
            };

            if (actions[action]) {
                actions[action]();
            }
        },
        [insertText],
    );

    const insertSnippet = useCallback(
        (snippetKey) => {
            const snippet = MDX_SNIPPETS[snippetKey];
            if (snippet) {
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const newText = value.substring(0, start) + '\n' + snippet + '\n' + value.substring(start);
                onChange(newText);
            }
        },
        [value, onChange],
    );

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        handleAction('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        handleAction('italic');
                        break;
                    case 'e':
                        e.preventDefault();
                        handleAction('inlineCode');
                        break;
                    case 'k':
                        e.preventDefault();
                        handleAction('link');
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleAction]);

    const renderToolbar = () => (
        <div className="border-b bg-gray-50 dark:bg-gray-900">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                        value="editor"
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                    >
                        Editor
                    </TabsTrigger>
                    <TabsTrigger
                        value="snippets"
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                    >
                        Snippets
                    </TabsTrigger>
                    <TabsTrigger
                        value="help"
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                    >
                        Help
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-0 p-2">
                    <ScrollArea className="w-full">
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(TOOLBAR_GROUPS).map(([key, group]) => (
                                <div key={key} className="flex items-center gap-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Button
                                                key={item.action}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleAction(item.action)}
                                                title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Icon className="h-4 w-4" />
                                            </Button>
                                        );
                                    })}
                                    <Separator orientation="vertical" className="mx-1 h-6" />
                                </div>
                            ))}

                            <div className="ml-auto flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'edit' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('edit')}
                                    disabled={isPreview}
                                    className={`h-8 ${isPreview ? 'pointer-events-none cursor-not-allowed' : ''}`}
                                >
                                    <Eye className="mr-1 h-3 w-3" />
                                    Edit
                                </Button>
                                <Button
                                    variant={viewMode === 'split' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('split')}
                                    disabled={isPreview}
                                    className={`h-8 ${isPreview ? 'pointer-events-none cursor-not-allowed' : ''}`}
                                >
                                    <Split className="mr-1 h-3 w-3" />
                                    Split
                                </Button>
                                <Button
                                    variant={viewMode === 'preview' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('preview')}
                                    className="h-8"
                                >
                                    <Maximize2 className="mr-1 h-3 w-3" />
                                    Preview
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="snippets" className="mt-0 p-2">
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(MDX_SNIPPETS).map(([key, snippet]) => (
                            <Button
                                key={key}
                                variant="outline"
                                size="sm"
                                onClick={() => insertSnippet(key)}
                                className="h-8"
                            >
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </Button>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="help" className="mt-0 p-2">
                    <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                        <div>
                            <code>**bold**</code> → <strong>bold</strong>
                        </div>
                        <div>
                            <code>*italic*</code> → <em>italic</em>
                        </div>
                        <div>
                            <code>~~strike~~</code> → <del>strike</del>
                        </div>
                        <div>
                            <code>==highlight==</code> → <mark>highlight</mark>
                        </div>
                        <div>
                            <code>`code`</code> → <code>code</code>
                        </div>
                        <div>
                            <code>[link](url)</code> → link
                        </div>
                        <div>
                            <code>![img](url)</code> → image
                        </div>
                        <div>
                            <code>- item</code> → • item
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    return (
        <div className="mx-auto max-w-6xl">
            {renderToolbar()}

            <div
                className={cn(
                    'grid gap-4 p-4',
                    viewMode === 'split' && 'grid-cols-2',
                    viewMode === 'edit' && 'grid-cols-1',
                    viewMode === 'preview' && 'grid-cols-1',
                )}
            >
                {(viewMode === 'edit' || viewMode === 'split') && (
                    <div className="relative">
                        {showLineNumbers && (
                            <div className="absolute top-0 left-0 w-12 bg-gray-100 p-4 font-mono text-xs text-gray-500 select-none dark:bg-gray-800">
                                {value.split('\n').map((_, i) => (
                                    <div key={i} className="leading-6">
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        )}
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            className={cn('min-h-[600px] resize-none font-mono text-sm', showLineNumbers && 'pl-14')}
                        />
                    </div>
                )}

                {(viewMode === 'preview' || viewMode === 'split') && (
                    <div className="min-h-[600px] rounded-lg border bg-white p-6 dark:bg-gray-900">
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            {/* Preview would be rendered here with MDX processor */}
                            <div
                                className="prose prose-lg dark:prose-invert prose-img:rounded-lg prose-img:shadow-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(textareaRef.current.value) }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span>{stats.chars} characters</span>
                        <span>{stats.words} words</span>
                        <span>{stats.lines} lines</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLineNumbers(!showLineNumbers)}
                            className="h-6 text-xs"
                        >
                            {showLineNumbers ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                            Line Numbers
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
