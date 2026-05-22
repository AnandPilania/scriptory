import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const SLASH_COMMANDS = [
    { label: 'Heading 1', syntax: '# ', desc: 'Large section heading' },
    { label: 'Heading 2', syntax: '## ', desc: 'Medium section heading' },
    { label: 'Heading 3', syntax: '### ', desc: 'Small section heading' },
    { label: 'Bullet List', syntax: '- ', desc: 'Unordered list' },
    { label: 'Numbered List', syntax: '1. ', desc: 'Ordered list' },
    { label: 'To-do', syntax: '- [ ] ', desc: 'Checkbox item' },
    { label: 'Code Block', syntax: '```\n\n```', desc: 'Code snippet' },
    { label: 'Quote', syntax: '> ', desc: 'Blockquote' },
    { label: 'Divider', syntax: '\n---\n', desc: 'Horizontal rule' },
    { label: 'Bold', syntax: '**text**', desc: 'Bold text' },
    { label: 'Italic', syntax: '*text*', desc: 'Italic text' },
    { label: 'Link', syntax: '[text](url)', desc: 'Hyperlink' },
];

export default function Editor({ value, onChange, placeholder, onSave }) {
    const textareaRef = useRef(null);
    const [slashMenu, setSlashMenu] = useState({ open: false, x: 0, y: 0, filter: '', selectedIdx: 0 });

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = `${ta.scrollHeight}px`;
    }, [value]);

    const filteredCommands = SLASH_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(slashMenu.filter.toLowerCase())
    );

    const handleKeyDown = (e) => {
        // Global save shortcut
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            onSave?.();
            return;
        }

        // Slash menu navigation
        if (slashMenu.open) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSlashMenu(m => ({ ...m, selectedIdx: Math.min(m.selectedIdx + 1, filteredCommands.length - 1) }));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSlashMenu(m => ({ ...m, selectedIdx: Math.max(m.selectedIdx - 1, 0) }));
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[slashMenu.selectedIdx]) {
                    insertCommand(filteredCommands[slashMenu.selectedIdx]);
                }
                return;
            }
            if (e.key === 'Escape') {
                setSlashMenu(m => ({ ...m, open: false }));
                return;
            }
        }

        // Auto-pair characters
        const ta = textareaRef.current;
        const { selectionStart: ss, selectionEnd: se } = ta;

        if (e.key === 'Tab') {
            e.preventDefault();
            insertAt(ss, se, '  ', 2);
            return;
        }

        // Smart enter: continue list items
        if (e.key === 'Enter') {
            const lineStart = value.lastIndexOf('\n', ss - 1) + 1;
            const currentLine = value.slice(lineStart, ss);
            const listMatch = currentLine.match(/^(\s*)([-*]|\d+\.)\s+(\[ \]\s*)?/);
            if (listMatch) {
                const [full, indent, bullet] = listMatch;
                if (currentLine.trim() === (listMatch[3] ? `${bullet} [ ]` : bullet)) {
                    // Empty list item — remove it
                    e.preventDefault();
                    const newVal = value.slice(0, lineStart) + '\n' + value.slice(ss);
                    onChange(newVal);
                    requestAnimationFrame(() => {
                        ta.selectionStart = ta.selectionEnd = lineStart + 1;
                    });
                } else {
                    e.preventDefault();
                    const nextBullet = /\d+\./.test(bullet)
                        ? `${parseInt(bullet) + 1}. `
                        : `${bullet} `;
                    const continuation = `\n${indent}${nextBullet}${listMatch[3] ? '[ ] ' : ''}`;
                    insertAt(ss, se, continuation, continuation.length);
                }
            }
        }
    };

    const handleChange = (e) => {
        const val = e.target.value;
        onChange(val);

        // Detect slash at line start for slash menu
        const ta = textareaRef.current;
        const { selectionStart: ss } = ta;
        const lineStart = val.lastIndexOf('\n', ss - 1) + 1;
        const textFromLineStart = val.slice(lineStart, ss);

        if (textFromLineStart.startsWith('/') && !textFromLineStart.includes(' ')) {
            const filter = textFromLineStart.slice(1);
            // Calculate approximate position
            setSlashMenu({ open: true, filter, selectedIdx: 0, x: 0, y: 0 });
        } else {
            setSlashMenu(m => ({ ...m, open: false }));
        }
    };

    const insertAt = (start, end, text, cursorOffset) => {
        const ta = textareaRef.current;
        const newVal = value.slice(0, start) + text + value.slice(end);
        onChange(newVal);
        requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + cursorOffset;
            ta.focus();
        });
    };

    const insertCommand = (cmd) => {
        const ta = textareaRef.current;
        const { selectionStart: ss } = ta;
        const lineStart = value.lastIndexOf('\n', ss - 1) + 1;
        // Replace from the slash to cursor
        const newVal = value.slice(0, lineStart) + cmd.syntax + value.slice(ss);
        onChange(newVal);
        setSlashMenu(m => ({ ...m, open: false }));
        requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = lineStart + cmd.syntax.length;
            ta.focus();
        });
    };

    return (
        <div className="relative max-w-4xl mx-auto">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                    'w-full min-h-[600px] font-mono text-sm resize-none bg-transparent',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder:text-gray-300 dark:placeholder:text-gray-600',
                    'focus:outline-hidden',
                    'leading-relaxed',
                    'p-0'
                )}
                spellCheck
            />

            {/* Slash command menu */}
            {slashMenu.open && filteredCommands.length > 0 && (
                <div className="absolute left-0 top-0 mt-6 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="px-3 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                        Blocks
                    </div>
                    {filteredCommands.map((cmd, i) => (
                        <button
                            key={cmd.label}
                            className={cn(
                                'w-full text-left px-3 py-2 text-sm flex flex-col transition-colors',
                                i === slashMenu.selectedIdx
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200'
                            )}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                insertCommand(cmd);
                            }}
                        >
                            <span className="font-medium">{cmd.label}</span>
                            <span className="text-[11px] text-gray-400">{cmd.desc}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
