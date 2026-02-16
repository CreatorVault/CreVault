import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Upload, Bell, User, LogOut, Settings, Play, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      {/* Mobile Search Overlay Header */}
      {showMobileSearch ? (
        <div className="flex w-full items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileSearch(false)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="h-10 w-full rounded-full border-border bg-secondary pl-4 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 rounded-full hover:bg-transparent"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Left section - Logo and menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-foreground hover:bg-accent"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
              </div>
              <span className="hidden text-xl font-bold text-foreground sm:block">
                Cre<span className="text-primary">Vault</span>
              </span>
            </Link>
          </div>

          {/* Center section - Search (Desktop) */}
          <form onSubmit={handleSearch} className="hidden max-w-xl flex-1 items-center gap-2 md:flex">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-full border-border bg-secondary pl-4 pr-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 rounded-l-none rounded-r-full bg-accent text-foreground hover:bg-accent/80"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Right section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground md:hidden"
              onClick={() => setShowMobileSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-foreground hover:bg-accent sm:flex"
                  asChild
                >
                  <Link to="/upload">
                    <Upload className="h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-foreground hover:bg-accent sm:flex"
                >
                  <Bell className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1 sm:ml-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-popover border-border" align="end">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{user?.username}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="cursor-pointer text-foreground hover:bg-accent">
                      <Link to={`/profile/${user?.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        Your Channel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-foreground hover:bg-accent sm:hidden">
                      <Link to="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Video
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-foreground hover:bg-accent">
                      <Link to="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="cursor-pointer text-foreground hover:bg-accent">
                        <Link to="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive hover:bg-accent focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
