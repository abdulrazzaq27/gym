import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../components/utils/ThemeContext.jsx';

function AttendanceOverview() {
  const [days, setDays] = useState([]);
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });

  const { isDarkMode } = useTheme();

  // Theme-based classes
  const themeClasses = {
    background: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    primaryText: isDarkMode ? 'text-white' : 'text-gray-900',
    secondaryText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    backButton: isDarkMode 
      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    toggleButton: isDarkMode 
      ? 'border-slate-700 bg-slate-800/80' 
      : 'border-gray-200 bg-white/80',
    toggleHover: isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100',
    sunColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-500',
    moonColor: isDarkMode ? 'text-gray-400' : 'text-gray-700',
    monthInput: isDarkMode 
      ? 'bg-gray-800 text-white border-gray-600 [color-scheme:dark]' 
      : 'bg-white text-gray-900 border-gray-300 [color-scheme:light]',
    exportButton: isDarkMode 
      ? 'bg-green-600 hover:bg-green-700' 
      : 'bg-green-500 hover:bg-green-600',
    trendsButton: isDarkMode 
      ? 'bg-blue-600 hover:bg-blue-700' 
      : 'bg-blue-500 hover:bg-blue-600',
    tableContainer: isDarkMode 
      ? 'border-gray-600' 
      : 'border-gray-300',
    tableHeader: isDarkMode 
      ? 'bg-gray-800 border-gray-600' 
      : 'bg-gray-100 border-gray-300',
    tableHeaderText: isDarkMode ? 'text-white' : 'text-gray-900',
    tableCell: isDarkMode 
      ? 'border-gray-600' 
      : 'border-gray-300',
    tableRow: isDarkMode 
      ? 'hover:bg-gray-700/50' 
      : 'hover:bg-gray-50',
    tableCellText: isDarkMode ? 'text-white' : 'text-gray-900',
    presentColor: isDarkMode ? '#10B981' : '#059669', // green
    absentColor: isDarkMode ? '#EF4444' : '#DC2626', // red
    futureColor: isDarkMode ? '#6B7280' : '#9CA3AF', // gray
    cardBackground: isDarkMode 
      ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/50' 
      : 'bg-white/70 backdrop-blur-sm border-gray-200/50',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. fetch all members
        const membersRes = await axios.get("/api/members");
        const allMembers = membersRes.data;

        // 2. fetch attendance for the month
        const attendanceRes = await axios.get(`/api/attendance?month=${month}`);
        const attendance = attendanceRes.data.result; // days mapped to 0/1

        // 3. days in month
        const totalDays = attendanceRes.data.days.length
          ? attendanceRes.data.days
          : [...Array(new Date(month.split("-")[0], month.split("-")[1], 0).getDate()).keys()].map(
            (d) => d + 1
          );
        setDays(totalDays);

        // 4. map attendance to all members
        const overview = allMembers.map((member) => {
          const dayMap = {};
          totalDays.forEach((day) => {
            dayMap[day] = 0; // default absent
          });

          // fill attendance if exists
          const record = attendance.find((r) => r.memberId === member._id);
          if (record) {
            totalDays.forEach((day) => {
              if (record[day] === 1) dayMap[day] = 1;
            });
          }

          return { ...dayMap, memberId: member._id, name: member.name };
        });

        setMembers(overview);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [month]);

  const exportCSV = () => {
    if (!members.length || !days.length) return;

    const today = new Date();
    const [year, monthNum] = month.split("-");

    // filter only past/current days
    const validDays = days.filter((day) => {
      const cellDate = new Date(year, monthNum - 1, day);
      return cellDate <= today;
    });

    // CSV header
    const headers = ["Member", ...validDays.map((d) => `Day ${d}`), "Total", "%"];

    // CSV rows
    const rows = members.map((member) => {
      const totalPresent = validDays.reduce(
        (sum, day) => sum + (member[day] || 0),
        0
      );
      const percentage =
        validDays.length > 0
          ? ((totalPresent / validDays.length) * 100).toFixed(0)
          : 0;

      const attendanceMarks = validDays.map((day) =>
        member[day] ? "Present" : "Absent"
      );

      return [member.name, ...attendanceMarks, totalPresent, `${percentage}%`];
    });

    // Build CSV string
    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((val) => `"${val}"`).join(","))
        .join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} relative`}>
      {/* Theme Toggle Button - Fixed Position */}
      {/* <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl transition-all duration-300 ${themeClasses.toggleHover} shadow-lg backdrop-blur-sm border ${themeClasses.toggleButton}`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className={`w-6 h-6 ${themeClasses.sunColor}`} />
          ) : (
            <Moon className={`w-6 h-6 ${themeClasses.moonColor}`} />
          )}
        </button>
      </div> */}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded ${themeClasses.backButton} transition-colors shadow-md`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className={`text-2xl font-bold ${themeClasses.primaryText}`}>
            Attendance Overview ({month})
          </h2>
        </div>

        {/* Controls */}
        <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg mb-6`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className={`text-sm font-medium ${themeClasses.secondaryText}`}>
                Select Month:
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className={`p-2 rounded-lg border ${themeClasses.monthInput} transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <button
              onClick={exportCSV}
              className={`px-4 py-2 rounded-lg ${themeClasses.exportButton} text-white font-medium transition-colors shadow-md hover:shadow-lg`}
            >
              Export CSV
            </button>

            <button
              onClick={() => navigate("/attendance/trend")}
              className={`px-4 py-2 rounded-lg ${themeClasses.trendsButton} text-white font-medium transition-colors shadow-md hover:shadow-lg`}
            >
              Attendance Trends
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <h3 className={`text-lg font-semibold ${themeClasses.primaryText} mb-2`}>Total Members</h3>
            <p className={`text-2xl font-bold ${themeClasses.primaryText}`}>{members.length}</p>
          </div>
          
          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <h3 className={`text-lg font-semibold ${themeClasses.primaryText} mb-2`}>Days in Month</h3>
            <p className={`text-2xl font-bold ${themeClasses.primaryText}`}>{days.length}</p>
          </div>

          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <h3 className={`text-lg font-semibold ${themeClasses.primaryText} mb-2`}>Current Month</h3>
            <p className={`text-2xl font-bold ${themeClasses.primaryText}`}>
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg overflow-hidden`}>
          <h3 className={`text-lg font-semibold ${themeClasses.primaryText} mb-4`}>
            Daily Attendance Overview
          </h3>
          
          <div className="overflow-x-auto">
            <table className={`table-auto border ${themeClasses.tableContainer} w-full text-sm ${themeClasses.primaryText} rounded-lg overflow-hidden`}>
              <thead>
                <tr className={`${themeClasses.tableHeader} border-b`}>
                  <th className={`border ${themeClasses.tableCell} px-3 py-2 text-left ${themeClasses.tableHeaderText} font-semibold`}>
                    Member
                  </th>
                  {days.map((day) => (
                    <th key={day} className={`border ${themeClasses.tableCell} px-2 py-2 text-center ${themeClasses.tableHeaderText} font-semibold min-w-[40px]`}>
                      {day}
                    </th>
                  ))}
                  <th className={`border ${themeClasses.tableCell} px-3 py-2 text-center ${themeClasses.tableHeaderText} font-semibold`}>
                    Total
                  </th>
                  <th className={`border ${themeClasses.tableCell} px-3 py-2 text-center ${themeClasses.tableHeaderText} font-semibold`}>
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const today = new Date();
                  const [year, monthNum] = month.split("-");

                  const validDays = days.filter((day) => {
                    const cellDate = new Date(year, monthNum - 1, day);
                    return cellDate <= today;
                  });

                  const totalPresent = validDays.reduce(
                    (sum, day) => sum + (member[day] || 0),
                    0
                  );
                  const percentage =
                    validDays.length > 0
                      ? ((totalPresent / validDays.length) * 100).toFixed(0)
                      : 0;

                  return (
                    <tr key={member.memberId} className={`${themeClasses.tableRow} transition-colors border-b ${themeClasses.tableCell}`}>
                      <td className={`border ${themeClasses.tableCell} px-3 py-2 font-medium ${themeClasses.tableCellText}`}>
                        {member.name}
                      </td>
                      {days.map((day) => {
                        const cellDate = new Date(year, monthNum - 1, day);
                        const isFuture = cellDate > today;
                        return (
                          <td
                            key={day}
                            className={`border ${themeClasses.tableCell} text-center font-bold px-2 py-2`}
                            style={{
                              color: isFuture
                                ? themeClasses.futureColor
                                : member[day]
                                  ? themeClasses.presentColor
                                  : themeClasses.absentColor,
                            }}
                          >
                            {isFuture ? "-" : member[day] ? "✓" : "✗"}
                          </td>
                        );
                      })}
                      <td className={`border ${themeClasses.tableCell} text-center ${themeClasses.tableCellText} font-semibold px-3 py-2`}>
                        {totalPresent}
                      </td>
                      <td className={`border ${themeClasses.tableCell} text-center px-3 py-2 font-semibold`}
                        style={{ 
                          color: percentage >= 80 
                            ? themeClasses.presentColor 
                            : percentage >= 60 
                              ? '#F59E0B' 
                              : themeClasses.absentColor 
                        }}
                      >
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span style={{ color: themeClasses.presentColor }} className="font-bold text-lg">✓</span>
              <span className={themeClasses.secondaryText}>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: themeClasses.absentColor }} className="font-bold text-lg">✗</span>
              <span className={themeClasses.secondaryText}>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: themeClasses.futureColor }} className="font-bold text-lg">-</span>
              <span className={themeClasses.secondaryText}>Future Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceOverview;