import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import { CreditCard, Check, Loader2, Calendar, DollarSign } from 'lucide-react';

export default function Billing() {
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);

  const { data: productsData } = useQuery({
    queryKey: ['billing-products'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listStripeProducts');
      return data;
    }
  });

  const { data: subscription, refetch: refetchSubscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const subs = await base44.entities.Subscription.filter({ 
        user_id: user.id 
      });
      return subs[0] || null;
    }
  });

  const handleCheckout = async (priceId) => {
    setLoading(true);
    setSelectedPrice(priceId);
    try {
      const { data } = await base44.functions.invoke('createCheckoutSession', { 
        priceId 
      });
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
      setSelectedPrice(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('createCustomerPortalSession');
      window.location.href = data.url;
    } catch (error) {
      console.error('Portal error:', error);
      setLoading(false);
    }
  };

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatInterval = (recurring) => {
    if (!recurring) return '';
    const { interval, interval_count } = recurring;
    if (interval_count === 1) return interval;
    return `${interval_count} ${interval}s`;
  };

  const getSubscriptionDetails = () => {
    if (!subscription || !productsData) return null;
    
    for (const { product, prices } of productsData.products) {
      const matchingPrice = prices.find(p => p.id === subscription.stripe_price_id);
      if (matchingPrice) {
        return {
          product,
          price: matchingPrice
        };
      }
    }
    return null;
  };

  const subscriptionDetails = getSubscriptionDetails();
  const activeProducts = productsData?.products?.filter(p => p.product.active) || [];

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
            <p className="text-white/60">Choose a plan that fits your needs</p>
          </div>
          {subscription && subscription.stripe_customer_id && (
            <Button 
              onClick={handleManageSubscription}
              disabled={loading}
              variant="outline"
              className="border-white/10 text-white"
            >
              Manage Subscription
            </Button>
          )}
        </div>

        {subscription && subscriptionDetails && (
          <GlassCard className="p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${theme.accent}20` }}
                >
                  <CreditCard className="w-6 h-6" style={{ color: theme.accent }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-white">
                      {subscriptionDetails.product.name}
                    </h3>
                    <Badge 
                      className={
                        subscription.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : subscription.status === 'trialing'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-white/60 text-sm">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {formatPrice(subscriptionDetails.price.unit_amount, subscriptionDetails.price.currency)}
                        /{formatInterval(subscriptionDetails.price.recurring)}
                      </span>
                    </div>
                    {subscription.current_period_end && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProducts.map(({ product, prices }) => {
            const isCurrentProduct = subscription?.stripe_product_id === product.id;
            
            return (
              <GlassCard 
                key={product.id} 
                className={`p-6 ${isCurrentProduct ? 'ring-2' : ''}`}
                style={isCurrentProduct ? { ringColor: theme.accent } : {}}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  {isCurrentProduct && (
                    <Badge style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                      Current
                    </Badge>
                  )}
                </div>
                {product.description && (
                  <p className="text-white/60 text-sm mb-4">{product.description}</p>
                )}
                
                <div className="space-y-3 mb-6">
                  {prices.filter(p => p.active).map((price) => {
                    const isCurrentPrice = subscription?.stripe_price_id === price.id;
                    
                    return (
                      <div key={price.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">
                            {formatPrice(price.unit_amount, price.currency)}
                          </p>
                          <p className="text-white/60 text-xs">
                            per {formatInterval(price.recurring)}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleCheckout(price.id)}
                          disabled={loading || isCurrentPrice}
                          size="sm"
                          style={isCurrentPrice ? {} : { backgroundColor: theme.accent }}
                          variant={isCurrentPrice ? 'outline' : 'default'}
                          className={isCurrentPrice ? 'border-white/10 text-white/40' : 'text-white'}
                        >
                          {isCurrentPrice ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Active
                            </>
                          ) : loading && selectedPrice === price.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}