import { useEffect, useState } from "react";
import axios from "../api/axios";

function AttendanceOverview() {
  const [days, setDays] = useState([]);
  const [members, setMembers] = useState([]);
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4">
        Attendance Overview ({month})
      </h2>

      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="mb-4 p-2 rounded bg-gray-800 text-white"
      />

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

              // filter only past/current days
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
  );
}

export default AttendanceOverview;
