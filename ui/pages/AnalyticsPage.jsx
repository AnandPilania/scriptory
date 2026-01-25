import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Eye, Edit3, Award } from 'lucide-react';
import { DocumentAnalytics } from '@/lib/analytics';
import { useDocuments } from '@/hooks/useDocuments';

export default function AnalyticsPage() {
    const [analytics] = useState(() => new DocumentAnalytics());
    const { documents } = useDocuments();
    const [stats, setStats] = useState({
        mostViewed: [],
        contributors: [],
        recentEdits: [],
        heatmap: {},
    });

    useEffect(() => {
        setStats({
            mostViewed: analytics.getMostViewed(10),
            contributors: analytics.getContributorStats(),
            recentEdits: analytics.getRecentEdits(20),
            heatmap: analytics.getActivityHeatmap(90),
        });
    }, []);

    const totalViews = Object.values(analytics.views).reduce((sum, v) => sum + v.count, 0);
    const totalEdits = analytics.editHistory.length;
    const uniqueContributors = new Set(analytics.editHistory.map((e) => e.author)).size;

    return (
        <div className="mx-auto max-w-7xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600">
                        <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    Analytics Dashboard
                </h1>
                <p className="text-gray-500">Track your documentation performance and insights</p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <BarChart3 className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documents.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Edits</CardTitle>
                        <Edit3 className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEdits.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                        <Users className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueContributors}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="views" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="views">Most Viewed</TabsTrigger>
                    <TabsTrigger value="contributors">Contributors</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                </TabsList>

                <TabsContent value="views">
                    <Card>
                        <CardHeader>
                            <CardTitle>Most Viewed Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-3">
                                    {stats.mostViewed.map((doc, index) => {
                                        const docInfo = documents.find((d) => d.id === doc.id);
                                        return (
                                            <div
                                                key={doc.id}
                                                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                                            >
                                                <div className="w-8 text-2xl font-bold text-gray-400">#{index + 1}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <span>{docInfo?.icon}</span>
                                                        <span>{docInfo?.title || doc.id}</span>
                                                    </div>
                                                    <div className="mt-1 text-sm text-gray-500">
                                                        {doc.count} views • Last viewed{' '}
                                                        {new Date(doc.lastView).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge>{doc.count}</Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contributors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Contributors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-3">
                                    {stats.contributors.map((contributor, index) => (
                                        <div
                                            key={contributor.author}
                                            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
                                                {contributor.author.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{contributor.author}</div>
                                                <div className="text-sm text-gray-500">
                                                    {contributor.edits} edits • {contributor.documents} documents
                                                </div>
                                            </div>
                                            {index < 3 && (
                                                <Award
                                                    className={`h-6 w-6 ${
                                                        index === 0
                                                            ? 'text-yellow-500'
                                                            : index === 1
                                                              ? 'text-gray-400'
                                                              : 'text-orange-600'
                                                    }`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-3">
                                    {stats.recentEdits.map((edit, index) => {
                                        const doc = documents.find((d) => d.id === edit.documentId);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 border-l-2 border-blue-500 p-3 pl-4"
                                            >
                                                <Edit3 className="h-4 w-4 text-gray-500" />
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {edit.author} edited {doc?.title || edit.documentId}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(edit.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="heatmap">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Heatmap (Last 90 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-10 gap-2">
                                {Object.entries(stats.heatmap)
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([date, count]) => {
                                        const intensity = Math.min(count / 5, 1);
                                        return (
                                            <div
                                                key={date}
                                                title={`${date}: ${count} edits`}
                                                className="h-8 w-8 rounded"
                                                style={{
                                                    backgroundColor:
                                                        count === 0 ? '#e5e7eb' : `rgba(34, 197, 94, ${intensity})`,
                                                }}
                                            />
                                        );
                                    })}
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                <span>Less</span>
                                <div className="h-4 w-4 rounded bg-gray-200" />
                                <div className="h-4 w-4 rounded bg-green-200" />
                                <div className="h-4 w-4 rounded bg-green-400" />
                                <div className="h-4 w-4 rounded bg-green-600" />
                                <span>More</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
