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
        className="group flex cursor-pointer gap-4 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-0.5"
        role="link"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') goToVideo(); }}
        style={{
          background: 'hsl(240 14% 10%)',
          border: '1px solid hsl(240 12% 16%)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'hsl(180 100% 50% / 0.3)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px hsl(180 100% 50% / 0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'hsl(240 12% 16%)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <div className="video-thumbnail w-40 shrink-0 sm:w-64 rounded-xl overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="video-duration">{video.duration}</span>
        </div>

        <div className="flex flex-col gap-2 py-1 min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors sm:text-base">
            {video.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(video.views)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(video.uploadedAt)}
            </span>
          </div>
          <Link
            to={`/profile/${video.author.id}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, hsl(270 80% 55%) 0%, hsl(180 100% 50%) 100%)',
                  color: 'hsl(240 15% 6%)',
                }}
              >
                {video.author.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>{video.author.username}</span>
          </Link>
          <p className="line-clamp-2 text-xs text-muted-foreground">{video.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={goToVideo}
      className="video-card group animate-fade-in cursor-pointer"
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
          style={{ background: 'hsl(240 15% 6% / 0.45)' }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: 'hsl(180 100% 50% / 0.9)',
              boxShadow: '0 0 20px hsl(180 100% 50% / 0.6)',
            }}
          >
            <svg className="h-5 w-5 ml-0.5 text-[hsl(240_15%_6%)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex gap-3 p-3">
        <Link
          to={`/profile/${video.author.id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          <Avatar className="h-9 w-9 transition-transform duration-200 hover:scale-110">
            <AvatarFallback
              className="text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, hsl(270 80% 55%) 0%, hsl(180 100% 50%) 100%)',
                color: 'hsl(240 15% 6%)',
              }}
            >
              {video.author.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 overflow-hidden">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
            {video.title}
          </h3>
          <Link
            to={`/profile/${video.author.id}`}
            className="mt-1 block text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {video.author.username}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
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
