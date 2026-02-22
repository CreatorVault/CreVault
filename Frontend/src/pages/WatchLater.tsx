import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2, Play, Video as VideoIcon } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getVideos } from '@/lib/api';
import type { Video } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const WATCH_LATER_KEY = 'crevault_watch_later';

export function getWatchLaterIds(): string[] {
    try {
        const raw = localStorage.getItem(WATCH_LATER_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function addToWatchLater(videoId: string) {
    const ids = getWatchLaterIds();
    if (!ids.includes(videoId)) {
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify([...ids, videoId]));
    }
}

export function removeFromWatchLater(videoId: string) {
    const ids = getWatchLaterIds().filter((id) => id !== videoId);
    localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(ids));
}

export function isInWatchLater(videoId: string): boolean {
    return getWatchLaterIds().includes(videoId);
}

const WatchLater = () => {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    const loadVideos = async () => {
        setLoading(true);
        try {
            const ids = getWatchLaterIds();
            if (ids.length === 0) {
                setVideos([]);
                return;
            }
            const allVideos = await getVideos();
            setVideos(allVideos.filter((v) => ids.includes(v.id)));
        } catch {
            toast({ title: 'Error', description: 'Failed to load Watch Later list.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const handleRemove = (videoId: string) => {
        removeFromWatchLater(videoId);
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
        toast({ title: 'Removed', description: 'Video removed from Watch Later.' });
    };

    const handleClearAll = () => {
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify([]));
        setVideos([]);
        toast({ title: 'Cleared', description: 'Watch Later list cleared.' });
    };

    return (
        <MainLayout>
            <div className="p-4 sm:p-6 mx-auto max-w-6xl">
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, hsl(270 80% 55% / 0.15), hsl(240 20% 12%))',
                                border: '1px solid hsl(270 80% 55% / 0.3)',
                                boxShadow: '0 0 20px hsl(270 80% 55% / 0.1)',
                            }}
                        >
                            <Clock className="h-5 w-5" style={{ color: 'hsl(270 80% 72%)' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Watch Later</h1>
                            <p className="text-sm text-muted-foreground">
                                {videos.length} video{videos.length !== 1 ? 's' : ''} saved
                            </p>
                        </div>
                    </div>
                    {videos.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All
                        </Button>
                    )}
                </div>

                {/* Not logged in warning */}
                {!isAuthenticated && (
                    <div
                        className="mb-6 rounded-xl p-4"
                        style={{
                            background: 'hsl(270 40% 14% / 0.5)',
                            border: '1px solid hsl(270 40% 25%)',
                        }}
                    >
                        <p className="text-sm" style={{ color: 'hsl(270 80% 72%)' }}>
                            💡 Sign in to sync your Watch Later list across devices.{' '}
                            <Link to="/login" className="underline hover:text-primary">
                                Sign in
                            </Link>
                        </p>
                    </div>
                )}

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
                        <p className="mt-5 text-sm text-muted-foreground font-medium">Loading your list...</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && videos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div
                            className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
                            style={{
                                background: 'linear-gradient(135deg, hsl(270 40% 14%) 0%, hsl(240 20% 12%) 100%)',
                                border: '1px solid hsl(270 40% 20%)',
                                boxShadow: '0 0 30px hsl(270 80% 55% / 0.1)',
                            }}
                        >
                            <Clock className="h-10 w-10" style={{ color: 'hsl(270 80% 55% / 0.4)' }} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">No videos saved</h2>
                        <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
                            Save videos to watch later by clicking the clock icon on any video.
                        </p>
                        <Button asChild className="mt-6 gap-2 rounded-full" style={{ background: 'hsl(270 80% 55%)' }}>
                            <Link to="/explore">
                                <Play className="h-4 w-4" />
                                Browse Videos
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Video list */}
                {!loading && videos.length > 0 && (
                    <div className="space-y-3">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl p-3 transition-all"
                                style={{
                                    background: 'hsl(240 16% 9%)',
                                    border: '1px solid hsl(240 12% 15%)',
                                }}
                            >
                                {/* Thumbnail */}
                                <Link
                                    to={`/watch/${video.id}`}
                                    className="relative shrink-0 w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-muted"
                                >
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
                                <div className="flex flex-1 flex-col gap-1 min-w-0">
                                    <Link
                                        to={`/watch/${video.id}`}
                                        className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                                    >
                                        {video.title}
                                    </Link>
                                    <p className="text-sm text-muted-foreground">{video.author.username}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        {video.views.toLocaleString()} views
                                    </p>
                                </div>

                                {/* Remove */}
                                <button
                                    onClick={() => handleRemove(video.id)}
                                    className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Remove</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default WatchLater;
