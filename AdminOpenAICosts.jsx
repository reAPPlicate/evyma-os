import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, CalendarIcon, Layers, Search, Loader, TrendingUp, ChevronDown, ChevronRight, Filter, BarChart3, PieChart, RefreshCw, Database } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar } from 'recharts';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const OpenAICostRecord = base44.entities.OpenAICostRecord;

const PROJECT_OPTIONS = [
  { id: 'proj_pZbTQOO9dwdQnRs485maIaaF', name: 'Evyma-v1.0' },
  { id: 'proj_xitXFr9n0K2SSp0MAQ61VImh', name: 'Integrated Sandbox' },
  { id: 'proj_l46IC6p9ZTZBINPaJC7IW0VR', name: 'Realtime' },
  { id: 'proj_DcMwZ6Qf5ylqUpYEVQz5FCvs', name: 'LLM' }
];

const getProjectName = (projectId) => {
  if (!projectId) return 'Unknown';
  const match = PROJECT_OPTIONS.find(p => p.id === projectId);
  if (match) return match.name;
  // Handle partial matches - check if ID contains key parts
  if (projectId.includes('l46') && projectId.includes('C6p9') && projectId.includes('W0VR')) return 'Realtime';
  return projectId;
};

const COLORS = ['#3498db', '#9b59b6', '#1abc9c', '#e91e63', '#e67e22', '#27ae60', '#6366f1', '#f43f5e'];

