import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Search, Clock } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Video } from '@/lib/mockData';
import { getLikedVideos } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LikedVideos = () => {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        getLikedVideos()
            .then((data) => {
                if (!cancelled) setVideos(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError('Failed to fetch liked videos. Please try again.');
                    toast({
                        title: 'Error',
                        description: 'Could not load your liked videos.',
                        variant: 'destructive',
                    });
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, toast]);

    const filteredVideos = videos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.author.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto w-full gap-6 lg:gap-8 animate-fade-in">

                {/* Left Sidebar - Playlist Info */}
                <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80 lg:self-start lg:min-h-[calc(100vh-8rem)]">
                    <div className="stat-card p-6 flex flex-col items-center text-center sm:flex-row sm:text-left lg:flex-col lg:text-center gap-6 h-full relative overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                        <div
                            className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.15) 0%, hsl(38 85% 50% / 0.1) 100%)',
                                border: '1px solid hsl(18 90% 48% / 0.3)',
                                boxShadow: 'var(--shadow-glow-ember)'
                            }}
                        >
                            <ThumbsUp className="h-12 w-12 text-primary" />
                        </div>

                        <div className="flex flex-col flex-1 w-full text-left sm:text-left lg:text-center mt-2">
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Approvals</h1>
                            <p className="mt-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                                <span className="text-primary">{videos.length}</span> creations
                            </p>

                            <p className="mt-4 text-sm text-foreground/80 font-medium leading-relaxed hidden sm:block">
                                The vault remembers your favor. These are the creations you've approved and ignited.
                            </p>

                            <div className="mt-6 w-full pt-6 border-t border-border/50">
                                <Button className="w-full font-bold btn-primary-glow" disabled={videos.length === 0} style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
                                    <Clock className="mr-2 h-4 w-4" /> Loop All
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Content - Video List */}
                <div className="flex-1 min-w-0">
                    {!isAuthenticated ? (
                        <div className="flex flex-col items-center justify-center py-24 stat-card border-dashed">
                            <h2 className="text-xl font-bold text-foreground mb-2">Vault Locked</h2>
                            <p className="mb-6 text-sm text-muted-foreground font-medium">Sign in to view creations you've approved.</p>
                            <Button asChild className="font-bold px-8" style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
                                <Link to="/login">Ignite Session</Link>
                            </Button>
                        </div>
                    ) : loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-24 stat-card bg-destructive/5 border-destructive/20 text-center">
                            <p className="text-destructive font-bold mb-4">{error}</p>
                            <Button variant="outline" onClick={() => window.location.reload()} className="hover:bg-accent border-border/50">
                                Try Again
                            </Button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center stat-card border-dashed">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary border border-border">
                                <ThumbsUp className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">No approvals yet</h2>
                            <p className="text-sm font-medium text-muted-foreground max-w-sm mb-6">
                                Forge your path and approve creations you enjoy to save them here.
                            </p>
                            <Button asChild className="btn-primary-glow font-bold" style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
                                <Link to="/">Explore Vault</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Search Within Playlist */}
                            <div className="ember-input relative rounded-xl max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search approvals..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-11 border-border bg-input focus-visible:ring-0 rounded-xl placeholder:font-medium placeholder:text-muted-foreground/60 font-medium text-foreground"
                                />
                            </div>

                            {/* List */}
                            <div className="flex flex-col gap-4">
                                {filteredVideos.map((video, index) => (
                                    <div key={video.id} className="flex gap-4 items-center group/item hover:bg-card/50 p-2 sm:p-0 rounded-2xl sm:rounded-none transition-colors">
                                        <span className="hidden w-6 text-center text-sm font-bold text-muted-foreground group-hover/item:text-primary sm:block shrink-0 transition-colors">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 w-full min-w-0">
                                            <VideoCard video={video} layout="list" />
                                        </div>
                                    </div>
                                ))}
                                {filteredVideos.length === 0 && searchQuery && (
                                    <div className="py-12 text-center">
                                        <p className="text-muted-foreground font-medium">No approvals match your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default LikedVideos;
