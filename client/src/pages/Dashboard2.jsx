import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  Users,
  DollarSign,
  Activity,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });

  const [data, setData] = useState({
    revenue: 0,
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    expiringMembers: [],
    recentMembers: [],
    attendanceTrend: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Members
        const membersRes = await axios.get("/api/members");
        const members = membersRes.data || [];
        const totalMembers = members.length;
        const activeMembers = members.filter(
          (m) => m.status?.toLowerCase() === "active"
        ).length;
        const inactiveMembers = totalMembers - activeMembers;

        const recentMembers = members
          .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
          .slice(0, 5);

        // Expiring members (next 30 days)
        const today = new Date();
        const expiringMembers = members.filter((m) => {
          const expiry = new Date(m.expiryDate);
          const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 30;
        });

        // Revenue (current month)
        let revenue = 0;
        const [year, month] = currentMonth.split("-");
        const paymentPromises = members.map((m) =>
          axios.get(`/api/payments/history/${m._id}`).catch(() => ({ data: [] }))
        );
        const paymentRes = await Promise.all(paymentPromises);
        const payments = paymentRes.flatMap((r) => r.data);
        payments.forEach((p) => {
          const d = new Date(p.date);
          if (
            d.getFullYear() === parseInt(year) &&
            d.getMonth() + 1 === parseInt(month)
          ) {
            revenue += p.amount || 0;
          }
        });

        // Attendance Trend (last 6 months)
        const months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          return date.toISOString().slice(0, 7);
        }).reverse();

        const trendPromises = months.map((m) =>
          axios.get(`/api/attendance?month=${m}`).catch(() => ({
            data: { days: [], result: [] },
          }))
        );
        const trendRes = await Promise.all(trendPromises);

        const attendanceTrend = trendRes.map((res, i) => {
          const att = res.data || { days: [], result: [] };
          const validDays = att.days.filter((day) => {
            const cellDate = new Date(
              months[i].split("-")[0],
              months[i].split("-")[1] - 1,
              day
            );
            return cellDate <= today;
          });
          const totalPossible = validDays.length * members.length;
          const totalPresent = validDays.reduce((sum, day) => {
            return (
              sum +
              att.result.reduce(
                (c, member) => (member[day] === 1 ? c + 1 : c),
                0
              )
            );
          }, 0);
          return {
            month: months[i],
            attendance:
              totalPossible > 0
                ? Math.round((totalPresent / totalPossible) * 100)
                : 0,
          };
        });

        setData({
          revenue,
          totalMembers,
          activeMembers,
          inactiveMembers,
          expiringMembers,
          recentMembers,
          attendanceTrend,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <Link
              to="/member/new"
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              + New Member
            </Link>
            <Link
              to="/members"
              className="bg-green-600 px-4 py-2 rounded-lg"
            >
              Mark Attendance
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Monthly Revenue</p>
            <p className="text-2xl font-bold mt-2">₹{data.revenue}</p>
            <DollarSign className="w-5 h-5 text-gray-400 mt-2" />
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Total Members</p>
            <p className="text-2xl font-bold mt-2">{data.totalMembers}</p>
            <p className="text-green-400 text-sm">{data.activeMembers} active</p>
            <p className="text-red-400 text-sm">
              {data.inactiveMembers} inactive
            </p>
            <Users className="w-5 h-5 text-gray-400 mt-2" />
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Expiring Soon</p>
            <p className="text-2xl font-bold mt-2">
              {data.expiringMembers.length}
            </p>
            <Calendar className="w-5 h-5 text-gray-400 mt-2" />
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Attendance (This Month)</p>
            <p className="text-2xl font-bold mt-2">
              {data.attendanceTrend.at(-1)?.attendance || 0}%
            </p>
            <Activity className="w-5 h-5 text-gray-400 mt-2" />
          </div>
        </div>

        {/* Charts + Recent Members */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Attendance Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af" }} />
                  <YAxis tick={{ fill: "#9ca3af" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Members */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Members</h3>
            <div className="space-y-3">
              {data.recentMembers.map((m, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  <p className="text-sm text-gray-300">
                    Joined {new Date(m.joinDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {data.recentMembers.length === 0 && (
                <p className="text-gray-400 text-sm">No members yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
