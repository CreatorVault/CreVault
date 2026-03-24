import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onViewStart?: () => void;
  onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, onViewStart, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [viewCounted, setViewCounted] = useState(false);
  const [skipTime, setSkipTime] = useState<{ direction: 'forward' | 'backward', key: number } | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const lastClickTimeRef = useRef(0);

  const onViewStartRef = useRef(onViewStart);
  onViewStartRef.current = onViewStart;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    setViewCounted(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (!viewCounted && video.currentTime >= 3) {
        setViewCounted(true);
        onViewStartRef.current?.();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [viewCounted, src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, newTime));
      setCurrentTime(videoRef.current.currentTime);
      
      // Visual feedback
      setSkipTime({ 
        direction: seconds > 0 ? 'forward' : 'backward', 
        key: Date.now() 
      });
      
      setTimeout(() => setSkipTime(null), 500);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    const time = Date.now();
    const delay = time - lastClickTimeRef.current;
    
    if (delay < 300) {
      // Double click - skip
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Determine side (1/3 for left, 1/3 for right, middle for play/pause)
      if (x < rect.width / 3) {
        skip(-10);
      } else if (x > (rect.width * 2) / 3) {
        skip(10);
      } else {
        togglePlay();
      }
    } else {
      // Standard behavior: click to toggle play
      togglePlay();
    }
    lastClickTimeRef.current = time;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]); // Dependencies to ensure current state is captured

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative w-full aspect-video overflow-hidden bg-black sm:rounded-xl shadow-lg border border-border"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full cursor-pointer object-contain"
        onClick={handleVideoClick}
        playsInline
      />

      {/* Skip feedback overlay */}
      {skipTime && (
        <div 
          key={skipTime.key}
          className={cn(
            "absolute inset-y-0 w-1/3 flex items-center justify-center pointer-events-none z-20",
            skipTime.direction === 'forward' ? "right-0" : "left-0",
            "bg-white/10"
          )}
          style={{
            borderRadius: skipTime.direction === 'forward' ? '100% 0 0 100%' : '0 100% 100% 0'
          }}
        >
          <div className="flex flex-col items-center gap-2 animate-out fade-out zoom-out duration-500 fill-mode-forwards">
            <div className="bg-black/40 backdrop-blur-md text-white rounded-full p-6 shadow-2xl">
              {skipTime.direction === 'forward' ? (
                <div className="flex items-center">
                  <RotateCw className="h-10 w-10 animate-in zoom-in spin-in-90 duration-300" />
                </div>
              ) : (
                <div className="flex items-center">
                  <RotateCcw className="h-10 w-10 animate-in zoom-in -spin-in-90 duration-300" />
                </div>
              )}
            </div>
            <span className="text-white font-bold text-xl drop-shadow-lg scale-110">
              {skipTime.direction === 'forward' ? '10s' : '10s'}
            </span>
          </div>
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, hsl(18 90% 50%) 0%, hsl(38 85% 50%) 100%)',
              boxShadow: '0 0 32px hsl(18 90% 48% / 0.5)'
            }}
          >
            <Play className="h-10 w-10 fill-current pl-1 text-[hsl(20_8%_5%)]" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 sm:px-4 pb-3 sm:pb-4 pt-16 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress bar */}
        <div className="mb-2 w-full">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_.relative]:h-1.5 [&_.relative]:rounded-full [&_.relative]:bg-white/20 [&_[data-orientation=horizontal]>.bg-primary]:bg-primary"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-primary transition-colors"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-primary transition-colors"
              title="Backward 10s"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-primary transition-colors"
              title="Forward 10s"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            <div className="group/volume hidden sm:flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-9 w-9 text-white hover:bg-white/20 hover:text-primary transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <div className="w-0 overflow-hidden transition-all duration-200 group-hover/volume:w-20 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="ml-2 w-16 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0"
                />
              </div>
            </div>

            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-white/90 font-medium">
              {formatTime(currentTime)} <span className="text-white/50 mx-1">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20 hover:text-primary transition-colors hidden sm:flex"
                  title="Playback Speed"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 text-white border-white/20">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <DropdownMenuItem
                    key={speed}
                    onClick={() => handlePlaybackSpeedChange(speed)}
                    className={cn(
                      "hover:bg-white/10 cursor-pointer",
                      playbackSpeed === speed && "text-primary font-bold"
                    )}
                  >
                    {speed === 1 ? 'Normal' : `${speed}x`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-9 w-9 text-white hover:bg-white/20 hover:text-primary transition-colors"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
