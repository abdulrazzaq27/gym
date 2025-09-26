import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
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
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Calendar,
  IndianRupee,
  UserPlus,
  UserCheck,
  AlertTriangle,
  Activity,
  Target,
  Award,
  Clock,
  Sun,
  Moon
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    totalRevenue: 0,
    recentMembers: [],
    expiringMembers: [],
    attendanceData: { days: [], members: [] },
    attendanceTrend: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });
  const [data, setData] = useState([]);
  const [monthlySeries, setMonthlySeries] = useState([]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
        
        const membersRes = await axios.get('/api/members');
        const members = membersRes?.data || [];

        const totalMembers = members.length;
        const activeMembers = members.filter(m => m.status?.toLowerCase() === 'active').length;
        const inactiveMembers = members.filter(m => m.status?.toLowerCase() === 'inactive').length;

        const recentMembers = members
          .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
          .slice(0, 5);

        const today = new Date();
        const expiringMembers = members.filter(m => {
          const expiryDate = new Date(m.expiryDate);
          const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 7;
        });

        const paymentPromises = members.map(member =>
          axios.get(`/api/payments/history/${member._id}`).catch(() => ({ data: [] }))
        );
        const paymentResponses = await Promise.all(paymentPromises);
        const allPayments = paymentResponses
          .flatMap(res => res.data)
          .filter(p => {
            const paymentDate = new Date(p.date);
            return (
              paymentDate.getFullYear() === parseInt(year) &&
              paymentDate.getMonth() + 1 === parseInt(month)
            );
          });
        const currentRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        const attendanceRes = await axios.get(`/api/attendance?month=${currentMonth}`);
        const attendanceData = attendanceRes?.data || { days: [], result: [] };

        const attendanceMembers = members.map(member => {
          const record = attendanceData.result.find(r => r.memberId === member._id) || {};
          const dayMap = {};
          (attendanceData.days || []).forEach(day => {
            dayMap[day] = record[day] === 1 ? 1 : 0;
          });
          return { ...dayMap, memberId: member._id, name: member.name };
        });
        
        const dailyCount = attendanceData.days.map(day => {
          let present = 0;
          attendanceData.result.forEach(member => {
            if (member[day] === 1) present++;
          });
          return { day, present };
        });
        setData(dailyCount);

        const revenueRes = await axios.get('/api/dashboard/revenue');
        const dataRaw = revenueRes.data || { monthlyRevenue: [], annualRevenue: [], totalRevenue: { total: 0, count: 0 } };

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
          const found = dataRaw.monthlyRevenue.find(
            d => d._id.year === m.year && d._id.month === m.month
          );
          return {
            label: m.label,
            revenue: found ? found.total : 0,
            transactions: found ? found.count : 0,
          };
        });
        setMonthlySeries(monthlySeriesData);

        setDashboardData({
          totalMembers,
          activeMembers,
          inactiveMembers,
          totalRevenue: currentRevenue,
          recentMembers,
          expiringMembers,
          attendanceData: { days: attendanceData.days, members: attendanceMembers },
        });

        setLoading(false);
      } catch (err) {
        setError(`Failed to load dashboard data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, navigate]);

  const prepareWeeklyAttendanceData = () => {
    const { days = [], members = [] } = dashboardData.attendanceData;
    const [year, month] = currentMonth.split("-");
    const today = new Date();

    const weekData = {};

    days.filter(day => new Date(year, month - 1, day) <= today).forEach(day => {
      const presentCount = members.reduce((count, member) => {
        return member[day] === 1 ? count + 1 : count;
      }, 0);

      const weekNum = Math.ceil(day / 7);

      if (!weekData[weekNum]) {
        weekData[weekNum] = { week: `Week ${weekNum}`, present: 0, totalDays: 0 };
      }

      weekData[weekNum].present += presentCount;
      weekData[weekNum].totalDays += members.length;
    });

    return Object.values(weekData).map(w => ({
      week: w.week,
      attendanceRate: w.totalDays > 0 ? Math.round((w.present / w.totalDays) * 100) : 0,
    }));
  };

  const calculateAttendanceRate = () => {
    const { days = [], members = [] } = dashboardData.attendanceData;
    if (!days.length || !members.length) return 0;

    let total = 0;
    let present = 0;

    days.forEach(day => {
      members.forEach(member => {
        total++;
        if (member[day] === 1) present++;
      });
    });

    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className={`w-full min-h-screen flex items-center justify-center ${themeClasses.background}`}>
        <div className="flex flex-col items-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-4 ${themeClasses.loadingBorder} border-t-transparent`}></div>
          <p className={`${themeClasses.loadingText} mt-4 text-lg`}>Loading Dashboard...</p>
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

  const attendanceRate = calculateAttendanceRate();
  const growthRate = ((dashboardData.activeMembers - 180) / 180 * 100).toFixed(1);

  return (
    <div className={`min-h-screen ${themeClasses.background} relative`}>
      {/* Theme Toggle Button - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl transition-all duration-300 ${themeClasses.toggleHover} shadow-lg backdrop-blur-sm border ${isDarkMode ? 'border-slate-700 bg-slate-800/80' : 'border-gray-200 bg-white/80'}`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className={`w-6 h-6 ${themeClasses.sunColor}`} />
          ) : (
            <Moon className={`w-6 h-6 ${themeClasses.moonColor}`} />
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
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
                <div className="text-2xl font-bold">{attendanceRate}%</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                <AreaChart data={monthlySeries}>
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
                <LineChart data={data}>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              {dashboardData.recentMembers.slice(0, 5).map((member, index) => (
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
              {dashboardData.expiringMembers.map((member, index) => (
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