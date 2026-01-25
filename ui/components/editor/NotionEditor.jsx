import { useState, useRef, useEffect } from 'react';
import {
    Type,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Code,
    Image as ImageIcon,
    Quote,
    Minus,
    Plus,
    GripVertical,
    Trash2,
    Table,
    AlertCircle,
    Info,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BLOCK_TYPES = {
    // Text blocks
    paragraph: { icon: Type, label: 'Text', shortcut: 'text', category: 'Basic' },
    h1: { icon: Heading1, label: 'Heading 1', shortcut: 'h1', category: 'Basic' },
    h2: { icon: Heading2, label: 'Heading 2', shortcut: 'h2', category: 'Basic' },
    h3: { icon: Heading3, label: 'Heading 3', shortcut: 'h3', category: 'Basic' },
    // Lists
    bulletList: { icon: List, label: 'Bullet List', shortcut: 'ul', category: 'Lists' },
    numberedList: { icon: ListOrdered, label: 'Numbered List', shortcut: 'ol', category: 'Lists' },
    todo: { icon: CheckSquare, label: 'To-do', shortcut: 'todo', category: 'Lists' },
    toggle: { icon: ChevronRight, label: 'Toggle List', shortcut: 'toggle', category: 'Lists' },
    // Media
    code: { icon: Code, label: 'Code', shortcut: 'code', category: 'Media' },
    image: { icon: ImageIcon, label: 'Image', shortcut: 'img', category: 'Media' },
    // Advanced
    quote: { icon: Quote, label: 'Quote', shortcut: 'quote', category: 'Advanced' },
    callout: { icon: AlertCircle, label: 'Callout', shortcut: 'callout', category: 'Advanced' },
    divider: { icon: Minus, label: 'Divider', shortcut: 'divider', category: 'Advanced' },
    table: { icon: Table, label: 'Table', shortcut: 'table', category: 'Advanced' },
};

const CALLOUT_TYPES = {
    info: { icon: Info, color: 'blue', label: 'Info' },
    warning: { icon: AlertCircle, color: 'yellow', label: 'Warning' },
    error: { icon: AlertCircle, color: 'red', label: 'Error' },
    success: { icon: CheckSquare, color: 'green', label: 'Success' },
};

const NotionEditor = ({ value, onChange, placeholder, onUpload }) => {
    const [blocks, setBlocks] = useState([]);
    const [focusedBlock, setFocusedBlock] = useState(null);
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [draggedBlock, setDraggedBlock] = useState(null);
    const editorRef = useRef(null);

    useEffect(() => {
        if (value && blocks.length === 0) {
            parseMarkdownToBlocks(value);
        }
    }, [value]);

    const parseMarkdownToBlocks = (markdown) => {
        const lines = markdown.split('\n');
        const newBlocks = [];
        let id = 0;
        let inCodeBlock = false;
        let codeContent = [];
        let codeLanguage = '';

        lines.forEach((line) => {
            const trimmed = line.trim();

            if (trimmed.startsWith('```')) {
                if (inCodeBlock) {
                    newBlocks.push({
                        id: id++,
                        type: 'code',
                        content: codeContent.join('\n'),
                        language: codeLanguage,
                    });
                    codeContent = [];
                    codeLanguage = '';
                    inCodeBlock = false;
                } else {
                    inCodeBlock = true;
                    codeLanguage = trimmed.slice(3);
                }
                return;
            }

            if (inCodeBlock) {
                codeContent.push(line);
                return;
            }

            if (trimmed.startsWith('# ')) {
                newBlocks.push({ id: id++, type: 'h1', content: trimmed.slice(2) });
            } else if (trimmed.startsWith('## ')) {
                newBlocks.push({ id: id++, type: 'h2', content: trimmed.slice(3) });
            } else if (trimmed.startsWith('### ')) {
                newBlocks.push({ id: id++, type: 'h3', content: trimmed.slice(4) });
            } else if (trimmed.startsWith('> [!')) {
                const match = trimmed.match(/> \[!(\w+)\] (.*)/);
                if (match) {
                    newBlocks.push({
                        id: id++,
                        type: 'callout',
                        content: match[2],
                        calloutType: match[1].toLowerCase(),
                    });
                }
            } else if (trimmed.startsWith('- [ ]')) {
                newBlocks.push({ id: id++, type: 'todo', content: trimmed.slice(5).trim(), checked: false });
            } else if (trimmed.startsWith('- [x]')) {
                newBlocks.push({ id: id++, type: 'todo', content: trimmed.slice(5).trim(), checked: true });
            } else if (trimmed.startsWith('- ')) {
                newBlocks.push({ id: id++, type: 'bulletList', content: trimmed.slice(2) });
            } else if (trimmed.match(/^\d+\. /)) {
                newBlocks.push({ id: id++, type: 'numberedList', content: trimmed.replace(/^\d+\. /, '') });
            } else if (trimmed.startsWith('> ')) {
                newBlocks.push({ id: id++, type: 'quote', content: trimmed.slice(2) });
            } else if (trimmed === '---') {
                newBlocks.push({ id: id++, type: 'divider', content: '' });
            } else if (trimmed.startsWith('![')) {
                const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
                if (match) {
                    newBlocks.push({ id: id++, type: 'image', content: match[2], alt: match[1] });
                }
            } else if (trimmed) {
                newBlocks.push({ id: id++, type: 'paragraph', content: trimmed });
            }
        });

        if (newBlocks.length === 0) {
            newBlocks.push({ id: 0, type: 'paragraph', content: '' });
        }

        setBlocks(newBlocks);
    };

    const blocksToMarkdown = (blocks) => {
        return blocks
            .map((block) => {
                switch (block.type) {
                    case 'h1':
                        return `# ${block.content}`;
                    case 'h2':
                        return `## ${block.content}`;
                    case 'h3':
                        return `### ${block.content}`;
                    case 'bulletList':
                        return `- ${block.content}`;
                    case 'numberedList':
                        return `1. ${block.content}`;
                    case 'todo':
                        return `- [${block.checked ? 'x' : ' '}] ${block.content}`;
                    case 'quote':
                        return `> ${block.content}`;
                    case 'code':
                        return `\`\`\`${block.language || ''}\n${block.content}\n\`\`\``;
                    case 'divider':
                        return '---';
                    case 'image':
                        return `![${block.alt || 'image'}](${block.content})`;
                    case 'callout':
                        return `> [!${block.calloutType.toUpperCase()}] ${block.content}`;
                    case 'toggle':
                        return `<details>\n<summary>${block.title}</summary>\n${block.content}\n</details>`;
                    default:
                        return block.content;
                }
            })
            .join('\n');
    };

    const updateBlocks = (newBlocks) => {
        setBlocks(newBlocks);
        onChange(blocksToMarkdown(newBlocks));
    };

    const handleBlockChange = (blockId, field, newValue) => {
        const newBlocks = blocks.map((block) => (block.id === blockId ? { ...block, [field]: newValue } : block));
        updateBlocks(newBlocks);
    };

    const toggleTodo = (blockId) => {
        const newBlocks = blocks.map((block) => (block.id === blockId ? { ...block, checked: !block.checked } : block));
        updateBlocks(newBlocks);
    };

    const addBlock = (afterBlockId, type = 'paragraph') => {
        const index = blocks.findIndex((b) => b.id === afterBlockId);
        const newBlock = {
            id: Math.max(...blocks.map((b) => b.id), 0) + 1,
            type,
            content: '',
            ...(type === 'todo' && { checked: false }),
            ...(type === 'callout' && { calloutType: 'info' }),
            ...(type === 'toggle' && { title: '', expanded: false }),
            ...(type === 'image' && { alt: '' }),
        };

        const newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
        updateBlocks(newBlocks);
        setFocusedBlock(newBlock.id);
    };

    const deleteBlock = (blockId) => {
        if (blocks.length === 1) return;
        const newBlocks = blocks.filter((b) => b.id !== blockId);
        updateBlocks(newBlocks);
    };

    const duplicateBlock = (blockId) => {
        const blockToDuplicate = blocks.find((b) => b.id === blockId);
        const index = blocks.findIndex((b) => b.id === blockId);
        const newBlock = {
            ...blockToDuplicate,
            id: Math.max(...blocks.map((b) => b.id), 0) + 1,
        };

        const newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
        updateBlocks(newBlocks);
    };

    const changeBlockType = (blockId, newType) => {
        const newBlocks = blocks.map((block) => {
            if (block.id === blockId) {
                const baseBlock = { ...block, type: newType };

                if (newType === 'todo') baseBlock.checked = false;
                if (newType === 'callout') baseBlock.calloutType = 'info';
                if (newType === 'toggle') {
                    baseBlock.title = block.content;
                    baseBlock.content = '';
                    baseBlock.expanded = false;
                }
                if (newType === 'image') baseBlock.alt = '';

                return baseBlock;
            }
            return block;
        });
        updateBlocks(newBlocks);
        setShowSlashMenu(false);
    };

    const handleDragStart = (e, blockId) => {
        setDraggedBlock(blockId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, blockId) => {
        e.preventDefault();

        if (draggedBlock === blockId) return;

        const draggedIndex = blocks.findIndex((b) => b.id === draggedBlock);
        const targetIndex = blocks.findIndex((b) => b.id === blockId);

        const newBlocks = [...blocks];
        const [removed] = newBlocks.splice(draggedIndex, 1);
        newBlocks.splice(targetIndex, 0, removed);

        setBlocks(newBlocks);
    };

    const handleDragEnd = () => {
        setDraggedBlock(null);
        updateBlocks(blocks);
    };

    const handleKeyDown = (e, blockId) => {
        const block = blocks.find((b) => b.id === blockId);

        if (e.key === '/') {
            setTimeout(() => {
                setShowSlashMenu(true);
                setSearchTerm('');
                const rect = e.target.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const menuHeight = 400;

                const spaceBelow = viewportHeight - rect.bottom;
                const spaceAbove = rect.top;

                let top, left;

                if (spaceBelow >= menuHeight || spaceBelow > spaceAbove) {
                    top = rect.bottom + window.scrollY + 4;
                } else {
                    top = rect.top + window.scrollY - menuHeight - 4;
                }

                left = Math.min(rect.left + window.scrollX, window.innerWidth - 320 - 20);

                setSlashMenuPosition({ top, left });
            }, 0);
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (showSlashMenu) {
                setShowSlashMenu(false);
            } else {
                addBlock(blockId);
            }
        }

        if (e.key === 'Backspace' && block.content === '') {
            e.preventDefault();
            deleteBlock(blockId);
        }
    };

    const categories = ['all', ...new Set(Object.values(BLOCK_TYPES).map((b) => b.category))];

    const filteredBlockTypes = Object.entries(BLOCK_TYPES).filter(([key, config]) => {
        const matchesSearch =
            config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            config.shortcut.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div ref={editorRef} className="notion-editor mx-auto max-w-4xl">
            <div className="mb-4 opacity-0 transition-opacity hover:opacity-100">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addBlock(blocks[blocks.length - 1]?.id || 0)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Click to add a block, or type '/' for commands
                </Button>
            </div>

            <div className="space-y-2">
                {blocks.map((block) => (
                    <BlockComponent
                        key={block.id}
                        block={block}
                        focused={focusedBlock === block.id}
                        onFocus={() => setFocusedBlock(block.id)}
                        onChange={(field, value) => handleBlockChange(block.id, field, value)}
                        onKeyDown={(e) => handleKeyDown(e, block.id)}
                        onToggleTodo={() => toggleTodo(block.id)}
                        onDelete={() => deleteBlock(block.id)}
                        onDuplicate={() => duplicateBlock(block.id)}
                        onAdd={() => addBlock(block.id)}
                        onDragStart={(e) => handleDragStart(e, block.id)}
                        onDragOver={(e) => handleDragOver(e, block.id)}
                        onDragEnd={handleDragEnd}
                        onUpload={onUpload}
                    />
                ))}
            </div>

            {showSlashMenu && (
                <div
                    className="fixed z-50 max-h-96 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                    style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
                >
                    <div className="border-b border-gray-200 p-3 dark:border-gray-700">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search blocks..."
                            className="w-full rounded-lg border-0 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-900"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-1 overflow-x-auto border-b border-gray-200 p-2 dark:border-gray-700">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    'rounded-lg px-3 py-1 text-xs whitespace-nowrap transition-colors',
                                    selectedCategory === cat
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
                                )}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                        {filteredBlockTypes.map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => changeBlockType(focusedBlock, key)}
                                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-blue-100 dark:bg-gray-800 dark:group-hover:bg-blue-900">
                                        <Icon className="h-4 w-4 text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{config.label}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            /{config.shortcut}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-600">{config.category}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {showSlashMenu && <div className="fixed inset-0 z-40" onClick={() => setShowSlashMenu(false)} />}
        </div>
    );
};

const BlockComponent = ({
    block,
    focused,
    onFocus,
    onChange,
    onKeyDown,
    onToggleTodo,
    onDelete,
    onDuplicate,
    onAdd,
    onDragStart,
    onDragOver,
    onDragEnd,
    onUpload,
}) => {
    const inputRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (focused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [focused]);

    const baseClasses = 'w-full bg-transparent border-0 focus:outline-none resize-none';

    const renderBlock = () => {
        switch (block.type) {
            case 'h1':
                return (
                    <input
                        ref={inputRef}
                        type="text"
                        value={block.content}
                        onChange={(e) => onChange('content', e.target.value)}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        placeholder="Heading 1"
                        className={`${baseClasses} text-4xl font-bold text-gray-900 dark:text-gray-100`}
                    />
                );

            case 'h2':
                return (
                    <input
                        ref={inputRef}
                        type="text"
                        value={block.content}
                        onChange={(e) => onChange('content', e.target.value)}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        placeholder="Heading 2"
                        className={`${baseClasses} text-3xl font-bold text-gray-900 dark:text-gray-100`}
                    />
                );

            case 'h3':
                return (
                    <input
                        ref={inputRef}
                        type="text"
                        value={block.content}
                        onChange={(e) => onChange('content', e.target.value)}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        placeholder="Heading 3"
                        className={`${baseClasses} text-2xl font-bold text-gray-900 dark:text-gray-100`}
                    />
                );

            case 'bulletList':
                return (
                    <div className="flex items-start gap-3">
                        <span className="mt-2 text-gray-400 select-none">•</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={block.content}
                            onChange={(e) => onChange('content', e.target.value)}
                            onFocus={onFocus}
                            onKeyDown={onKeyDown}
                            placeholder="List"
                            className={baseClasses}
                        />
                    </div>
                );

            case 'numberedList':
                return (
                    <div className="flex items-start gap-3">
                        <span className="mt-1 text-gray-400 select-none">1.</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={block.content}
                            onChange={(e) => onChange('content', e.target.value)}
                            onFocus={onFocus}
                            onKeyDown={onKeyDown}
                            placeholder="List"
                            className={baseClasses}
                        />
                    </div>
                );

            case 'todo':
                return (
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={block.checked}
                            onChange={onToggleTodo}
                            className="mt-1.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={block.content}
                            onChange={(e) => onChange('content', e.target.value)}
                            onFocus={onFocus}
                            onKeyDown={onKeyDown}
                            placeholder="To-do"
                            className={`${baseClasses} ${block.checked ? 'text-gray-400 line-through' : ''}`}
                        />
                    </div>
                );

            case 'code':
                return (
                    <div className="overflow-hidden rounded-lg bg-gray-900 dark:bg-black">
                        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2 dark:bg-gray-900">
                            <input
                                type="text"
                                value={block.language || ''}
                                onChange={(e) => onChange('language', e.target.value)}
                                placeholder="Language"
                                className="w-32 border-0 bg-transparent text-xs text-gray-400 focus:outline-none"
                            />
                            <span className="text-xs text-gray-500">Code Block</span>
                        </div>
                        <textarea
                            ref={inputRef}
                            value={block.content}
                            onChange={(e) => onChange('content', e.target.value)}
                            onFocus={onFocus}
                            placeholder="// Enter code..."
                            className="min-h-[120px] w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-gray-100 focus:outline-none"
                            rows={6}
                        />
                    </div>
                );

            case 'quote':
                return (
                    <div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50 py-1 pl-4 dark:border-blue-400 dark:bg-blue-950/20">
                        <input
                            ref={inputRef}
                            type="text"
                            value={block.content}
                            onChange={(e) => onChange('content', e.target.value)}
                            onFocus={onFocus}
                            onKeyDown={onKeyDown}
                            placeholder="Quote"
                            className={`${baseClasses} text-gray-700 italic dark:text-gray-300`}
                        />
                    </div>
                );

            case 'callout':
                const calloutConfig = CALLOUT_TYPES[block.calloutType] || CALLOUT_TYPES.info;
                const CalloutIcon = calloutConfig.icon;
                const colorClasses = {
                    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
                    yellow: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
                    red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
                    green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
                };

                return (
                    <div className={cn('flex gap-3 rounded-r-lg border-l-4 p-3', colorClasses[calloutConfig.color])}>
                        <CalloutIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                            <select
                                value={block.calloutType}
                                onChange={(e) => onChange('calloutType', e.target.value)}
                                className="mb-1 border-0 bg-transparent text-sm font-medium focus:outline-none"
                            >
                                {Object.entries(CALLOUT_TYPES).map(([key, config]) => (
                                    <option key={key} value={key}>
                                        {config.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                ref={inputRef}
                                type="text"
                                value={block.content}
                                onChange={(e) => onChange('content', e.target.value)}
                                onFocus={onFocus}
                                onKeyDown={onKeyDown}
                                placeholder="Callout message..."
                                className={`${baseClasses} text-sm`}
                            />
                        </div>
                    </div>
                );

            case 'divider':
                return <hr className="my-4 border-t-2 border-gray-200 dark:border-gray-700" />;

            case 'image':
                return (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-700">
                        {block.content ? (
                            <div className="space-y-2">
                                <img src={block.content} alt={block.alt || ''} className="max-w-full rounded-lg" />
                                <input
                                    type="text"
                                    value={block.alt || ''}
                                    onChange={(e) => onChange('alt', e.target.value)}
                                    placeholder="Image caption..."
                                    className={`${baseClasses} min-h-[60px]`}
                                    rows={3}
                                />
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                );

            default:
                return (
                    <input
                        ref={inputRef}
                        type="text"
                        value={block.content}
                        onChange={(e) => onChange('content', e.target.value)}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        placeholder="Type '/' for commands, or start writing..."
                        className={baseClasses}
                    />
                );
        }
    };

    return (
        <div
            className={cn(
                'group relative rounded-lg px-3 py-2 transition-all',
                focused && 'bg-blue-50/50 ring-2 ring-blue-200 dark:bg-blue-950/10 dark:ring-blue-800',
                'hover:bg-gray-50 dark:hover:bg-gray-900/50',
            )}
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="absolute top-1/2 left-0 flex -translate-x-full -translate-y-1/2 items-center gap-1 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-grab hover:bg-gray-200 active:cursor-grabbing dark:hover:bg-gray-700"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={onAdd}
                >
                    <Plus className="h-4 w-4 text-gray-400" />
                </Button>
            </div>

            <div className="relative">{renderBlock()}</div>

            <div className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 pl-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} title="Duplicate">
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                        onClick={onDelete}
                        title="Delete"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotionEditor;
