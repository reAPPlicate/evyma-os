import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { theme, isDarkMode } = useTheme();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(createPageUrl('Home'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <GlassCard className="max-w-md w-full p-8 text-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${theme.accent}20` }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: theme.accent }} />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-white/60 mb-6">
          Your subscription is now active. Welcome aboard!
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            style={{ backgroundColor: theme.accent }}
            className="w-full text-white"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-white/40 text-sm">
            Redirecting in {countdown} seconds...
          </p>
        </div>
      </GlassCard>
    </div>
  );
}