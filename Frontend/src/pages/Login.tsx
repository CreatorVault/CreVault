import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
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
      fill="url(#ember-grad)"
      stroke="hsl(43 85% 60%)"
      strokeWidth="0.8"
    />
    <circle cx="16" cy="16" r="7" fill="none" stroke="hsl(20 8% 5%)" strokeWidth="1.5" />
    <rect x="14.5" y="12" width="3" height="5" rx="1" fill="hsl(20 8% 5%)" />
    <circle cx="16" cy="19" r="1.5" fill="hsl(43 85% 60%)" />
    <defs>
      <linearGradient id="ember-grad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="hsl(18 90% 52%)" />
        <stop offset="1" stopColor="hsl(38 85% 50%)" />
      </linearGradient>
    </defs>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        navigate('/');
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password. Please try again.',
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
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background orbs */}
      <div className="orb orb-ember h-[600px] w-[600px] -top-64 -left-64" />
      <div className="orb orb-gold h-[500px] w-[500px] -bottom-48 -right-48" />

      <div className="w-full max-w-md animate-fade-in relative z-10 my-8">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 group">
          <div className="flex h-14 w-14 items-center justify-center transition-all duration-300 group-hover:scale-110">
            <VaultLogo className="h-12 w-12 drop-shadow-[0_0_12px_hsl(18_90%_48%/0.6)]" />
          </div>
          <span className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-foreground">Cre</span>
            <span className="gradient-text">Vault</span>
          </span>
        </Link>

        {/* Card */}
        <div className="stat-card backdrop-blur-xl bg-card/80 border-border shadow-2xl relative overflow-hidden">
          {/* Card Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="mb-8 text-center mt-2">
            <h1 className="text-2xl font-bold text-foreground">Ignite Your Vault</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your content
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="ember-input relative rounded-xl transition-all duration-300">
                <Input
                  id="email"
                  type="email"
                  placeholder="creator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-input text-foreground font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                {/* <Button variant="link" className="h-auto p-0 text-xs font-semibold text-primary/80 hover:text-primary">
                  Forgot?
                </Button> */}
              </div>
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-12 mt-2 rounded-xl font-bold text-[hsl(20_8%_5%)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden"
              style={{
                background: isLoading ? 'hsl(18 60% 40%)' : 'var(--gradient-primary)',
                boxShadow: isLoading ? 'none' : 'var(--shadow-glow-ember)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[hsl(20_8%_5%/0.3)] border-t-[hsl(20_8%_5%)]" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    Enter the Vault
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Inner shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">New to CreVault?</p>
            <Button
              asChild
              variant="outline"
              className="w-full h-11 border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary font-semibold transition-all"
            >
              <Link to="/signup" className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create an Account
              </Link>
            </Button>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl p-4 bg-secondary/50 border border-border/50">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-accent text-center">
              Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/50 rounded-md p-2 border border-border/50">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Standard</p>
                <p className="text-xs font-medium text-foreground truncate">techmaster@example.com</p>
              </div>
              <div className="bg-background/50 rounded-md p-2 border border-border/50">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Admin</p>
                <p className="text-xs font-medium text-foreground truncate">crevault@gmail.com</p>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-wide">
              Any 6+ char password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
