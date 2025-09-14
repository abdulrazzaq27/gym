import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });

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

  // --- Helpers ---
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  }

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

  // --- UI ---
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white text-gray-600">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => setCurrentMonth(currentMonth)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const attendanceChartData = prepareAttendanceChartData();
  const trendChartData = prepareTrendChartData();
  const attendancePercentage = calculateAttendancePercentage();

  return (
    <div className="w-full max-w-none flex flex-col items-start p-6 bg-black">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            to="/create-member"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            + New Member
          </Link>
          <Link
            to="/members"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            Mark Attendance
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
        <Link to="/revenue" className="bg-gray-800 p-6 rounded-xl text-white shadow-lg block">
          <h3 className="text-lg font-medium">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {formatCurrency(dashboardData.totalRevenue)}
          </p>
        </Link>

        <Link to="/members" className="bg-gray-800 p-6 rounded-xl text-white shadow-lg block">
          <h3 className="text-lg font-medium">Total Members</h3>
          <p className="text-2xl font-bold text-blue-400">{dashboardData.totalMembers}</p>
          <p className="text-sm text-green-400">{dashboardData.activeMembers} active</p>
          <p className="text-sm text-red-400">{dashboardData.inactiveMembers} inactive</p>
        </Link>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-white font-medium">Select Month:</label>
        <input
          type="month"
          value={currentMonth}
          onChange={e => setCurrentMonth(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white [color-scheme:dark]"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-8">
        {/* Attendance Overview */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <Link to="/attendance" className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
                Attendance Overview ({currentMonth})
              </h2>
              <span className="bg-green-600 text-white text-sm font-medium px-2 py-1 rounded-lg">
                {attendancePercentage}%
              </span>
            </Link>
            <div className="text-sm text-gray-400">
              {dashboardData.attendanceData.members.length} members
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0f1724',
                    border: '1px solid #374151',
                    color: '#f3f4f6',
                  }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Present"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <Link to="/attendance/trend">
              <h2 className="text-xl font-semibold text-white hover:underline cursor-pointer">
                Attendance Trend (6 months)
              </h2>
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0f1724',
                    border: '1px solid #374151',
                    color: '#f3f4f6',
                  }}
                  formatter={value => [`${value}%`, 'Attendance']}
                  labelFormatter={label => `Month: ${label}`}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  name="Attendance %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
