import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Video,
  Eye,
  TrendingUp,
  Trash2,
  Ban,
  MoreVertical,
  Search,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockVideos, formatViews, User, Video as VideoType } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const Admin = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>(mockUsers.filter(u => u.role !== 'admin'));
  const [videos, setVideos] = useState<VideoType[]>(mockVideos);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!isAdmin) {
      toast({
        title: 'Vault Sealed',
        description: 'Only the High Keepers can access this realm.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  // Calculate stats
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);

  const handleDeleteVideo = (videoId: string) => {
    setVideos(videos.filter(v => v.id !== videoId));
    toast({
      title: 'Creation Incinerated',
      description: 'The video has been permanently purged from the vault.',
    });
  };

  const handleBlockUser = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
    ));
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.isBlocked ? 'Access Restored' : 'Access Revoked',
      description: `${user?.username} has been ${user?.isBlocked ? 'unblocked' : 'blocked'} from the forge.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    setVideos(videos.filter(v => v.author.id !== userId));
    toast({
      title: 'Patron Banished',
      description: 'The user and all their creations have been purged.',
    });
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    colorClass,
    bgStyle
  }: {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    colorClass: string;
    bgStyle: any;
  }) => (
    <div className="stat-card p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-150 group-hover:-translate-y-4 group-hover:translate-x-4">
        <Icon className="h-24 w-24" />
      </div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={cn("mt-3 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit", trendUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {trend}
            </div>
          )}
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105" style={bgStyle}>
          <Icon className={cn("h-7 w-7", colorClass)} />
        </div>
      </div>
    </div>
  );

  if (!isAdmin) return null;

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto animate-fade-in min-h-screen">
        <div className="mb-8 flex items-center gap-4 border-b border-border pb-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(0 75% 55% / 0.15) 0%, hsl(18 90% 48% / 0.1) 100%)',
              border: '1px solid hsl(0 75% 55% / 0.3)',
              boxShadow: '0 0 20px hsl(0 75% 55% / 0.15)'
            }}
          >
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight">Vault Overwatch</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground uppercase tracking-widest">High Keeper Access Only</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Patrons"
            value={users.length.toString()}
            icon={Users}
            trend="+12% this cycle"
            trendUp
            colorClass="text-primary"
            bgStyle={{ background: 'hsl(18 90% 48% / 0.1)', border: '1px solid hsl(18 90% 48% / 0.2)' }}
          />
          <StatCard
            title="Shattered Ambers"
            value={videos.length.toString()}
            icon={Video}
            trend="+8% this cycle"
            trendUp
            colorClass="text-accent"
            bgStyle={{ background: 'hsl(38 85% 50% / 0.1)', border: '1px solid hsl(38 85% 50% / 0.2)' }}
          />
          <StatCard
            title="Total Insight"
            value={formatViews(totalViews)}
            icon={Eye}
            trend="+23% this cycle"
            trendUp
            colorClass="text-[hsl(43_85%_60%)]"
            bgStyle={{ background: 'hsl(43 85% 60% / 0.1)', border: '1px solid hsl(43 85% 60% / 0.2)' }}
          />
          <StatCard
            title="Resonance"
            value="4.2%"
            icon={TrendingUp}
            trend="-2% this cycle"
            trendUp={false}
            colorClass="text-destructive"
            bgStyle={{ background: 'hsl(0 75% 55% / 0.1)', border: '1px solid hsl(0 75% 55% / 0.2)' }}
          />
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="ember-input relative max-w-md rounded-xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Query the archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 border-border bg-input text-foreground rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-0 font-medium"
            />
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6 bg-transparent h-14 w-full sm:w-auto justify-start border-b border-border rounded-none p-0 overflow-x-auto scrollbar-hide">
            <TabsTrigger
              value="users"
              className="h-14 rounded-none border-b-2 border-transparent px-4 sm:px-6 text-sm font-bold text-muted-foreground uppercase tracking-widest data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
            >
              Patrons ({users.length})
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="h-14 rounded-none border-b-2 border-transparent px-4 sm:px-6 text-sm font-bold text-muted-foreground uppercase tracking-widest data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
            >
              Creations ({videos.length})
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="h-14 rounded-none border-b-2 border-transparent px-4 sm:px-6 text-sm font-bold text-muted-foreground uppercase tracking-widest data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="animate-fade-in">
            <div className="stat-card overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Patron</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Sigil (Email)</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Following</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Forged</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id} className="border-border hover:bg-card/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/50">
                            <AvatarImage src={user.avatar} alt={user.username} />
                            <AvatarFallback
                              className="text-xs font-bold text-[hsl(20_8%_5%)]"
                              style={{ background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(43 85% 60%) 100%)' }}
                            >
                              {user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-foreground">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">{user.email}</TableCell>
                      <TableCell className="text-foreground font-semibold">{formatViews(user.subscribers)}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{user.createdAt}</TableCell>
                      <TableCell>
                        <Badge variant={user.isBlocked ? 'destructive' : 'secondary'} className={cn("font-bold tracking-wide uppercase text-[10px]", user.isBlocked ? "" : "bg-success/10 text-success border border-success/20 hover:bg-success/20")}>
                          {user.isBlocked ? 'Banished' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/50 text-muted-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border backdrop-blur-xl">
                            <DropdownMenuItem asChild className="cursor-pointer font-medium hover:bg-accent focus:bg-accent">
                              <Link to={`/profile/${user.id}`}>Inspect Grimoire</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleBlockUser(user.id)}
                              className="cursor-pointer font-medium hover:bg-accent focus:bg-accent"
                            >
                              <Ban className="mr-2 h-4 w-4 text-accent" />
                              {user.isBlocked ? 'Restore Access' : 'Revoke Access'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-bold"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Purge Entity
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium border-border">
                        No patrons found matching the query.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="animate-fade-in">
            <div className="stat-card overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Creation</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Forgemaster</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Insight</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Approvals</TableHead>
                    <TableHead className="text-xs font-bold tracking-widest uppercase text-muted-foreground py-4">Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.map(video => (
                    <TableRow key={video.id} className="border-border hover:bg-card/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg group">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-6 w-6 text-primary drop-shadow-[0_0_8px_hsl(18_90%_48%)]" />
                            </div>
                          </div>
                          <span className="line-clamp-2 max-w-xs font-bold text-foreground">
                            {video.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">{video.author.username}</TableCell>
                      <TableCell className="text-foreground font-semibold">{formatViews(video.views)}</TableCell>
                      <TableCell className="text-foreground font-semibold flex items-center gap-1.5"><ThumbsUp className="h-3 w-3 text-accent" />{formatViews(video.likes)}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{video.uploadedAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/50 text-muted-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border backdrop-blur-xl">
                            <DropdownMenuItem asChild className="cursor-pointer font-medium hover:bg-accent focus:bg-accent">
                              <Link to={`/watch/${video.id}`}>Observe Amber</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteVideo(video.id)}
                              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-bold"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Incinerate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVideos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium border-border">
                        No creations found matching the query.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="animate-fade-in">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Most Viewed Videos */}
              <div className="stat-card p-6 md:p-8">
                <h3 className="mb-6 font-bold uppercase tracking-widest text-xs text-muted-foreground border-b border-border/50 pb-3">Highest Resonance Entities</h3>
                <div className="space-y-5">
                  {topVideos.map((video, index) => (
                    <div key={video.id} className="flex items-center gap-4 group cursor-pointer hover:bg-secondary/30 p-2 rounded-xl transition-colors">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm"
                        style={{
                          background: index < 3 ? 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(43 85% 60%) 100%)' : 'hsl(20 8% 12%)',
                          color: index < 3 ? 'hsl(20 8% 5%)' : 'hsl(0 0% 100% / 0.5)',
                          border: index < 3 ? 'none' : '1px solid hsl(20 8% 15%)'
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {video.title}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                          {formatViews(video.views)} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Stats */}
              <div className="stat-card p-6 md:p-8 bg-secondary/20">
                <h3 className="mb-6 font-bold uppercase tracking-widest text-xs text-muted-foreground border-b border-border/50 pb-3">Realm Statistics</h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="text-muted-foreground font-medium text-sm text-foreground/80">Total Sync Time</span>
                    <span className="font-bold text-foreground">1,234,567 hours</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="text-muted-foreground font-medium text-sm text-foreground/80">Average Forge Session</span>
                    <span className="font-bold text-foreground">12 min 34 sec</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="text-muted-foreground font-medium text-sm text-foreground/80">Total Inscriptions (Comments)</span>
                    <span className="font-bold text-foreground">45,678</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="text-muted-foreground font-medium text-sm text-foreground/80">Daily Embers (Active Users)</span>
                    <span className="font-bold text-primary shadow-[0_0_10px_hsl(18_90%_48%/0.2)]">2,345</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium text-sm text-foreground/80">Vault Capacity</span>
                    <span className="font-bold text-accent">1.2 TB / 5 TB</span>
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

export default Admin;
