import React, { useState, useMemo, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { categories } from '@/lib/mockData';
import type { Video } from '@/lib/mockData';
import { getVideos } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Compass } from 'lucide-react';

const Explore = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        getVideos()
            .then((data) => {
                if (!cancelled) setVideos(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load videos');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const filteredVideos = useMemo(() => {
        if (selectedCategory === 'All') return videos;
        return videos.filter((v) => v.category === selectedCategory);
    }, [videos, selectedCategory]);

    return (
        <MainLayout>
            <div className="p-4 sm:p-6">
                {/* Page Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                            background: 'linear-gradient(135deg, hsl(180 100% 50% / 0.15), hsl(270 80% 55% / 0.15))',
                            border: '1px solid hsl(180 100% 50% / 0.3)',
                            boxShadow: '0 0 20px hsl(180 100% 50% / 0.1)',
                        }}
                    >
                        <Compass className="h-5 w-5" style={{ color: 'hsl(180 100% 50%)' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Explore</h1>
                        <p className="text-sm text-muted-foreground">Discover videos across all categories</p>
                    </div>
                </div>

                {/* Category filter pills */}
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                                'category-pill shrink-0 whitespace-nowrap',
                                selectedCategory === category
                                    ? 'category-pill-active'
                                    : 'category-pill-inactive'
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Loading */}
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
                        <p className="mt-5 text-sm text-muted-foreground font-medium">Exploring the vault...</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div
                            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                            style={{ background: 'hsl(350 80% 55% / 0.12)', border: '1px solid hsl(350 80% 55% / 0.25)' }}
                        >
                            ⚡
                        </div>
                        <p className="font-semibold text-destructive">{error}</p>
                        <p className="mt-2 text-sm text-muted-foreground">Make sure the backend is running on port 5000.</p>
                    </div>
                )}

                {/* Video grid */}
                {!loading && !error && filteredVideos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                ) : !loading && !error ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div
                            className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl"
                            style={{
                                background: 'linear-gradient(135deg, hsl(270 40% 14%) 0%, hsl(240 20% 12%) 100%)',
                                border: '1px solid hsl(270 40% 20%)',
                                boxShadow: '0 0 30px hsl(270 80% 55% / 0.1)',
                            }}
                        >
                            🔭
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Nothing to explore yet</h2>
                        <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
                            No videos in this category — check back soon or switch categories!
                        </p>
                    </div>
                ) : null}
            </div>
        </MainLayout>
    );
};

export default Explore;
