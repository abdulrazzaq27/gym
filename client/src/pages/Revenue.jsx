import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../components/utils/ThemeContext.jsx';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  AreaChart,
  LineChart,
  Brush,
  ReferenceLine
} from 'recharts';

const PALETTE = {
  revenue: '#3B82F6', // blue
  revenueAccent: '#06B6D4', // teal
  transactions: '#F59E0B', // amber
  positive: '#10B981',
  negative: '#EF4444',
  surface: 'rgba(255,255,255,0.03)'
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

function shortMonthName(m) {
  // return short month name or fallback to 'M<number>' (keeps behavior similar to original)
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] || `M${m}`;
}

function buildCSV(rows) {
  // Create a CSV where every field is quoted (safer for commas/newlines)
  if (!rows || !rows.length) return '';
  const keys = Object.keys(rows[0]);
  // Quote header fields too
  const header = keys.map(k => `"${k.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','));
  return [header, ...lines].join('\n');
}

export default function RevenueRevamp() {
  // State
  const navigate = useNavigate();
  const [dataRaw, setDataRaw] = useState({ monthlyRevenue: [], annualRevenue: [], totalRevenue: { total: 0, count: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('12m'); // '12m' | 'ytd' | 'all'
  const [chartMode, setChartMode] = useState('composed'); // composed | bar | area | line

  const { isDarkMode } = useTheme();

  // Theme-based classes
  const themeClasses = {
    background: isDarkMode
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    cardBackground: isDarkMode
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
    primaryText: isDarkMode ? 'text-white' : 'text-gray-900',
    secondaryText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    backButton: isDarkMode
      ? 'bg-gray-700 hover:bg-gray-600 text-white'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    toggleButton: isDarkMode
      ? 'border-slate-700 bg-slate-800/80'
      : 'border-gray-200 bg-white/80',
    toggleHover: isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100',
    sunColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-500',
    moonColor: isDarkMode ? 'text-gray-400' : 'text-gray-700',
    buttonGroup: isDarkMode
      ? 'bg-gray-800/50 border-gray-700'
      : 'bg-gray-100/50 border-gray-300',
    activeButton: isDarkMode
      ? 'bg-blue-800/30 text-blue-200'
      : 'bg-blue-200/50 text-blue-800',
    inactiveButton: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    chartModeActive: isDarkMode
      ? 'bg-indigo-700/30 text-indigo-200'
      : 'bg-indigo-200/50 text-indigo-800',
    exportButton: isDarkMode
      ? 'bg-blue-600 hover:bg-blue-700'
      : 'bg-blue-500 hover:bg-blue-600',
    kpiCard: isDarkMode
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
    positiveText: isDarkMode ? 'text-green-300' : 'text-green-600',
    negativeText: isDarkMode ? 'text-red-300' : 'text-red-600',
    positiveBg: isDarkMode ? 'bg-green-900/30' : 'bg-green-100/50',
    negativeBg: isDarkMode ? 'bg-red-900/30' : 'bg-red-100/50',
    tableHeader: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    tableRow: isDarkMode
      ? 'border-gray-800 hover:bg-gray-750/30'
      : 'border-gray-100 hover:bg-gray-50/30',
    loadingCard: isDarkMode ? 'bg-gray-800' : 'bg-gray-200',
    loadingText: isDarkMode ? 'bg-gray-700' : 'bg-gray-300',
    errorCard: isDarkMode
      ? 'bg-red-900/30 border-red-700'
      : 'bg-red-50 border-red-200',
    errorButton: isDarkMode ? 'bg-red-600' : 'bg-red-500',
    chartGrid: isDarkMode ? '#1F2937' : '#E5E7EB',
    chartTick: isDarkMode ? '#cbd5e1' : '#6B7280',
    chartTooltip: isDarkMode
      ? { background: '#0f1724', border: '1px solid #374151' }
      : { background: '#ffffff', border: '1px solid #d1d5db' },
    pieColors: isDarkMode
      ? [PALETTE.revenue, PALETTE.revenueAccent, PALETTE.transactions, PALETTE.positive, PALETTE.negative, '#8B5CF6']
      : ['#3B82F6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6']
  };

  // Fetch data once on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get('/api/dashboard/revenue')
      .then(res => { if (mounted) { setDataRaw(res.data || { monthlyRevenue: [], annualRevenue: [], totalRevenue: { total: 0, count: 0 } }); setLoading(false); } })
      .catch(err => { console.error(err); if (mounted) { setError('Could not load revenue data.'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  // Prepare monthly series (12 months always ending with current month)
  const monthlySeries = useMemo(() => {
    const map = new Map();
    (dataRaw.monthlyRevenue || []).forEach(item => {
      const y = item._id.year; const m = item._id.month;
      map.set(`${y}-${String(m).padStart(2, '0')}`, item);
    });

    const out = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear(); const month = d.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const item = map.get(key);
      out.push({
        year,
        month,
        label: `${shortMonthName(month)} ${String(year).slice(2)}`,
        revenue: item ? item.total : 0,
        transactions: item ? (item.count || 0) : 0,
        iso: `${year}-${String(month).padStart(2, '0')}`
      });
    }
    return out;
  }, [dataRaw.monthlyRevenue]);

  // Annual series
  const annualSeries = useMemo(() => {
    return (dataRaw.annualRevenue || []).slice().sort((a, b) => a._id - b._id).map(item => ({ year: String(item._id), revenue: item.total, transactions: item.count || 0 }));
  }, [dataRaw.annualRevenue]);

  // Derived KPIs
  const totalRevenue = dataRaw.totalRevenue?.total || 0;
  const totalTransactions = dataRaw.totalRevenue?.count || 0;
  const currentMonthRevenue = monthlySeries[monthlySeries.length - 1]?.revenue || 0;
  const currentYearRevenue = (annualSeries.length ? annualSeries[annualSeries.length - 1].revenue : 0);

  // Short sparklines data
  const sparkRevenue = monthlySeries.map(m => ({ x: m.label, y: m.revenue }));
  const sparkTx = monthlySeries.map(m => ({ x: m.label, y: m.transactions }));

  // Chart data depending on timeframe
  const visibleMonthly = useMemo(() => {
    if (timeframe === '12m') return monthlySeries;
    if (timeframe === 'ytd') {
      const thisYear = new Date().getFullYear();
      return monthlySeries.filter(m => m.year === thisYear);
    }
    return monthlySeries; // all (we only have last 12 anyway)
  }, [monthlySeries, timeframe]);

  // Distribution for pie: last 6 months
  const distribution = useMemo(() => {
    const slice = monthlySeries.slice(-6).map((m, i) => ({ name: m.label, value: m.revenue }));
    return slice;
  }, [monthlySeries]);

  function downloadCSV(dataset, filename = 'export.csv') {
    const csv = buildCSV(dataset);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function renderKPI({ title, value, sub, delta, sparkData, color }) {
    const deltaPositive = delta >= 0;
    return (
      <div className={`${themeClasses.kpiCard} border rounded-2xl p-4 shadow-lg`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs ${themeClasses.mutedText}`}>{title}</p>
            <p className={`text-2xl font-bold ${themeClasses.primaryText} mt-1`}>{formatCurrency(value)}</p>
            <p className={`text-xs ${themeClasses.mutedText} mt-1`}>{sub}</p>
          </div>
          <div className="text-right">
            {/* delta badge */}
            <div className={`px-2 py-1 rounded-md text-sm font-medium ${deltaPositive ? `${themeClasses.positiveBg} ${themeClasses.positiveText}` : `${themeClasses.negativeBg} ${themeClasses.negativeText}`}`}>
              {deltaPositive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
            </div>
          </div>
        </div>
        {/* mini sparkline */}
        <div className="mt-3 h-12">
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area type="monotone" dataKey="y" stroke={color} fill={color} fillOpacity={0.12} dot={false} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // If loading or error
  if (loading) return (
    <div className={`w-full p-6 ${themeClasses.background} min-h-screen`}>
      <div className="animate-pulse space-y-6">
        <div className={`h-8 ${themeClasses.loadingText} rounded w-1/3`}></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`h-28 ${themeClasses.loadingCard} rounded-xl`}></div>
          <div className={`h-28 ${themeClasses.loadingCard} rounded-xl`}></div>
          <div className={`h-28 ${themeClasses.loadingCard} rounded-xl`}></div>
        </div>
        <div className={`h-64 ${themeClasses.loadingCard} rounded-xl`}></div>
      </div>
    </div>
  );

  if (error) return (
    <div className={`w-full p-6 flex items-center justify-center ${themeClasses.background} min-h-screen`}>
      <div className={`${themeClasses.errorCard} border rounded-xl p-6 text-center`}>
        <p className={`${themeClasses.primaryText} font-semibold mb-2`}>{error}</p>
        <button onClick={() => window.location.reload()} className={`${themeClasses.errorButton} px-4 py-2 rounded text-white`}>Retry</button>
      </div>
    </div>
  );

  // Quick deltas for KPIs
  const last = monthlySeries[monthlySeries.length - 1] || { revenue: 0 };
  const prev = monthlySeries[monthlySeries.length - 2] || { revenue: 0 };
  const monthDelta = prev && prev.revenue ? ((last.revenue - prev.revenue) / prev.revenue) * 100 : 0;

  const lastYear = annualSeries[annualSeries.length - 1] || { revenue: 0 };
  const prevYear = annualSeries[annualSeries.length - 2] || { revenue: 0 };
  const yearDelta = prevYear && prevYear.revenue ? ((lastYear.revenue - prevYear.revenue) / prevYear.revenue) * 100 : 0;

  // Composed chart for overview
  const OverviewChart = () => (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={visibleMonthly} margin={{ top: 10, right: 24, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.revenue} stopOpacity={0.18} />
            <stop offset="100%" stopColor={PALETTE.revenue} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={themeClasses.chartGrid} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fill: themeClasses.chartTick }} />
        <YAxis yAxisId="left" tickFormatter={(v) => {
          if (v >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`;
          if (v >= 1_000) return `₹${(v / 1000).toFixed(1)}K`;
          return `₹${v}`;
        }} tick={{ fill: themeClasses.chartTick }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: themeClasses.chartTick }} />
        <Tooltip contentStyle={themeClasses.chartTooltip} formatter={(val, name) => name === 'revenue' ? formatCurrency(val) : val} />
        <Legend wrapperStyle={{ color: themeClasses.chartTick }} />

        <Area yAxisId="left" type="monotone" dataKey="revenue" fillOpacity={1} fill="url(#gRev)" stroke={PALETTE.revenue} strokeWidth={2.5} />
        <Bar yAxisId="left" dataKey="revenue" barSize={18} name="Revenue (bar)" fill={PALETTE.revenueAccent} opacity={0.12} />
        <Line yAxisId="right" type="monotone" dataKey="transactions" stroke={PALETTE.transactions} strokeWidth={2} dot={{ r: 3 }} name="Transactions" />
        <Brush dataKey="label" height={24} stroke={isDarkMode ? "#374151" : "#9CA3AF"} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <div className={`w-full p-6 ${themeClasses.background} min-h-screen relative`}>
      {/* Theme Toggle Button - Fixed Position */}
      {/* <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl transition-all duration-300 ${themeClasses.toggleHover} shadow-lg backdrop-blur-sm border ${themeClasses.toggleButton}`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className={`w-6 h-6 ${themeClasses.sunColor}`} />
          ) : (
            <Moon className={`w-6 h-6 ${themeClasses.moonColor}`} />
          )}
        </button>
      </div> */}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/')}
            className={`p-2 rounded ${themeClasses.backButton} transition-colors shadow-md`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className={`text-2xl font-bold ${themeClasses.primaryText}`}>
            Revenue DashBoard
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`text-sm ${themeClasses.mutedText}`}>Timeframe</div>
          <div className={`flex items-center space-x-2 ${themeClasses.buttonGroup} p-1 rounded-md border`}>
            <button onClick={() => setTimeframe('12m')} className={`px-3 py-1 rounded transition-colors ${timeframe === '12m' ? themeClasses.activeButton : themeClasses.inactiveButton}`}>Last 12m</button>
            <button onClick={() => setTimeframe('ytd')} className={`px-3 py-1 rounded transition-colors ${timeframe === 'ytd' ? themeClasses.activeButton : themeClasses.inactiveButton}`}>YTD</button>
            <button onClick={() => setTimeframe('all')} className={`px-3 py-1 rounded transition-colors ${timeframe === 'all' ? themeClasses.activeButton : themeClasses.inactiveButton}`}>All</button>
          </div>

          <div className={`flex items-center space-x-2 ${themeClasses.buttonGroup} p-1 rounded-md border`}>
            <button onClick={() => setChartMode('composed')} className={`px-2 py-1 rounded transition-colors ${chartMode === 'composed' ? themeClasses.chartModeActive : themeClasses.inactiveButton}`}>Overview</button>
            <button onClick={() => setChartMode('bar')} className={`px-2 py-1 rounded transition-colors ${chartMode === 'bar' ? themeClasses.chartModeActive : themeClasses.inactiveButton}`}>Bar</button>
            <button onClick={() => setChartMode('area')} className={`px-2 py-1 rounded transition-colors ${chartMode === 'area' ? themeClasses.chartModeActive : themeClasses.inactiveButton}`}>Area</button>
            <button onClick={() => setChartMode('line')} className={`px-2 py-1 rounded transition-colors ${chartMode === 'line' ? themeClasses.chartModeActive : themeClasses.inactiveButton}`}>Line</button>
          </div>

          <button onClick={() => downloadCSV(visibleMonthly.map(m => ({ month: m.label, revenue: m.revenue, transactions: m.transactions })), 'monthly.csv')} className={`${themeClasses.exportButton} px-3 py-2 rounded text-white transition-colors`}>Export CSV</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {renderKPI({ title: 'Total Revenue', value: totalRevenue, sub: `${totalTransactions} transactions`, delta: yearDelta, sparkData: sparkRevenue, color: PALETTE.revenue })}
        {renderKPI({ title: 'This Year', value: currentYearRevenue, sub: 'YTD', delta: yearDelta, sparkData: sparkRevenue, color: PALETTE.revenueAccent })}
        {renderKPI({ title: 'This Month', value: currentMonthRevenue, sub: `${monthlySeries[monthlySeries.length - 1]?.label || ''}`, delta: monthDelta, sparkData: sparkTx, color: PALETTE.transactions })}
      </div>

      {/* Main Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`col-span-2 ${themeClasses.cardBackground} border rounded-2xl p-4 shadow-xl`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-semibold ${themeClasses.primaryText}`}>Overview</h2>
            <div className={`text-sm ${themeClasses.mutedText}`}>Revenue & Transactions</div>
          </div>

          {chartMode === 'composed' && <OverviewChart />}

          {chartMode === 'bar' && (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={visibleMonthly} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={themeClasses.chartGrid} strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: themeClasses.chartTick }} />
                <YAxis
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`;
                    if (v >= 1_000) return `₹${(v / 1000).toFixed(1)}K`;
                    return `₹${v}`;
                  }}
                  tick={{ fill: themeClasses.chartTick }}
                />

                <Tooltip contentStyle={themeClasses.chartTooltip} formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="revenue" fill={PALETTE.revenue} radius={[8, 8, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartMode === 'area' && (
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={visibleMonthly} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PALETTE.revenue} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={PALETTE.revenue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={themeClasses.chartGrid} strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: themeClasses.chartTick }} />
                <YAxis
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`;
                    if (v >= 1_000) return `₹${(v / 1000).toFixed(1)}K`;
                    return `₹${v}`;
                  }}
                  tick={{ fill: themeClasses.chartTick }}
                />

                <Tooltip contentStyle={themeClasses.chartTooltip} formatter={(val) => formatCurrency(val)} />
                <Area type="monotone" dataKey="revenue" stroke={PALETTE.revenue} fill="url(#gA)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartMode === 'line' && (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={visibleMonthly} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={themeClasses.chartGrid} strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: themeClasses.chartTick }} />
                <YAxis
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`;
                    if (v >= 1_000) return `₹${(v / 1000).toFixed(1)}K`;
                    return `₹${v}`;
                  }}
                  tick={{ fill: themeClasses.chartTick }}
                />

                <Tooltip contentStyle={themeClasses.chartTooltip} formatter={(val) => (typeof val === 'number' ? formatCurrency(val) : val)} />
                <Line dataKey="revenue" stroke={PALETTE.revenue} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line dataKey="transactions" stroke={PALETTE.transactions} strokeWidth={1.5} dot={false} strokeDasharray="4 3" yAxisId="right" />
              </LineChart>
            </ResponsiveContainer>
          )}

        </div>

        {/* Right column small charts */}
        <div className="flex flex-col gap-6">
          <div className={`${themeClasses.cardBackground} border rounded-2xl p-4 shadow-xl`}>
            <h3 className={`text-sm font-semibold ${themeClasses.primaryText} mb-2`}>Transactions (last 12)</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={monthlySeries} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" hide />
                <YAxis hide />
                <Tooltip contentStyle={themeClasses.chartTooltip} formatter={(v) => v} />
                <Line type="monotone" dataKey="transactions" stroke={PALETTE.transactions} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className={`mt-3 text-xs ${themeClasses.mutedText}`}>Total tx: <span className={`${themeClasses.primaryText} ml-1`}>{totalTransactions}</span></div>
          </div>

          <div className={`${themeClasses.cardBackground} border rounded-2xl p-4 shadow-xl`}>
            <h3 className={`text-sm font-semibold ${themeClasses.primaryText} mb-2`}>Revenue Distribution (last 6m)</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={distribution} dataKey="value" innerRadius={36} outerRadius={60} paddingAngle={4}>
                  {distribution.map((entry, idx) => (
                    <Cell key={`c-${idx}`} fill={themeClasses.pieColors[idx % 6]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={themeClasses.chartTooltip} formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs">
              {distribution.map((d, i) => (
                <div key={d.name} className={`flex items-center justify-between ${themeClasses.secondaryText} text-xs py-0.5`}>
                  <div className="flex items-center"><span className="w-2 h-2 mr-2 rounded-sm" style={{ background: themeClasses.pieColors[i % 6] }}></span>{d.name}</div>
                  <div className={themeClasses.primaryText}>{formatCurrency(d.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables: Monthly & Annual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className={`${themeClasses.cardBackground} border rounded-2xl p-4 shadow-xl overflow-x-auto`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-semibold ${themeClasses.primaryText}`}>Monthly Revenue</h3>
            <div className={`text-xs ${themeClasses.mutedText}`}>{monthlySeries.length} months</div>
          </div>
          <table className="w-full text-sm">
            <thead className={`text-left ${themeClasses.secondaryText} text-xs border-b ${themeClasses.tableHeader}`}>
              <tr>
                <th className="py-2">Month</th>
                <th className="py-2">Revenue</th>
                <th className="py-2">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {monthlySeries.slice().reverse().map(r => (
                <tr key={r.iso} className={`border-b ${themeClasses.tableRow} transition-colors`}>
                  <td className={`py-3 ${themeClasses.primaryText}`}>{r.label}</td>
                  <td className={`py-3 ${themeClasses.positiveText} font-semibold text-right`}>{formatCurrency(r.revenue)}</td>
                  <td className={`py-3 ${themeClasses.secondaryText} text-right`}>{r.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`${themeClasses.cardBackground} border rounded-2xl p-4 shadow-xl overflow-x-auto`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-semibold ${themeClasses.primaryText}`}>Annual Revenue</h3>
            <div className={`text-xs ${themeClasses.mutedText}`}>{annualSeries.length} years</div>
          </div>
          <table className="w-full text-sm">
            <thead className={`text-left ${themeClasses.secondaryText} text-xs border-b ${themeClasses.tableHeader}`}>
              <tr>
                <th className="py-2">Year</th>
                <th className="py-2 text-right">Revenue</th>
                <th className="py-2 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {annualSeries.slice().reverse().map(a => (
                <tr key={a.year} className={`border-b ${themeClasses.tableRow} transition-colors`}>
                  <td className={`py-3 ${themeClasses.primaryText}`}>{a.year}</td>
                  <td className={`py-3 text-blue-400 text-right font-semibold`}>{formatCurrency(a.revenue)}</td>
                  <td className={`py-3 ${themeClasses.secondaryText} text-right`}>{a.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}