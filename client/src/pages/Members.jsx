import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [marked, setMarked] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState({});
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const token = localStorage.getItem("token");

  // Fetch members + attendance
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

  // Function to mark attendance
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
      <div className="w-full max-w-none flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-white">Members</h2>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none flex flex-col">
      {/* Header with Back + Title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">Members</h2>
          <p className="text-gray-400 text-sm mt-1">
            {processedMembers.length} of {members.length} members
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="min-w-[120px] px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Expired">Expired</option>
          </select>


          {/* Sort Options */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="expiryDate">Sort by Expiry</option>
              <option value="renewalDate">Sort by Renewal</option>
              <option value="status">Sort by Status</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <svg className={`w-5 h-5 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      {processedMembers.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-400">No members found</h3>
          <p className="mt-1 text-gray-500">
            {searchQuery || filterStatus !== "All"
              ? "Try adjusting your search or filters"
              : "Add your first member to get started"}
          </p>
        </div>
      ) : (
        <div className="w-full self-start">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border border-gray-600 rounded-lg overflow-hidden">
              <thead className="bg-black">
                <tr>
                  <th className="px-6 py-3 text-gray-200 font-semibold">#</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Name</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Phone</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Plan</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Gender</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Renewal Date</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Expiry Date</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Status</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Attendance</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {processedMembers.map((member, index) => (
                  <tr
                    onClick={() => navigate(`/members/${member._id}`)}
                    key={member._id}
                    className={`border-b border-gray-600 hover:bg-gray-700 cursor-pointer transition-colors ${isExpiringSoon(member.expiryDate) ? 'bg-yellow-900/20' : ''
                      }`}
                  >
                    <td className="px-6 py-4 text-gray-300">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{member.name}</span>
                        {isExpiringSoon(member.expiryDate) && (
                          <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded-full" title="Expiring soon">
                            ⚠️
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{member.phone}</td>
                    <td className="px-6 py-4 text-blue-400 font-medium">{member.plan}</td>
                    <td className="px-6 py-4 text-gray-300">{member.gender}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDate(member.renewalDate)}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDate(member.expiryDate)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'Active'
                          ? 'bg-green-900 text-green-300'
                          : member.status === 'Inactive'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-yellow-900 text-yellow-300'
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
                          className={`px-4 py-2 rounded transition-colors ${marked[member._id]
                            ? "bg-green-600 text-white cursor-not-allowed"
                            : attendanceLoading[member._id]
                              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                            }`}
                          onClick={(e) => markAttendance(member._id, e)}
                        >
                          {attendanceLoading[member._id] ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Marking...
                            </div>
                          ) : marked[member._id] ? (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Marked
                            </div>
                          ) : (
                            "Mark"
                          )}
                        </button>
                      ) : (
                        <span
                          className={`px-3 py-2 rounded text-xs font-medium ${member.status === "Inactive"
                            ? "bg-red-900 text-red-300"
                            : "bg-yellow-900 text-yellow-300"
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
  );
}

export default Members;