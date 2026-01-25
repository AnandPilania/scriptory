import { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, Clock, TrendingUp, Activity, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDocuments } from '@/hooks/useDocuments';
import { useConfig } from '@/hooks/useConfig';

export default function TeamActivity() {
    const { documents } = useDocuments();
    const { config } = useConfig();
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        generateActivities();
    }, [documents]);

    const generateActivities = () => {
        const acts = documents.flatMap((doc) => {
            const activities = [];

            activities.push({
                id: `create-${doc.id}`,
                type: 'created',
                user: 'Team Member',
                document: doc.title,
                icon: doc.icon,
                timestamp: doc.createdAt,
                color: 'blue',
            });

            if (doc.updatedAt !== doc.createdAt) {
                activities.push({
                    id: `update-${doc.id}`,
                    type: 'updated',
                    user: 'Team Member',
                    document: doc.title,
                    icon: doc.icon,
                    timestamp: doc.updatedAt,
                    color: 'green',
                });
            }

            if (doc.comments && doc.comments.length > 0) {
                doc.comments.forEach((comment) => {
                    activities.push({
                        id: `comment-${comment.id}`,
                        type: 'commented',
                        user: comment.author,
                        document: doc.title,
                        icon: doc.icon,
                        comment: comment.text,
                        timestamp: comment.createdAt,
                        color: 'purple',
                    });
                });
            }

            return activities;
        });

        acts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivities(acts.slice(0, 50)); // Last 50 activities
    };

    const stats = {
        totalDocs: documents.length,
        recentUpdates: documents.filter((d) => {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return new Date(d.updatedAt) > dayAgo;
        }).length,
        totalComments: documents.reduce((sum, d) => sum + (d.comments?.length || 0), 0),
        teamMembers: new Set(activities.map((a) => a.user)).size,
    };

    return (
        <div className="mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    Team Activity
                </h1>
                <p className="text-gray-500">
                    {config.TEAM_NAME
                        ? `${config.TEAM_NAME} - Collaboration Dashboard`
                        : "Track your team's documentation activity"}
                </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                        <FileText className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDocs}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
                        <TrendingUp className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentUpdates}</div>
                        <p className="text-muted-foreground text-xs">Last 24 hours</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comments</CardTitle>
                        <MessageSquare className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalComments}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <Users className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.teamMembers}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-4">
                            {activities.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <Activity className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                    <p>No activity yet</p>
                                </div>
                            ) : (
                                activities.map((activity, index) => (
                                    <div key={activity.id}>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`h-8 w-8 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900 flex items-center justify-center`}
                                                >
                                                    {activity.type === 'created' && (
                                                        <Plus className="h-4 w-4 text-blue-600" />
                                                    )}
                                                    {activity.type === 'updated' && (
                                                        <FileText className="h-4 w-4 text-green-600" />
                                                    )}
                                                    {activity.type === 'commented' && (
                                                        <MessageSquare className="h-4 w-4 text-purple-600" />
                                                    )}
                                                </div>
                                                {index < activities.length - 1 && (
                                                    <div className="h-12 w-0.5 bg-gray-200 dark:bg-gray-800" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="font-medium">{activity.user}</span>
                                                    <span className="text-sm text-gray-500">{activity.type}</span>
                                                    <span className="text-lg">{activity.icon}</span>
                                                    <span className="font-medium">{activity.document}</span>
                                                </div>
                                                {activity.comment && (
                                                    <div className="mb-1 rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                                                        "{activity.comment}"
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        {index < activities.length - 1 && <Separator className="my-4" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
