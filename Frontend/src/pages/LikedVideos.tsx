import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, Play, Video as VideoIcon, RefreshCw, LogIn } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getLikedVideos } from '@/lib/api';
import type { Video } from '@/lib/mockData';
import { formatViews, formatDate } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const LikedVideos = () => {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadVideos = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await getLikedVideos();
            setVideos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load liked videos');
            toast({ title: 'Error', description: 'Failed to load liked videos.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    // ── Not logged in ─────────────────────────────────────────────────────────
    if (!isAuthenticated && !loading) {
        return (
            <MainLayout>
                <div className="mx-auto max-w-lg px-4 py-24 text-center">
                    <div
                        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl"
                        style={{
                            background: 'linear-gradient(135deg, hsl(270 40% 14%), hsl(240 20% 12%))',
                            border: '1px solid hsl(270 40% 22%)',
                            boxShadow: '0 0 40px hsl(180 100% 50% / 0.06)',
                        }}
                    >
                        <ThumbsUp className="h-12 w-12" style={{ color: 'hsl(180 100% 50% / 0.4)' }} />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Sign in to see your liked videos</h1>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        Keep track of videos you like. Sign in to see all the videos you've liked.
                    </p>
                    <Button
                        onClick={() => navigate('/login')}
                        className="mt-8 gap-2 rounded-full px-8 py-3"
                        style={{ background: 'hsl(180 100% 35%)', color: 'white' }}
                    >
                        <LogIn className="h-4 w-4" />
                        Sign In
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="mx-auto max-w-6xl p-4 sm:p-6">
                {/* ── Header ─────────────────────────────────────────────────────── */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, hsl(180 100% 50% / 0.12), hsl(270 80% 55% / 0.12))',
                                border: '1px solid hsl(180 100% 50% / 0.3)',
                                boxShadow: '0 0 20px hsl(180 100% 50% / 0.1)',
                            }}
                        >
                            <ThumbsUp className="h-5 w-5" style={{ color: 'hsl(180 100% 50%)' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Liked Videos</h1>
                            <p className="text-sm text-muted-foreground">
                                {loading ? 'Loading…' : `${videos.length} video${videos.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadVideos}
                        disabled={loading}
                        className="gap-2 text-muted-foreground hover:text-primary"
                    >
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                        Refresh
                    </Button>
                </div>

                {/* ── Loading ────────────────────────────────────────────────────── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div
                            className="h-12 w-12 animate-spin rounded-full"
                            style={{
                                border: '3px solid hsl(180 100% 50% / 0.15)',
                                borderTopColor: 'hsl(180 100% 50%)',
                                boxShadow: '0 0 20px hsl(180 100% 50% / 0.2)',
                            }}
                        />
                        <p className="mt-5 text-sm text-muted-foreground font-medium">Loading liked videos…</p>
                    </div>
                )}

                {/* ── Error ─────────────────────────────────────────────────────── */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div
                            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                            style={{ background: 'hsl(350 80% 55% / 0.12)', border: '1px solid hsl(350 80% 55% / 0.25)' }}
                        >
                            ⚡
                        </div>
                        <p className="font-semibold text-destructive">{error}</p>
                        <Button onClick={loadVideos} variant="ghost" className="mt-4 gap-2 text-muted-foreground">
                            <RefreshCw className="h-4 w-4" /> Try again
                        </Button>
                    </div>
                )}

                {/* ── Empty state ───────────────────────────────────────────────── */}
                {!loading && !error && videos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div
                            className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, hsl(270 40% 14%) 0%, hsl(240 20% 12%) 100%)',
                                border: '1px solid hsl(270 40% 20%)',
                                boxShadow: '0 0 30px hsl(180 100% 50% / 0.08)',
                            }}
                        >
                            <ThumbsUp className="h-10 w-10" style={{ color: 'hsl(180 100% 50% / 0.35)' }} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">No liked videos yet</h2>
                        <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
                            Like videos while watching them and they'll appear here automatically.
                        </p>
                        <Button
                            asChild
                            className="mt-6 gap-2 rounded-full px-6"
                            style={{ background: 'hsl(180 100% 35%)', color: 'white' }}
                        >
                            <Link to="/explore">
                                <Play className="h-4 w-4" />
                                Browse Videos
                            </Link>
                        </Button>
                    </div>
                )}

                {/* ── Video list ────────────────────────────────────────────────── */}
                {!loading && !error && videos.length > 0 && (
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: '1px solid hsl(240 12% 16%)', background: 'hsl(240 16% 8%)' }}
                    >
                        {/* List header */}
                        <div
                            className="flex items-center gap-3 px-5 py-4"
                            style={{ borderBottom: '1px solid hsl(240 12% 14%)' }}
                        >
                            <ThumbsUp className="h-4 w-4" style={{ color: 'hsl(180 100% 50%)' }} />
                            <span className="text-sm font-semibold text-foreground">
                                {videos.length} liked video{videos.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="divide-y" style={{ borderColor: 'hsl(240 12% 13%)' }}>
                            {videos.map((video, index) => (
                                <div
                                    key={video.id}
                                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 transition-colors hover:bg-white/[0.02]"
                                >
                                    {/* Index number */}
                                    <span
                                        className="hidden sm:flex shrink-0 h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                                        style={{ color: 'hsl(180 100% 50% / 0.5)', background: 'hsl(180 100% 50% / 0.05)' }}
                                    >
                                        {index + 1}
                                    </span>

                                    {/* Thumbnail */}
                                    <Link
                                        to={`/watch/${video.id}`}
                                        className="relative shrink-0 w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-muted"
                                    >
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <VideoIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        {/* Duration badge */}
                                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white font-medium">
                                            {video.duration}
                                        </span>
                                        {/* Play overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ background: 'hsl(180 100% 50% / 0.1)' }}>
                                            <div className="rounded-full p-2" style={{ background: 'hsl(0 0% 0% / 0.6)', backdropFilter: 'blur(4px)' }}>
                                                <Play className="h-5 w-5 text-white fill-white" />
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                                        <Link
                                            to={`/watch/${video.id}`}
                                            className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                                        >
                                            {video.title}
                                        </Link>
                                        <Link
                                            to={`/profile/${video.author.id}`}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {video.author.username}
                                        </Link>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="h-3 w-3" style={{ color: 'hsl(180 100% 50%)' }} />
                                                <span style={{ color: 'hsl(180 100% 50%)' }}>{formatViews(video.likes)} likes</span>
                                            </span>
                                            <span>•</span>
                                            <span>{formatViews(video.views)} views</span>
                                            <span>•</span>
                                            <span>{formatDate(video.uploadedAt)}</span>
                                        </div>
                                    </div>

                                    {/* Watch button */}
                                    <Link
                                        to={`/watch/${video.id}`}
                                        className="shrink-0 hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all"
                                        style={{
                                            color: 'hsl(180 100% 50%)',
                                            border: '1px solid hsl(180 100% 50% / 0.2)',
                                            background: 'hsl(180 100% 50% / 0.05)',
                                        }}
                                    >
                                        <Play className="h-3.5 w-3.5 fill-current" />
                                        Watch
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default LikedVideos;
