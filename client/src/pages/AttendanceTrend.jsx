import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, TrendingUp, Calendar, Users } from 'lucide-react';
import { useTheme } from '../components/utils/ThemeContext.jsx';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
  BarChart,
  Bar
} from "recharts";

export default function AttendanceTrend() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('line'); // line | area | bar
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    cardBackground: isDarkMode 
      ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/50' 
      : 'bg-white/70 backdrop-blur-sm border-gray-200/50',
    chartCard: isDarkMode 
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
    monthInput: isDarkMode 
      ? 'bg-gray-800 text-white border-gray-600 [color-scheme:dark]' 
      : 'bg-white text-gray-900 border-gray-300 [color-scheme:light]',
    buttonGroup: isDarkMode 
      ? 'bg-gray-800/50 border-gray-700' 
      : 'bg-gray-100/50 border-gray-300',
    activeButton: isDarkMode 
      ? 'bg-blue-700/50 text-blue-200 border-blue-600' 
      : 'bg-blue-200/50 text-blue-800 border-blue-400',
    inactiveButton: isDarkMode ? 'text-gray-300 border-transparent' : 'text-gray-600 border-transparent',
    chartGrid: isDarkMode ? '#374151' : '#E5E7EB',
    chartTick: isDarkMode ? '#9CA3AF' : '#6B7280',
    chartTooltip: isDarkMode 
      ? { backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }
      : { backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px' },
    loadingSpinner: isDarkMode ? 'border-blue-500' : 'border-blue-600',
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/attendance?month=${month}`)
      .then(res => {
        const dailyCount = res.data.days.map(day => {
          let present = 0;
          res.data.result.forEach(member => {
            if (member[day] === 1) present++;
          });
          return { day, present, total: res.data.result.length };
        });
        setData(dailyCount);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [month]);

  // Calculate statistics
  const stats = {
    totalDays: data.length,
    averageAttendance: data.length > 0 ? Math.round(data.reduce((sum, day) => sum + day.present, 0) / data.length) : 0,
    maxAttendance: data.length > 0 ? Math.max(...data.map(d => d.present)) : 0,
    minAttendance: data.length > 0 ? Math.min(...data.map(d => d.present)) : 0,
    totalMembers: data.length > 0 ? data[0].total : 0,
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={themeClasses.chartGrid} />
            <XAxis dataKey="day" tick={{ fill: themeClasses.chartTick }} />
            <YAxis allowDecimals={false} tick={{ fill: themeClasses.chartTick }} />
            <Tooltip contentStyle={themeClasses.chartTooltip} />
            <Area type="monotone" dataKey="present" stroke="#4F46E5" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeClasses.chartGrid} />
            <XAxis dataKey="day" tick={{ fill: themeClasses.chartTick }} />
            <YAxis allowDecimals={false} tick={{ fill: themeClasses.chartTick }} />
            <Tooltip contentStyle={themeClasses.chartTooltip} />
            <Bar dataKey="present" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeClasses.chartGrid} />
            <XAxis dataKey="day" tick={{ fill: themeClasses.chartTick }} />
            <YAxis allowDecimals={false} tick={{ fill: themeClasses.chartTick }} />
            <Tooltip contentStyle={themeClasses.chartTooltip} />
            <Legend wrapperStyle={{ color: themeClasses.chartTick }} />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke="#4F46E5" 
              strokeWidth={3} 
              dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#4F46E5' }}
              name="Present Members"
            />
          </LineChart>
        );
    }
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
            className={`p-2 rounded-lg ${themeClasses.backButton} transition-colors shadow-md`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <TrendingUp className={`w-8 h-8 ${themeClasses.primaryText}`} />
            <h2 className={`text-2xl font-bold ${themeClasses.primaryText}`}>
              Attendance Trend ({month})
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg mb-6`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className={`w-5 h-5 ${themeClasses.secondaryText}`} />
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
            
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${themeClasses.secondaryText}`}>Chart Type:</span>
              <div className={`flex items-center space-x-1 ${themeClasses.buttonGroup} p-1 rounded-lg border`}>
                <button 
                  onClick={() => setChartType('line')} 
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${chartType === 'line' ? themeClasses.activeButton : themeClasses.inactiveButton}`}
                >
                  Line
                </button>
                <button 
                  onClick={() => setChartType('area')} 
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${chartType === 'area' ? themeClasses.activeButton : themeClasses.inactiveButton}`}
                >
                  Area
                </button>
                <button 
                  onClick={() => setChartType('bar')} 
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${chartType === 'bar' ? themeClasses.activeButton : themeClasses.inactiveButton}`}
                >
                  Bar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className={`w-5 h-5 ${themeClasses.secondaryText}`} />
              <h3 className={`text-sm font-medium ${themeClasses.secondaryText}`}>Avg Daily</h3>
            </div>
            <p className={`text-2xl font-bold ${themeClasses.primaryText}`}>{stats.averageAttendance}</p>
          </div>
          
          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <h3 className={`text-sm font-medium ${themeClasses.secondaryText} mb-2`}>Peak Day</h3>
            <p className={`text-2xl font-bold text-green-500`}>{stats.maxAttendance}</p>
          </div>

          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <h3 className={`text-sm font-medium ${themeClasses.secondaryText} mb-2`}>Lowest Day</h3>
            <p className={`text-2xl font-bold text-red-500`}>{stats.minAttendance}</p>
          </div>

          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <h3 className={`text-sm font-medium ${themeClasses.secondaryText} mb-2`}>Total Days</h3>
            <p className={`text-2xl font-bold ${themeClasses.primaryText}`}>{stats.totalDays}</p>
          </div>
        </div>

        {/* Chart */}
        <div className={`${themeClasses.chartCard} border rounded-2xl p-6 shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${themeClasses.primaryText}`}>
              Daily Attendance Trend
            </h3>
            <div className={`text-sm ${themeClasses.mutedText}`}>
              {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${themeClasses.loadingSpinner}`}></div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className={`text-center ${themeClasses.mutedText}`}>
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No attendance data available for this month</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Summary */}
        {data.length > 0 && (
          <div className={`${themeClasses.cardBackground} rounded-2xl p-6 border shadow-lg mt-6`}>
            <h3 className={`text-lg font-semibold ${themeClasses.primaryText} mb-3`}>Monthly Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${themeClasses.mutedText}`}>
                  Total Members: <span className={`font-semibold ${themeClasses.primaryText}`}>{stats.totalMembers}</span>
                </p>
                <p className={`text-sm ${themeClasses.mutedText} mt-1`}>
                  Average Daily Attendance: <span className={`font-semibold ${themeClasses.primaryText}`}>{stats.averageAttendance} members</span>
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.mutedText}`}>
                  Best Attendance: <span className="font-semibold text-green-500">{stats.maxAttendance} members</span>
                </p>
                <p className={`text-sm ${themeClasses.mutedText} mt-1`}>
                  Attendance Rate: <span className={`font-semibold ${themeClasses.primaryText}`}>
                    {stats.totalMembers > 0 ? Math.round((stats.averageAttendance / stats.totalMembers) * 100) : 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}