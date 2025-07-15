import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0, // Changed from expiredMembers
    totalRevenue: 0,
    recentMembers: [],
    expiringMembers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    Promise.all([
      axios.get('/api/dashboard/stats'),
      axios.get('/api/dashboard/recent-members'),
      axios.get('/api/dashboard/expiring-members'),
      axios.get('/api/dashboard/revenue') // Added revenue endpoint
    ])
    .then(([statsRes, recentRes, expiringRes, revenueRes]) => {
      // Handle the new API response structure
      const stats = statsRes.data;
      const recentMembers = recentRes.data.recentMembers || [];
      const expiringMembers = expiringRes.data.expiringMembers || [];
      const revenue = revenueRes.data;
      
      // Calculate current month's revenue or use total revenue
      let currentRevenue = 0;
      if (revenue.monthlyRevenue && revenue.monthlyRevenue.length > 0) {
        const currentMonth = new Date().getMonth() + 1;
        const currentMonthData = revenue.monthlyRevenue.find(
          item => item._id.month === currentMonth
        );
        currentRevenue = currentMonthData ? currentMonthData.total : 0;
      } else if (revenue.totalRevenue) {
        currentRevenue = revenue.totalRevenue.total;
      }

      setDashboardData({
        totalMembers: stats.totalMembers || 0,
        activeMembers: stats.activeMembers || 0,
        inactiveMembers: stats.inactiveMembers || 0,
        totalRevenue: currentRevenue,
        recentMembers: recentMembers,
        expiringMembers: expiringMembers
      });
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    });
  }, []);

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  }

  if (loading) {
    return (
      <div className="w-full max-w-none flex flex-col items-start">
        <h1 className="text-3xl font-bold mb-6 text-white text-left">Dashboard</h1>
        <div className="w-full flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none flex flex-col items-start">
      <h1 className="text-3xl font-bold mb-6 text-white text-left">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Members</p>
              <p className="text-2xl font-bold text-white">{dashboardData.totalMembers}</p>
            </div>
            <div className="bg-blue-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Members</p>
              <p className="text-2xl font-bold text-green-400">{dashboardData.activeMembers}</p>
            </div>
            <div className="bg-green-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Inactive Members</p>
              <p className="text-2xl font-bold text-red-400">{dashboardData.inactiveMembers}</p>
            </div>
            <div className="bg-red-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <Link to="/revenue" className="bg-gray-800 border border-gray-600 rounded-lg p-6 block hover:bg-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(dashboardData.totalRevenue)}</p>
            </div>
            <div className="bg-yellow-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Members and Expiring Members */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        {/* Recent Members */}
        <div className="w-full">
          <h2 className="text-xl font-bold mb-4 text-white">Recent Members</h2>
          {dashboardData.recentMembers.length === 0 ? (
            <p className="text-gray-400 text-lg">No recent members found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-600 rounded-lg overflow-hidden table-auto">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-gray-200 font-semibold">Name</th>
                    <th className="px-4 py-3 text-gray-200 font-semibold">Email</th>
                    <th className="px-4 py-3 text-gray-200 font-semibold">Join Date</th>
                    <th className="px-4 py-3 text-gray-200 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800">
                  {dashboardData.recentMembers.map((member) => (
                    <tr key={member._id} className="border-b border-gray-600 hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{member.name}</td>
                      <td className="px-4 py-3 text-blue-400 font-medium">{member.email}</td>
                      <td className="px-4 py-3 text-gray-300">{formatDate(member.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'Active' 
                            ? 'bg-green-900 text-green-300' 
                            : member.status === 'Inactive'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expiring Members */}
        <div className="w-full">
          <h2 className="text-xl font-bold mb-4 text-white">Expiring Soon</h2>
          {dashboardData.expiringMembers.length === 0 ? (
            <p className="text-gray-400 text-lg">No members expiring soon.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-600 rounded-lg overflow-hidden table-auto">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-gray-200 font-semibold">Name</th>
                    <th className="px-4 py-3 text-gray-200 font-semibold">Email</th>
                    <th className="px-4 py-3 text-gray-200 font-semibold">Expiry Date</th>
                    <th className="px-4 py-3 text-gray-200 font-semibold">Days Left</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800">
                  {dashboardData.expiringMembers.map((member) => {
                    const daysLeft = Math.ceil((new Date(member.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={member._id} className="border-b border-gray-600 hover:bg-gray-750 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{member.name}</td>
                        <td className="px-4 py-3 text-blue-400 font-medium">{member.email}</td>
                        <td className="px-4 py-3 text-gray-300">{formatDate(member.expiryDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            daysLeft <= 3 
                              ? 'bg-red-900 text-red-300' 
                              : daysLeft <= 7
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-orange-900 text-orange-300'
                          }`}>
                            {daysLeft} days
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;