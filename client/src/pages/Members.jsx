import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Filter, SortAsc, SortDesc, AlertTriangle, Check, Loader2, Users, UserCheck } from 'lucide-react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [marked, setMarked] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState({});
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isVisible, setIsVisible] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("/api/members");
        setMembers(res.data);

        // Fetch attendance info
        const attendanceRes = await axios.get("/api/attendance/today");
        const alreadyMarked = {};
        attendanceRes.data.forEach((record) => {
          alreadyMarked[record.memberId] = true;
        });

        setMarked(alreadyMarked);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);


  // Mock navigation function
//   const navigate = (path) => {
//     if (path === -1) {
//       alert("Navigate back");
//     } else {
//       alert(`Navigate to: ${path}`);
//     }
//   };

  // Function to mark attendance
//   const markAttendance = async (memberId, e) => {
//     e.stopPropagation();
//     setAttendanceLoading(prev => ({ ...prev, [memberId]: true }));

//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1500));
//       setMarked((prev) => ({ ...prev, [memberId]: true }));
//     } catch (err) {
//       console.error("Error marking attendance:", err);
//       setError("Failed to mark attendance. Please try again.");
//       setTimeout(() => setError(""), 3000);
//     } finally {
//       setAttendanceLoading(prev => ({ ...prev, [memberId]: false }));
//     }
//   };

const markAttendance = async (memberId, e) => {
    e.stopPropagation();

    setAttendanceLoading(prev => ({ ...prev, [memberId]: true }));

    try {
      const res = await fetch(`http://localhost:3000/api/attendance/mark/${memberId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setMarked((prev) => ({ ...prev, [memberId]: true }));
      } else {
        setError(data.message || "Failed to mark attendance");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
      setError("Failed to mark attendance. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setAttendanceLoading(prev => ({ ...prev, [memberId]: false }));
    }
  };

  // Helper to format dates
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Check if membership is expiring soon (within 7 days)
  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  // Sort function
  const sortMembers = (membersList) => {
    return [...membersList].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'renewalDate' || sortBy === 'expiryDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Filter and sort members
  const processedMembers = (() => {
    let filtered = members.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.toString().includes(searchQuery);
      const matchesStatus = filterStatus === "All" || member.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return sortMembers(filtered);
  })();

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-slate-900 text-white overflow-hidden relative flex flex-col">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20"></div>
          <div className="absolute top-1/4 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-400">Loading members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20"></div>
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Background Image */}
      {/* <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center"
          alt="Gym background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95"></div>
      </div> */}

      {/* Content */}
      <div className={`relative z-10 p-6 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Header with Back + Title */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group p-3 rounded-xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:bg-slate-700/80 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </button>

          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-30"></span>
                <span className="relative text-white">Members</span>
              </span>
            </h2>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-sm">
                  {processedMembers.length} of {members.length} members
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-400" />
                <span className="text-sm">
                  {Object.keys(marked).length} attended today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-xl text-red-300 backdrop-blur-sm animate-shake">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              />
            </div>

            {/* Filters Container */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none min-w-[140px] pl-4 pr-10 py-3 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-3 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                >
                  <option value="name">Sort by Name</option>
                  <option value="expiryDate">Sort by Expiry</option>
                  <option value="renewalDate">Sort by Renewal</option>
                  <option value="status">Sort by Status</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="group p-3 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl hover:bg-slate-700/80 text-white transition-all duration-300 transform hover:scale-105"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="w-5 h-5 group-hover:text-cyan-400 transition-colors duration-300" />
                  ) : (
                    <SortDesc className="w-5 h-5 group-hover:text-cyan-400 transition-colors duration-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Members Table */}
        {processedMembers.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 max-w-md mx-auto">
              <Users className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No members found</h3>
              <p className="text-slate-500">
                {searchQuery || filterStatus !== "All"
                  ? "Try adjusting your search or filters"
                  : "Add your first member to get started"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl">
                  <tr className="border-b border-slate-700/50">
                    <th className="px-6 py-4 text-slate-200 font-semibold">#</th>
                    <th className="px-6 py-4 text-slate-200 font-semibold">Name</th>
                    <th className="px-6 py-4 text-slate-200 font-semibold">Phone</th>
                    <th className="px-6 py-4 text-slate-200 font-semibold">Plan</th>
                    <th className="px-6 py-4 text-slate-200 font-semibold">Gender</th>
                    <th className="px-6 py-4 text-slate-200 font-semibold">Renewal Date</th>
                    <th className="px-6 py-4 text-slate-200 font-semibold">Expiry Date</th>
                    <th className="px-6 py-4 text-slate-200 font-semibold">Status</th>
                    <th className="px-6 py-4 text-slate-200 font-semibold">Attendance</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30">
                  {processedMembers.map((member, index) => (
                    <tr
                      onClick={() => navigate(`/members/${member._id}`)}
                      key={member._id}
                      className={`border-b border-slate-700/30 hover:bg-slate-700/40 cursor-pointer transition-all duration-300 group ${
                        isExpiringSoon(member.expiryDate) ? 'bg-yellow-900/10 hover:bg-yellow-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-slate-300">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium group-hover:text-cyan-300 transition-colors duration-300">
                            {member.name}
                          </span>
                          {isExpiringSoon(member.expiryDate) && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded-full backdrop-blur-sm border border-yellow-500/30" title="Expiring soon">
                              <AlertTriangle className="w-3 h-3" />
                              Soon
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{member.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 text-xs font-medium rounded-full border border-cyan-500/30">
                          {member.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{member.gender}</td>
                      <td className="px-6 py-4 text-slate-300">{formatDate(member.renewalDate)}</td>
                      <td className="px-6 py-4 text-slate-300">{formatDate(member.expiryDate)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            member.status === 'Active'
                              ? 'bg-green-900/50 text-green-300 border-green-500/30'
                              : member.status === 'Inactive'
                              ? 'bg-red-900/50 text-red-300 border-red-500/30'
                              : 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>

                      {/* Attendance Button / Status */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {member.status === "Active" ? (
                          <button
                            disabled={marked[member._id] || attendanceLoading[member._id]}
                            className={`group px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform ${
                              marked[member._id]
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed shadow-lg shadow-green-500/25"
                                : attendanceLoading[member._id]
                                ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white cursor-pointer hover:scale-105 shadow-lg shadow-blue-500/25"
                            }`}
                            onClick={(e) => markAttendance(member._id, e)}
                          >
                            {attendanceLoading[member._id] ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Marking...
                              </div>
                            ) : marked[member._id] ? (
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Marked
                              </div>
                            ) : (
                              "Mark"
                            )}
                          </button>
                        ) : (
                          <span
                            className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                              member.status === "Inactive"
                                ? "bg-red-900/50 text-red-300 border-red-500/30"
                                : "bg-yellow-900/50 text-yellow-300 border-yellow-500/30"
                            }`}
                          >
                            {member.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Additional Visual Elements */}
      <div className="fixed -top-10 -left-10 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl animate-pulse z-0"></div>
      <div className="fixed -bottom-10 -right-10 w-24 h-24 bg-green-400/10 rounded-full blur-xl animate-pulse delay-1000 z-0"></div>
    </div>
  );
}

export default Members;