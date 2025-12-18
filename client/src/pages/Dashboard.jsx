import { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from '../components/utils/ThemeContext.jsx';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  IndianRupee,
  UserPlus,
  UserCheck,
  AlertTriangle,
  Activity,
  Clock,
} from 'lucide-react';
import axios from '../api/axios';
import React from 'react';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
}

function Dashboard() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    totalRevenue: 0,
    recentMembers: [],
    expiringMembers: [],
    attendanceTrend: [],
    attendanceRate: 0,
    monthlyRevenueData: [] // For chart
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });
  
  const [recentLimit, setRecentLimit] = useState(10); // client-side limit for now, can be server-side later if needed
  const [expiringLimit, setExpiringLimit] = useState(10);

  // Theme-based classes
  const themeClasses = {
    background: isDarkMode ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white' : 'bg-gradient-to-br from-white to-blue-50 text-gray-900',
    cardBackground: isDarkMode ? 'bg-slate-800/50' : 'bg-gray-200',
    cardText: isDarkMode ? 'text-white' : 'text-gray-900',
    cardSecondaryText: isDarkMode ? 'text-slate-300' : 'text-gray-900',
    cardTertiaryText: isDarkMode ? 'text-slate-400' : 'text-gray-700',
    memberCardBg: isDarkMode ? 'bg-slate-700/30' : 'bg-white/5',
    memberCardBorder: isDarkMode ? 'border-slate-600/30' : 'border-white/10',
    toggleHover: isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100',
    sunColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-500',
    moonColor: isDarkMode ? 'text-gray-400' : 'text-gray-700',
    loadingText: isDarkMode ? 'text-slate-300' : 'text-gray-700',
    loadingBorder: isDarkMode ? 'border-slate-700' : 'border-gray-700',
    errorBg: isDarkMode ? 'bg-red-900/20' : 'bg-red-500/10',
    errorBorder: isDarkMode ? 'border-red-700/30' : 'border-red-500/20',
    errorText: isDarkMode ? 'text-red-300' : 'text-red-400',
    errorButton: isDarkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700',
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [year, month] = currentMonth.split('-');

        // Parallel Fetching for optimized performance
        const [
          statsRes, 
          recentRes, 
          expiringRes, 
          revenueRes, 
          attendanceStatsRes
        ] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/recent-members?limit=20'),
          axios.get('/api/dashboard/expiring-members?days=7'),
          axios.get('/api/dashboard/revenue'),
          axios.get(`/api/attendance/stats?month=${currentMonth}`)
        ]);

        // 1. Stats
        const { totalMembers, activeMembers, inactiveMembers } = statsRes.data;

        // 2. Recent & Expiring
        const recentMembers = recentRes.data.recentMembers || [];
        const expiringMembers = expiringRes.data.expiringMembers || [];

        // 3. Revenue
        const revenueData = revenueRes.data || { monthlyRevenue: [], totalRevenue: { total: 0 } };
        
        // Match revenue graph data
        const now = new Date();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last12Months = Array.from({ length: 12 }).map((_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            label: `${months[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`,
          };
        });

        const monthlySeriesData = last12Months.map(m => {
          const found = revenueData.monthlyRevenue.find(
            d => d._id.year === m.year && d._id.month === m.month
          );
          return {
            label: m.label,
            revenue: found ? found.total : 0,
            transactions: found ? found.count : 0,
          };
        });

        // Find current month revenue from aggregation or fallback to 0
        const currentMonthRevenueObj = revenueData.monthlyRevenue.find(
          d => d._id.year === parseInt(year) && d._id.month === parseInt(month)
        );
        const currentRevenue = currentMonthRevenueObj ? currentMonthRevenueObj.total : 0;

        // 4. Attendance
        const { trend = [], rate = 0 } = attendanceStatsRes.data;

        setDashboardData({
          totalMembers,
          activeMembers,
          inactiveMembers,
          totalRevenue: currentRevenue,
          recentMembers,
          expiringMembers,
          attendanceTrend: trend,
          attendanceRate: rate,
          monthlyRevenueData: monthlySeriesData
        });

      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, navigate]);

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} relative`}>
        <div className="w-full p-4 sm:p-6 animate-pulse">
          {/* Header Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-32 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className={`h-80 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
            <div className={`h-80 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
          </div>

          {/* Bottom Lists Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className={`h-96 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
            <div className={`h-96 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full min-h-screen flex flex-col items-center justify-center ${themeClasses.background}`}>
        <div className={`${themeClasses.errorBg} border ${themeClasses.errorBorder} rounded-xl p-6 max-w-md text-center`}>
          <AlertTriangle className={`w-12 h-12 ${themeClasses.errorText} mx-auto mb-4`} />
          <p className={`${themeClasses.errorText} mb-4`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`${themeClasses.errorButton} text-white px-6 py-3 rounded-lg font-medium transition-colors`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} relative`}>
      <div className="w-full p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link
            to="/revenue"
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <IndianRupee className="w-8 h-8" />
              </div>
              <div className="text-right">
                <div className="text-green-100 text-sm font-medium">Monthly Revenue</div>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalRevenue)}</div>
              </div>
            </div>
          </Link>

          <Link
            to="/members"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm font-medium">Total Members</div>
                <div className="text-2xl font-bold">{dashboardData.totalMembers}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-100">{dashboardData.activeMembers} Active</span>
              <span className="text-blue-200">{dashboardData.inactiveMembers} Inactive</span>
            </div>
          </Link>

          <Link
            to="/attendance"
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Activity className="w-8 h-8" />
              </div>
              <div className="text-right">
                <div className="text-purple-100 text-sm font-medium">Attendance Rate</div>
                <div className="text-2xl font-bold">{dashboardData.attendanceRate}%</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className={`${themeClasses.cardBackground} backdrop-blur-sm rounded-2xl p-6 border border-white/2 shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-semibold ${themeClasses.cardText} mb-2`}>Revenue Trend</h3>
                <p className={`${themeClasses.cardSecondaryText} text-sm`}>Monthly revenue</p>
              </div>
              <div className="bg-green-300 p-2 rounded-xl">
                <IndianRupee className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.monthlyRevenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                  <XAxis dataKey="label" tick={{ fill: isDarkMode ? '#ffffff' : '#000000', fontSize: 12 }} />
                  <YAxis tick={{ fill: isDarkMode ? '#ffffff' : '#000000', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
                      borderRadius: '12px',
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${themeClasses.cardBackground} backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-semibold ${themeClasses.cardText} mb-2`}>Attendance Trend</h3>
                <p className={`${themeClasses.cardSecondaryText} text-sm`}>This Month attendance overview</p>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.attendanceTrend}>
                  <XAxis dataKey="day" tick={{ fill: isDarkMode ? '#ffffff' : '#000000', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: isDarkMode ? '#ffffff' : '#000000', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
                      borderRadius: '12px',
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#4f46e5"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className={`${themeClasses.cardBackground} backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-semibold ${themeClasses.cardText} mb-2`}>Recent Members</h3>
                <p className={`${themeClasses.cardSecondaryText} text-sm`}>Latest member registrations</p>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <UserPlus className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData.recentMembers.slice(0, recentLimit).map((member, index) => (
                <div key={index} className={`flex items-center justify-between p-4 ${themeClasses.memberCardBg} rounded-xl border ${themeClasses.memberCardBorder}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`${themeClasses.cardText} font-medium`}>{member.name}</p>
                      <p className={`${themeClasses.cardTertiaryText} text-sm`}>{member.membershipType} Plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`${themeClasses.cardSecondaryText} text-sm`}>
                      {new Date(member.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentLimit < dashboardData.recentMembers.length && (
                <button
                  onClick={() => setRecentLimit(prev => prev + 10)}
                  className={`w-full py-2 mt-2 text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
                >
                  Load More
                </button>
              )}
            </div>
          </div>

          <div className={`${themeClasses.cardBackground} backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-semibold ${themeClasses.cardText} mb-2`}>Expiring Soon</h3>
                <p className={`${themeClasses.cardSecondaryText} text-sm`}>Memberships expiring within 07 days</p>
              </div>
              <div className="bg-orange-500/20 p-2 rounded-xl">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData.expiringMembers.slice(0, expiringLimit).map((member, index) => (
                <div key={index} className={`flex items-center justify-between p-4 ${themeClasses.memberCardBg} rounded-xl border ${themeClasses.memberCardBorder}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`${themeClasses.cardText} font-medium`}>{member.name}</p>
                      <p className={`${themeClasses.cardSecondaryText} text-sm`}>{member.membershipType} Plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 text-sm font-medium">
                      Expires: {new Date(member.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {expiringLimit < dashboardData.expiringMembers.length && (
                <button
                  onClick={() => setExpiringLimit(prev => prev + 10)}
                  className={`w-full py-2 mt-2 text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
                >
                  Load More
                </button>
              )}
            </div>
            {dashboardData.expiringMembers.length === 0 && (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className={isDarkMode ? "text-slate-300" : "text-gray-600"}>No memberships expiring soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;