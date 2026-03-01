import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Eye,
    ThumbsUp,
    Video as VideoIcon,
    Trash2,
    Upload,
    BarChart3,
    TrendingUp,
    IndianRupee,
    RefreshCw,
    Lock,
    Users,
    Calendar,
    Sparkles,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, deleteVideo } from '@/lib/api';
import { formatViews, formatDate, Video } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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

interface Stats {
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    videos: Video[];
}

const PATRON_THRESHOLD = 2000;
const EARNINGS_RATE = 0.40; // ₹ per view

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Pull patron count from the authenticated user object
    const patronCount = (user as any)?.subscribers ?? 0;
    const isMonetized = patronCount >= PATRON_THRESHOLD;
    const patronProgress = Math.min((patronCount / PATRON_THRESHOLD) * 100, 100);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchStats();
    }, [isAuthenticated, navigate]);

    const fetchStats = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            toast({
                title: 'Vault Sync Failed',
                description: 'Could not load dashboard data. Is the backend running?',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = async (videoId: string) => {
        setDeletingId(videoId);
        try {
            await deleteVideo(videoId);
            toast({
                title: 'Creation Incinerated',
                description: 'Your video has been permanently removed from the vault.',
            });
            await fetchStats(true);
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete video. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    <p className="text-xs font-bold uppercase tracking-widest text-primary animate-pulse">Syncing Vault...</p>
                </div>
            </MainLayout>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const earnings = isMonetized ? (stats?.totalViews ?? 0) * EARNINGS_RATE : 0;

    return (
        <MainLayout>
            <div className="mx-auto max-w-6xl p-4 lg:p-8 animate-fade-in min-h-screen">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                            style={{
                                background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.15), hsl(43 85% 60% / 0.1))',
                                border: '1px solid hsl(18 90% 48% / 0.3)',
                                boxShadow: 'var(--shadow-glow-ember)',
                            }}
                        >
                            <BarChart3 className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                Forge Control
                            </h1>
                            <p className="mt-1 text-sm font-medium text-muted-foreground">
                                Welcome back, <span className="font-bold text-primary">{user.username}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => fetchStats(true)}
                            disabled={refreshing}
                            className="h-10 w-10 border border-border/50 hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                            title="Refresh stats"
                        >
                            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                        </Button>
                        <Button
                            asChild
                            className="gap-2 font-bold btn-primary-glow"
                            style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}
                        >
                            <Link to="/upload">
                                <Upload className="h-4 w-4" />
                                Ignite Forge
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {/* Creations */}
                    <div className="stat-card p-6 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-150 group-hover:-translate-y-2 group-hover:translate-x-2 pointer-events-none">
                            <VideoIcon className="h-20 w-20" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Creations</p>
                                <p className="text-4xl font-black text-foreground">{stats?.totalVideos ?? 0}</p>
                                <p className="mt-2 text-xs font-semibold text-muted-foreground">videos forged</p>
                            </div>
                            <div className="flex h-13 w-13 items-center justify-center rounded-xl p-3 transition-transform group-hover:scale-110"
                                style={{ background: 'hsl(18 90% 48% / 0.12)', border: '1px solid hsl(18 90% 48% / 0.25)' }}>
                                <VideoIcon className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Total Views */}
                    <div className="stat-card p-6 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-150 group-hover:-translate-y-2 group-hover:translate-x-2 pointer-events-none">
                            <Eye className="h-20 w-20" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Insight</p>
                                <p className="text-4xl font-black text-foreground">{formatViews(stats?.totalViews ?? 0)}</p>
                                <p className="mt-2 text-xs font-semibold text-muted-foreground">total views</p>
                            </div>
                            <div className="flex h-13 w-13 items-center justify-center rounded-xl p-3 transition-transform group-hover:scale-110"
                                style={{ background: 'hsl(38 85% 50% / 0.12)', border: '1px solid hsl(38 85% 50% / 0.25)' }}>
                                <Eye className="h-6 w-6 text-accent" />
                            </div>
                        </div>
                    </div>

                    {/* Total Approvals (Likes) */}
                    <div className="stat-card p-6 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-150 group-hover:-translate-y-2 group-hover:translate-x-2 pointer-events-none">
                            <ThumbsUp className="h-20 w-20" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Approvals</p>
                                <p className="text-4xl font-black text-foreground">{formatViews(stats?.totalLikes ?? 0)}</p>
                                <p className="mt-2 text-xs font-semibold text-muted-foreground">total likes</p>
                            </div>
                            <div className="flex h-13 w-13 items-center justify-center rounded-xl p-3 transition-transform group-hover:scale-110"
                                style={{ background: 'hsl(43 85% 60% / 0.12)', border: '1px solid hsl(43 85% 60% / 0.25)' }}>
                                <ThumbsUp className="h-6 w-6" style={{ color: 'hsl(43 85% 60%)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Earnings — gated at 2K patrons */}
                    <div className={cn(
                        "stat-card p-6 group overflow-hidden relative transition-all",
                        !isMonetized && "opacity-90"
                    )}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-150 group-hover:-translate-y-2 group-hover:translate-x-2 pointer-events-none">
                            <IndianRupee className="h-20 w-20" />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Earnings</p>
                                    {!isMonetized && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                                    {isMonetized && <Sparkles className="h-3 w-3 text-yellow-400 shrink-0" />}
                                </div>

                                {isMonetized ? (
                                    <>
                                        <p className="text-4xl font-black text-foreground">
                                            ₹{earnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p className="mt-2 text-xs font-semibold text-muted-foreground">estimated (₹0.40/view)</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-2xl font-black text-foreground">Locked</p>
                                        <p className="mt-1 text-xs font-semibold text-muted-foreground leading-relaxed">
                                            Reach <span className="text-primary font-bold">{(PATRON_THRESHOLD).toLocaleString('en-IN')}</span> patrons to unlock earnings
                                        </p>

                                        {/* Progress bar */}
                                        <div className="mt-3">
                                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-widest">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-2.5 w-2.5" />
                                                    {formatViews(patronCount)}
                                                </span>
                                                <span>{formatViews(PATRON_THRESHOLD)}</span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary border border-border/50">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${patronProgress}%`,
                                                        background: 'linear-gradient(90deg, hsl(18 90% 48%), hsl(43 85% 60%))',
                                                        boxShadow: '0 0 8px hsl(18 90% 48% / 0.4)',
                                                    }}
                                                />
                                            </div>
                                            <p className="mt-1.5 text-[10px] text-muted-foreground/70 font-semibold">
                                                {Math.max(0, PATRON_THRESHOLD - patronCount).toLocaleString('en-IN')} patrons remaining
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className={cn(
                                "flex h-13 w-13 items-center justify-center rounded-xl p-3 transition-transform group-hover:scale-110 ml-3 shrink-0",
                            )}
                                style={{
                                    background: isMonetized ? 'hsl(48 96% 53% / 0.12)' : 'hsl(20 8% 10%)',
                                    border: `1px solid ${isMonetized ? 'hsl(48 96% 53% / 0.3)' : 'hsl(20 8% 20%)'}`,
                                }}>
                                {isMonetized
                                    ? <IndianRupee className="h-6 w-6 text-yellow-400" />
                                    : <Lock className="h-6 w-6 text-muted-foreground" />
                                }
                            </div>
                        </div>
                    </div>
                </div>



                {/* Video List */}
                <div className="stat-card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-bold text-foreground">Your Creations</h2>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {stats?.totalVideos ?? 0} forge{(stats?.totalVideos ?? 0) !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {(!stats?.videos || stats.videos.length === 0) ? (
                        <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary border border-border">
                                <VideoIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">The forge awaits</h3>
                            <p className="text-sm font-medium text-muted-foreground max-w-xs mb-6">
                                Upload your first creation to start building your legacy in the vault.
                            </p>
                            <Button
                                asChild
                                className="gap-2 btn-primary-glow font-bold"
                                style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}
                            >
                                <Link to="/upload">
                                    <Upload className="h-4 w-4" />
                                    Upload Creation
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {stats.videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="flex flex-col gap-4 p-4 sm:p-5 transition-colors hover:bg-card/80 sm:flex-row sm:items-start group/row"
                                >
                                    {/* Thumbnail */}
                                    <Link
                                        to={`/watch/${video.id}`}
                                        className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44 group-hover/row:shadow-[0_0_15px_hsl(18_90%_48%/0.15)] transition-all"
                                    >
                                        {video.thumbnail ? (
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover/row:scale-105"
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
                                            className="line-clamp-2 text-base font-bold text-foreground transition-colors hover:text-primary leading-tight"
                                        >
                                            {video.title}
                                        </Link>
                                        <p className="line-clamp-1 text-sm font-medium text-muted-foreground">
                                            {video.description || 'No lore provided.'}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Eye className="h-3.5 w-3.5 text-primary/70" />
                                                {formatViews(video.views)} views
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <ThumbsUp className="h-3.5 w-3.5 text-accent/70" />
                                                {formatViews(video.likes)} likes
                                            </span>
                                            {isMonetized && (
                                                <span className="flex items-center gap-1.5 text-yellow-500/80">
                                                    <IndianRupee className="h-3.5 w-3.5" />
                                                    ₹{(video.views * EARNINGS_RATE).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            )}
                                            <span className="opacity-30 hidden sm:inline">•</span>
                                            <span className="flex items-center gap-1.5 text-muted-foreground/70">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(video.uploadedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <div className="shrink-0 self-start sm:self-center">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 text-destructive font-bold hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sm:hidden lg:inline">Delete</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-card border-border backdrop-blur-xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Incinerate "{video.title}"?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. The creation, all its views, and
                                                        reactions will be permanently purged from the vault.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-accent">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(video.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                                                    >
                                                        {deletingId === video.id ? 'Incinerating...' : 'Incinerate'}
                                                    </AlertDialogAction>
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

export default Dashboard;
