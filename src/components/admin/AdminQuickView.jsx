import React from 'react';
import { 
  Target, TrendingUp, Users, Activity, Zap, CheckCircle, Flame, Bell, 
  Clock, Star, CreditCard, DollarSign, PieChart, Cpu, Mic, PlayCircle,
  UserPlus, Rocket, MousePointer, ListChecks, AlertTriangle, RefreshCw,
  Timer, XCircle, Server, ShieldAlert
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import MetricCard from './MetricCard';

export default function AdminQuickView() {
  const { isDarkMode } = useTheme();

  // Hero metrics (1-5)
  const heroMetrics = [
    { metricName: 'Completed Actions per AU', metricId: 'completed_actions_per_AU', icon: Target },
    { metricName: 'Goal-On-Track Rate', metricId: '%goals_on_track', icon: TrendingUp },
    { metricName: '7-Day Retention', metricId: '%7d_retention', icon: Users },
    { metricName: 'Daily Active Users', metricId: 'DAU', icon: Activity },
    { metricName: 'Momentum Score', metricId: 'avg_momentum_score', icon: Zap },
  ];

  // Behavior & Engagement metrics (6-10)
  const behaviorMetrics = [
    { metricName: 'Check-In Completion Rate', metricId: '%checkins_completed', icon: CheckCircle },
    { metricName: 'Streak Health (3+ days)', metricId: '%users_with_streak_3+', icon: Flame },
    { metricName: 'Nudge Response Rate', metricId: '%nudge_response', icon: Bell },
    { metricName: 'Coaching Minutes per AU', metricId: 'coaching_minutes_per_AU', icon: Clock },
    { metricName: 'Session Helpfulness (CSAT)', metricId: 'avg_helpfulness_1_to_5', icon: Star },
  ];

  // Revenue & Unit Economics metrics (11-20)
  const revenueMetrics = [
    { metricName: 'New Paid Subscribers', metricId: 'new_paid_subs_today', icon: CreditCard },
    { metricName: 'Net MRR Change', metricId: 'net_MRR_delta_today', icon: DollarSign },
    { metricName: 'Gross Margin %', metricId: 'gross_margin', icon: PieChart },
    { metricName: 'AI/Infra COGS per AU', metricId: 'COGS_per_AU', icon: Cpu },
    { metricName: 'AI Cost per Coaching Min', metricId: 'AI_cost_per_min', icon: Mic },
    { metricName: 'Trials Started', metricId: 'new_trials_today', icon: PlayCircle },
    { metricName: 'Trial → Paid Conversion', metricId: '%trial_to_paid', icon: TrendingUp },
    { metricName: 'Daily Churn', metricId: 'churned_users_today', icon: XCircle },
    { metricName: 'ARPU', metricId: 'ARPU', icon: DollarSign },
    { metricName: 'Plan Mix by Tier', metricId: '%by_tier', icon: PieChart },
  ];

  // Acquisition & Funnel metrics (21-26)
  const acquisitionMetrics = [
    { metricName: 'New Sign-Ups', metricId: 'new_signups_today', icon: UserPlus },
    { metricName: 'Activation Rate', metricId: '%activation', icon: Rocket },
    { metricName: 'Visitor → Sign-Up Rate', metricId: '%visit_to_signup', icon: MousePointer },
    { metricName: 'Onboarding Completion', metricId: '%onboarding_complete', icon: ListChecks },
    { metricName: 'Worst Onboarding Step', metricId: 'max_drop_step', icon: AlertTriangle },
    { metricName: 'Returning User Rate', metricId: '%returning', icon: RefreshCw },
  ];

  // Reliability & Safety metrics (27-30)
  const reliabilityMetrics = [
    { metricName: 'Session Latency (p50/p95)', metricId: 'p50_latency_ms', icon: Timer },
    { metricName: 'Failed Session Rate', metricId: '%failed_sessions', icon: XCircle, alert: false },
    { metricName: 'Uptime (Critical Paths)', metricId: '%uptime_critical', icon: Server },
    { metricName: 'Safety Flag Count', metricId: 'safety_flags_today', icon: ShieldAlert, alert: false },
  ];

  const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-4">
      <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
      {subtitle && <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-zinc-500'}`}>{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Quick View</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>Daily metrics dashboard • All values are placeholders</p>
      </div>

      {/* Hero Metrics */}
      <section>
        <SectionHeader title="Core North Stars" subtitle="Primary health indicators" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {heroMetrics.map((m) => <MetricCard key={m.metricId} {...m} />)}
        </div>
      </section>

      {/* Behavior & Engagement */}
      <section>
        <SectionHeader title="Behavior & Engagement" subtitle="User actions and coaching depth" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {behaviorMetrics.map((m) => <MetricCard key={m.metricId} {...m} />)}
        </div>
      </section>

      {/* Revenue & Unit Economics */}
      <section>
        <SectionHeader title="Revenue & Unit Economics" subtitle="Monetization and cost efficiency" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {revenueMetrics.map((m) => <MetricCard key={m.metricId} {...m} />)}
        </div>
      </section>

      {/* Acquisition & Funnel */}
      <section>
        <SectionHeader title="Acquisition & Funnel" subtitle="Growth and activation" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {acquisitionMetrics.map((m) => <MetricCard key={m.metricId} {...m} />)}
        </div>
      </section>

      {/* Reliability & Safety */}
      <section>
        <SectionHeader title="Reliability & Safety" subtitle="Performance and risk monitoring" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {reliabilityMetrics.map((m) => <MetricCard key={m.metricId} {...m} />)}
        </div>
      </section>
    </div>
  );
}