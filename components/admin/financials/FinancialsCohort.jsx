import React from 'react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function FinancialsCohort() {
  const { isDarkMode } = useTheme();

  const cohorts = ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'];
  const months = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Cohort Analysis</h1>
        <p className={isDarkMode ? 'text-white/50' : 'text-zinc-500'}>Retention and revenue by signup cohort</p>
      </div>

      <GlassCard className="p-5 overflow-x-auto">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Revenue Retention by Cohort</h3>
        <table className="w-full min-w-[500px]">
          <thead>
            <tr>
              <th className={`text-left text-sm font-medium py-2 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Cohort</th>
              {months.map(m => (
                <th key={m} className={`text-center text-sm font-medium py-2 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr key={cohort} className={`border-t ${isDarkMode ? 'border-white/10' : 'border-zinc-200'}`}>
                <td className={`py-3 text-sm ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{cohort}</td>
                {months.map((_, i) => (
                  <td key={i} className="text-center py-3">
                    <span className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`}>—</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Cohort LTV Comparison</h3>
        <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'text-white/30' : 'text-zinc-400'}`}>
          Bar chart placeholder
        </div>
      </GlassCard>
    </div>
  );
}