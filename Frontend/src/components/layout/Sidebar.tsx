import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Clock,
  ThumbsUp,
  ListVideo,
  Flame,
  Music2,
  Gamepad2,
  Newspaper,
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
    { icon: Music2, label: 'Music', path: '/?category=Music' },
    { icon: Gamepad2, label: 'Gaming', path: '/?category=Gaming' },
    { icon: Newspaper, label: 'News', path: '/?category=News' },
  ];

  const renderNavItem = (icon: React.ElementType, label: string, path: string) => {
    const Icon = icon;
    const isActive = location.pathname === path ||
      (path.includes('?') && location.search.includes(path.split('?')[1]));

    return (
      <Link
        key={path}
        to={path}
        onClick={() => {
          // Close sidebar on mobile when a link is clicked
          if (window.innerWidth < 768 && onClose) {
            onClose();
          }
        }}
        className={cn(
          'sidebar-item',
          isActive && 'active',
          // Desktop collapsed state styling
          !isOpen && 'md:flex-col md:gap-1 md:px-0 md:py-4 md:text-[10px]'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', !isOpen && 'md:h-6 md:w-6')} />
        <span className={cn(
          // Always show text on mobile (because sidebar is either hidden or full width)
          // Hide text on desktop only when collapsed
          !isOpen && 'md:text-center md:hidden lg:block',
          !isOpen && 'md:hidden'
        )}>{label}</span>
        {/* Helper for desktop collapsed text */}
        {!isOpen && <span className="hidden md:block text-[10px] text-center">{label}</span>}
      </Link>
    );
  };

  // Simplified render item to avoid complex span hiding logic
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
          'sidebar-item',
          isActive && 'active',
          // Desktop collapsed styling
          !isOpen && 'md:flex-col md:justify-center md:gap-1 md:px-0 md:py-3'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', !isOpen && 'md:h-6 md:w-6 md:mr-0')} />
        <span className={cn(
          'whitespace-nowrap transition-all duration-300',
          // Mobile: Always visible if sidebar is open (sidebar is hidden otherwise)
          // Desktop: Visible if open, special styling if closed
          isOpen ? 'opacity-100' : 'md:hidden'
        )}>
          {label}
        </span>
        {/* Desktop Collapsed label (small text) */}
        {!isOpen && (
          <span className="hidden text-[10px] md:block text-center w-full truncate px-1">
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
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] overflow-y-auto border-r border-sidebar-border bg-sidebar transition-all duration-300',
          // Mobile: Width fixed to 64, slide in/out
          'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: Width changes, always visible (translate-0)
          isOpen ? 'md:w-60' : 'md:w-[72px]',
          'md:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col justify-between">
          <nav className="flex flex-col gap-1 p-2">
            {/* Mobile Close Button (Optional, but good for UX) */}
            <div className="flex items-center justify-end md:hidden p-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Main Links */}
            <div className="space-y-1">
              {mainLinks.map(link => renderItem(link.icon, link.label, link.path))}
            </div>

            <div className="my-3 border-t border-sidebar-border" />

            {/* Library */}
            {isAuthenticated && (
              <>
                {(isOpen || window.innerWidth < 768) && (
                  <h3 className={cn("mb-2 px-3 text-sm font-semibold text-sidebar-foreground", !isOpen && "md:hidden")}>Library</h3>
                )}
                <div className="space-y-1">
                  {libraryLinks.map(link => renderItem(link.icon, link.label, link.path))}
                </div>
                <div className="my-3 border-t border-sidebar-border" />
              </>
            )}

            {/* Categories */}
            {(isOpen || window.innerWidth < 768) && (
              <h3 className={cn("mb-2 px-3 text-sm font-semibold text-sidebar-foreground", !isOpen && "md:hidden")}>Explore</h3>
            )}
            <div className="space-y-1">
              {categoryLinks.map(link => renderItem(link.icon, link.label, link.path))}
            </div>

            {/* Admin Link */}
            {isAdmin && (
              <>
                <div className="my-3 border-t border-sidebar-border" />
                {renderItem(Settings, 'Admin Panel', '/admin')}
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
