import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Clock,
  ThumbsUp,
  ListVideo,
  Flame,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const mainLinks = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
  ];

  const libraryLinks = [
    { icon: Clock, label: 'Watch Later', path: '/playlist/watch-later' },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/playlist/liked' },
    { icon: ListVideo, label: 'Your Videos', path: '/your-videos' },
  ];

  const categoryLinks = [
    { icon: Flame, label: 'Trending', path: '/?category=Trending' },
  ];

  const renderItem = (icon: React.ElementType, label: string, path: string) => {
    const Icon = icon;
    const isActive = location.pathname === path ||
      (path.includes('?') && location.search.includes(path.split('?')[1]));

    return (
      <Link
        key={path}
        to={path}
        onClick={() => {
          if (window.innerWidth < 768 && onClose) onClose();
        }}
        className={cn(
          'sidebar-item group',
          isActive && 'active',
          !isOpen && 'md:flex-col md:justify-center md:gap-1 md:px-0 md:py-3'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 shrink-0 transition-all duration-200',
            isActive
              ? 'text-primary drop-shadow-[0_0_6px_hsl(18_90%_48%/0.8)]'
              : 'text-sidebar-foreground group-hover:text-accent-foreground',
            !isOpen && 'md:h-5 md:w-5 md:mr-0'
          )}
        />
        <span
          className={cn(
            'whitespace-nowrap transition-all duration-300 font-medium',
            isOpen ? 'opacity-100' : 'md:hidden'
          )}
        >
          {label}
        </span>
        {!isOpen && (
          <span className="hidden text-[10px] md:block text-center w-full truncate px-1 text-sidebar-foreground">
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden transition-all duration-300',
          'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isOpen ? 'md:w-60' : 'md:w-[72px]',
          'md:translate-x-0'
        )}
        style={{
          background: 'hsl(20 9% 7%)',
          borderRight: '1px solid hsl(20 6% 13%)',
        }}
      >
        {/* Subtle top ember accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(43 85% 55% / 0.3), hsl(18 90% 48% / 0.5), transparent)',
          }}
        />

        <div className="flex h-full flex-col justify-between">
          <nav className="flex flex-col gap-1 p-2 pt-3">
            {/* Mobile Close */}
            <div className="flex items-center justify-end md:hidden p-1 mb-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-primary hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Main Links */}
            <div className="space-y-0.5">
              {mainLinks.map(link => renderItem(link.icon, link.label, link.path))}
            </div>

            <div
              className="my-3 h-px mx-2"
              style={{ background: 'linear-gradient(90deg, transparent, hsl(20 6% 20%), transparent)' }}
            />

            {/* Library */}
            {isAuthenticated && (
              <>
                {(isOpen || window.innerWidth < 768) && (
                  <h3
                    className={cn(
                      "mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest",
                      !isOpen && "md:hidden"
                    )}
                    style={{ color: 'hsl(43 60% 55%)' }}
                  >
                    Library
                  </h3>
                )}
                <div className="space-y-0.5">
                  {libraryLinks.map(link => renderItem(link.icon, link.label, link.path))}
                </div>
                <div
                  className="my-3 h-px mx-2"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(20 6% 20%), transparent)' }}
                />
              </>
            )}

            {/* Trending */}
            <div className="space-y-0.5">
              {categoryLinks.map(link => renderItem(link.icon, link.label, link.path))}
            </div>

            {/* Admin */}
            {isAdmin && (
              <>
                <div
                  className="my-3 h-px mx-2"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(20 6% 20%), transparent)' }}
                />
                {renderItem(Settings, 'Admin Panel', '/admin')}
              </>
            )}
          </nav>

          {/* Bottom decoration */}
          {isOpen && (
            <div className="p-4 m-2 mb-4 rounded-xl" style={{
              background: 'linear-gradient(135deg, hsl(20 10% 10%) 0%, hsl(25 8% 8%) 100%)',
              border: '1px solid hsl(18 40% 18%)',
            }}>
              <p className="text-xs font-semibold" style={{ color: 'hsl(18 90% 55%)' }}>CreVault</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'hsl(30 8% 45%)' }}>Your creative ember</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