export default function AdminOpenAICosts() {
  const { isDarkMode, theme } = useTheme();
  const queryClient = useQueryClient();
  
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [showRequestPayload, setShowRequestPayload] = useState(false);
  
  // Query params for sync - default to last 7 days
  const [syncStartDate, setSyncStartDate] = useState(subDays(new Date(), 7));
  const [syncEndDate, setSyncEndDate] = useState(new Date());
  const [selectedProjects, setSelectedProjects] = useState(['proj_pZbTQOO9dwdQnRs485maIaaF', 'proj_xitXFr9n0K2SSp0MAQ61VImh', 'proj_l46IC6p9ZTZBINPaJC7IW0VR', 'proj_DcMwZ6Qf5ylqUpYEVQz5FCvs']);
  
  // Filters for viewing
  const [filterProject, setFilterProject] = useState('all');
  const [filterLineItem, setFilterLineItem] = useState('all');
  const [dateRange, setDateRange] = useState('3');

  // Fetch stored cost records
  const { data: costRecords = [], isLoading, refetch } = useQuery({
    queryKey: ['openai-costs', dateRange],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
      return OpenAICostRecord.filter({ date: { $gte: startDate } }, '-date', 1000);
    }
  });

  // Sync data from OpenAI
  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    
    try {
      const response = await base44.functions.invoke('syncOpenAICosts', {
        start_date: format(syncStartDate, 'yyyy-MM-dd'),
        end_date: format(syncEndDate, 'yyyy-MM-dd'),
        project_ids: selectedProjects
      });
      
      if (response.data.success) {
        setSyncMessage({ type: 'success', text: response.data.message });
        refetch();
      } else {
        setSyncMessage({ type: 'error', text: response.data.error || 'Sync failed' });
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: err.message });
    } finally {
      setSyncing(false);
    }
  };

  // Process and filter data
  const processedData = useMemo(() => {
    if (!costRecords.length) return null;

    let filtered = [...costRecords];

    // Apply filters
    if (filterProject !== 'all') {
      filtered = filtered.filter(r => r.project_id === filterProject);
    }
    if (filterLineItem !== 'all') {
      filtered = filtered.filter(r => r.line_item === filterLineItem);
    }

    // Get unique values for filters
    const uniqueProjects = [...new Set(costRecords.map(r => r.project_id).filter(Boolean))];
    const uniqueLineItems = [...new Set(costRecords.map(r => r.line_item).filter(Boolean))];

    // Calculate totals
    const totalCost = filtered.reduce((sum, r) => sum + (r.cost || 0), 0);
    
    // Costs by project
    const costsByProject = {};
    filtered.forEach(r => {
      const proj = r.project_name || getProjectName(r.project_id) || 'Unknown';
      costsByProject[proj] = (costsByProject[proj] || 0) + (r.cost || 0);
    });

    // Costs by line item
    const costsByLineItem = {};
    filtered.forEach(r => {
      const item = r.line_item || 'Unknown';
      costsByLineItem[item] = (costsByLineItem[item] || 0) + (r.cost || 0);
    });

    // Daily costs for chart
    const dailyCosts = {};
    filtered.forEach(r => {
      const dateStr = format(new Date(r.date), 'MMM d');
      dailyCosts[dateStr] = (dailyCosts[dateStr] || 0) + (r.cost || 0);
    });
    const chartData = Object.entries(dailyCosts)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Pie chart data for projects
    const projectPieData = Object.entries(costsByProject).map(([name, value]) => ({ name, value }));

    // Bar chart data for line items (top 10)
    const lineItemBarData = Object.entries(costsByLineItem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ 
        name: name.length > 25 ? name.slice(0, 25) + '...' : name, 
        fullName: name, 
        value 
      }));

    const uniqueDates = [...new Set(filtered.map(r => r.date))];

    return {
      totalCost,
      costsByProject,
      costsByLineItem,
      chartData,
      projectPieData,
      lineItemBarData,
      uniqueProjects,
      uniqueLineItems,
      filteredResults: filtered,
      daysWithData: uniqueDates.length,
      totalDays: parseInt(dateRange)
    };
  }, [costRecords, filterProject, filterLineItem, dateRange]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  };

  const accentColor = theme?.accent || '#3B82F6';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <DollarSign className="w-7 h-7" style={{ color: accentColor }} />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>OpenAI Costs</h1>
          <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>
            API usage analytics with persistent storage
          </p>
        </div>
      </div>

      {/* Sync Controls */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Sync from OpenAI</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Start Date (EST)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full h-9 justify-start text-left text-sm font-normal ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-zinc-100 border-zinc-200'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(syncStartDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={syncStartDate}
                  onSelect={(date) => date && setSyncStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>End Date (EST)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full h-9 justify-start text-left text-sm font-normal ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-zinc-100 border-zinc-200'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(syncEndDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={syncEndDate}
                  onSelect={(date) => date && setSyncEndDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Projects</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_OPTIONS.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjects(prev => 
                    prev.includes(project.id) 
                      ? prev.filter(id => id !== project.id) 
                      : [...prev, project.id]
                  )}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedProjects.includes(project.id)
                      ? 'text-white'
                      : isDarkMode ? 'bg-white/5 text-white/70' : 'bg-zinc-100 text-zinc-600'
                  }`}
                  style={{
                    backgroundColor: selectedProjects.includes(project.id) ? accentColor : undefined
                  }}
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <Button
              onClick={handleSync}
              disabled={syncing || selectedProjects.length === 0}
              className="w-full h-9 text-white"
              style={{ backgroundColor: accentColor }}
            >
              {syncing ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {syncMessage && (
          <div className={`p-3 rounded-lg text-sm ${
            syncMessage.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {syncMessage.text}
          </div>
        )}
      </GlassCard>

      {/* View Controls */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" style={{ color: accentColor }} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>View Stored Data:</span>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className={`w-32 rounded-lg h-8 text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1 day</SelectItem>
              <SelectItem value="3">Last 3 days</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 180 days</SelectItem>
            </SelectContent>
          </Select>
          
          {processedData && (
            <>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className={`w-40 rounded-lg h-8 text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200'}`}>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {processedData.uniqueProjects.map(p => (
                    <SelectItem key={p} value={p}>{PROJECT_OPTIONS.find(o => o.id === p)?.name || p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLineItem} onValueChange={setFilterLineItem}>
                <SelectTrigger className={`w-48 rounded-lg h-8 text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200'}`}>
                  <SelectValue placeholder="Line Item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Line Items</SelectItem>
                  {processedData.uniqueLineItems.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button 
                onClick={() => { setFilterProject('all'); setFilterLineItem('all'); }} 
                className={`text-xs px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              >
                Clear
              </button>
            </>
          )}
        </div>
      </GlassCard>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
        </div>
      )}

      {/* Dashboard */}
      {processedData && !isLoading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" style={{ color: accentColor }} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Total Cost</span>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{formatCurrency(processedData.totalCost)}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" style={{ color: accentColor }} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Days</span>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                {processedData.daysWithData} <span className={`text-sm font-normal ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`}>/ {processedData.totalDays}</span>
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" style={{ color: accentColor }} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Avg/Day</span>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                {formatCurrency(processedData.totalCost / (processedData.daysWithData || 1))}
              </p>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5" style={{ color: accentColor }} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Records</span>
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{processedData.filteredResults.length}</p>
            </GlassCard>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area Chart - Daily Costs */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5" style={{ color: accentColor }} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Daily Costs</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={processedData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDarkMode ? '#fff' : '#333' }} />
                  <YAxis tick={{ fontSize: 10, fill: isDarkMode ? '#fff' : '#333' }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip 
                    formatter={(v) => formatCurrency(v)} 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                      border: `1px solid ${isDarkMode ? '#333' : '#ddd'}`,
                      borderRadius: 8
                    }}
                  />
                  <Area type="monotone" dataKey="cost" stroke={accentColor} fill={accentColor} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Pie Chart - By Project */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5" style={{ color: accentColor }} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>By Project</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie 
                    data={processedData.projectPieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={70} 
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} 
                    labelLine={false}
                  >
                    {processedData.projectPieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </RechartsPie>
              </ResponsiveContainer>
            </GlassCard>
          </div>

          {/* Bar Chart - Top Line Items */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5" style={{ color: accentColor }} />
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Top 10 Line Items</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.lineItemBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 10, fill: isDarkMode ? '#fff' : '#333' }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: isDarkMode ? '#fff' : '#333' }} width={150} />
                <Tooltip 
                  formatter={(v) => formatCurrency(v)} 
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullName || ''}
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                    border: `1px solid ${isDarkMode ? '#333' : '#ddd'}`,
                    borderRadius: 8
                  }}
                />
                <Bar dataKey="value" fill={accentColor} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Detailed Table */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" style={{ color: accentColor }} />
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  All Records ({processedData.filteredResults.length})
                </h3>
              </div>
            </div>
            <div className={`overflow-auto max-h-96 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-zinc-50'}`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-white/10' : 'border-zinc-200'}`}>
                    <th className={`text-left p-3 font-semibold ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Date</th>
                    <th className={`text-left p-3 font-semibold ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Project</th>
                    <th className={`text-left p-3 font-semibold ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Line Item</th>
                    <th className={`text-right p-3 font-semibold ${isDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.filteredResults.map((r, idx) => (
                    <tr key={r.id || idx} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-zinc-100'}`}>
                      <td className={`p-3 text-xs ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>
                        {format(new Date(r.date), 'MMM d, yyyy')}
                      </td>
                      <td className={`p-3 text-xs ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>
                        {r.project_name || getProjectName(r.project_id)}
                      </td>
                      <td className={`p-3 text-xs ${isDarkMode ? 'text-white/70' : 'text-zinc-600'}`}>{r.line_item}</td>
                      <td className="p-3 text-right font-mono font-semibold" style={{ color: accentColor }}>
                        {formatCurrency(r.cost || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

      {/* Empty State */}
      {!processedData && !isLoading && (
        <GlassCard className="p-12 text-center">
          <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: accentColor }} />
          <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>No Data Yet</p>
          <p className={isDarkMode ? 'text-white/60' : 'text-zinc-500'}>
            Click "Sync Now" to fetch and store cost data from OpenAI
          </p>
        </GlassCard>
      )}
    </div>
  );
}