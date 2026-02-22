import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const inputStyle = {
  background: 'hsl(240 12% 14%)',
  boxShadow: 'inset 0 0 0 1px hsl(240 12% 20%)',
};

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(username, email, password);
      if (success) {
        toast({
          title: 'Welcome to CreVault!',
          description: 'Your account has been created successfully.',
        });
        navigate('/');
      } else {
        toast({
          title: 'Signup failed',
          description: 'Please check your details and try again.',
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

  const labelClass = "text-xs font-semibold uppercase tracking-widest";
  const inputClass = "h-11 rounded-xl border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-1";

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'hsl(240 15% 6%)' }}
    >
      {/* Background orbs */}
      <div
        className="absolute -top-32 -right-32 h-80 w-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(180 100% 50% / 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(270 80% 55% / 0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 group">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, hsl(180 100% 50%) 0%, hsl(200 100% 45%) 100%)',
              boxShadow: '0 0 24px hsl(180 100% 50% / 0.4)',
            }}
          >
            <Zap className="h-6 w-6 fill-current text-[hsl(240_15%_6%)]" />
          </div>
          <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <span className="text-foreground">Cre</span>
            <span className="gradient-text">Vault</span>
          </span>
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'hsl(240 14% 10%)',
            border: '1px solid hsl(240 12% 18%)',
            boxShadow: '0 24px 60px hsl(240 15% 4% / 0.8), 0 0 0 1px hsl(180 60% 30% / 0.08)',
          }}
        >
          <div className="mb-7 text-center">
            <div className="mb-3 flex justify-center">
              <Sparkles className="h-6 w-6" style={{ color: 'hsl(180 100% 55%)' }} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create your vault</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join CreVault and start sharing your content
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className={labelClass} style={{ color: 'hsl(220 15% 65%)' }}>
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className={labelClass} style={{ color: 'hsl(220 15% 65%)' }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className={labelClass} style={{ color: 'hsl(220 15% 65%)' }}>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`${inputClass} pr-11`}
                  style={inputStyle}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-11 px-3 text-muted-foreground hover:text-primary hover:bg-transparent"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className={labelClass} style={{ color: 'hsl(220 15% 65%)' }}>
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-11 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{
                background: isLoading
                  ? 'hsl(270 40% 35%)'
                  : 'linear-gradient(135deg, hsl(270 80% 60%) 0%, hsl(200 100% 50%) 100%)',
                color: 'hsl(240 15% 6%)',
                boxShadow: isLoading ? 'none' : '0 0 20px hsl(270 80% 55% / 0.3)',
              }}
            >
              {isLoading ? (
                <>
                  <div
                    className="h-4 w-4 animate-spin rounded-full"
                    style={{ border: '2px solid hsl(240 15% 20%)', borderTopColor: 'hsl(240 15% 6%)' }}
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold hover:underline transition-colors"
              style={{ color: 'hsl(180 100% 55%)' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
