import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListVideo, Upload, Eye, ThumbsUp, Trash2, Video as VideoIcon, TrendingUp } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, deleteVideo } from '@/lib/api';
import { formatViews, formatDate, Video } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const YourVideos = () => {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchVideos();
    }, [isAuthenticated, navigate]);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const data = await getDashboardStats();
            setVideos(data.videos);
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to load your videos.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (videoId: string) => {
        setDeletingId(videoId);
        try {
            await deleteVideo(videoId);
            toast({ title: 'Video deleted', description: 'Your video has been permanently removed.' });
            setVideos((prev) => prev.filter((v) => v.id !== videoId));
        } catch {
            toast({ title: 'Error', description: 'Failed to delete video. Please try again.', variant: 'destructive' });
        } finally {
            setDeletingId(null);
        }
    };

    if (!isAuthenticated || !user) return null;

    return (
        <MainLayout>
            <div className="mx-auto max-w-5xl p-4 sm:p-6">
                {/* Page Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, hsl(270 80% 55% / 0.15), hsl(180 100% 50% / 0.1))',
                                border: '1px solid hsl(270 80% 55% / 0.3)',
                                boxShadow: '0 0 20px hsl(270 80% 55% / 0.1)',
                            }}
                        >
                            <ListVideo className="h-5 w-5" style={{ color: 'hsl(270 80% 72%)' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Your Videos</h1>
                            <p className="text-sm text-muted-foreground">
                                {videos.length} video{videos.length !== 1 ? 's' : ''} uploaded
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        className="gap-2 rounded-full"
                        style={{ background: 'hsl(270 80% 55%)', color: 'white' }}
                    >
                        <Link to="/upload">
                            <Upload className="h-4 w-4" />
                            Upload Video
                        </Link>
                    </Button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div
                            className="h-12 w-12 animate-spin rounded-full"
                            style={{
                                border: '3px solid hsl(270 80% 55% / 0.15)',
                                borderTopColor: 'hsl(270 80% 72%)',
                                boxShadow: '0 0 20px hsl(270 80% 55% / 0.2)',
                            }}
                        />
                        <p className="mt-5 text-sm text-muted-foreground font-medium">Loading your videos...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && videos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div
                            className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, hsl(270 40% 14%) 0%, hsl(240 20% 12%) 100%)',
                                border: '1px solid hsl(270 40% 20%)',
                                boxShadow: '0 0 30px hsl(270 80% 55% / 0.08)',
                            }}
                        >
                            <VideoIcon className="h-10 w-10" style={{ color: 'hsl(270 80% 55% / 0.35)' }} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">No videos uploaded yet</h2>
                        <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
                            Share your first video with the CreVault community!
                        </p>
                        <Button
                            asChild
                            className="mt-6 gap-2 rounded-full"
                            style={{ background: 'hsl(270 80% 55%)', color: 'white' }}
                        >
                            <Link to="/upload">
                                <Upload className="h-4 w-4" />
                                Upload Your First Video
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Video list */}
                {!loading && videos.length > 0 && (
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: '1px solid hsl(240 12% 16%)', background: 'hsl(240 16% 8%)' }}
                    >
                        <div
                            className="flex items-center justify-between px-5 py-4"
                            style={{ borderBottom: '1px solid hsl(240 12% 14%)' }}
                        >
                            <div className="flex items-center gap-2">
                                <ListVideo className="h-4 w-4" style={{ color: 'hsl(270 80% 72%)' }} />
                                <span className="font-semibold text-foreground text-sm">All Videos</span>
                            </div>
                            <Link
                                to="/dashboard"
                                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                                View Analytics →
                            </Link>
                        </div>

                        <div className="divide-y" style={{ borderColor: 'hsl(240 12% 13%)' }}>
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 transition-colors hover:bg-white/[0.02]"
                                >
                                    {/* Thumbnail */}
                                    <Link
                                        to={`/watch/${video.id}`}
                                        className="relative aspect-video w-full sm:w-40 shrink-0 overflow-hidden rounded-lg bg-muted"
                                    >
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <VideoIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                                            {video.duration}
                                        </span>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                                        <Link
                                            to={`/watch/${video.id}`}
                                            className="line-clamp-2 font-medium text-foreground transition-colors hover:text-primary"
                                        >
                                            {video.title}
                                        </Link>
                                        <p className="line-clamp-1 text-sm text-muted-foreground">
                                            {video.description || 'No description'}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5" />
                                                {formatViews(video.views)} views
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                {formatViews(video.likes)} likes
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                                {formatDate(video.uploadedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <div className="shrink-0">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="hidden lg:inline">Delete</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete "{video.title}"?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. The video, all its views, and reactions
                                                        will be permanently removed.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(video.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        {deletingId === video.id ? 'Deleting...' : 'Delete'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default YourVideos;
