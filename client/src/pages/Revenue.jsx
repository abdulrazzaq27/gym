import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
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
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1] || `M${m}`;
}

function buildCSV(rows) {
  // Create a CSV where every field is quoted (safer for commas/newlines)
  if (!rows || !rows.length) return '';
  const keys = Object.keys(rows[0]);
  // Quote header fields too
  const header = keys.map(k => `"${k.replace(/"/g, '""')}"`).join(',');
  const lines = rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g,'""')}"`).join(','));
  return [header, ...lines].join('\n');
}

export default function RevenueRevamp() {
  // State
  const navigate = useNavigate();
  const [dataRaw, setDataRaw] = useState({ monthlyRevenue: [], annualRevenue: [], totalRevenue: { total:0, count:0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('12m'); // '12m' | 'ytd' | 'all'
  const [chartMode, setChartMode] = useState('composed'); // composed | bar | area | line

  // Fetch data once on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get('/api/dashboard/revenue')
      .then(res => { if (mounted) { setDataRaw(res.data || { monthlyRevenue: [], annualRevenue: [], totalRevenue: { total:0, count:0 } }); setLoading(false); } })
      .catch(err => { console.error(err); if (mounted) { setError('Could not load revenue data.'); setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  // Prepare monthly series (12 months always ending with current month)
  const monthlySeries = useMemo(() => {
    const map = new Map();
    (dataRaw.monthlyRevenue || []).forEach(item => {
      const y = item._id.year; const m = item._id.month;
      map.set(`${y}-${String(m).padStart(2,'0')}`, item);
    });

    const out = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear(); const month = d.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2,'0')}`;
      const item = map.get(key);
      out.push({
        year,
        month,
        label: `${shortMonthName(month)} ${String(year).slice(2)}`,
        revenue: item ? item.total : 0,
        transactions: item ? (item.count || 0) : 0,
        iso: `${year}-${String(month).padStart(2,'0')}`
      });
    }
    return out;
  }, [dataRaw.monthlyRevenue]);

  // Annual series
  const annualSeries = useMemo(() => {
    return (dataRaw.annualRevenue || []).slice().sort((a,b)=>a._id-b._id).map(item=>({ year: String(item._id), revenue: item.total, transactions: item.count||0 }));
  }, [dataRaw.annualRevenue]);

  // Derived KPIs
  const totalRevenue = dataRaw.totalRevenue?.total || 0;
  const totalTransactions = dataRaw.totalRevenue?.count || 0;
  const currentMonthRevenue = monthlySeries[monthlySeries.length-1]?.revenue || 0;
  const currentYearRevenue = (annualSeries.length ? annualSeries[annualSeries.length-1].revenue : 0);

  // Short sparklines data
  const sparkRevenue = monthlySeries.map(m => ({ x: m.label, y: m.revenue }));
  const sparkTx = monthlySeries.map(m => ({ x: m.label, y: m.transactions }));

  // Chart data depending on timeframe
  const visibleMonthly = useMemo(() => {
    if (timeframe === '12m') return monthlySeries;
    if (timeframe === 'ytd') {
      const thisYear = new Date().getFullYear();
      return monthlySeries.filter(m=>m.year===thisYear);
    }
    return monthlySeries; // all (we only have last 12 anyway)
  }, [monthlySeries, timeframe]);

  // Distribution for pie: last 6 months
  const distribution = useMemo(()=> {
    const slice = monthlySeries.slice(-6).map((m,i)=>({ name: m.label, value: m.revenue }));
    return slice;
  }, [monthlySeries]);

  function downloadCSV(dataset, filename='export.csv'){
    const csv = buildCSV(dataset);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function renderKPI({ title, value, sub, delta, sparkData, color }){
    const deltaPositive = delta >= 0;
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-4 shadow-inner">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-300">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(value)}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
          <div className="text-right">
            {/* delta badge */}
            <div className={`px-2 py-1 rounded-md text-sm font-medium ${deltaPositive ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
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
    <div className="w-full p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-700 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-gray-800 rounded-xl"></div>
          <div className="h-28 bg-gray-800 rounded-xl"></div>
          <div className="h-28 bg-gray-800 rounded-xl"></div>
        </div>
        <div className="h-64 bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="w-full p-6 flex items-center justify-center">
      <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
        <p className="text-white font-semibold mb-2">{error}</p>
        <button onClick={()=>window.location.reload()} className="bg-red-600 px-4 py-2 rounded">Retry</button>
      </div>
    </div>
  );

  // Quick deltas for KPIs
  const last = monthlySeries[monthlySeries.length-1] || { revenue:0 };
  const prev = monthlySeries[monthlySeries.length-2] || { revenue:0 };
  const monthDelta = prev && prev.revenue ? ((last.revenue - prev.revenue)/prev.revenue)*100 : 0;

  const lastYear = annualSeries[annualSeries.length-1] || { revenue:0 };
  const prevYear = annualSeries[annualSeries.length-2] || { revenue:0 };
  const yearDelta = prevYear && prevYear.revenue ? ((lastYear.revenue - prevYear.revenue)/prevYear.revenue)*100 : 0;

  // Composed chart for overview
  const OverviewChart = () => (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart data={visibleMonthly} margin={{ top: 10, right: 24, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.revenue} stopOpacity={0.18}/>
            <stop offset="100%" stopColor={PALETTE.revenue} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fill:'#cbd5e1' }} />
        <YAxis yAxisId="left" tickFormatter={(v)=> `₹${(v/1000).toFixed(0)}K`} tick={{ fill:'#cbd5e1' }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill:'#cbd5e1' }} />
        <Tooltip contentStyle={{ background:'#0f1724', border:'1px solid #374151' }} formatter={(val, name) => name === 'revenue' ? formatCurrency(val) : val} />
        <Legend wrapperStyle={{ color:'#94a3b8' }} />

        <Area yAxisId="left" type="monotone" dataKey="revenue" fillOpacity={1} fill="url(#gRev)" stroke={PALETTE.revenue} strokeWidth={2.5} />
        <Bar yAxisId="left" dataKey="revenue" barSize={18} name="Revenue (bar)" fill={PALETTE.revenueAccent} opacity={0.12} />
        <Line yAxisId="right" type="monotone" dataKey="transactions" stroke={PALETTE.transactions} strokeWidth={2} dot={{ r:3 }} name="Transactions" />
        <Brush dataKey="label" height={24} stroke="#374151" />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold text-white">
            Revenue DashBoard
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-300">Timeframe</div>
          <div className="flex items-center space-x-2 bg-gray-800/50 p-1 rounded-md border border-gray-700">
            <button onClick={()=>setTimeframe('12m')} className={`px-3 py-1 rounded ${timeframe==='12m' ? 'bg-blue-800/30 text-blue-200' : 'text-gray-300'}`}>Last 12m</button>
            <button onClick={()=>setTimeframe('ytd')} className={`px-3 py-1 rounded ${timeframe==='ytd' ? 'bg-blue-800/30 text-blue-200' : 'text-gray-300'}`}>YTD</button>
            <button onClick={()=>setTimeframe('all')} className={`px-3 py-1 rounded ${timeframe==='all' ? 'bg-blue-800/30 text-blue-200' : 'text-gray-300'}`}>All</button>
          </div>

          <div className="flex items-center space-x-2 bg-gray-800/50 p-1 rounded-md border border-gray-700">
            <button onClick={()=>setChartMode('composed')} className={`px-2 py-1 rounded ${chartMode==='composed' ? 'bg-indigo-700/30 text-indigo-200' : 'text-gray-300'}`}>Overview</button>
            <button onClick={()=>setChartMode('bar')} className={`px-2 py-1 rounded ${chartMode==='bar' ? 'bg-indigo-700/30 text-indigo-200' : 'text-gray-300'}`}>Bar</button>
            <button onClick={()=>setChartMode('area')} className={`px-2 py-1 rounded ${chartMode==='area' ? 'bg-indigo-700/30 text-indigo-200' : 'text-gray-300'}`}>Area</button>
            <button onClick={()=>setChartMode('line')} className={`px-2 py-1 rounded ${chartMode==='line' ? 'bg-indigo-700/30 text-indigo-200' : 'text-gray-300'}`}>Line</button>
          </div>

          <button onClick={()=>downloadCSV(visibleMonthly.map(m=>({ month:m.label, revenue:m.revenue, transactions:m.transactions })), 'monthly.csv')} className="bg-blue-600 px-3 py-2 rounded text-white">Export CSV</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {renderKPI({ title:'Total Revenue', value: totalRevenue, sub: `${totalTransactions} transactions`, delta: yearDelta, sparkData: sparkRevenue, color: PALETTE.revenue })}
        {renderKPI({ title:'This Year', value: currentYearRevenue, sub: 'YTD', delta: yearDelta, sparkData: sparkRevenue, color: PALETTE.revenueAccent })}
        {renderKPI({ title:'This Month', value: currentMonthRevenue, sub: `${monthlySeries[monthlySeries.length-1]?.label || ''}`, delta: monthDelta, sparkData: sparkTx, color: PALETTE.transactions })}
      </div>

      {/* Main Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Overview</h2>
            <div className="text-sm text-gray-400">Revenue & Transactions</div>
          </div>

          {chartMode === 'composed' && <OverviewChart />}

          {chartMode === 'bar' && (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={visibleMonthly} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill:'#cbd5e1' }} />
                <YAxis tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}K`} tick={{ fill:'#cbd5e1' }} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="revenue" fill={PALETTE.revenue} radius={[8,8,0,0]} barSize={22} />
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
                <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill:'#cbd5e1' }} />
                <YAxis tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}K`} tick={{ fill:'#cbd5e1' }} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Area type="monotone" dataKey="revenue" stroke={PALETTE.revenue} fill="url(#gA)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartMode === 'line' && (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={visibleMonthly} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill:'#cbd5e1' }} />
                <YAxis tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}K`} tick={{ fill:'#cbd5e1' }} />
                <Tooltip formatter={(val) => (typeof val === 'number' ? formatCurrency(val) : val)} />
                <Line dataKey="revenue" stroke={PALETTE.revenue} strokeWidth={2.5} dot={{ r:3 }} />
                <Line dataKey="transactions" stroke={PALETTE.transactions} strokeWidth={1.5} dot={false} strokeDasharray="4 3" yAxisId="right" />
              </LineChart>
            </ResponsiveContainer>
          )}

        </div>

        {/* Right column small charts */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-2">Transactions (last 12)</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={monthlySeries} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" hide />
                <YAxis hide />
                <Tooltip formatter={(v) => v} />
                <Line type="monotone" dataKey="transactions" stroke={PALETTE.transactions} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 text-xs text-gray-400">Total tx: <span className="text-white ml-1">{totalTransactions}</span></div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-2">Revenue Distribution (last 6m)</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={distribution} dataKey="value" innerRadius={36} outerRadius={60} paddingAngle={4}>
                  {distribution.map((entry, idx) => (
                    <Cell key={`c-${idx}`} fill={[PALETTE.revenue, PALETTE.revenueAccent, PALETTE.transactions, PALETTE.positive, PALETTE.negative, '#8B5CF6'][idx % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v)=>formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs text-gray-400">
              {distribution.map((d, i)=> (
                <div key={d.name} className="flex items-center justify-between text-gray-300 text-xs py-0.5">
                  <div className="flex items-center"><span className="w-2 h-2 mr-2 rounded-sm" style={{ background: [PALETTE.revenue, PALETTE.revenueAccent, PALETTE.transactions, PALETTE.positive, PALETTE.negative, '#8B5CF6'][i%6] }}></span>{d.name}</div>
                  <div className="text-white">{formatCurrency(d.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables: Monthly & Annual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Monthly Revenue</h3>
            <div className="text-xs text-gray-400">{monthlySeries.length} months</div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-gray-300 text-xs border-b border-gray-700">
              <tr>
                <th className="py-2">Month</th>
                <th className="py-2">Revenue</th>
                <th className="py-2">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {monthlySeries.slice().reverse().map(r => (
                <tr key={r.iso} className="border-b border-gray-800 hover:bg-gray-750/30 transition-colors">
                  <td className="py-3 text-white">{r.label}</td>
                  <td className="py-3 text-green-400 font-semibold text-right">{formatCurrency(r.revenue)}</td>
                  <td className="py-3 text-gray-300 text-right">{r.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-4 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Annual Revenue</h3>
            <div className="text-xs text-gray-400">{annualSeries.length} years</div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-gray-300 text-xs border-b border-gray-700">
              <tr>
                <th className="py-2">Year</th>
                <th className="py-2 text-right">Revenue</th>
                <th className="py-2 text-right">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {annualSeries.slice().reverse().map(a=> (
                <tr key={a.year} className="border-b border-gray-800 hover:bg-gray-750/30 transition-colors">
                  <td className="py-3 text-white">{a.year}</td>
                  <td className="py-3 text-blue-400 text-right font-semibold">{formatCurrency(a.revenue)}</td>
                  <td className="py-3 text-gray-300 text-right">{a.transactions}</td>
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
