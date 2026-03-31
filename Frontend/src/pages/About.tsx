import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Rocket, Brain, Eye, Zap, TrendingUp, Users, Film } from 'lucide-react';

const About = () => {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('about-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (index: number) => (el: HTMLDivElement | null) => {
    sectionsRef.current[index] = el;
  };

  return (
    <MainLayout hideSidebar>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-ember" style={{ width: 500, height: 500, top: '-10%', left: '-8%' }} />
        <div className="orb orb-gold" style={{ width: 400, height: 400, bottom: '5%', right: '-5%' }} />
        <div className="orb orb-ember" style={{ width: 300, height: 300, top: '40%', right: '10%', opacity: 0.06 }} />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:py-20">

          {/* Back link */}
          <Link
            to="/"
            className="group mb-10 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            style={{ color: 'hsl(30 12% 58%)' }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" style={{ color: 'hsl(18 90% 52%)' }} />
            <span className="group-hover:text-foreground">Back to Home</span>
          </Link>

          {/* ── HERO ── */}
          <div ref={setRef(0)} className="about-section mb-20">
            <h1
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Welcome to{' '}
              <span className="gradient-text">CreVault</span>
              <span className="inline-block ml-1 animate-float">.</span>
            </h1>
            <p
              className="mt-5 text-lg font-medium sm:text-xl"
              style={{ color: 'hsl(30 12% 62%)' }}
            >
              Where watching content is no longer a full-time unpaid job.
            </p>
          </div>

          {/* ── THE PROBLEM ── */}
          <div ref={setRef(1)} className="about-section mb-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
              We got tired of a system where:
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: <Film className="h-5 w-5" />, line: 'Creators grind', sub: 'platforms earn' },
                { icon: <Eye className="h-5 w-5" />, line: 'Viewers watch', sub: 'get nothing' },
                { icon: <Users className="h-5 w-5" />, line: 'Talented filmmakers', sub: 'stay broke' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03]"
                  style={{
                    background: 'hsl(20 8% 9%)',
                    border: '1px solid hsl(20 6% 16%)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(0 60% 45% / 0.5)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 30px hsl(0 60% 45% / 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(20 6% 16%)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: 'hsl(0 60% 45% / 0.12)',
                      border: '1px solid hsl(0 60% 45% / 0.25)',
                      color: 'hsl(0 70% 60%)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <p className="text-base font-semibold text-foreground">{item.line}</p>
                  <p className="text-sm font-medium" style={{ color: 'hsl(0 50% 55%)' }}>
                    → {item.sub}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="mt-8 text-center text-xl font-bold sm:text-2xl"
              style={{ color: 'hsl(18 90% 52%)' }}
            >
              So we said… nah. 🔥
            </p>
          </div>

          {/* ── THE FLIP ── */}
          <div ref={setRef(2)} className="about-section mb-16">
            <div
              className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
              style={{
                background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.08) 0%, hsl(43 85% 60% / 0.06) 100%)',
                border: '1px solid hsl(18 90% 48% / 0.2)',
              }}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full animate-pulse-slow" style={{ background: 'hsl(18 90% 48% / 0.08)', filter: 'blur(40px)' }} />
              <h2
                className="text-3xl font-extrabold sm:text-4xl"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <span className="gradient-text">CreVault</span>{' '}
                <span className="text-foreground">flips the game.</span>
              </h2>
              <p className="mt-4 text-lg font-medium" style={{ color: 'hsl(30 12% 62%)' }}>
                Here, you don't just watch creators grow
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                👉 you can literally <span className="gradient-text">grow with them</span>.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  { left: 'YouTube', right: 'Stock market', emoji: '🤝' },
                  { left: 'Netflix', right: 'Startup investing', emoji: '🤝' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-center transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'hsl(20 8% 7%)',
                      border: '1px solid hsl(43 60% 40% / 0.2)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <span className="text-lg font-bold text-foreground">{item.left}</span>
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-lg font-bold gradient-text-gold">{item.right}</span>
                  </div>
                ))}
              </div>
              <p
                className="mt-6 text-center text-base font-medium italic"
                style={{ color: 'hsl(30 12% 55%)' }}
              >
                Except less boring and more rewarding.
              </p>
            </div>
          </div>

          {/* ── WHAT WE'RE TRYING TO DO ── */}
          <div ref={setRef(3)} className="about-section mb-16">
            <div className="mb-8 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl animate-ember-flicker"
                style={{
                  background: 'hsl(18 90% 48% / 0.12)',
                  border: '1px solid hsl(18 90% 48% / 0.3)',
                }}
              >
                <Rocket className="h-5 w-5" style={{ color: 'hsl(18 90% 52%)' }} />
              </div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                What we're trying to do
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: <Zap className="h-5 w-5" />, text: 'Turn creators into assets', color: '18 90% 48%' },
                { icon: <TrendingUp className="h-5 w-5" />, text: 'Turn fans into investors', color: '43 85% 60%' },
                { icon: <Eye className="h-5 w-5" />, text: 'Turn "just watching" into "actually earning"', color: '155 65% 45%' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group rounded-2xl p-6 transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'hsl(20 8% 9%)',
                    border: `1px solid hsl(${item.color} / 0.2)`,
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `hsl(${item.color} / 0.5)`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 28px hsl(${item.color} / 0.2)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `hsl(${item.color} / 0.2)`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `hsl(${item.color} / 0.12)`,
                      border: `1px solid hsl(${item.color} / 0.3)`,
                      color: `hsl(${item.color})`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── BIG VISION ── */}
          <div ref={setRef(4)} className="about-section mb-16">
            <div className="mb-8 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl animate-gold-pulse"
                style={{
                  background: 'hsl(43 85% 60% / 0.12)',
                  border: '1px solid hsl(43 85% 60% / 0.3)',
                }}
              >
                <Brain className="h-5 w-5" style={{ color: 'hsl(43 85% 62%)' }} />
              </div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Big vision <span className="text-sm font-medium" style={{ color: 'hsl(30 12% 50%)' }}>(don't panic, it's simple)</span>
              </h2>
            </div>
            <div
              className="rounded-2xl p-8 text-center sm:p-10"
              style={{
                background: 'linear-gradient(135deg, hsl(43 85% 60% / 0.06) 0%, hsl(18 90% 48% / 0.04) 100%)',
                border: '1px solid hsl(43 60% 40% / 0.2)',
              }}
            >
              <p className="text-lg font-medium" style={{ color: 'hsl(30 12% 62%)' }}>
                We're building a place where:
              </p>
              <p className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                Content isn't just entertainment…
              </p>
              <p className="mt-1 text-2xl font-extrabold sm:text-3xl">
                <span className="gradient-text-gold">it's opportunity.</span>
              </p>
            </div>
          </div>

          {/* ── WHO BUILT THIS ── */}
          <div ref={setRef(5)} className="about-section mb-20">
            <div className="mb-8 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: 'hsl(18 90% 48% / 0.12)',
                  border: '1px solid hsl(18 90% 48% / 0.3)',
                }}
              >
                <Eye className="h-5 w-5" style={{ color: 'hsl(18 90% 52%)' }} />
              </div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Who built this
              </h2>
            </div>
            <div
              className="rounded-2xl p-8 sm:p-10"
              style={{
                background: 'hsl(20 8% 9%)',
                border: '1px solid hsl(20 6% 16%)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p className="text-base leading-relaxed" style={{ color: 'hsl(30 12% 62%)' }}>
                A bunch of people who looked at the creator economy and said:
              </p>
              <p className="mt-4 text-xl font-bold text-foreground sm:text-2xl">
                "Why is everyone making money{' '}
                <span className="gradient-text">except the audience?</span>"
              </p>
              <div
                className="mt-6 inline-block rounded-xl px-6 py-3"
                style={{
                  background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.1), hsl(43 85% 60% / 0.08))',
                  border: '1px solid hsl(18 90% 48% / 0.2)',
                }}
              >
                <p className="text-base font-semibold text-foreground">
                  So yeah… we fixed that. ✨
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div ref={setRef(6)} className="about-section text-center">
            <Link
              to="/signup"
              className="btn-primary-glow inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--gradient-primary)',
                color: 'hsl(20 8% 5%)',
                boxShadow: 'var(--shadow-glow-ember)',
              }}
            >
              <Rocket className="h-5 w-5" />
              Join CreVault
            </Link>
            <p className="mt-4 text-sm font-medium" style={{ color: 'hsl(30 12% 50%)' }}>
              Start earning while you watch.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll-reveal animation styles */}
      <style>{`
        .about-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .about-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </MainLayout>
  );
};

export default About;
