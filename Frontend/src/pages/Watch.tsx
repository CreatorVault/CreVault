import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  MoreHorizontal,
  Eye,
  Trash2,
  Calendar,
  Clock
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import VideoPlayer from '@/components/video/VideoPlayer';
import VideoCard from '@/components/video/VideoCard';
import CommentSection from '@/components/video/CommentSection';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { formatViews, formatDate, Video } from '@/lib/mockData';
import {
  getVideo,
  getVideos,
  incrementVideoView,
  updateVideoReaction,
  updateVideoSubscribers,
  checkSubscriptionStatus,
  getUserReactionStatus,
  deleteVideo,
} from '@/lib/api';
import { cn } from '@/lib/utils';
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
} from "@/components/ui/alert-dialog";

const Watch = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [subscribers, setSubscribers] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setHasRecordedView(false);

    getVideo(videoId)
      .then((v) => {
        if (cancelled) return;
        if (v) {
          setVideo(v);
          setViews(v.views);
          setLikes(v.likes);
          setDislikes(v.dislikes);
          setSubscribers(v.author.subscribers);
        } else {
          setVideo(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load video');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    if (!socket || !videoId) return;

    socket.emit('join_video', videoId);

    const handleViewUpdate = (data: { views: number }) => setViews(data.views);
    const handleReactionUpdate = (data: { likes: number; dislikes: number }) => {
      setLikes(data.likes);
      setDislikes(data.dislikes);
    };
    const handleSubscriberUpdate = (data: { subscribers: number }) => setSubscribers(data.subscribers);

    socket.on('view_updated', handleViewUpdate);
    socket.on('reaction_updated', handleReactionUpdate);
    socket.on('subscriber_updated', handleSubscriberUpdate);

    return () => {
      socket.off('view_updated', handleViewUpdate);
      socket.off('reaction_updated', handleReactionUpdate);
      socket.off('subscriber_updated', handleSubscriberUpdate);
    };
  }, [socket, videoId]);

  useEffect(() => {
    if (!videoId) return;
    getVideos()
      .then((list) => {
        setRelatedVideos(list.filter((v) => v.id !== videoId).slice(0, 10));
      })
      .catch(() => setRelatedVideos([]));
  }, [videoId]);

  useEffect(() => {
    if (!videoId || !isAuthenticated) return;
    checkSubscriptionStatus(videoId)
      .then((status) => {
        if (status) {
          setIsSubscribed(status.isSubscribed);
          setSubscribers(status.subscribers);
        }
      })
      .catch(() => { });
  }, [videoId, isAuthenticated]);

  useEffect(() => {
    if (!videoId || !isAuthenticated) {
      setUserReaction(null);
      return;
    }
    getUserReactionStatus(videoId)
      .then((reaction) => setUserReaction(reaction))
      .catch(() => setUserReaction(null));
  }, [videoId, isAuthenticated]);



  const handleViewStart = () => {
    if (!video || hasRecordedView) return;
    setHasRecordedView(true);
    setViews(prev => prev + 1);

    incrementVideoView(video.id)
      .then((updated) => {
        if (updated) setViews(updated.views);
      })
      .catch(() => { });
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to react to vault content.',
        variant: 'destructive',
      });
      return;
    }
    if (!video) return;

    if (userReaction === type) {
      setUserReaction(null);
      if (type === 'like') setLikes(prev => Math.max(0, prev - 1));
      else setDislikes(prev => Math.max(0, prev - 1));
    } else {
      if (userReaction === 'like') setLikes(prev => Math.max(0, prev - 1));
      if (userReaction === 'dislike') setDislikes(prev => Math.max(0, prev - 1));
      setUserReaction(type);
      if (type === 'like') setLikes(prev => prev + 1);
      else setDislikes(prev => prev + 1);
    }

    updateVideoReaction(video.id, type)
      .then((result) => {
        if (result) {
          setLikes(result.video.likes);
          setDislikes(result.video.dislikes);
          setUserReaction(result.userReaction);
        }
      })
      .catch(() => { });
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to ignite your patronage.',
        variant: 'destructive',
      });
      return;
    }
    if (!video) return;

    const nextSubscribed = !isSubscribed;
    setIsSubscribed(nextSubscribed);
    setSubscribers(prev => Math.max(0, prev + (nextSubscribed ? 1 : -1)));

    updateVideoSubscribers(video.id)
      .then((result) => {
        if (result) {
          setSubscribers(result.subscribers);
          setIsSubscribed(result.isSubscribed);
        }
      })
      .catch(() => { });

    toast({
      title: nextSubscribed ? 'Vault Ignited!' : 'Patronage Removed',
      description: nextSubscribed
        ? `You are now supporting ${video.author.username}`
        : `You revoked support for ${video.author.username}`,
    });
  };

  const handleDelete = async () => {
    if (!video) return;
    setIsDeleting(true);
    try {
      await deleteVideo(video.id);
      toast({
        title: 'Content Purged',
        description: 'Your creation has been successfully incinerated.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete creation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user && video && user.id === video.author.id;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[hsl(20_8%_15%)] border-t-[hsl(18_90%_48%)]" />
        </div>
      </MainLayout>
    );
  }

  if (error || !video) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center bg-card p-10 rounded-2xl border border-border shadow-2xl">
            <h1 className="text-2xl font-bold text-foreground">Content not found</h1>
            <p className="mt-2 text-muted-foreground">{error || "This creation doesn't exist or has been reduced to ashes."}</p>
            <Button asChild className="mt-6 bg-primary text-[hsl(20_8%_5%)] hover:bg-primary/90">
              <Link to="/">Return to Vault</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 lg:flex-row p-0 sm:p-4 lg:p-6 w-full max-w-[2000px] mx-auto animate-fade-in">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Video Player */}
          <VideoPlayer
            src={video.videoUrl}
            poster={video.thumbnail}
            onViewStart={handleViewStart}
          />

          {/* Video info */}
          <div className="mt-5 px-4 sm:px-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {video.title}
            </h1>

            {/* Stats and actions */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Link to={`/profile/${video.author.id}`} className="flex items-center gap-3 group shrink-0">
                  <Avatar className="h-11 w-11 avatar-ring transition-transform group-hover:scale-105">
                    <AvatarFallback
                      className="text-base font-bold"
                      style={{
                        background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(43 85% 60%) 100%)',
                        color: 'hsl(20 8% 5%)',
                      }}
                    >
                      {video.author.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">
                      {video.author.username}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {formatViews(subscribers)} patrons
                    </p>
                  </div>
                </Link>

                <Button
                  onClick={handleSubscribe}
                  className={cn(
                    'rounded-full px-6 font-bold tracking-wide transition-all duration-300',
                    isSubscribed
                      ? 'bg-secondary text-foreground hover:bg-secondary border border-border/50 hover:border-border'
                      : 'bg-foreground text-background hover:bg-foreground/90 hover:scale-105 hover:shadow-[0_0_20px_hsl(35_30%_92%/0.2)]'
                  )}
                >
                  {isSubscribed ? 'Patronizing' : 'Patron'}
                </Button>

                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2 rounded-full font-bold ml-auto sm:ml-0 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border backdrop-blur-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Incinerate this creation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your video
                          and reduce it to ashes in the vault.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-accent">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {isDeleting ? 'Incinerating...' : 'Incinerate'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
                {/* Like/Dislike */}
                <div className="flex items-center overflow-hidden rounded-full bg-secondary border border-border/50 shrink-0">
                  <Button
                    variant="ghost"
                    onClick={() => handleReaction('like')}
                    className={cn(
                      'gap-2 rounded-l-full rounded-r-none pl-4 pr-3 hover:bg-accent hover:text-primary transition-colors font-semibold',
                      userReaction === 'like' && 'bg-accent text-primary'
                    )}
                  >
                    <ThumbsUp className={cn('h-4 w-4 xl:h-5 xl:w-5', userReaction === 'like' && 'fill-current')} />
                    <span className="text-sm">{formatViews(likes)}</span>
                  </Button>
                  <div className="h-5 w-px bg-border my-auto" />
                  <Button
                    variant="ghost"
                    onClick={() => handleReaction('dislike')}
                    className={cn(
                      'rounded-l-none rounded-r-full px-3 hover:bg-accent hover:text-destructive transition-colors',
                      userReaction === 'dislike' && 'bg-accent text-destructive'
                    )}
                  >
                    <ThumbsDown className={cn('h-4 w-4 xl:h-5 xl:w-5', userReaction === 'dislike' && 'fill-current')} />
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  className="gap-2 rounded-full font-semibold border border-border/50 hover:bg-accent shrink-0 text-sm"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url).then(() => {
                      toast({ title: 'Link Copied', description: 'Video link has been copied to your clipboard.' });
                    }).catch(() => {
                      // Fallback for older browsers
                      const input = document.createElement('input');
                      input.value = url;
                      document.body.appendChild(input);
                      input.select();
                      document.execCommand('copy');
                      document.body.removeChild(input);
                      toast({ title: 'Link Copied', description: 'Video link has been copied to your clipboard.' });
                    });
                  }}
                >
                  <Share2 className="h-4 w-4 xl:h-5 xl:w-5" />
                  <span className="hidden sm:inline">Share</span>
                </Button>




                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full border border-border/50 hover:bg-accent shrink-0">
                      <MoreHorizontal className="h-4 w-4 xl:h-5 xl:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 border-0"
                    style={{
                      background: 'hsl(20 8% 9%)',
                      border: '1px solid hsl(20 6% 18%)',
                      boxShadow: '0 16px 48px hsl(20 8% 3% / 0.8)',
                    }}
                  >
                    <DropdownMenuItem
                      className="cursor-pointer gap-3 font-medium hover:bg-accent focus:bg-accent py-2.5"
                      onClick={() => {
                        if (!video) return;
                        const WATCH_LATER_KEY = 'crevault_watch_later';
                        try {
                          const stored = localStorage.getItem(WATCH_LATER_KEY);
                          const ids: string[] = stored ? JSON.parse(stored) : [];
                          if (ids.includes(video.id)) {
                            toast({ title: 'Already Saved', description: 'This video is already in your Watch Later list.' });
                          } else {
                            ids.push(video.id);
                            localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(ids));
                            toast({ title: 'Saved to Watch Later', description: 'You can find it in your Watch Later list.' });
                          }
                        } catch {
                          toast({ title: 'Error', description: 'Could not save to Watch Later.', variant: 'destructive' });
                        }
                      }}
                    >
                      <Clock className="h-4 w-4 text-accent" />
                      Watch Later
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ background: 'hsl(20 6% 16%)' }} />
                    <DropdownMenuItem
                      className="cursor-pointer gap-3 font-medium hover:bg-accent focus:bg-accent py-2.5"
                      onClick={() => {
                        toast({ title: 'Video Reported', description: 'Thank you for helping keep the vault safe. We will review this content.' });
                      }}
                    >
                      <Flag className="h-4 w-4 text-destructive" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description Box */}
            <div className="mt-5 rounded-2xl bg-card p-4 border border-border hover:border-border/80 transition-colors shadow-sm cursor-pointer" onClick={() => setShowFullDescription(!showFullDescription)}>
              <div className="flex items-center gap-3 text-sm font-bold text-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-primary" />
                  {formatViews(views)} views
                </span>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(video.uploadedAt)}
                </span>
              </div>
              <div className={cn(
                'mt-3 text-sm text-foreground/90 font-medium leading-relaxed overflow-hidden transition-all',
                !showFullDescription ? 'max-h-20' : 'max-h-[2000px]'
              )}>
                <p className="whitespace-pre-wrap">{video.description}</p>
                {!showFullDescription && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                )}
              </div>
              <Button
                variant="link"
                className="mt-1 h-auto p-0 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
              >
                {showFullDescription ? 'Show less' : '...more'}
              </Button>
            </div>

            {/* Comments */}
            <CommentSection videoId={video.id} socket={socket} />
          </div>
        </div>

        {/* Sidebar - Related videos */}
        <aside className="w-full shrink-0 px-4 sm:px-0 lg:w-[350px] xl:w-[400px]">
          <h3 className="mb-4 font-bold text-foreground text-lg px-1">More from the Vault</h3>
          <div className="space-y-4 sm:space-y-3">
            {relatedVideos.map(v => (
              <VideoCard key={v.id} video={v} layout="list" />
            ))}
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};

export default Watch;
