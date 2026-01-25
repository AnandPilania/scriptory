import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { FileText, Settings, Users, Home, Plus, Star, GitBranch, Search } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';

export default function GlobalCommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { documents, createDocument } = useDocuments();

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = useCallback((command) => {
        setOpen(false);
        command();
    }, []);

    const quickActions = [
        {
            label: 'New Document',
            icon: Plus,
            action: async () => {
                const newDoc = await createDocument({
                    title: 'Untitled',
                    icon: '📄',
                    content: '',
                });
                navigate(`/document/${newDoc.id}`);
            },
            shortcut: 'Ctrl+N',
        },
        {
            label: 'Generate from Git Changes',
            icon: GitBranch,
            action: () => navigate('/git-docs'),
            shortcut: 'Ctrl+G',
        },
        {
            label: 'Search Documents',
            icon: Search,
            action: () => navigate('/search'),
            shortcut: 'Ctrl+F',
        },
    ];

    const navigation = [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Team Activity', icon: Users, path: '/team' },
        { label: 'Settings', icon: Settings, path: '/settings' },
        { label: 'Git Documentation', icon: GitBranch, path: '/git-docs' },
    ];

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Quick Actions">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <CommandItem key={action.label} onSelect={() => runCommand(action.action)}>
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{action.label}</span>
                                {action.shortcut && (
                                    <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium opacity-100 select-none">
                                        {action.shortcut}
                                    </kbd>
                                )}
                            </CommandItem>
                        );
                    })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigate">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <CommandItem key={item.path} onSelect={() => runCommand(() => navigate(item.path))}>
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                            </CommandItem>
                        );
                    })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Recent Documents">
                    {documents.slice(0, 5).map((doc) => (
                        <CommandItem key={doc.id} onSelect={() => runCommand(() => navigate(`/document/${doc.id}`))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span className="mr-2">{doc.icon}</span>
                            <span>{doc.title}</span>
                            {doc.favorite && <Star className="ml-auto h-3 w-3 text-yellow-500" />}
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="All Documents">
                    {documents.slice(5).map((doc) => (
                        <CommandItem key={doc.id} onSelect={() => runCommand(() => navigate(`/document/${doc.id}`))}>
                            <span className="mr-2">{doc.icon}</span>
                            <span>{doc.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
