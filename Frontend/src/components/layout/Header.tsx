import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Upload, User, LogOut, Settings, LayoutDashboard, ArrowLeft } from 'lucide-react';
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

interface HeaderProps {
  onMenuToggle?: () => void;
}

/* ── CreVault Logo Image ── */

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
    } else {
      navigate('/');
      setShowMobileSearch(false);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between gap-4 px-4"
      style={{
        background: 'hsl(20 9% 6% / 0.94)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid hsl(20 6% 14%)',
      }}
    >
      {/* Ember accent line at bottom of header */}
      <div className="header-glow-line" />

      {/* Mobile Search Overlay */}
      {showMobileSearch ? (
        <div className="flex w-full items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileSearch(false)}
            className="shrink-0 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search CreVault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="h-10 w-full rounded-full border-0 pl-4 pr-10 text-foreground placeholder:text-muted-foreground"
                style={{
                  background: 'hsl(20 6% 13%)',
                  boxShadow: 'inset 0 0 0 1px hsl(20 6% 20%)',
                }}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 rounded-full text-primary hover:bg-transparent"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Left — Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-primary hover:bg-accent"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center transition-all duration-300 group-hover:scale-110">
                <img
                  src="/CreVault_logo.png"
                  alt="CreVault Logo"
                  className="h-9 w-9 rounded-md object-cover drop-shadow-[0_0_8px_hsl(18_90%_48%/0.5)]"
                />
              </div>
              <span className="hidden text-xl font-bold tracking-tight sm:block" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="text-foreground">Cre</span>
                <span className="gradient-text">Vault</span>
              </span>
            </Link>
          </div>

          {/* Center — Search (Desktop) */}
          <form onSubmit={handleSearch} className="hidden max-w-lg flex-1 md:flex">
            <div className="relative w-full">
              <div
                className="relative flex items-center rounded-full transition-all duration-200 ember-input"
                style={{
                  background: 'hsl(20 6% 11%)',
                  border: '1px solid hsl(20 6% 18%)',
                }}
              >
                <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search videos, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent px-3 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                />
                <button
                  type="submit"
                  className="mr-1 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(38 85% 50%) 100%)',
                  }}
                >
                  <Search className="h-3.5 w-3.5 text-[hsl(20_8%_5%)]" />
                </button>
              </div>
            </div>
          </form>

          {/* Right — Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary md:hidden"
              onClick={() => setShowMobileSearch(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <>
                {/* Upload button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-muted-foreground hover:text-primary hover:bg-accent sm:flex"
                  asChild
                >
                  <Link to="/upload">
                    <Upload className="h-5 w-5" />
                  </Link>
                </Button>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 sm:ml-0 p-0">
                      <Avatar className="h-9 w-9 avatar-ring">
                        {user?.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                        <AvatarFallback
                          className="text-sm font-bold"
                          style={{
                            background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(43 85% 60%) 100%)',
                            color: 'hsl(20 8% 5%)',
                          }}
                        >
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 border-0"
                    style={{
                      background: 'hsl(20 8% 9%)',
                      border: '1px solid hsl(20 6% 18%)',
                      boxShadow: '0 16px 48px hsl(20 8% 3% / 0.8), 0 0 0 1px hsl(18 90% 48% / 0.08)',
                    }}
                    align="end"
                  >
                    <div className="flex items-center gap-3 p-3">
                      <Avatar className="h-10 w-10 avatar-ring">
                        {user?.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                        <AvatarFallback
                          className="text-sm font-bold"
                          style={{
                            background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(43 85% 60%) 100%)',
                            color: 'hsl(20 8% 5%)',
                          }}
                        >
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{user?.username}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                      </div>
                    </div>
                    <div className="mx-2 my-1 h-px" style={{ background: 'hsl(20 6% 16%)' }} />
                    <DropdownMenuItem asChild className="cursor-pointer mx-1 rounded-lg text-sidebar-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <Link to={`/profile/${user?.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        Your Channel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer mx-1 rounded-lg text-sidebar-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground sm:hidden">
                      <Link to="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Video
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer mx-1 rounded-lg text-sidebar-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                      <Link to="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="cursor-pointer mx-1 rounded-lg text-sidebar-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <Link to="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <div className="mx-2 my-1 h-px" style={{ background: 'hsl(20 6% 16%)' }} />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer mx-1 mb-1 rounded-lg focus:bg-destructive/15 focus:text-destructive"
                      style={{ color: 'hsl(0 72% 50%)' }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                asChild
                className="rounded-full px-5 font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, hsl(18 90% 48%) 0%, hsl(38 85% 50%) 100%)',
                  color: 'hsl(20 8% 5%)',
                  boxShadow: '0 0 16px hsl(18 90% 48% / 0.3)',
                  border: 'none',
                }}
              >
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
