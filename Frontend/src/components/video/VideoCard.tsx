import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, formatViews, formatDate } from '@/lib/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Clock } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  layout?: 'grid' | 'list';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, layout = 'grid' }) => {
  const navigate = useNavigate();

  const goToVideo = () => navigate(`/watch/${video.id}`);

  if (layout === 'list') {
    return (
      <div
        onClick={goToVideo}
        className="group flex flex-col sm:flex-row cursor-pointer gap-4 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-0.5 video-card"
        role="link"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') goToVideo(); }}
      >
        <div className="video-thumbnail w-full sm:w-64 shrink-0 rounded-xl overflow-hidden aspect-video">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="video-duration">{video.duration}</span>
        </div>

        <div className="flex flex-col gap-2 py-1 min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors sm:text-base">
            {video.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 group-hover:text-primary/70 transition-colors">
              <Eye className="h-3.5 w-3.5" />
              {formatViews(video.views)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 opacity-70" />
              {formatDate(video.uploadedAt)}
            </span>
          </div>
          <Link
            to={`/profile/${video.author.id}`}
            className="flex items-center gap-2 text-sm text-sidebar-foreground hover:text-accent-foreground transition-colors w-fit mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-6 w-6 avatar-ring">
              <AvatarFallback
                className="text-[10px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(43 85% 60%) 100%)',
                  color: 'hsl(20 8% 5%)',
                }}
              >
                {video.author.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{video.author.username}</span>
          </Link>
          <p className="line-clamp-2 text-xs text-muted-foreground mt-1 hidden sm:block">{video.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={goToVideo}
      className="video-card group animate-fade-in cursor-pointer flex flex-col h-full"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') goToVideo(); }}
    >
      {/* Thumbnail */}
      <div className="video-thumbnail">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="video-duration">{video.duration}</span>

        {/* Hover play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'hsl(20 8% 5% / 0.4)' }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110"
            style={{
              background: 'hsl(18 90% 48% / 0.9)',
              boxShadow: '0 0 24px hsl(18 90% 48% / 0.6)',
            }}
          >
            <svg className="h-5 w-5 ml-0.5" style={{ color: 'hsl(20 8% 5%)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex gap-3 p-3 flex-1">
        <Link
          to={`/profile/${video.author.id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 pt-0.5"
        >
          <Avatar className="h-9 w-9 transition-transform duration-200 hover:scale-110 avatar-ring">
            <AvatarFallback
              className="text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(43 85% 60%) 100%)',
                color: 'hsl(20 8% 5%)',
              }}
            >
              {video.author.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
            {video.title}
          </h3>
          <Link
            to={`/profile/${video.author.id}`}
            className="mt-1 block text-xs text-muted-foreground hover:text-primary transition-colors font-medium truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {video.author.username}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 group-hover:text-primary/70 transition-colors">
              <Eye className="h-3 w-3 opacity-70" />
              {formatViews(video.views)}
            </span>
            <span className="opacity-40">·</span>
            <span>{formatDate(video.uploadedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
