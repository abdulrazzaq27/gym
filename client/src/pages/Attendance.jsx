import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

function AttendanceOverview() {
  const [days, setDays] = useState([]);
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });

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
    <>


      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
        <button
    onClick={() => navigate(-1)}
    className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors shadow-md"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>

          <h2 className="text-2xl font-bold text-white">
            Attendance Overview ({month})
          </h2>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white [color-scheme:dark]"
          />
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            Export CSV
          </button>

          <div>
            <button
              onClick={() => navigate("/attendance/trend")}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Attendance Trends
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto border border-gray-600 w-full text-sm text-white">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-600 px-2 py-1">Member</th>
                {days.map((day) => (
                  <th key={day} className="border border-gray-600 px-1 py-1">
                    {day}
                  </th>
                ))}
                <th className="border border-gray-600 px-2 py-1">Total</th>
                <th className="border border-gray-600 px-2 py-1">%</th>
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
                  <tr key={member.memberId} className="hover:bg-gray-700">
                    <td className="border border-gray-600 px-2 py-1 font-medium">
                      {member.name}
                    </td>
                    {days.map((day) => {
                      const cellDate = new Date(year, monthNum - 1, day);
                      const isFuture = cellDate > today;
                      return (
                        <td
                          key={day}
                          className="border border-gray-600 text-center font-bold"
                          style={{
                            color: isFuture
                              ? "gray"
                              : member[day]
                                ? "green"
                                : "red",
                          }}
                        >
                          {isFuture ? "-" : member[day] ? "✅" : "❌"}
                        </td>
                      );
                    })}
                    <td className="border border-gray-600 text-center text-white">
                      {totalPresent}
                    </td>
                    <td className="border border-gray-600 text-center">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
export default AttendanceOverview;
