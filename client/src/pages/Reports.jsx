import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useTheme } from '../components/utils/ThemeContext';
import {
    FileText,
    Users,
    CreditCard,
    Calendar,
    Download,
    Filter,
    Search
} from 'lucide-react';

const Reports = () => {
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('financial');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);

    // Filter States
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        method: 'All',
        plan: 'All',
        status: 'All',
        month: new Date().toISOString().slice(0, 7) // YYYY-MM
    });

    const [settings, setSettings] = useState(null);

    useEffect(() => {
        // Load plan options from settings
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/settings');
                setSettings(res.data);
            } catch (err) {
                console.error("Error loading settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const themeClasses = {
        background: isDarkMode
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
        card: isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        secondaryText: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        input: isDarkMode
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-gray-50 border-gray-300 text-gray-900',
        th: isDarkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-50 text-gray-600',
        td: isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700',
        tabActive: isDarkMode
            ? 'bg-blue-600 text-white'
            : 'bg-blue-600 text-white',
        tabInactive: isDarkMode
            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            : 'bg-white text-gray-600 hover:bg-gray-50',
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            let params = {};

            if (activeTab === 'financial') {
                endpoint = '/api/reports/payments';
                params = {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    method: filters.method,
                    plan: filters.plan
                };
            } else if (activeTab === 'members') {
                endpoint = '/api/reports/members';
                params = {
                    status: filters.status,
                    plan: filters.plan,
                    joinStartDate: filters.startDate,
                    joinEndDate: filters.endDate
                };
            } else if (activeTab === 'attendance') {
                endpoint = '/api/reports/attendance';
                params = {
                    month: filters.month
                };
            }

            const res = await axios.get(endpoint, { params });
            setData(res.data.data);
            setSummary(res.data.summary);
        } catch (err) {
            console.error("Error fetching report:", err);
            setError("Failed to generate report. Please try again.");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const convertToCSV = (objArray) => {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
        if (array.length > 0) {
             const header = Object.keys(array[0]).join(',') + '\r\n';
             str += header;
        }
       
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (const index in array[i]) {
                if (line !== '') line += ',';
                // Handle objects/arrays in cells roughly or just flatten before pass
                let val = array[i][index];
                if(typeof val === 'object' && val !== null) val = JSON.stringify(val).replace(/,/g, ';'); // simple escape
                line += val;
            }
            str += line + '\r\n';
        }
        return str;
    };

    const downloadCSV = () => {
        if (!data || data.length === 0) return;

        // Custom flattening for CSV based on tab
        let csvData = [];
        if (activeTab === 'financial') {
            csvData = data.map(p => ({
                Date: new Date(p.date).toLocaleDateString(),
                Member: p.memberId ? p.memberId.name : 'Unknown',
                Amount: p.amount,
                Plan: p.plan,
                Method: p.method
            }));
        } else if (activeTab === 'members') {
            csvData = data.map(m => ({
                Name: m.name,
                Email: m.email,
                Phone: m.phone,
                Status: m.status,
                Plan: m.plan || 'N/A',
                JoinDate: new Date(m.joinDate).toLocaleDateString(),
                ExpiryDate: new Date(m.expiryDate).toLocaleDateString()
            }));
        } else if (activeTab === 'attendance') {
            csvData = data.map(a => ({
                Name: a.name,
                Month: a.month,
                PresentDays: a.presentCount,
                TotalDays: a.totalDays,
                Percentage: ((a.presentCount / a.totalDays) * 100).toFixed(1) + '%'
            }));
        }

        const csvString = convertToCSV(csvData);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tabs = [
        { id: 'financial', label: 'Financial', icon: CreditCard },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
    ];

    return (
        <div className={`min-h-screen ${themeClasses.background} p-6`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Reports</h1>
                        <p className={`text-sm ${themeClasses.secondaryText}`}>Generate & Export Detailed Reports</p>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-gray-200/50 dark:bg-gray-800 p-1 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setData([]); setSummary(null); setError(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.id ? themeClasses.tabActive : themeClasses.tabInactive
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Section */}
            <div className={`${themeClasses.card} rounded-2xl p-6 mb-6 shadow-xl border`}>
                <div className="flex items-center gap-2 mb-4 pb-4 border-b dark:border-gray-700">
                    <Filter className={`w-5 h-5 ${themeClasses.secondaryText}`} />
                    <h2 className={`font-semibold ${themeClasses.text}`}>Filters</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {activeTab === 'attendance' ? (
                        <div>
                            <label className={`block text-xs font-medium ${themeClasses.secondaryText} mb-1`}>Month</label>
                            <input
                                type="month"
                                name="month"
                                value={filters.month}
                                onChange={handleFilterChange}
                                className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${themeClasses.input}`}
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className={`block text-xs font-medium ${themeClasses.secondaryText} mb-1`}>Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${themeClasses.input}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium ${themeClasses.secondaryText} mb-1`}>End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${themeClasses.input}`}
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'financial' && (
                        <div>
                            <label className={`block text-xs font-medium ${themeClasses.secondaryText} mb-1`}>Method</label>
                            <select
                                name="method"
                                value={filters.method}
                                onChange={handleFilterChange}
                                className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${themeClasses.input}`}
                            >
                                <option value="All">All Methods</option>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>
                    )}

                    {(activeTab === 'financial' || activeTab === 'members') && (
                        <div>
                            <label className={`block text-xs font-medium ${themeClasses.secondaryText} mb-1`}>Plan</label>
                            <select
                                name="plan"
                                value={filters.plan}
                                onChange={handleFilterChange}
                                className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${themeClasses.input}`}
                            >
                                <option value="All">All Plans</option>
                                {settings?.membershipPlans?.map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div>
                            <label className={`block text-xs font-medium ${themeClasses.secondaryText} mb-1`}>Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${themeClasses.input}`}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-end">
                        <button
                            onClick={fetchReport}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
                        >
                            <Search className="w-4 h-4" />
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}
            <div className={`${themeClasses.card} rounded-2xl p-6 shadow-xl border min-h-[400px]`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                        Results
                        {data.length > 0 && <span className="ml-2 text-sm font-normal text-gray-500">({data.length} records)</span>}
                    </h2>
                    {data.length > 0 && (
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            To CSV
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                         <p className={`mt-4 ${themeClasses.secondaryText}`}>Fetching data...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>No records found. Adjust filters and click Generate.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    {activeTab === 'financial' && (
                                        <>
                                            <th className={`p-4 text-sm font-semibold rounded-tl-lg ${themeClasses.th}`}>Date</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th}`}>Member</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th}`}>Plan</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th}`}>Method</th>
                                            <th className={`p-4 text-sm font-semibold rounded-tr-lg text-right ${themeClasses.th}`}>Amount</th>
                                        </>
                                    )}
                                    {activeTab === 'members' && (
                                        <>
                                            <th className={`p-4 text-sm font-semibold rounded-tl-lg ${themeClasses.th}`}>Name</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th}`}>Email</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th}`}>Plan</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th}`}>Join Date</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th}`}>Expiry</th>
                                            <th className={`p-4 text-sm font-semibold rounded-tr-lg ${themeClasses.th}`}>Status</th>
                                        </>
                                    )}
                                    {activeTab === 'attendance' && (
                                        <>
                                            <th className={`p-4 text-sm font-semibold rounded-tl-lg ${themeClasses.th}`}>Name</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th}`}>Month</th>
                                            <th className={`p-4 text-sm font-semibold ${themeClasses.th} text-center`}>Present Days</th>
                                            <th className={`p-4 text-sm font-semibold rounded-tr-lg ${themeClasses.th} text-right`}>Attendance %</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {data.map((row, idx) => (
                                    <tr key={idx} className={`border-b last:border-0 ${themeClasses.td}`}>
                                        {activeTab === 'financial' && (
                                            <>
                                                <td className="p-4">{new Date(row.date).toLocaleDateString()}</td>
                                                <td className="p-4 font-medium">{row.memberId?.name || 'Unknown'}</td>
                                                <td className="p-4">{row.plan}</td>
                                                <td className="p-4">{row.method}</td>
                                                <td className="p-4 text-right font-mono">₹{row.amount}</td>
                                            </>
                                        )}
                                        {activeTab === 'members' && (
                                            <>
                                                <td className="p-4 font-medium">
                                                    <div>{row.name}</div>
                                                    <div className={`text-xs ${themeClasses.secondaryText}`}>{row.phone}</div>
                                                </td>
                                                <td className="p-4">{row.email}</td>
                                                <td className="p-4">{row.plan || '-'}</td>
                                                <td className="p-4">{new Date(row.joinDate).toLocaleDateString()}</td>
                                                <td className="p-4">{new Date(row.expiryDate).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        row.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'attendance' && (
                                            <>
                                                <td className="p-4 font-medium">{row.name}</td>
                                                <td className="p-4">{row.month}</td>
                                                <td className="p-4 text-center">{row.presentCount} / {row.totalDays}</td>
                                                <td className="p-4 text-right font-medium">
                                                    {((row.presentCount / row.totalDays) * 100).toFixed(1)}%
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {data.length > 0 && summary && activeTab === 'financial' && (
                    <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center">
                            <span className={`font-semibold ${themeClasses.secondaryText}`}>Total Revenue</span>
                            <span className={`text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent`}>
                                ₹{summary.totalAmount?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
