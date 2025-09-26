import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios'; // ✅ Adjust path if needed
import { User, Mail, Phone, Calendar, CreditCard, Shield, FileText, ArrowLeft, CheckCircle, XCircle, Clock, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MemberDetails() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const navigate = useNavigate();

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Theme-based classes
    const themeClasses = {
        background: isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
        backButton: isDarkMode 
            ? 'text-gray-300 hover:text-blue-300' 
            : 'text-gray-600 hover:text-blue-600',
        profileAvatar: isDarkMode 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
            : 'bg-gradient-to-br from-blue-400 to-purple-500',
        nameText: isDarkMode ? 'text-white' : 'text-gray-900',
        cardBackground: isDarkMode 
            ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/50' 
            : 'bg-white/70 backdrop-blur-sm border-gray-200/50',
        cardTitle: isDarkMode ? 'text-white' : 'text-gray-900',
        infoItem: isDarkMode ? 'bg-gray-900/30' : 'bg-gray-100/50',
        infoLabel: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        infoValue: isDarkMode ? 'text-white' : 'text-gray-900',
        sidebarCard1: isDarkMode 
            ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-blue-500/20' 
            : 'bg-gradient-to-br from-blue-100/50 to-purple-100/50 backdrop-blur-sm border-blue-300/30',
        sidebarCard2: isDarkMode 
            ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border-green-500/20' 
            : 'bg-gradient-to-br from-green-100/50 to-emerald-100/50 backdrop-blur-sm border-green-300/30',
        sidebarTitle: isDarkMode ? 'text-white' : 'text-gray-900',
        sidebarLabel: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        sidebarValue: isDarkMode ? 'text-white' : 'text-gray-900',
        sidebarValueMono: isDarkMode ? 'text-white font-mono' : 'text-gray-900 font-mono',
        timelineDot1: isDarkMode ? 'bg-blue-400' : 'bg-blue-500',
        timelineDot2: isDarkMode ? 'bg-red-400' : 'bg-red-500',
        tableTitle: isDarkMode ? 'text-white' : 'text-gray-900',
        tableContainer: isDarkMode 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-gray-300 bg-white',
        tableHeader: isDarkMode ? 'bg-black' : 'bg-gray-100',
        tableHeaderText: isDarkMode ? 'text-gray-200' : 'text-gray-700',
        tableRow: isDarkMode 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-gray-200 bg-white',
        tableRowHover: isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50',
        tableCellText: isDarkMode ? 'text-white' : 'text-gray-900',
        renewButton: isDarkMode 
            ? 'bg-green-600 hover:bg-green-700 focus:ring-blue-800' 
            : 'bg-green-500 hover:bg-green-600 focus:ring-green-300',
        toggleHover: isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100',
        sunColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-500',
        moonColor: isDarkMode ? 'text-gray-400' : 'text-gray-700',
        loadingSpinner: isDarkMode ? 'border-blue-500' : 'border-blue-600',
        loadingText: isDarkMode ? 'text-white' : 'text-gray-900',
        notFoundText: isDarkMode ? 'text-white' : 'text-gray-900',
    };

    useEffect(() => {
        axios.get(`/api/members/${id}`)
            .then(res => setMember(res.data))
            .catch(err => console.error("Error fetching member:", err));
    }, [id]);

    useEffect(() => {
        axios.get(`/api/payments/history/${id}`)
            .then(res => setPaymentHistory(res.data))
            .catch(err => console.log(err))
    }, [id]);

    function handleSubmit() {
        navigate('./RenewMember');
    }

    function formatDate(isoDate) {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatDate2(isoDate) {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'text-green-400 bg-green-900/20';
            case 'inactive': return 'text-red-400 bg-red-900/20';
            case 'suspended': return 'text-yellow-400 bg-yellow-900/20';
            default: return 'text-gray-400 bg-gray-900/20';
        }
    }

    function getStatusIcon(status) {
        switch (status?.toLowerCase()) {
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'inactive': return <XCircle className="w-4 h-4" />;
            case 'suspended': return <Clock className="w-4 h-4" />;
            default: return <Shield className="w-4 h-4" />;
        }
    }

    if (loading) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${themeClasses.loadingSpinner}`}></div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className={`${themeClasses.notFoundText} text-xl`}>Member not found</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeClasses.background} relative`}>
            {/* Theme Toggle Button - Fixed Position */}
            <div className="fixed top-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className={`p-3 rounded-xl transition-all duration-300 ${themeClasses.toggleHover} shadow-lg backdrop-blur-sm border ${isDarkMode ? 'border-slate-700 bg-slate-800/80' : 'border-gray-200 bg-white/80'}`}
                    aria-label="Toggle theme"
                >
                    {isDarkMode ? (
                        <Sun className={`w-6 h-6 ${themeClasses.sunColor}`} />
                    ) : (
                        <Moon className={`w-6 h-6 ${themeClasses.moonColor}`} />
                    )}
                </button>
            </div>

            <div className="w-full py-4 px-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/members')}
                        className={`inline-flex items-center gap-2 hover:cursor-pointer ${themeClasses.backButton} transition-colors duration-200 mb-6 group`}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back to Members
                    </button>

                    <div className="flex justify-center gap-4 mb-2">
                        <div className={`w-16 h-16 ${themeClasses.profileAvatar} rounded-full flex items-center justify-center`}>
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className={`text-4xl font-bold ${themeClasses.nameText} mb-1`}>{member.name}</h1>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                                {getStatusIcon(member.status)}
                                {member.status || 'Unknown'}
                            </div>
                        </div>
                        {/*******************  Renew button *****************/}
                        {member.status.toLowerCase() === 'inactive' ?
                            (<button
                                onClick={handleSubmit}
                                className={`${themeClasses.renewButton} z-10 mt-3 ml-16 text-white py-3 h-12 px-6 hover:cursor-pointer rounded-lg focus:outline-none focus:ring-4 transition-all font-semibold text-lg`}>
                                Renew
                            </button>
                            ) : ('')
                        }
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className={`${themeClasses.cardBackground} rounded-2xl p-6 border shadow-lg`}>
                            <h2 className={`text-xl font-semibold ${themeClasses.cardTitle} mb-4 flex items-center gap-2`}>
                                <Mail className="w-5 h-5 text-blue-400" />
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`flex items-center gap-3 p-3 ${themeClasses.infoItem} rounded-lg`}>
                                    <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <div className={`text-sm ${themeClasses.infoLabel}`}>Email</div>
                                        <div className={`${themeClasses.infoValue} font-medium`}>{member.email || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 ${themeClasses.infoItem} rounded-lg`}>
                                    <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <div>
                                        <div className={`text-sm ${themeClasses.infoLabel}`}>Phone</div>
                                        <div className={`${themeClasses.infoValue} font-medium`}>{member.phone || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 ${themeClasses.infoItem} rounded-lg`}>
                                    <User className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                    <div>
                                        <div className={`text-sm ${themeClasses.infoLabel}`}>Gender</div>
                                        <div className={`${themeClasses.infoValue} font-medium`}>{member.gender || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 ${themeClasses.infoItem} rounded-lg`}>
                                    <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <div>
                                        <div className={`text-sm ${themeClasses.infoLabel}`}>Date of Birth</div>
                                        <div className={`${themeClasses.infoValue} font-medium`}>{formatDate(member.dob)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Membership Details */}
                        <div className={`${themeClasses.cardBackground} rounded-2xl p-6 border shadow-lg`}>
                            <h2 className={`text-xl font-semibold ${themeClasses.cardTitle} mb-4 flex items-center gap-2`}>
                                <CreditCard className="w-5 h-5 text-green-400" />
                                Membership Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`flex items-center gap-3 p-3 ${themeClasses.infoItem} rounded-lg`}>
                                    <CreditCard className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <div>
                                        <div className={`text-sm ${themeClasses.infoLabel}`}>Plan</div>
                                        <div className={`${themeClasses.infoValue} font-medium`}>{member.plan || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 ${themeClasses.infoItem} rounded-lg`}>
                                    <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <div className={`text-sm ${themeClasses.infoLabel}`}>Join Date</div>
                                        <div className={`${themeClasses.infoValue} font-medium`}>{formatDate(member.joinDate)}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 ${themeClasses.infoItem} rounded-lg md:col-span-2`}>
                                    <Calendar className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <div>
                                        <div className={`text-sm ${themeClasses.infoLabel}`}>Expiry Date</div>
                                        <div className={`${themeClasses.infoValue} font-medium`}>{formatDate(member.expiryDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {member.notes && (
                            <div className={`${themeClasses.cardBackground} rounded-2xl p-6 border shadow-lg`}>
                                <h2 className={`text-xl font-semibold ${themeClasses.cardTitle} mb-4 flex items-center gap-2`}>
                                    <FileText className="w-5 h-5 text-yellow-400" />
                                    Notes
                                </h2>
                                <div className={`p-4 ${themeClasses.infoItem} rounded-lg`}>
                                    <p className={`${themeClasses.infoLabel} leading-relaxed`}>{member.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Sidebar */}
                    <div className="space-y-6 w-100">
                        <div className={`${themeClasses.sidebarCard1} rounded-2xl p-6 border shadow-lg`}>
                            <h3 className={`text-lg font-semibold ${themeClasses.sidebarTitle} mb-4`}>Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={themeClasses.sidebarLabel}>Member ID</span>
                                    <span className={themeClasses.sidebarValueMono}>#{member._id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={themeClasses.sidebarLabel}>Status</span>
                                    <span className={`font-medium ${member.status === 'active' ? 'text-green-400' : member.status.toLowerCase() === 'inactive' ? 'text-red-400' : 'text-yellow-400'}`}>
                                        {member.status || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className={themeClasses.sidebarLabel}>Plan Type</span>
                                    <span className={`${themeClasses.sidebarValue} font-medium`}>{member.plan || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={`${themeClasses.sidebarCard2} rounded-2xl p-6 border shadow-lg`}>
                            <h3 className={`text-lg font-semibold ${themeClasses.sidebarTitle} mb-4`}>Membership Timeline</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className={`absolute left-2 top-2 w-2 h-2 ${themeClasses.timelineDot1} rounded-full`}></div>
                                    <div className="pl-6">
                                        <div className={`text-sm ${themeClasses.sidebarLabel}`}>Last Renewal</div>
                                        <div className={`${themeClasses.sidebarValue} font-medium`}>{formatDate(member.renewalDate)}</div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className={`absolute left-2 top-2 w-2 h-2 ${themeClasses.timelineDot2} rounded-full`}></div>
                                    <div className="pl-6">
                                        <div className={`text-sm ${themeClasses.sidebarLabel}`}>Expires</div>
                                        <div className={`${themeClasses.sidebarValue} font-medium`}>{formatDate(member.expiryDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className={`text-xl ${themeClasses.tableTitle} font-bold mt-6 mb-2`}>Payment History</h2>
                <div className="overflow-hidden rounded-lg shadow-lg">
                    <table className={`w-full text-sm text-left border ${themeClasses.tableContainer} table-auto`}>
                        <thead className={themeClasses.tableHeader}>
                            <tr>
                                <th className={`px-6 py-3 ${themeClasses.tableHeaderText} font-semibold`}>Date</th>
                                <th className={`px-6 py-3 ${themeClasses.tableHeaderText} font-semibold`}>Amount</th>
                                <th className={`px-6 py-3 ${themeClasses.tableHeaderText} font-semibold`}>Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentHistory.map((payment, index) => (
                                <tr
                                    key={index} 
                                    className={`border-b ${themeClasses.tableRow} ${themeClasses.tableRowHover} transition-colors`}
                                >
                                    <td className={`px-6 py-4 ${themeClasses.tableCellText} font-medium`}>{formatDate2(payment.date)}</td>
                                    <td className={`px-6 py-4 ${themeClasses.tableCellText} font-medium`}>₹{payment.amount}</td>
                                    <td className={`px-6 py-4 ${themeClasses.tableCellText} font-medium`}>{payment.method}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MemberDetails;