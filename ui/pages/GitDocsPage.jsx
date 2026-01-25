import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    GitBranch,
    FileText,
    Plus,
    Minus,
    Code,
    Calendar,
    User,
    GitCommit,
    RefreshCw,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Info,
} from 'lucide-react';

export default function GitDocsPage() {
    const [gitStatus, setGitStatus] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [includeStaged, setIncludeStaged] = useState(true);
    const [includeDirty, setIncludeDirty] = useState(false);
    const [autoGenerate, setAutoGenerate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGitStatus();
    }, []);

    const fetchGitStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:6767/api/git/status');
            const data = await response.json();
            setGitStatus(data);

            if (data.staged && data.staged.length > 0) {
                setSelectedFiles(data.staged.map((f) => f.path));
            }
        } catch (error) {
            console.error('Error fetching git status:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateDocumentation = async () => {
        try {
            setGenerating(true);

            const response = await fetch('http://localhost:6767/api/git/generate-docs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: selectedFiles,
                    includeStaged,
                    includeDirty,
                    autoGenerate,
                }),
            });

            const data = await response.json();

            if (data.success) {
                navigate(`/document/${data.documentId}`);
            }
        } catch (error) {
            console.error('Error generating documentation:', error);
        } finally {
            setGenerating(false);
        }
    };

    const toggleFile = (filePath) => {
        setSelectedFiles((prev) =>
            prev.includes(filePath) ? prev.filter((f) => f !== filePath) : [...prev, filePath],
        );
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
                    <p className="text-gray-500">Loading Git status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                        <GitBranch className="h-6 w-6 text-white" />
                    </div>
                    Git Documentation Generator
                </h1>
                <p className="text-gray-500">Automatically generate documentation from your Git changes</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Git Changes</span>
                                <Button variant="outline" size="sm" onClick={fetchGitStatus}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="staged">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="staged">Staged ({gitStatus?.staged?.length || 0})</TabsTrigger>
                                    <TabsTrigger value="modified">
                                        Modified ({gitStatus?.modified?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="untracked">
                                        Untracked ({gitStatus?.untracked?.length || 0})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="staged" className="mt-4">
                                    <ScrollArea className="h-96">
                                        {gitStatus?.staged?.length === 0 ? (
                                            <div className="py-8 text-center text-gray-500">
                                                <CheckCircle2 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                                <p>No staged files</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {gitStatus?.staged?.map((file) => (
                                                    <FileItem
                                                        key={file.path}
                                                        file={file}
                                                        selected={selectedFiles.includes(file.path)}
                                                        onToggle={() => toggleFile(file.path)}
                                                        status="staged"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="modified" className="mt-4">
                                    <ScrollArea className="h-96">
                                        {gitStatus?.modified?.length === 0 ? (
                                            <div className="py-8 text-center text-gray-500">
                                                <CheckCircle2 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                                <p>No modified files</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {gitStatus?.modified?.map((file) => (
                                                    <FileItem
                                                        key={file.path}
                                                        file={file}
                                                        selected={selectedFiles.includes(file.path)}
                                                        onToggle={() => toggleFile(file.path)}
                                                        status="modified"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="untracked" className="mt-4">
                                    <ScrollArea className="h-96">
                                        {gitStatus?.untracked?.length === 0 ? (
                                            <div className="py-8 text-center text-gray-500">
                                                <CheckCircle2 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                                <p>No untracked files</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {gitStatus?.untracked?.map((file) => (
                                                    <FileItem
                                                        key={file.path}
                                                        file={file}
                                                        selected={selectedFiles.includes(file.path)}
                                                        onToggle={() => toggleFile(file.path)}
                                                        status="untracked"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Repository Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <GitBranch className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Branch:</span>
                                <Badge>{gitStatus?.branch || 'main'}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Author:</span>
                                <span className="text-gray-600">{gitStatus?.author || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <GitCommit className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Last Commit:</span>
                                <span className="text-xs text-gray-600">{gitStatus?.lastCommit || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="staged" className="text-sm">
                                    Include Staged Files
                                </Label>
                                <input
                                    id="staged"
                                    type="checkbox"
                                    checked={includeStaged}
                                    onChange={(e) => setIncludeStaged(e.target.checked)}
                                    className="h-4 w-4"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dirty" className="text-sm">
                                    Include Modified Files
                                </Label>
                                <input
                                    id="dirty"
                                    type="checkbox"
                                    checked={includeDirty}
                                    onChange={(e) => setIncludeDirty(e.target.checked)}
                                    className="h-4 w-4"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="auto" className="text-sm">
                                    Auto-generate on Commit
                                </Label>
                                <input
                                    id="auto"
                                    type="checkbox"
                                    checked={autoGenerate}
                                    onChange={(e) => setAutoGenerate(e.target.checked)}
                                    className="h-4 w-4"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Selected Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="py-4 text-center">
                                <div className="text-3xl font-bold text-blue-600">{selectedFiles.length}</div>
                                <p className="mt-1 text-sm text-gray-500">files selected</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                        size="lg"
                        onClick={generateDocumentation}
                        disabled={selectedFiles.length === 0 || generating}
                    >
                        {generating ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Documentation
                            </>
                        )}
                    </Button>

                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                        <CardContent className="pt-6">
                            <div className="flex gap-3">
                                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                    <p className="mb-1 font-medium">Auto-Documentation</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Documentation will include:
                                    </p>
                                    <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                        <li>• File changes with diffs</li>
                                        <li>• Author and timestamp</li>
                                        <li>• Commit message (if available)</li>
                                        <li>• Code snippets</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const FileItem = ({ file, selected, onToggle, status }) => {
    const statusColors = {
        staged: 'bg-green-100 text-green-700 border-green-300',
        modified: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        untracked: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    const statusIcons = {
        staged: Plus,
        modified: Code,
        untracked: FileText,
    };

    const Icon = statusIcons[status];

    return (
        <div
            onClick={onToggle}
            className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
            }`}
        >
            <div className="flex items-center gap-3">
                <input type="checkbox" checked={selected} onChange={() => {}} className="h-4 w-4" />
                <Icon className="h-4 w-4 text-gray-500" />
                <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-sm">{file.path}</div>
                    {file.changes && (
                        <div className="mt-1 flex gap-2">
                            <span className="text-xs text-green-600">+{file.changes.additions}</span>
                            <span className="text-xs text-red-600">-{file.changes.deletions}</span>
                        </div>
                    )}
                </div>
                <Badge className={statusColors[status]} variant="outline">
                    {status}
                </Badge>
            </div>
        </div>
    );
};
