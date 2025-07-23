import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { format } from 'date-fns';

function Attendance() {
  const [members, setMembers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState({}); // { memberId: true/false }

  useEffect(() => {
    axios.get('/api/members')
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("Error fetching members:", err));

    fetchAttendanceForDate(new Date());
  }, []);

  const fetchAttendanceForDate = async (date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await axios.get(`/api/attendance?date=${formattedDate}`);
      const map = {};
      res.data.forEach(entry => {
        map[entry.memberId] = true;
      });
      setAttendanceMap(map);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    fetchAttendanceForDate(newDate);
  };

  const markAttendance = async (memberId) => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      await axios.post('/api/attendance/mark', { memberId, date: formattedDate });
      setAttendanceMap(prev => ({ ...prev, [memberId]: true }));
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>

      <div className="mb-4">
        <label className="mr-2 text-lg font-semibold">Select Date:</label>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={handleDateChange}
          className="text-black px-3 py-1 rounded"
        />
      </div>

      <table className="w-full text-sm text-left border border-gray-600 rounded-lg overflow-hidden table-auto">
        <thead className="bg-black">
          <tr>
            <th className="px-6 py-3 text-gray-200 font-semibold">#</th>
            <th className="px-6 py-3 text-gray-200 font-semibold">Name</th>
            <th className="px-6 py-3 text-gray-200 font-semibold">Plan</th>
            <th className="px-6 py-3 text-gray-200 font-semibold">Status</th>
            <th className="px-6 py-3 text-gray-200 font-semibold">Attendance</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800">
          {members.map((member, index) => (
            <tr key={member._id} className="border-b border border-gray-600 hover:bg-gray-700">
              <td className="px-6 py-4 text-gray-300">{index + 1}</td>
              <td className="px-6 py-4 text-white font-medium">{member.name}</td>
              <td className="px-6 py-4 text-blue-400">{member.plan}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'Active'
                    ? 'bg-green-900 text-green-300'
                    : 'bg-red-900 text-red-300'
                }`}>
                  {member.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {attendanceMap[member._id] ? (
                  <span className="text-green-300">Present</span>
                ) : (
                  <button
                    onClick={() => markAttendance(member._id)}
                    className="text-white px-4 py-1 rounded bg-black hover:bg-gray-900"
                  >
                    Mark Present
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Attendance;