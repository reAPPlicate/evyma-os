import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Sparkles, Target, Calendar, BarChart3, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const [isLoading, setIsLoading] = useState(true);

  // Check if already authenticated, redirect to Home
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          window.location.href = createPageUrl('Home');
          return;
        }
      } catch {
        // Not authenticated, stay on landing
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin('/Home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600/20 via-blue-900/10 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold">Evyma</span>
        </div>
        <Button 
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Your Personal Coaching Companion
          </h1>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Transform your goals into reality with AI-powered coaching, habit tracking, and actionable insights tailored to your journey.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto"
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <FeatureCard 
            icon={Target}
            title="Goal Setting"
            description="Define clear objectives and break them down into achievable milestones."
          />
          <FeatureCard 
            icon={Calendar}
            title="Habit Tracking"
            description="Build lasting habits with daily tracking and streak monitoring."
          />
          <FeatureCard 
            icon={BarChart3}
            title="Progress Insights"
            description="Visualize your growth with detailed analytics and reports."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-white/40 text-sm">
        <p>&copy; {new Date().getFullYear()} Evyma. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-colors">
      <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-white/50 text-sm">{description}</p>
    </div>
  );
}