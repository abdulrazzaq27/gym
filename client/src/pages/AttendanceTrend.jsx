import { useEffect, useState } from "react";
import axios from "../api/axios";
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
      alignItems: "center",
      marginTop: "20px"
    }}>
      
      {/* Month selector */}
      <input
        type="month"
        value={month}
        onChange={e => setMonth(e.target.value)}
        style={{ marginBottom: "20px", padding: "5px", fontSize: "16px" }}
      />

      {/* Line chart */}
      <div style={{ width: "95%", maxWidth: "1200px" }}>
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
