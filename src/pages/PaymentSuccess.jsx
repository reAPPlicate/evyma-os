import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function PaymentSuccess() {
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = createPageUrl('Dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <GlassCard className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${theme.accent}20` }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: theme.accent }} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Payment Successful!
        </h1>
        
        <p className="text-white/60 mb-6">
          Your subscription has been activated successfully. 
          Welcome to Evyma Pro!
        </p>

        <div className="flex items-center justify-center gap-2 text-white/60 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            Redirecting to dashboard in {countdown} seconds...
          </span>
        </div>

        <Button
          onClick={() => window.location.href = createPageUrl('Dashboard')}
          style={{ backgroundColor: theme.accent }}
          className="w-full text-white"
        >
          Go to Dashboard Now
        </Button>
      </GlassCard>
    </div>
  );
}