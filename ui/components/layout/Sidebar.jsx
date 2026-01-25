import { Link, useNavigate } from 'react-router-dom';
import {
    FileText,
    Plus,
    Settings,
    Star,
    Clock,
    Users,
    Menu,
    ChevronRight,
    Home,
    Search as SearchIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useDocuments } from '@/hooks/useDocuments';
import { useConfig } from '@/hooks/useConfig';
import DocumentList from '../documents/DocumentList';
import NewDocumentDialog from '../documents/NewDocumentDialog';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { documents, createDocument, deleteDocument } = useDocuments();
    const { config } = useConfig();
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleCreateDocument = async (data) => {
        const newDoc = await createDocument(data);
        setShowNewDialog(false);
        navigate(`/document/${newDoc.id}`);
    };

    const filteredDocs = documents.filter((doc) => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'favorites' && doc.favorite) || filter === 'recent';
        return matchesSearch && matchesFilter;
    });

    if (!sidebarOpen) {
        return (
            <div className="flex w-16 flex-col items-center gap-3 border-r border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-950">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(true)}
                    className="mb-2"
                    title="Expand Sidebar"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>

                <Separator className="w-10" />

                <Link to="/" title="Home">
                    <Button variant="ghost" size="icon">
                        <Home className="h-5 w-5" />
                    </Button>
                </Link>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setSidebarOpen(true);
                        setTimeout(() => setShowNewDialog(true), 100);
                    }}
                    title="New Document"
                >
                    <Plus className="h-5 w-5" />
                </Button>

                <Separator className="w-10" />

                <div className="flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto py-2">
                    {documents.slice(0, 5).map((doc) => (
                        <Link
                            key={doc.id}
                            to={`/document/${doc.id}`}
                            title={doc.title}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {doc.icon}
                        </Link>
                    ))}
                </div>

                <Separator className="w-10" />

                <Link to="/team" title="Team Activity">
                    <Button variant="ghost" size="icon">
                        <Users className="h-5 w-5" />
                    </Button>
                </Link>

                <Link to="/settings" title="Settings">
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex w-80 flex-col overflow-hidden border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-xl transition-all duration-300 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
            <div className="border-b border-gray-200 p-6 pb-3 dark:border-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                                scriptory
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {config.TEAM_NAME || 'Team Documentation'}
                            </p>
                        </div>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} title="Minimize Sidebar">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                <div className="relative mb-3">
                    <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search docs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Button
                    onClick={() => setShowNewDialog(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Document
                </Button>
            </div>

            <div className="flex justify-around gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                {[
                    { id: 'all', label: 'All', icon: null },
                    { id: 'favorites', label: 'Favorites', icon: Star },
                    { id: 'recent', label: 'Recent', icon: Clock },
                ].map(({ id, label, icon: Icon }) => (
                    <Button
                        key={id}
                        variant={filter === id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter(id)}
                        className={filter === id ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >
                        {Icon && <Icon className="mr-1 h-3 w-3" />}
                        {label}
                    </Button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <DocumentList documents={filteredDocs} onDelete={deleteDocument} />
            </div>

            <div className="space-y-1 border-t border-gray-200 p-4 dark:border-gray-800">
                {config.TEAM_NAME && (
                    <Link to="/team">
                        <Button variant="ghost" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Team Activity
                        </Button>
                    </Link>
                )}
                <Link to="/settings">
                    <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </Link>
            </div>
            <NewDocumentDialog open={showNewDialog} onOpenChange={setShowNewDialog} onSubmit={handleCreateDocument} />
        </div>
    );
}
