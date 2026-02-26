import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { categories } from '@/lib/mockData';
import type { Video } from '@/lib/mockData';
import { getVideos } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
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
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVideos = useMemo(() => {
    let list = videos;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          video.author.username.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      list = list.filter((video) => video.category === selectedCategory);
    }

    return list;
  }, [videos, searchQuery, selectedCategory]);

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 animate-fade-in w-full max-w-[2000px] mx-auto min-h-screen">

        {/* Category filter pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'category-pill',
                selectedCategory === category
                  ? 'category-pill-active'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-[0_0_12px_hsl(18_90%_48%/0.15)] shadow-sm'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search results header */}
        {searchQuery && (
          <div className="mb-8 flex items-center gap-4 animate-fade-in">
            <div
              className="flex h-12 w-12 items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.15) 0%, hsl(38 85% 50% / 0.15) 100%)',
                border: '1px solid hsl(18 90% 48% / 0.3)',
                boxShadow: 'var(--shadow-glow-ember)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            >
              <Search className="h-5 w-5" style={{ color: 'hsl(38 85% 50%)' }} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Results for <span className="gradient-text">"{searchQuery}"</span>
              </h1>
              <p className="text-sm font-medium mt-1 text-muted-foreground">
                {filteredVideos.length} vault item{filteredVideos.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse">
            <div
              className="h-14 w-14 animate-spin rounded-full"
              style={{
                border: '3px solid hsl(18 90% 48% / 0.15)',
                borderTopColor: 'hsl(18 90% 48%)',
                boxShadow: '0 0 24px hsl(18 90% 48% / 0.3)',
              }}
            />
            <p className="mt-6 text-sm text-primary font-bold tracking-widest uppercase">Unlocking Vault...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div
              className="mb-5 flex h-20 w-20 items-center justify-center text-4xl"
              style={{
                background: 'hsl(0 70% 50% / 0.1)',
                border: '1px solid hsl(0 70% 50% / 0.3)',
                boxShadow: '0 0 30px hsl(0 70% 50% / 0.15)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            >
              ⚡
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Operation Failed</h2>
            <p className="font-semibold text-destructive">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground w-full max-w-sm">Please ensure the vault backend is operational on port 5000.</p>
          </div>
        )}

        {/* Video grid */}
        {!loading && !error && filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div
              className="mb-6 flex h-24 w-24 items-center justify-center text-5xl"
              style={{
                background: 'linear-gradient(135deg, hsl(20 8% 10%) 0%, hsl(20 8% 6%) 100%)',
                border: '1px solid hsl(20 8% 15%)',
                boxShadow: 'inset 0 0 20px hsl(0 0% 0% / 0.5)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            >
              🎬
            </div>
            <h2 className="text-2xl font-bold text-foreground">Vault is empty</h2>
            <p className="mt-3 text-sm font-medium text-muted-foreground max-w-sm">
              {searchQuery
                ? 'Try different search terms or explore other categories to ignite your search.'
                : 'No creations in this category yet — be the first to forge one!'}
            </p>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default Home;
