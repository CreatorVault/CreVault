import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/* ── Hexagonal Vault Door Logo (SVG) ── */
const VaultLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
      fill="url(#ember-grad-signup)"
      stroke="hsl(43 85% 60%)"
      strokeWidth="0.8"
    />
    <circle cx="16" cy="16" r="7" fill="none" stroke="hsl(20 8% 5%)" strokeWidth="1.5" />
    <rect x="14.5" y="12" width="3" height="5" rx="1" fill="hsl(20 8% 5%)" />
    <circle cx="16" cy="19" r="1.5" fill="hsl(43 85% 60%)" />
    <defs>
      <linearGradient id="ember-grad-signup" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="hsl(18 90% 52%)" />
        <stop offset="1" stopColor="hsl(38 85% 50%)" />
      </linearGradient>
    </defs>
  </svg>
);

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await signup(email, password, username);
      if (success) {
        toast({
          title: 'Account created!',
          description: 'Welcome to CreVault.',
        });
        navigate('/');
      } else {
        toast({
          title: 'Signup failed',
          description: 'Email or username already exists. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-8 relative overflow-hidden bg-background">
      {/* Background orbs */}
      <div className="orb orb-ember h-[600px] w-[600px] -top-64 -right-10" />
      <div className="orb orb-gold h-[500px] w-[500px] -bottom-48 -left-32" />

      <div className="w-full max-w-md animate-fade-in relative z-10 flex flex-col items-center">
        {/* Logo */}
        <Link to="/" className="mb-6 flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center transition-all duration-300 group-hover:scale-110">
            <VaultLogo className="h-10 w-10 drop-shadow-[0_0_12px_hsl(18_90%_48%/0.5)]" />
          </div>
          <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-foreground">Cre</span>
            <span className="gradient-text">Vault</span>
          </span>
        </Link>

        {/* Card */}
        <div className="stat-card w-full backdrop-blur-xl bg-card/80 border-border shadow-2xl relative overflow-hidden p-6 sm:p-8">
          {/* Card Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />

          <div className="mb-8 mt-1 text-center">
            <h1 className="text-2xl font-bold text-foreground">Join the Creators</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Create your account to start uploading, discovering, and connecting.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Username
              </Label>
              <div className="ember-input relative rounded-xl transition-all duration-300">
                <Input
                  id="username"
                  type="text"
                  placeholder="creative_mind"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-input text-foreground font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="ember-input relative rounded-xl transition-all duration-300">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-input text-foreground font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="ember-input relative rounded-xl transition-all duration-300">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl border-border bg-input text-foreground font-medium placeholder:text-muted-foreground/50 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1 h-10 w-10 text-muted-foreground hover:text-primary hover:bg-transparent transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/80 mt-1.5 ml-1 font-medium">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-12 mt-4 rounded-xl font-bold text-[hsl(20_8%_5%)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
              style={{
                background: isLoading ? 'hsl(18 60% 40%)' : 'var(--gradient-primary)',
                boxShadow: isLoading ? 'none' : 'var(--shadow-glow-ember)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[hsl(20_8%_5%/0.3)] border-t-[hsl(20_8%_5%)]" />
                  Creating Account...
                </>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Forge Your Vault
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-8 pt-6 border-t border-border/80 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary hover:text-accent hover:underline transition-colors ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
