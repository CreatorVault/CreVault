import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, ListVideo, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Video } from '@/lib/mockData';
import { getVideos } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const WATCH_LATER_KEY = 'crevault_watch_later';

const getWatchLaterIds = (): string[] => {
    try {
        const stored = localStorage.getItem(WATCH_LATER_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const removeFromWatchLater = (videoId: string) => {
    const ids = getWatchLaterIds().filter(id => id !== videoId);
    localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(ids));
};

const WatchLater = () => {
    const { toast } = useToast();

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchVideos = () => {
        setLoading(true);
        const ids = getWatchLaterIds();

        if (ids.length === 0) {
            setVideos([]);
            setLoading(false);
            return;
        }

        getVideos()
            .then((allVideos) => {
                const filtered = allVideos.filter(v => ids.includes(v.id));
                setVideos(filtered);
            })
            .catch(() => {
                setVideos([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleRemove = (videoId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        removeFromWatchLater(videoId);
        setVideos(prev => prev.filter(v => v.id !== videoId));
        toast({
            title: 'Removed',
            description: 'Video removed from Watch Later list.',
        });
    };

    const filteredVideos = videos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.author.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto w-full gap-6 lg:gap-8 animate-fade-in">

                {/* Left Sidebar - Playlist Info */}
                <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80 lg:self-start">
                    <div className="stat-card p-6 flex flex-col items-center text-center sm:flex-row sm:text-left lg:flex-col lg:text-center gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

                        <div
                            className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, hsl(38 85% 50% / 0.15) 0%, hsl(18 90% 48% / 0.05) 100%)',
                                border: '1px solid hsl(38 85% 50% / 0.3)',
                                boxShadow: 'var(--shadow-glow-gold)'
                            }}
                        >
                            <Clock className="h-12 w-12 text-accent" />
                        </div>

                        <div className="flex flex-col flex-1 w-full text-left sm:text-left lg:text-center mt-2">
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Watch Later</h1>
                            <p className="mt-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                                <span className="text-accent">{videos.length}</span> reserved
                            </p>

                            <p className="mt-4 text-sm text-foreground/80 font-medium leading-relaxed hidden sm:block">
                                Creations you've set aside to witness at a future time. Stored securely in your local vault.
                            </p>

                            <div className="mt-6 w-full pt-6 border-t border-border/50">
                                <Button className="w-full font-bold btn-primary-glow" disabled={videos.length === 0} style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
                                    <ListVideo className="mr-2 h-4 w-4" /> Watch All
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Content - Video List */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-accent" />
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center stat-card border-dashed">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary border border-border">
                                <Clock className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">No reserved ambers</h2>
                            <p className="text-sm font-medium text-muted-foreground max-w-sm mb-6">
                                Explore the vault and save creations to your Watch Later list to view them anytime.
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
                                    placeholder="Search reservations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-11 border-border bg-input focus-visible:ring-0 rounded-xl placeholder:font-medium placeholder:text-muted-foreground/60 font-medium text-foreground"
                                />
                            </div>

                            {/* List */}
                            <div className="flex flex-col gap-4">
                                {filteredVideos.map((video, index) => (
                                    <div key={video.id} className="relative flex gap-4 items-center group/item hover:bg-card/50 p-2 sm:p-0 rounded-2xl sm:rounded-none transition-colors pr-10">
                                        <span className="hidden w-6 text-center text-sm font-bold text-muted-foreground group-hover/item:text-accent sm:block shrink-0 transition-colors">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 w-full min-w-0">
                                            <VideoCard video={video} layout="list" />
                                        </div>

                                        {/* Remove Action */}
                                        <div className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => handleRemove(video.id, e)}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                title="Remove from Watch Later"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {filteredVideos.length === 0 && searchQuery && (
                                    <div className="py-12 text-center">
                                        <p className="text-muted-foreground font-medium">No reservations match your search.</p>
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

export default WatchLater;
