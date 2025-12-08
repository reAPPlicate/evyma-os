import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Calendar, Shield, Sparkles, Loader, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Billing() {
  const { isDarkMode, theme } = useTheme();
  const queryClient = useQueryClient();
  const accentColor = theme.accent;
  const [loading, setLoading] = useState(false);

  // Fetch current user and subscription
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      if (!user?.id) return null;
      const subs = await base44.entities.Subscription.filter({ created_by: user.email }, '-created_date', 1);
      return subs[0] || null;
    },
    enabled: !!user,
  });

  // Open Stripe Checkout for upgrade
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        tier: 'premium'
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Error creating checkout session');
    } finally {
      setLoading(false);
    }
  };

  // Open Stripe Customer Portal
  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createPortalSession', {});
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to open customer portal');
      }
    } catch (error) {
      toast.error('Error opening customer portal');
    } finally {
      setLoading(false);
    }
  };

  const currentTier = subscription?.tier || 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPremium = currentTier === 'premium' && isActive;

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Get started with Evyma',
      features: [
        '5 coaching sessions per month',
        'Basic habit tracking',
        'Goal setting',
        'Weekly insights'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$29',
      period: '/month',
      description: 'Unlock your full potential',
      features: [
        'Unlimited coaching sessions',
        'Advanced habit analytics',
        'Personalized AI insights',
        'Priority support',
        'Custom coaching characters',
        'Export & share progress'
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <CreditCard className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              Billing & Subscription
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
              Manage your plan and payment details
            </p>
          </div>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <GlassCard className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: accentColor }} />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Current Plan
                </h2>
              </div>
              <span 
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {subscription.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>
                  Tier
                </span>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                </span>
              </div>

              {subscription.current_period_end && (
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>
                    {subscription.status === 'trialing' ? 'Trial Ends' : 'Next Billing Date'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: accentColor }} />
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              )}

              {subscription.cancel_at_period_end && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-yellow-400">
                    Your subscription will be canceled at the end of the current billing period.
                  </p>
                </div>
              )}
            </div>

            {isPremium && (
              <Button
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
                className="w-full mt-4"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            )}
          </GlassCard>
        )}

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-2 gap-4">
          {tiers.map((tier) => {
            const isCurrentTier = tier.id === currentTier;
            
            return (
              <GlassCard 
                key={tier.id}
                className={`p-5 relative ${tier.popular ? 'ring-2' : ''}`}
                style={{ borderColor: tier.popular ? accentColor : undefined }}
              >
                {tier.popular && (
                  <div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Popular
                  </div>
                )}

                <div className="mb-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="mb-4">
                  <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
                      {tier.period}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 
                        className="w-4 h-4 mt-0.5 flex-shrink-0" 
                        style={{ color: accentColor }} 
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {isCurrentTier ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full"
                  >
                    Current Plan
                  </Button>
                ) : tier.id === 'premium' ? (
                  <Button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Upgrade to Premium
                  </Button>
                ) : null}
              </GlassCard>
            );
          })}
        </div>

        {/* Additional Info */}
        <GlassCard className="p-5">
          <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            Payment Security
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
            All payments are securely processed through Stripe. We never store your payment information.
            You can cancel your subscription at any time from the customer portal.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}