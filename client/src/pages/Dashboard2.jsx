import { useEffect, useState } from 'react';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  IndianRupee,
  UserPlus,
  UserCheck,
  UserX,
  AlertTriangle,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react';
import axios from '../api/axios';


function Dashboard() {
const navigate = useNavigate();
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

  // Mock revenue data for chart
  // const revenueData = [
  //   { month: 'Aug', revenue: 98000 },
  //   { month: 'Sep', revenue: 108000 },
  //   { month: 'Oct', revenue: 115000 },
  //   { month: 'Nov', revenue: 118000 },
  //   { month: 'Dec', revenue: 122000 },
  //   { month: 'Jan', revenue: 125000 }
  // ];

  // // Mock membership distribution
  // const membershipData = [
  //   { name: 'Premium', value: 89, color: '#3b82f6' },
  //   { name: 'Standard', value: 76, color: '#10b981' },
  //   { name: 'Basic', value: 82, color: '#f59e0b' }
  // ];

  // // Mock daily attendance data
  // const dailyAttendanceData = [
  //   { day: 'Mon', attendance: 85 },
  //   { day: 'Tue', attendance: 92 },
  //   { day: 'Wed', attendance: 78 },
  //   { day: 'Thu', attendance: 88 },
  //   { day: 'Fri', attendance: 95 },
  //   { day: 'Sat', attendance: 112 },
  //   { day: 'Sun', attendance: 68 }
  // ];

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
        // --- Members ---
        let members = [];
        try {
          const membersRes = await axios.get('/api/members');
          members = membersRes?.data || [];
        } catch {
          throw new Error('Failed to fetch member data');
        }

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
          return diffDays >= 0 && diffDays <= 30;
        });

        // --- Revenue (currentMonth only) ---
        let currentRevenue = 0;
        try {
          const [year, month] = currentMonth.split('-');
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

          currentRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        } catch {
          currentRevenue = 0;
        }

        // --- Attendance (selected month) ---
        let attendanceData = { days: [], result: [] };
        try {
          const attendanceRes = await axios.get(`/api/attendance?month=${currentMonth}`);
          attendanceData = attendanceRes?.data || { days: [], result: [] };
        } catch {
          throw new Error('Failed to fetch attendance data');
        }

        const attendanceMembers = members.map(member => {
          const record = attendanceData.result.find(r => r.memberId === member._id) || {};
          const dayMap = {};
          (attendanceData.days || []).forEach(day => {
            dayMap[day] = record[day] === 1 ? 1 : 0;
          });
          return { ...dayMap, memberId: member._id, name: member.name };
        });

        // --- Attendance Trend (last 6 months) ---
        const months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          return date.toISOString().slice(0, 7);
        }).reverse();

        const trendPromises = months.map(m =>
          axios.get(`/api/attendance?month=${m}`).catch(() => ({ data: { days: [], result: [] } }))
        );

        const trendResponses = await Promise.all(trendPromises);

        const attendanceTrend = trendResponses.map((res, index) => {
          const data = res?.data || { days: [], result: [] };

          const validDays = data.days.filter(day => {
            const cellDate = new Date(
              months[index].split('-')[0],
              months[index].split('-')[1] - 1,
              day
            );
            return cellDate <= today;
          });

          const totalPossible = validDays.length * members.length;
          const totalPresent = validDays.reduce((sum, day) => {
            return (
              sum +
              data.result.reduce((count, member) => (member[day] === 1 ? count + 1 : count), 0)
            );
          }, 0);

          const attendanceRate =
            totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

          return {
            _id: {
              year: parseInt(months[index].split('-')[0]),
              month: parseInt(months[index].split('-')[1]),
            },
            attendanceRate,
          };
        });

        setDashboardData({
          totalMembers,
          activeMembers,
          inactiveMembers,
          totalRevenue: currentRevenue,
          recentMembers,
          expiringMembers,
          attendanceData: { days: attendanceData.days, members: attendanceMembers },
          attendanceTrend,
        });

        setLoading(false);
      } catch (err) {
        setError(`Failed to load dashboard data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  }

  // const prepareTrendChartData = () => {
  //   return dashboardData.attendanceTrend.map(item => ({
  //     month: item?._id?.year && item?._id?.month
  //       ? `${new Date(item._id.year, item._id.month - 1).toLocaleDateString('en', { month: 'short' })}`
  //       : 'Unknown',
  //     attendance: item?.attendanceRate || 0,
  //   }));
  // };

  const prepareAttendanceChartData = () => {
    const { days = [], members = [] } = dashboardData.attendanceData;
    const today = new Date();
    const [year, month] = currentMonth.split('-');

    return days
      .filter(day => new Date(year, month - 1, day) <= today)
      .map(day => {
        const presentCount = members.reduce((count, member) => {
          return member[day] === 1 ? count + 1 : count;
        }, 0);

        return {
          day: `Day ${day}`,
          present: presentCount,
          absent: members.length - presentCount,
        };
      });
  };

  const prepareTrendChartData = () => {
    if (!Array.isArray(dashboardData.attendanceTrend)) return [];
    return dashboardData.attendanceTrend.map(item => ({
      month:
        item?._id?.year && item?._id?.month
          ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
          : 'Unknown',
      attendance: item?.attendanceRate || 0,
    }));
  };

  const calculateAttendancePercentage = () => {
    const { days = [], members = [] } = dashboardData.attendanceData;
    if (days.length === 0 || members.length === 0) return 0;

    const today = new Date();
    const [year, month] = currentMonth.split('-');
    const validDays = days.filter(day => new Date(year, month - 1, day) <= today);

    if (validDays.length === 0) return 0;

    const totalPossible = validDays.length * members.length;
    const totalPresent = validDays.reduce((sum, day) => {
      return sum + members.reduce((count, member) => (member[day] === 1 ? count + 1 : count), 0);
    }, 0);

    return Math.round((totalPresent / totalPossible) * 100);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-white mt-4 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const trendChartData = prepareTrendChartData();
  const growthRate = ((dashboardData.activeMembers - 180) / 180 * 100).toFixed(1);
  const attendanceRate = 88; // Mock current attendance rate
  const attendanceChartData = prepareAttendanceChartData();
  const attendancePercentage = calculateAttendancePercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      {/* <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Gym Management Dashboard</h1>
              <p className="text-slate-300">Welcome back! Here's what's happening at your gym today.</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                New Member
              </button>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-300 hover:to-green-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Mark Attendance
              </button>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto p-6">
        {/* Key Metrics */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
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
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-200" />
              {/* <span className="text-green-100 text-sm">+12.5% from last month</span> */}
            </div>
          </Link>

          {/* Total Members */}
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

          {/* Attendance Rate */}
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
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-200" />
              <span className="text-purple-100 text-sm">Target: 85%</span>
            </div>
          </Link>

          {/* Member Growth */}
          <Link
            to="/growth"
            className="bg-[#ea580c] rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-right">
                <div className="text-orange-100 text-sm font-medium">Member Growth</div>
                <div className="text-2xl font-bold">+{growthRate}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-200" />
              <span className="text-orange-100 text-sm">18 new this month</span>
            </div>
          </Link>
        </div>


        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-gray-200 backdrop-blur-sm rounded-2xl p-6 border border-white/2 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Revenue Trend</h3>
                <p className="text-gray-900 text-sm">Monthly revenue</p>
              </div>
              <div className="bg-green-300 p-2 rounded-xl">
                <IndianRupee className="w-6 h-6 text-green-500" />
              </div>
            </div>
            {/* <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.totalRevenue}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: '#000000', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#000000', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#f3f4f6',
                    }}
                    formatter={(value, name) => [formatCurrency(value), 'Revenue']}
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
            </div> */}
          </div>

          {/* Attendance Trend */}
          <div className="bg-gray-200 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendance Trend</h3>
                <p className="text-gray-900 text-sm">6-month attendance overview</p>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: '#000000', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#000000', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#f3f4f6',
                    }}
                    formatter={value => [`${value}%`, 'Attendance Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Membership Distribution */}
          <div className="bg-gray-200 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Membership Plans</h3>
                <p className="text-gray-900 text-sm">Distribution by plan type</p>
              </div>
              <Award className="w-6 h-6 text-gray-900" />
            </div>
            {/* <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {membershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#f3f4f6',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div> */}
          </div>

          {/* Daily Attendance */}
          <div className="bg-gray-200 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Weekly Attendance</h3>
                <p className="text-gray-900 text-sm">Daily attendance this week</p>
              </div>
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
            <div className="h-64">
              {/* <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" tick={{ fill: '#000000', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#000000', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#f3f4f6',
                    }}
                  />
                  <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer> */}
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Members */}
          <div className="bg-gray-200 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Recent Members</h3>
                <p className="text-gray-900 text-sm">Latest member registrations</p>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <UserPlus className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData.recentMembers.slice(0, 5).map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{member.name}</p>
                      <p className="text-gray-700 text-sm">{member.membershipType} Plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 text-sm">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring Memberships */}
          <div className="bg-gray-200 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Expiring Soon</h3>
                <p className="text-gray-900 text-sm">Memberships expiring within 30 days</p>
              </div>
              <div className="bg-orange-500/20 p-2 rounded-xl">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData.expiringMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{member.name}</p>
                      <p className="text-gray-900 text-sm">{member.membershipType} Plan</p>
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
                <p className="text-slate-300">No memberships expiring soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;