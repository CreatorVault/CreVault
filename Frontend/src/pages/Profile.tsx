import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, Video as VideoIcon, Settings, Eye, ThumbsUp } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import VideoCard from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatViews, formatDate, Video } from '@/lib/mockData';
import { getUserProfile, getUserVideos, ApiUserProfile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState<ApiUserProfile | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getUserProfile(userId),
      getUserVideos(userId),
    ])
      .then(([profile, videos]) => {
        if (cancelled) return;
        setProfileUser(profile);
        setUserVideos(videos);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const totalViews = userVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = userVideos.reduce((acc, v) => acc + (v.likes || 0), 0);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !profileUser) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center stat-card p-10 backdrop-blur-md border border-border/50">
            <h1 className="text-2xl font-bold text-foreground mb-3">{error ? 'Operation Failed' : 'User not found'}</h1>
            <p className="text-muted-foreground mb-6 font-medium">{error || 'This channel does not exist in the vault.'}</p>
            <Button asChild className="btn-primary-glow font-bold" style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
              <Link to="/">Return to Vault</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto animate-fade-in min-h-screen">
        {/* Banner */}
        <div
          className="h-32 sm:h-48 md:h-56 rounded-2xl w-full"
          style={{
            background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.4) 0%, hsl(38 85% 50% / 0.1) 50%, hsl(20 8% 5%) 100%)',
            border: '1px solid hsl(18 90% 48% / 0.2)',
            boxShadow: 'inset 0 0 100px hsl(20 8% 5% / 0.8)'
          }}
        />

        {/* Profile header */}
        <div className="relative -mt-16 sm:-mt-20 flex flex-col items-start gap-4 px-4 sm:flex-row sm:items-end sm:px-6 mb-8">
          <Avatar className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl border-4" style={{ borderColor: 'hsl(20 8% 5%)', boxShadow: '0 0 30px hsl(18 90% 48% / 0.3)' }}>
            <AvatarFallback
              className="text-4xl sm:text-5xl font-bold rounded-2xl text-[hsl(20_8%_5%)]"
              style={{ background: 'linear-gradient(135deg, hsl(43 85% 60%) 0%, hsl(18 90% 48%) 100%)' }}
            >
              {profileUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between w-full pt-2 sm:pt-0">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-4xl tracking-tight mb-2">
                {profileUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="text-primary font-bold">{formatViews(profileUser.subscribers)}</span> patrons
                </span>
                <span className="hidden sm:inline opacity-30">•</span>
                <span className="flex items-center gap-1.5">
                  <VideoIcon className="h-4 w-4 text-accent" />
                  {userVideos.length} creations
                </span>
                <span className="hidden sm:inline opacity-30">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Forged {formatDate(profileUser.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              {isOwnProfile ? (
                <Button variant="secondary" className="gap-2 w-full sm:w-auto font-bold border border-border/50 hover:bg-accent" asChild>
                  <Link to="/dashboard">
                    <Settings className="h-4 w-4" />
                    Manage Vault
                  </Link>
                </Button>
              ) : (
                <Button className="w-full sm:w-auto gap-2 font-bold px-8 btn-primary-glow" style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
                  <Users className="h-4 w-4" />
                  Patron
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats row for own profile */}
        {isOwnProfile && (
          <div className="mb-10 grid grid-cols-1 gap-4 px-2 sm:grid-cols-3 sm:px-0">
            <div className="stat-card p-5 group">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110" style={{ background: 'hsl(18 90% 48% / 0.1)', border: '1px solid hsl(18 90% 48% / 0.2)' }}>
                  <VideoIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Creations</p>
                  <p className="text-2xl font-bold text-foreground">{userVideos.length}</p>
                </div>
              </div>
            </div>

            <div className="stat-card p-5 group">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110" style={{ background: 'hsl(38 85% 50% / 0.1)', border: '1px solid hsl(38 85% 50% / 0.2)' }}>
                  <Eye className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-foreground">{formatViews(totalViews)}</p>
                </div>
              </div>
            </div>

            <div className="stat-card p-5 group">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110" style={{ background: 'hsl(43 85% 60% / 0.1)', border: '1px solid hsl(43 85% 60% / 0.2)' }}>
                  <ThumbsUp className="h-6 w-6" style={{ color: 'hsl(43 85% 60%)' }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Approvals</p>
                  <p className="text-2xl font-bold text-foreground">{formatViews(totalLikes)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="videos" className="mt-4 px-2 sm:px-0">
          <TabsList className="h-14 w-full justify-start gap-4 sm:gap-8 rounded-none border-b border-border bg-transparent p-0 overflow-x-auto scrollbar-hide">
            <TabsTrigger
              value="videos"
              className="h-14 rounded-none border-b-2 border-transparent px-2 sm:px-4 text-base font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
            >
              Creations
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="h-14 rounded-none border-b-2 border-transparent px-2 sm:px-4 text-base font-bold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
            >
              Lore & Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="mt-8">
            {userVideos.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {userVideos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center stat-card border-dashed">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary border border-border">
                  <VideoIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">The forge is silent</h2>
                <p className="text-sm text-muted-foreground max-w-sm mb-6 font-medium">
                  {isOwnProfile
                    ? 'Upload your first creation to start building your legacy.'
                    : 'This creator has not forged any ambers yet.'}
                </p>
                {isOwnProfile && (
                  <Button asChild className="font-bold px-8 btn-primary-glow" style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
                    <Link to="/upload">Ignite the Forge</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
              <div className="md:col-span-2 space-y-4 stat-card p-6 md:p-8">
                <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-2">Lore</h3>
                <p className="text-foreground/90 font-medium leading-relaxed whitespace-pre-wrap">
                  Welcome to {profileUser.name}'s realm! Stay tuned for awesome creations. The embers are just starting to burn.
                </p>
              </div>
              <div className="stat-card p-6 md:p-8 space-y-6 h-fit bg-secondary/30">
                <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground border-b border-border/50 pb-3">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Forged Date</p>
                    <p className="text-sm font-bold text-foreground">{formatDate(profileUser.createdAt)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Total Impact</p>
                    <p className="text-sm font-bold text-foreground">{formatViews(totalViews)} views</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Creations</p>
                    <p className="text-sm font-bold text-foreground">{userVideos.length}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Patrons</p>
                    <p className="text-sm font-bold text-primary">{formatViews(profileUser.subscribers)}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
