import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Clapperboard, TrendingUp, Film, Brain, ArrowRight, Rocket } from 'lucide-react';

const steps = [
  { label: 'Watch', color: '18 90% 48%' },
  { label: 'Believe', color: '43 85% 60%' },
  { label: 'Invest', color: '155 65% 45%' },
  { label: 'Grow', color: '210 80% 55%' },
  { label: 'Earn', color: '18 90% 52%' },
];

const HowItWorks = () => {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hiw-visible');
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

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    sectionsRef.current[i] = el;
  };

  return (
    <MainLayout hideSidebar>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-ember" style={{ width: 500, height: 500, top: '-8%', right: '-6%' }} />
        <div className="orb orb-gold" style={{ width: 400, height: 400, bottom: '10%', left: '-5%' }} />
        <div className="orb orb-ember" style={{ width: 250, height: 250, top: '50%', left: '15%', opacity: 0.05 }} />

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
          <div ref={setRef(0)} className="hiw-section mb-20">
            <h1
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              How{' '}
              <span className="gradient-text">CreVault</span>{' '}
              Works
            </h1>
            <p className="mt-4 text-lg font-medium sm:text-xl" style={{ color: 'hsl(30 12% 62%)' }}>
              Three audiences. One platform. Everyone wins.
            </p>
          </div>

          {/* ── FOR CREATORS ── */}
          <div ref={setRef(1)} className="hiw-section mb-14">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl animate-ember-flicker"
                style={{
                  background: 'hsl(18 90% 48% / 0.12)',
                  border: '1px solid hsl(18 90% 48% / 0.3)',
                }}
              >
                <Clapperboard className="h-5 w-5" style={{ color: 'hsl(18 90% 52%)' }} />
              </div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">🎬 For Creators</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { num: '01', text: 'Post content (do your thing)' },
                { num: '02', text: 'Grow your audience' },
                { num: '03', text: 'Unlock your own Creator Units' },
                { num: '04', text: 'Let fans invest in your success' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'hsl(20 8% 9%)',
                    border: '1px solid hsl(20 6% 16%)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(18 90% 48% / 0.4)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 24px hsl(18 90% 48% / 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(20 6% 16%)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{
                      background: 'hsl(18 90% 48% / 0.15)',
                      color: 'hsl(18 90% 55%)',
                      border: '1px solid hsl(18 90% 48% / 0.25)',
                    }}
                  >
                    {item.num}
                  </span>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-base font-bold" style={{ color: 'hsl(18 90% 52%)' }}>
              👉 Basically: your hype = your value
            </p>
          </div>

          {/* ── FOR VIEWERS / INVESTORS ── */}
          <div ref={setRef(2)} className="hiw-section mb-14">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl animate-gold-pulse"
                style={{
                  background: 'hsl(43 85% 60% / 0.12)',
                  border: '1px solid hsl(43 85% 60% / 0.3)',
                }}
              >
                <TrendingUp className="h-5 w-5" style={{ color: 'hsl(43 85% 62%)' }} />
              </div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">💰 For Viewers / Investors</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { num: '01', text: 'Watch content (like usual)' },
                { num: '02', text: 'Find creators you believe in' },
                { num: '03', text: 'Invest early' },
                { num: '04', text: 'Win when they blow up' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'hsl(20 8% 9%)',
                    border: '1px solid hsl(20 6% 16%)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(43 85% 60% / 0.4)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 24px hsl(43 85% 60% / 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(20 6% 16%)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{
                      background: 'hsl(43 85% 60% / 0.15)',
                      color: 'hsl(43 85% 65%)',
                      border: '1px solid hsl(43 85% 60% / 0.25)',
                    }}
                  >
                    {item.num}
                  </span>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-base font-bold" style={{ color: 'hsl(43 85% 62%)' }}>
              👉 Yes, stalking creators early finally pays off
            </p>
          </div>

          {/* ── FOR FILMMAKERS ── */}
          <div ref={setRef(3)} className="hiw-section mb-14">
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: 'hsl(155 65% 42% / 0.12)',
                  border: '1px solid hsl(155 65% 42% / 0.3)',
                }}
              >
                <Film className="h-5 w-5" style={{ color: 'hsl(155 65% 48%)' }} />
              </div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">🎥 For Filmmakers</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { num: '01', text: 'Drop a trailer or short film' },
                { num: '02', text: 'Build hype' },
                { num: '03', text: 'Raise funds from fans' },
                { num: '04', text: 'Release your movie on CreVault' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-4 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'hsl(20 8% 9%)',
                    border: '1px solid hsl(20 6% 16%)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(155 65% 42% / 0.4)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 24px hsl(155 65% 42% / 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(20 6% 16%)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{
                      background: 'hsl(155 65% 42% / 0.15)',
                      color: 'hsl(155 65% 50%)',
                      border: '1px solid hsl(155 65% 42% / 0.25)',
                    }}
                  >
                    {item.num}
                  </span>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-base font-bold" style={{ color: 'hsl(155 65% 50%)' }}>
              👉 No more begging studios who say "we'll get back to you"
            </p>
          </div>

          {/* ── THE WHOLE THING IN ONE LINE ── */}
          <div ref={setRef(4)} className="hiw-section mb-20">
            <div className="mb-8 flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl animate-ember-flicker"
                style={{
                  background: 'hsl(18 90% 48% / 0.12)',
                  border: '1px solid hsl(18 90% 48% / 0.3)',
                }}
              >
                <Brain className="h-5 w-5" style={{ color: 'hsl(18 90% 52%)' }} />
              </div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                The whole thing in one line:
              </h2>
            </div>

            <div
              className="overflow-hidden rounded-3xl p-8 sm:p-12"
              style={{
                background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.08) 0%, hsl(43 85% 60% / 0.06) 100%)',
                border: '1px solid hsl(18 90% 48% / 0.2)',
              }}
            >
              {/* Flow steps */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {steps.map((step, i) => (
                  <React.Fragment key={i}>
                    <div
                      className="flex items-center justify-center rounded-xl px-5 py-3 text-base font-bold transition-all duration-300 hover:scale-110 sm:text-lg"
                      style={{
                        background: `hsl(${step.color} / 0.12)`,
                        border: `1px solid hsl(${step.color} / 0.35)`,
                        color: `hsl(${step.color})`,
                        boxShadow: `0 0 18px hsl(${step.color} / 0.15)`,
                      }}
                    >
                      {step.label}
                    </div>
                    {i < steps.length - 1 && (
                      <ArrowRight className="h-5 w-5 shrink-0 hidden sm:block" style={{ color: 'hsl(30 12% 40%)' }} />
                    )}
                    {i < steps.length - 1 && (
                      <span className="block text-sm font-bold sm:hidden" style={{ color: 'hsl(30 12% 40%)' }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p
                className="mt-8 text-center text-base font-semibold sm:text-lg"
                style={{ color: 'hsl(30 12% 62%)' }}
              >
                Simple. Clean.{' '}
                <span className="gradient-text-gold">No MBA required.</span>
              </p>
            </div>
          </div>

          {/* CTA */}
          <div ref={setRef(5)} className="hiw-section text-center">
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
              Get Started
            </Link>
            <p className="mt-4 text-sm font-medium" style={{ color: 'hsl(30 12% 50%)' }}>
              Pick your role. Start winning.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll-reveal animation styles */}
      <style>{`
        .hiw-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .hiw-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </MainLayout>
  );
};

export default HowItWorks;
