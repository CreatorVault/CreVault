import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Vault pathway shattered at:", location.pathname);
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="text-center stat-card p-10 sm:p-16 max-w-lg border-dashed relative overflow-hidden group">
          {/* Background glow orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-destructive/10 blur-[80px] pointer-events-none group-hover:bg-destructive/20 transition-colors duration-1000" />

          <div className="relative z-10">
            <div
              className="mx-auto mb-8 flex h-32 w-32 items-center justify-center text-5xl animate-pulse"
              style={{
                background: 'linear-gradient(135deg, hsl(20 8% 10%) 0%, hsl(20 8% 6%) 100%)',
                border: '1px solid hsl(0 75% 55% / 0.5)',
                boxShadow: 'inset 0 0 20px hsl(0 75% 55% / 0.2), 0 0 30px hsl(0 75% 55% / 0.1)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            >
              ⚡
            </div>

            <h1 className="mb-2 text-6xl font-black tracking-tighter" style={{ color: 'hsl(0 75% 55%)' }}>404</h1>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold text-foreground">Void Reached</h2>
            <p className="mb-8 font-medium leading-relaxed text-muted-foreground">
              The chamber you seek has been sealed or never existed in the vault. The path ends here.
            </p>

            <Button asChild className="btn-primary-glow font-bold px-8 h-12" style={{ background: 'var(--gradient-primary)', color: 'hsl(20 8% 5%)' }}>
              <Link to="/">Return to Main Vault</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
