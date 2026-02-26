import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { View, Eye, ThumbsUp, Trash2, Video as VideoIcon, Upload, Calendar } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getUserVideos, deleteVideo } from '@/lib/api';
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
        if (!isAuthenticated || !user) {
            if (!loading) navigate('/login');
            return;
        }
        fetchVideos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user, navigate]);

    const fetchVideos = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserVideos(user.id);
            setVideos(data);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to load your creations.',
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
            toast({
                title: 'Incinerated',
                description: 'Your creation has been permanently removed.',
            });
            fetchVideos();
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete creation. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
                </div>
            </MainLayout>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <MainLayout>
            <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 animate-fade-in min-h-[calc(100vh-4rem)]">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                            style={{
                                background: 'hsl(18 90% 48% / 0.1)',
                                border: '1px solid hsl(18 90% 48% / 0.2)',
                            }}
                        >
                            <VideoIcon className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                Your Creations
                            </h1>
                            <p className="mt-1 font-medium text-sm text-muted-foreground uppercase tracking-widest">
                                <span className="text-primary font-bold">{videos.length}</span> forged in the vault
                            </p>
                        </div>
                    </div>
                    <Button asChild className="gap-2 font-bold whitespace-nowrap btn-primary-glow" style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
                        <Link to="/upload">
                            <Upload className="h-4 w-4" />
                            Ignite Forge
                        </Link>
                    </Button>
                </div>

                {/* Video List */}
                <div className="stat-card">
                    {videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-dashed border-border border-2 rounded-2xl m-4">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary border border-border">
                                <VideoIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">The forge is cold</h3>
                            <p className="text-sm font-medium text-muted-foreground max-w-xs mb-6">
                                You haven't uploaded any creations yet. Spark the ember to begin.
                            </p>
                            <Button asChild className="btn-primary-glow font-bold" style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
                                <Link to="/upload">Start Uploading</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="flex flex-col gap-4 p-4 lg:p-6 transition-colors hover:bg-card/80 sm:flex-row sm:items-start group/row"
                                >
                                    {/* Thumbnail */}
                                    <Link
                                        to={`/watch/${video.id}`}
                                        className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-48 group-hover/row:shadow-[0_0_15px_hsl(18_90%_48%/0.15)] transition-all"
                                    >
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="h-full w-full object-cover transition-transform group-hover/row:scale-105 duration-500"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <VideoIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">
                                            {video.duration}
                                        </span>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                                        <Link
                                            to={`/watch/${video.id}`}
                                            className="line-clamp-2 text-lg font-bold text-foreground transition-colors hover:text-primary leading-tight"
                                        >
                                            {video.title}
                                        </Link>
                                        <p className="line-clamp-2 text-sm text-muted-foreground font-medium pr-8">
                                            {video.description || 'No lore provided for this creation.'}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Eye className="h-3.5 w-3.5 text-primary/70" />
                                                {formatViews(video.views)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <ThumbsUp className="h-3.5 w-3.5 text-accent/70" />
                                                {formatViews(video.likes)}
                                            </span>
                                            <span className="hidden sm:inline opacity-30">•</span>
                                            <span className="flex items-center gap-1.5 text-muted-foreground/70">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(video.uploadedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="shrink-0 flex items-center justify-end sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 text-destructive font-bold hover:bg-destructive/10 hover:text-destructive hidden sm:flex"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-card border-border backdrop-blur-xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Incinerate "{video.title}"?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. The creation and all its lore
                                                        will be permanently removed from the vault.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-accent">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(video.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                                                    >
                                                        {deletingId === video.id ? 'Incinerating...' : 'Incinerate'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        {/* Mobile Delete Button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:hidden h-9 w-9"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-card border-border backdrop-blur-xl max-w-xs w-[90vw] rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Incinerate Creation?</AlertDialogTitle>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="flex-col gap-2">
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(video.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold w-full"
                                                    >
                                                        {deletingId === video.id ? 'Incinerating...' : 'Incinerate'}
                                                    </AlertDialogAction>
                                                    <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-accent w-full mt-0">Cancel</AlertDialogCancel>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default YourVideos;
