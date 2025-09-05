import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

export default function AttendanceTrend() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/attendance?month=${month}`)
      .then(res => {
        const dailyCount = res.data.days.map(day => {
          let present = 0;
          res.data.result.forEach(member => {
            if (member[day] === 1) present++;
          });
          return { day, present };
        });
        setData(dailyCount);
      })
      .catch(err => console.error(err));
  }, [month]);

  return (
    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      marginTop: "20px"
    }}>

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
            Attendance Trend ({month})
          </h2>
        </div>

      {/* Month selector */}
      <input
        type="month"
        value={month}
        onChange={e => setMonth(e.target.value)}
        style={{ marginBottom: "20px", marginLeft: "16px", padding: "5px", fontSize: "16px" }}
        className="p-2 rounded bg-gray-800 text-white [color-scheme:dark]"
      />

      {/* Line chart */}
      <div style={{ width: "95%", maxWidth: "1200px", marginLeft: "16px" }}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#4f46e5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}