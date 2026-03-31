import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Shield, TrendingUp, BarChart3, Ban, Receipt, Lock, Database, HelpCircle, ShieldCheck, ShieldOff } from 'lucide-react';

const Terms = () => {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('terms-visible');
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

  interface CardItem {
    icon: React.ReactNode;
    text: string;
  }

  const Section = ({
    icon,
    iconBg,
    iconBorder,
    iconColor,
    title,
    items,
    tagline,
    taglineColor,
    cardHoverColor,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    iconBorder: string;
    iconColor: string;
    title: string;
    items: CardItem[];
    tagline?: string;
    taglineColor?: string;
    cardHoverColor?: string;
  }) => (
    <>
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: iconBg,
            border: `1px solid ${iconBorder}`,
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl px-5 py-3.5 transition-all duration-300"
            style={{
              background: 'hsl(20 8% 9%)',
              border: '1px solid hsl(20 6% 16%)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = cardHoverColor || 'hsl(18 90% 48% / 0.35)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${cardHoverColor?.replace('0.35', '0.12') || 'hsl(18 90% 48% / 0.12)'}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(20 6% 16%)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <span className="mt-0.5 shrink-0" style={{ color: iconColor }}>{item.icon}</span>
            <p className="text-sm font-medium text-foreground">{item.text}</p>
          </div>
        ))}
      </div>
      {tagline && (
        <p className="mt-4 text-sm font-semibold italic" style={{ color: taglineColor || 'hsl(30 12% 50%)' }}>
          {tagline}
        </p>
      )}
    </>
  );

  return (
    <MainLayout hideSidebar>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-ember" style={{ width: 450, height: 450, top: '-6%', left: '-5%' }} />
        <div className="orb orb-gold" style={{ width: 350, height: 350, bottom: '8%', right: '-4%' }} />

        <div className="relative z-10 mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:py-20">

          {/* Back link */}
          <Link
            to="/"
            className="group mb-10 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            style={{ color: 'hsl(30 12% 58%)' }}
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" style={{ color: 'hsl(18 90% 52%)' }} />
            <span className="group-hover:text-foreground">Back to Home</span>
          </Link>

          {/* ═══════════════════════════════════ */}
          {/*        TERMS OF SERVICE             */}
          {/* ═══════════════════════════════════ */}

          <div ref={setRef(0)} className="terms-section mb-16">
            <h1
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Terms{' '}
              <span className="gradient-text">&</span>{' '}
              Privacy
            </h1>
            <p className="mt-3 text-base font-medium" style={{ color: 'hsl(30 12% 58%)' }}>
              The boring legal stuff — but we made it not boring.
            </p>
          </div>

          {/* The basics */}
          <div ref={setRef(1)} className="terms-section mb-12">
            <Section
              icon={<Shield className="h-5 w-5" />}
              iconBg="hsl(18 90% 48% / 0.12)"
              iconBorder="hsl(18 90% 48% / 0.3)"
              iconColor="hsl(18 90% 52%)"
              title="The basics"
              cardHoverColor="hsl(18 90% 48% / 0.35)"
              items={[
                { icon: '🔞', text: 'Be 18+ (no kids running hedge funds please)' },
                { icon: '🚫', text: "Don't fake stuff, scam people, or act smart in a bad way" },
              ]}
            />
          </div>

          {/* About investing */}
          <div ref={setRef(2)} className="terms-section mb-12">
            <Section
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg="hsl(43 85% 60% / 0.12)"
              iconBorder="hsl(43 85% 60% / 0.3)"
              iconColor="hsl(43 85% 62%)"
              title="💸 About investing"
              cardHoverColor="hsl(43 85% 60% / 0.35)"
              items={[
                { icon: '⚠️', text: 'This is NOT guaranteed money' },
                { icon: '📈', text: 'You can win, you can lose' },
                { icon: '💡', text: "If everything always went up, we'd all be billionaires already" },
              ]}
            />
          </div>

          {/* About Creator Units */}
          <div ref={setRef(3)} className="terms-section mb-12">
            <Section
              icon={<BarChart3 className="h-5 w-5" />}
              iconBg="hsl(210 80% 55% / 0.12)"
              iconBorder="hsl(210 80% 55% / 0.3)"
              iconColor="hsl(210 80% 58%)"
              title="📊 About Creator Units"
              cardHoverColor="hsl(210 80% 55% / 0.35)"
              items={[
                { icon: '❌', text: 'They are NOT stocks' },
                { icon: '⚙️', text: 'They are digital assets based on performance' },
                { icon: '📏', text: 'Their value depends on real engagement (not your delusion)' },
              ]}
            />
          </div>

          {/* What gets you banned */}
          <div ref={setRef(4)} className="terms-section mb-12">
            <Section
              icon={<Ban className="h-5 w-5" />}
              iconBg="hsl(0 70% 50% / 0.12)"
              iconBorder="hsl(0 70% 50% / 0.3)"
              iconColor="hsl(0 70% 55%)"
              title="🚫 What gets you banned"
              cardHoverColor="hsl(0 70% 50% / 0.35)"
              items={[
                { icon: '🤖', text: 'Fake views, bots, scams' },
                { icon: '🗑️', text: 'Uploading nonsense just to pump value' },
                { icon: '🕶️', text: "Basically… don't be shady" },
              ]}
            />
          </div>

          {/* Platform cut */}
          <div ref={setRef(5)} className="terms-section mb-12">
            <Section
              icon={<Receipt className="h-5 w-5" />}
              iconBg="hsl(155 65% 42% / 0.12)"
              iconBorder="hsl(155 65% 42% / 0.3)"
              iconColor="hsl(155 65% 48%)"
              title="🧾 Platform cut"
              cardHoverColor="hsl(155 65% 42% / 0.35)"
              items={[
                { icon: '💵', text: 'Yeah, we take a small fee' },
                { icon: '🖥️', text: "Servers don't run on vibes unfortunately" },
              ]}
            />
          </div>

          {/* ═══════════════════════════════════ */}
          {/*         PRIVACY POLICY              */}
          {/* ═══════════════════════════════════ */}

          <div ref={setRef(6)} className="terms-section mb-12">
            <div
              className="mb-10 rounded-2xl p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, hsl(43 85% 60% / 0.06) 0%, hsl(18 90% 48% / 0.04) 100%)',
                border: '1px solid hsl(43 60% 40% / 0.2)',
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="h-5 w-5" style={{ color: 'hsl(43 85% 62%)' }} />
                <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Privacy Policy
                </h2>
              </div>
              <p className="text-sm font-medium" style={{ color: 'hsl(30 12% 55%)' }}>(human version)</p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'hsl(30 12% 62%)' }}>
                We get it. You don't want your data flying around the internet like a lost drone.
              </p>
            </div>
          </div>

          {/* What we collect */}
          <div ref={setRef(7)} className="terms-section mb-12">
            <Section
              icon={<Database className="h-5 w-5" />}
              iconBg="hsl(210 80% 55% / 0.12)"
              iconBorder="hsl(210 80% 55% / 0.3)"
              iconColor="hsl(210 80% 58%)"
              title="📊 What we collect"
              cardHoverColor="hsl(210 80% 55% / 0.35)"
              items={[
                { icon: '👤', text: 'Basic stuff (name, email)' },
                { icon: '📱', text: 'How you use the platform' },
                { icon: '💳', text: 'Payment info (if you invest)' },
              ]}
            />
          </div>

          {/* Why we collect it */}
          <div ref={setRef(8)} className="terms-section mb-12">
            <Section
              icon={<HelpCircle className="h-5 w-5" />}
              iconBg="hsl(43 85% 60% / 0.12)"
              iconBorder="hsl(43 85% 60% / 0.3)"
              iconColor="hsl(43 85% 62%)"
              title="🤔 Why we collect it"
              cardHoverColor="hsl(43 85% 60% / 0.35)"
              items={[
                { icon: '⚙️', text: 'To make the app work (obviously)' },
                { icon: '📈', text: 'To improve things' },
                { icon: '🔐', text: 'To keep everything secure' },
              ]}
            />
          </div>

          {/* Your data = locked */}
          <div ref={setRef(9)} className="terms-section mb-12">
            <Section
              icon={<ShieldCheck className="h-5 w-5" />}
              iconBg="hsl(155 65% 42% / 0.12)"
              iconBorder="hsl(155 65% 42% / 0.3)"
              iconColor="hsl(155 65% 48%)"
              title="🔐 Your data = locked"
              cardHoverColor="hsl(155 65% 42% / 0.35)"
              items={[
                { icon: '🛡️', text: 'We use proper security' },
                { icon: '✅', text: 'No shady business' },
              ]}
            />
          </div>

          {/* What we DON'T do */}
          <div ref={setRef(10)} className="terms-section mb-20">
            <div className="mb-5 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl animate-ember-flicker"
                style={{
                  background: 'hsl(18 90% 48% / 0.12)',
                  border: '1px solid hsl(18 90% 48% / 0.3)',
                  color: 'hsl(18 90% 52%)',
                }}
              >
                <ShieldOff className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">🚫 What we DON'T do</h2>
            </div>
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, hsl(18 90% 48% / 0.08) 0%, hsl(0 70% 50% / 0.05) 100%)',
                border: '1px solid hsl(18 90% 48% / 0.2)',
              }}
            >
              <p className="text-xl font-bold text-foreground sm:text-2xl">
                We don't sell your data.
              </p>
              <p className="mt-3 text-sm font-medium" style={{ color: 'hsl(30 12% 55%)' }}>
                Because creepy data selling is not the business model here.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div ref={setRef(11)} className="terms-section text-center mb-12">
            <p className="text-xs font-medium" style={{ color: 'hsl(30 12% 40%)' }}>
              Last updated: April 2026 · If you have questions, reach out to us anytime.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .terms-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .terms-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </MainLayout>
  );
};

export default Terms;
