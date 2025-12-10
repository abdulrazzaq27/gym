import { useEffect, useState, useRef, useCallback } from "react";
import axios from '../api/axios';
import { useTheme } from '../components/utils/ThemeContext.jsx';
import { 
  CreditCard, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Filter,
  Search,
  TrendingUp,
  IndianRupee,
  Loader2
} from 'lucide-react';

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ totalAmount: 0, count: 0 });
  
  const observer = useRef();
  const { isDarkMode } = useTheme();

  // Theme-based classes
  const themeClasses = {
    background: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    primaryText: isDarkMode ? 'text-white' : 'text-gray-900',
    secondaryText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    cardBackground: isDarkMode 
      ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/50' 
      : 'bg-white/70 backdrop-blur-sm border-gray-200/50',
    tableContainer: isDarkMode 
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
    tableHeader: isDarkMode ? 'bg-gray-900/50 border-gray-600' : 'bg-gray-100/50 border-gray-300',
    tableHeaderText: isDarkMode ? 'text-gray-200' : 'text-gray-700',
    tableRow: isDarkMode 
      ? 'border-gray-700 hover:bg-gray-700/30' 
      : 'border-gray-200 hover:bg-gray-50/50',
    tableCellText: isDarkMode ? 'text-white' : 'text-gray-900',
    inputBackground: isDarkMode 
      ? 'bg-gray-800/50 text-white border-gray-600 placeholder-gray-400' 
      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500',
    selectBackground: isDarkMode 
      ? 'bg-gray-800/50 text-white border-gray-600' 
      : 'bg-white text-gray-900 border-gray-300',
    loadingSpinner: isDarkMode ? 'border-blue-500' : 'border-blue-600',
    errorCard: isDarkMode 
      ? 'bg-red-900/30 border-red-700 text-red-300' 
      : 'bg-red-50 border-red-200 text-red-700',
    successBadge: isDarkMode 
      ? 'bg-green-900/30 text-green-300 border-green-700/30' 
      : 'bg-green-100 text-green-700 border-green-300/30',
    pendingBadge: isDarkMode 
      ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/30' 
      : 'bg-yellow-100 text-yellow-700 border-yellow-300/30',
    failedBadge: isDarkMode 
      ? 'bg-red-900/30 text-red-300 border-red-700/30' 
      : 'bg-red-100 text-red-700 border-red-300/30',
    statsCard: isDarkMode 
      ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/30' 
      : 'bg-gradient-to-br from-blue-100/50 to-purple-100/50 border-blue-300/30',
    exportButton: isDarkMode 
      ? 'bg-blue-600 hover:bg-blue-700' 
      : 'bg-blue-500 hover:bg-blue-600',
  };

  // Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm);
        setPage(1);
        setPayments([]);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, debouncedSearch]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setPayments([]);
  }, [statusFilter]);

  // Fetch Payments
  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: 15,
          search: debouncedSearch,
          status: statusFilter
        };

        const res = await axios.get("/api/payments", { 
          params,
          withCredentials: true 
        });

        if (res.data.success) {
          const newPayments = res.data.data;
          const pagination = res.data.pagination;

          setPayments(prev => {
            if (page === 1) return newPayments;
            const existingIds = new Set(prev.map(p => p._id));
            const uniqueNew = newPayments.filter(p => !existingIds.has(p._id));
            return [...prev, ...uniqueNew];
          });

          setHasMore(page < pagination.pages);

          // Update stats (only on first page or when filters change)
          if (res.data.stats) {
            setStats(res.data.stats);
          }
        } else {
          setError("Failed to fetch payments");
        }
      } catch (err) {
        console.log(err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [page, debouncedSearch, statusFilter]);

  // Infinite Scroll Observer
  const lastPaymentElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
      case 'success':
        return `${themeClasses.successBadge} border`;
      case 'pending':
        return `${themeClasses.pendingBadge} border`;
      case 'failed':
      case 'error':
        return `${themeClasses.failedBadge} border`;
      default:
        return `${themeClasses.pendingBadge} border`;
    }
  };

  const exportCSV = () => {
    const headers = ['Member', 'Amount', 'Status', 'Date'];
    const rows = payments.map(p => [
      p.memberId?.name || 'N/A',
      p.amount,
      p.status || 'completed',
      new Date(p.date).toLocaleDateString("en-US")
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error && payments.length === 0) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center p-6`}>
        <div className={`${themeClasses.errorCard} border rounded-2xl p-6 text-center max-w-md`}>
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Payments</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className={`w-8 h-8 ${themeClasses.primaryText}`} />
            <h1 className={`text-3xl font-bold ${themeClasses.primaryText}`}>Payments</h1>
          </div>
          <p className={`${themeClasses.secondaryText}`}>Manage and track all payment transactions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className={`w-6 h-6 ${themeClasses.primaryText}`} />
              <h3 className={`text-sm font-medium ${themeClasses.secondaryText}`}>Total Revenue</h3>
            </div>
            <p className={`text-2xl font-bold ${themeClasses.primaryText}`}>
              ₹{stats.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className={`w-6 h-6 ${themeClasses.primaryText}`} />
              <h3 className={`text-sm font-medium ${themeClasses.secondaryText}`}>Total Payments</h3>
            </div>
            <p className={`text-2xl font-bold ${themeClasses.primaryText}`}>{stats.count}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg mb-6`}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.mutedText}`} />
                <input
                  type="text"
                  placeholder="Search by member name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeClasses.inputBackground} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className={`w-4 h-4 ${themeClasses.mutedText}`} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${themeClasses.selectBackground} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <button
              onClick={exportCSV}
              className={`flex items-center gap-2 ${themeClasses.exportButton} text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg`}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className={`${themeClasses.tableContainer} border rounded-2xl shadow-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${themeClasses.tableHeader} border-b`}>
                <tr>
                  <th className={`px-6 py-4 text-left ${themeClasses.tableHeaderText} font-semibold`}>
                    Member
                  </th>
                  <th className={`px-6 py-4 text-left ${themeClasses.tableHeaderText} font-semibold`}>
                    Amount
                  </th>
                  <th className={`px-6 py-4 text-left ${themeClasses.tableHeaderText} font-semibold`}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center">
                      <div className={`${themeClasses.mutedText}`}>
                        <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No payments found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => {
                    const isLast = payments.length === index + 1;
                    
                    return (
                      <tr 
                        ref={isLast ? lastPaymentElementRef : null}
                        key={payment._id} 
                        className={`border-b ${themeClasses.tableRow} transition-colors`}
                      >
                        <td className={`px-6 py-4 ${themeClasses.tableCellText}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{payment.memberId?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${themeClasses.tableCellText} font-semibold`}>
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 ${themeClasses.tableCellText}`}>
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${themeClasses.mutedText}`} />
                            {new Date(payment.date).toLocaleDateString("en-US", {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <div className={`animate-spin rounded-full h-8 w-8 border-2 ${themeClasses.loadingSpinner} border-t-transparent`}></div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {payments.length > 0 && (
          <div className={`${themeClasses.cardBackground} rounded-2xl p-4 border shadow-lg mt-6`}>
            <div className="flex items-center justify-between text-sm">
              <span className={themeClasses.mutedText}>
                Showing {payments.length} of {stats.count} payments
              </span>
              <span className={`font-medium ${themeClasses.primaryText}`}>
                Filtered Total: ₹{stats.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentsPage;