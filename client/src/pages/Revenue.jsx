import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

function Revenue() {
  const [revenueData, setRevenueData] = useState({ 
    monthlyRevenue: [], 
    annualRevenue: [], 
    totalRevenue: { total: 0, count: 0 } 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/dashboard/revenue')
      .then(res => {
        setRevenueData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching revenue data:", err);
        setError("Failed to load revenue data. Please try again later.");
        setLoading(false);
      });
  }, []);

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  function getMonthName(monthNumber) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || `Month ${monthNumber}`;
  }

  function getShortMonthName(monthNumber) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1] || `M${monthNumber}`;
  }

  function calculateCurrentMonthRevenue() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const currentMonthData = revenueData.monthlyRevenue.find(
      item => item._id.month === currentMonth && item._id.year === currentYear
    );
    
    return currentMonthData ? currentMonthData.total : 0;
  }

  function calculateCurrentYearRevenue() {
    const currentYear = new Date().getFullYear();
    const currentYearData = revenueData.annualRevenue.find(
      item => item._id === currentYear
    );
    
    return currentYearData ? currentYearData.total : 0;
  }

  // Prepare data for charts - FIXED to generate 12 months of data
  function prepareMonthlyChartData() {
    // Create a map of all available data for quick lookup
    const dataMap = new Map();
    revenueData.monthlyRevenue.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      dataMap.set(key, item);
    });

    // Generate 12 months of data including the current month
    const currentDate = new Date();
    const months = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      
      const existing = dataMap.get(key);
      
      months.push({
        month: getShortMonthName(month),
        year,
        revenue: existing ? existing.total : 0,
        transactions: existing ? existing.count || 0 : 0,
        label: `${getShortMonthName(month)} ${year}`,
        fullDate: `${year}-${month.toString().padStart(2, '0')}`
      });
    }

    return months;
  }

  function prepareAnnualChartData() {
    return [...revenueData.annualRevenue]
      .sort((a, b) => a._id - b._id)
      .map(item => ({
        year: item._id.toString(),
        revenue: item.total,
        transactions: item.count || 0
      }));
  }

  // Prepare data for pie chart (last 6 months)
  function prepareMonthlyPieData() {
    const monthlyData = prepareMonthlyChartData();
    return monthlyData.slice(-6).map((item, index) => ({
      name: item.label,
      value: item.revenue,
      color: COLORS[index % COLORS.length]
    }));
  }

  // Custom tooltip formatter - FIXED text visibility
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center mt-1 text-gray-100">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.dataKey === 'revenue' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  if (loading) {
    return (
      <div className="w-full max-w-none flex flex-col items-start">
        <h1 className="text-3xl font-bold mb-6 text-white text-left">Revenue Analytics</h1>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-7 bg-gray-600 rounded w-32"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
                <div className="bg-gray-700 p-3 rounded-full">
                  <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/70 border border-gray-700 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-48 mb-6"></div>
              <div className="h-64 bg-gray-900/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-none flex flex-col items-center justify-center py-20">
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-8 max-w-md text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Data Loading Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const monthlyChartData = prepareMonthlyChartData();
  const annualChartData = prepareAnnualChartData();
  const monthlyPieData = prepareMonthlyPieData();

  return (
    <div className="w-full max-w-none flex flex-col items-start">
      <div className="flex justify-between items-center w-full mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white text-left">Revenue Analytics</h1>
          <p className="text-gray-400 mt-2">Track and analyze your revenue performance</p>
        </div>
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-2 text-blue-300 text-sm">
          Updated just now
        </div>
      </div>
      
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl hover:border-blue-500 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-green-400 mt-2">{formatCurrency(revenueData.totalRevenue.total)}</p>
              <p className="text-gray-400 text-xs mt-3">{revenueData.totalRevenue.count} transactions</p>
            </div>
            <div className="bg-green-900/30 p-3 rounded-full border border-green-700">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-xs">Avg. transaction value: {formatCurrency(revenueData.totalRevenue.total / (revenueData.totalRevenue.count || 1))}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl hover:border-blue-500 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                This Year
              </p>
              <p className="text-2xl font-bold text-blue-400 mt-2">{formatCurrency(calculateCurrentYearRevenue())}</p>
              <p className="text-gray-400 text-xs mt-3">{new Date().getFullYear()}</p>
            </div>
            <div className="bg-blue-900/30 p-3 rounded-full border border-blue-700">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-xs">Monthly avg: {formatCurrency(calculateCurrentYearRevenue() / (new Date().getMonth() + 1))}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl hover:border-blue-500 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                This Month
              </p>
              <p className="text-2xl font-bold text-yellow-400 mt-2">{formatCurrency(calculateCurrentMonthRevenue())}</p>
              <p className="text-gray-400 text-xs mt-3">{getMonthName(new Date().getMonth() + 1)}</p>
            </div>
            <div className="bg-yellow-900/30 p-3 rounded-full border border-yellow-700">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-xs">Daily avg: {formatCurrency(calculateCurrentMonthRevenue() / new Date().getDate())}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mb-8">
        {/* Monthly Revenue Trend Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Monthly Revenue Trend</h2>
            <div className="text-xs bg-gray-700 rounded-full px-3 py-1">
              Last 12 months
            </div>
          </div>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="label" stroke="#D1D5DB" fontSize={12} />
                <YAxis stroke="#D1D5DB" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2, fill: '#1D4ED8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-900/20 rounded-xl">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <p>No revenue data available</p>
              <p className="text-xs mt-1">Revenue data will appear here once available</p>
            </div>
          )}
        </div>

        {/* Annual Revenue Bar Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Annual Revenue</h2>
            <div className="text-xs bg-gray-700 rounded-full px-3 py-1">
              Last 5 years
            </div>
          </div>
          {annualChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={annualChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="year" stroke="#D1D5DB" fontSize={12} />
                <YAxis stroke="#D1D5DB" fontSize={12} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-900/20 rounded-xl">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <p>No annual data available</p>
              <p className="text-xs mt-1">Annual data will appear here once available</p>
            </div>
          )}
        </div>
      </div>

      {/* Combined Revenue and Transactions Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full mb-8">
        {/* Monthly Revenue vs Transactions */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Revenue vs Transactions</h2>
            <div className="flex space-x-2">
              <div className="flex items-center text-xs bg-blue-900/30 rounded-full px-3 py-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Revenue
              </div>
              <div className="flex items-center text-xs bg-amber-900/30 rounded-full px-3 py-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                Transactions
              </div>
            </div>
          </div>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="label" stroke="#D1D5DB" fontSize={12} />
                <YAxis 
                  yAxisId="left" 
                  stroke="#D1D5DB" 
                  fontSize={12} 
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} 
                  domain={['auto', 'auto']}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#D1D5DB" 
                  fontSize={12} 
                  domain={[0, 'dataMax + 5']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2, fill: '#1D4ED8' }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="transactions" 
                  name="Transactions"
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-900/20 rounded-xl">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
              <p>No transaction data available</p>
              <p className="text-xs mt-1">Transaction data will appear here once available</p>
            </div>
          )}
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Revenue Distribution</h2>
            <div className="text-xs bg-gray-700 rounded-full px-3 py-1">
              Last 6 months
            </div>
          </div>
          {monthlyPieData.length > 0 ? (
            <div className="flex">
              <ResponsiveContainer width="50%" height={300}>
                <PieChart>
                  <Pie
                    data={monthlyPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => (
                      <text 
                        fill="#fff" 
                        fontSize={12}
                        fontWeight="bold"
                        x={0} 
                        y={0}
                        textAnchor="middle"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    )}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {monthlyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1f2937" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 pl-4 flex flex-col justify-center">
                <div className="space-y-3">
                  {monthlyPieData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                      <span className="text-gray-300 text-sm">{item.name}</span>
                      <span className="ml-auto text-white font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-900/20 rounded-xl">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
              <p>No distribution data available</p>
              <p className="text-xs mt-1">Distribution data will appear here once available</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Details Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        {/* Monthly Revenue */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Monthly Revenue</h2>
            <div className="text-xs bg-gray-700 rounded-full px-3 py-1">
              {revenueData.monthlyRevenue.length} months
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
            {revenueData.monthlyRevenue.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p>No monthly revenue data available</p>
                <p className="text-xs mt-2">Monthly data will appear here once available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-gray-200 font-semibold">Month</th>
                      <th className="px-6 py-3 text-gray-200 font-semibold">Year</th>
                      <th className="px-6 py-3 text-gray-200 font-semibold text-right">Revenue</th>
                      <th className="px-6 py-3 text-gray-200 font-semibold text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {revenueData.monthlyRevenue
                      .sort((a, b) => {
                        if (a._id.year !== b._id.year) return b._id.year - a._id.year;
                        return b._id.month - a._id.month;
                      })
                      .map((item, index) => (
                        <tr key={`${item._id.year}-${item._id.month}`} className="hover:bg-gray-750/50 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{getMonthName(item._id.month)}</td>
                          <td className="px-6 py-4 text-gray-300">{item._id.year}</td>
                          <td className="px-6 py-4 text-green-400 font-semibold text-right">{formatCurrency(item.total)}</td>
                          <td className="px-6 py-4 text-gray-300 text-right">{item.count || 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Annual Revenue */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Annual Revenue</h2>
            <div className="text-xs bg-gray-700 rounded-full px-3 py-1">
              {revenueData.annualRevenue.length} years
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
            {revenueData.annualRevenue.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p>No annual revenue data available</p>
                <p className="text-xs mt-2">Annual data will appear here once available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-gray-200 font-semibold">Year</th>
                      <th className="px-6 py-3 text-gray-200 font-semibold text-right">Revenue</th>
                      <th className="px-6 py-3 text-gray-200 font-semibold text-right">Transactions</th>
                      <th className="px-6 py-3 text-gray-200 font-semibold text-right">Avg/Month</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {revenueData.annualRevenue
                      .sort((a, b) => b._id - a._id)
                      .map((item, index) => (
                        <tr key={item._id} className="hover:bg-gray-750/50 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{item._id}</td>
                          <td className="px-6 py-4 text-blue-400 font-semibold text-right">{formatCurrency(item.total)}</td>
                          <td className="px-6 py-4 text-gray-300 text-right">{item.count || 0}</td>
                          <td className="px-6 py-4 text-gray-300 text-right">{formatCurrency(item.total / 12)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Growth Indicators */}
      {revenueData.monthlyRevenue.length > 1 && (
        <div className="w-full mt-8">
          <h2 className="text-xl font-bold mb-4 text-white">Revenue Growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Month-over-Month</h3>
              {(() => {
                const sortedMonthly = [...revenueData.monthlyRevenue].sort((a, b) => {
                  if (a._id.year !== b._id.year) return b._id.year - a._id.year;
                  return b._id.month - a._id.month;
                });
                
                if (sortedMonthly.length < 2) return <p className="text-gray-400">Not enough data</p>;
                
                const current = sortedMonthly[0];
                const previous = sortedMonthly[1];
                const growth = ((current.total - previous.total) / previous.total) * 100;
                const isPositive = growth >= 0;
                
                return (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      {getMonthName(current._id.month)} {current._id.year} vs {getMonthName(previous._id.month)} {previous._id.year}
                    </p>
                    <div className="flex items-end">
                      <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{growth.toFixed(1)}%
                      </p>
                      <div className="ml-4">
                        <p className="text-gray-300 text-sm">
                          {isPositive ? 'Increase' : 'Decrease'} of {formatCurrency(Math.abs(current.total - previous.total))}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Year-over-Year</h3>
              {(() => {
                const sortedAnnual = [...revenueData.annualRevenue].sort((a, b) => b._id - a._id);
                
                if (sortedAnnual.length < 2) return <p className="text-gray-400">Not enough data</p>;
                
                const current = sortedAnnual[0];
                const previous = sortedAnnual[1];
                const growth = ((current.total - previous.total) / previous.total) * 100;
                const isPositive = growth >= 0;
                
                return (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      {current._id} vs {previous._id}
                    </p>
                    <div className="flex items-end">
                      <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{growth.toFixed(1)}%
                      </p>
                      <div className="ml-4">
                        <p className="text-gray-300 text-sm">
                          {isPositive ? 'Increase' : 'Decrease'} of {formatCurrency(Math.abs(current.total - previous.total))}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Revenue;