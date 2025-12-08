import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  DollarSign, 
  Package, 
  Users, 
  Settings,
  Menu,
  X,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Eye,
  Wallet,
  TrendingUp,
  PieChart,
  Target,
  Calculator,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ThemeProvider, useTheme } from '@/components/theme/ThemeContext';
import ThemedBackground from '@/components/theme/ThemedBackground';
import GlassCard from '@/components/theme/GlassCard';

import AdminQuickView from '@/components/admin/AdminQuickView';
import FinancialsOverview from '@/components/admin/financials/FinancialsOverview';
import FinancialsUsers from '@/components/admin/financials/FinancialsUsers';
import FinancialsCost from '@/components/admin/financials/FinancialsCost';
import FinancialsRevenue from '@/components/admin/financials/FinancialsRevenue';
import FinancialsCohort from '@/components/admin/financials/FinancialsCohort';
import FinancialsTierProfitability from '@/components/admin/financials/FinancialsTierProfitability';
import FinancialsForecasting from '@/components/admin/financials/FinancialsForecasting';
import FinancialsCACManagement from '@/components/admin/financials/FinancialsCACManagement';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminSiteManagement from '@/components/admin/AdminSiteManagement';
import AdminOpenAICosts from '@/components/admin/AdminOpenAICosts';

const TABS = [
  { id: 'quick-view', label: 'Quick View', icon: LayoutDashboard },
  { 
    id: 'financials', 
    label: 'Financials', 
    icon: DollarSign,
    subTabs: [
      { id: 'financials-overview', label: 'Overview', icon: Eye },
      { id: 'financials-users', label: 'Users', icon: Users },
      { id: 'financials-cost', label: 'Cost', icon: Wallet },
      { id: 'financials-revenue', label: 'Revenue', icon: TrendingUp },
      { id: 'financials-cohort', label: 'Cohort', icon: PieChart },
      { id: 'financials-tier', label: 'Tier Profitability', icon: Target },
      { id: 'financials-forecasting', label: 'Forecasting', icon: TrendingUp },
      { id: 'financials-cac', label: 'CAC Management', icon: Calculator },
    ]
  },
  { id: 'products', label: 'Products & Pricing', icon: Package },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'site', label: 'Site Management', icon: Settings },
  { id: 'openai-costs', label: 'OpenAI Costs', icon: Cpu },
];

function AdminContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quick-view');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({});
  const navigate = useNavigate();
  const { isDarkMode, theme } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/Admin');
          return;
        }
        if (currentUser.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin('/Admin');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
        <div 
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const toggleAccordion = (tabId) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [tabId]: !prev[tabId]
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'quick-view':
        return <AdminQuickView />;
      case 'financials-overview':
        return <FinancialsOverview />;
      case 'financials-users':
        return <FinancialsUsers />;
      case 'financials-cost':
        return <FinancialsCost />;
      case 'financials-revenue':
        return <FinancialsRevenue />;
      case 'financials-cohort':
        return <FinancialsCohort />;
      case 'financials-tier':
        return <FinancialsTierProfitability />;
      case 'financials-forecasting':
        return <FinancialsForecasting />;
      case 'financials-cac':
        return <FinancialsCACManagement />;
      case 'products':
        return <AdminProducts />;
      case 'users':
        return <AdminUsers />;
      case 'site':
        return <AdminSiteManagement />;
      case 'openai-costs':
        return <AdminOpenAICosts />;
      default:
        return <AdminQuickView />;
    }
  };

  return (
    <div className={`
      min-h-screen flex
      transition-colors duration-500 ease-out
      ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}
    `}>
      <ThemedBackground />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 
        backdrop-blur-xl
        ${isDarkMode 
          ? 'bg-zinc-900/80 border-r border-white/10' 
          : 'bg-white/70 border-r border-zinc-200/50'
        }
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-zinc-200/50'}`}>
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Admin Panel</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`lg:hidden ${isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'}`}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const hasSubTabs = tab.subTabs && tab.subTabs.length > 0;
            const isExpanded = expandedAccordions[tab.id];
            const isActive = activeTab === tab.id || (hasSubTabs && tab.subTabs.some(st => st.id === activeTab));
            
            return (
              <div key={tab.id}>
                <button
                  onClick={() => {
                    if (hasSubTabs) {
                      toggleAccordion(tab.id);
                    } else {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl
                    transition-all text-left backdrop-blur-sm
                    ${isActive && !hasSubTabs
                      ? 'text-white shadow-lg' 
                      : isDarkMode
                        ? 'text-white/60 hover:text-white hover:bg-white/5'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                    }
                  `}
                  style={isActive && !hasSubTabs ? { backgroundColor: theme.accent } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {hasSubTabs && (
                    isExpanded 
                      ? <ChevronDown className="w-4 h-4" /> 
                      : <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {/* Sub-tabs accordion */}
                {hasSubTabs && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/10 pl-2">
                    {tab.subTabs.map((subTab) => {
                      const SubIcon = subTab.icon;
                      const isSubActive = activeTab === subTab.id;
                      return (
                        <button
                          key={subTab.id}
                          onClick={() => {
                            setActiveTab(subTab.id);
                            setSidebarOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                            transition-all text-left
                            ${isSubActive 
                              ? 'text-white shadow-md' 
                              : isDarkMode
                                ? 'text-white/50 hover:text-white hover:bg-white/5'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                            }
                          `}
                          style={isSubActive ? { backgroundColor: theme.accent } : {}}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span>{subTab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="outline" 
            className={`
              w-full gap-2
              ${isDarkMode 
                ? 'border-white/20 text-white/70 hover:text-white hover:bg-white/10' 
                : 'border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }
            `}
            onClick={() => navigate(createPageUrl('Home'))}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative z-10">
        {/* Mobile Header */}
        <header className={`
          lg:hidden flex items-center gap-4 p-4 
          backdrop-blur-xl
          ${isDarkMode 
            ? 'bg-zinc-900/50 border-b border-white/10' 
            : 'bg-white/50 border-b border-zinc-200/50'
          }
        `}>
          <Button 
            variant="ghost" 
            size="icon"
            className={isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function Admin() {
  return (
    <ThemeProvider>
      <AdminContent />
    </ThemeProvider>
  );
}