import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios'; // ✅ Adjust path if needed
import { User, Mail, Phone, Calendar, CreditCard, Shield, FileText, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


function MemberDetails() {

    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);

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

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Member not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="w-full py-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/members')}
                        className="inline-flex items-center gap-2 hover:cursor-pointer text-gray-300 hover:text-blue-300 transition-colors duration-200 mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back to Members
                    </button>



                    <div className="flex justify-center gap-4 mb-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-1">{member.name}</h1>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                                {getStatusIcon(member.status)}
                                {member.status || 'Unknown'}
                            </div>
                        </div>
                        {/*******************  Renew button *****************/}
                        {member.status.toLowerCase() === 'inactive' ?
                            (<button
                                onClick={handleSubmit}
                                className="bg-green-600 z-10 mt-3 ml-16 text-white py-3 h-12 px-6 hover:cursor-pointer rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all font-semibold text-lg">
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
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-400" />
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                    <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-400">Email</div>
                                        <div className="text-white font-medium">{member.email || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                    <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-400">Phone</div>
                                        <div className="text-white font-medium">{member.phone || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                    <User className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-400">Gender</div>
                                        <div className="text-white font-medium">{member.gender || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                    <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-400">Date of Birth</div>
                                        <div className="text-white font-medium">{formatDate(member.dob)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Membership Details */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-green-400" />
                                Membership Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-400">Plan</div>
                                        <div className="text-white font-medium">{member.plan || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-400">Join Date</div>
                                        <div className="text-white font-medium">{formatDate(member.joinDate)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg md:col-span-2">
                                    <Calendar className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm text-gray-400">Expiry Date</div>
                                        <div className="text-white font-medium">{formatDate(member.expiryDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {member.notes && (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-yellow-400" />
                                    Notes
                                </h2>
                                <div className="p-4 bg-gray-900/30 rounded-lg">
                                    <p className="text-gray-300 leading-relaxed">{member.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Sidebar */}
                    <div className="space-y-6 w-100">
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Member ID</span>
                                    <span className="text-white font-mono">#{member._id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Status</span>
                                    <span className={`font-medium ${member.status === 'active' ? 'text-green-400' : member.status.toLowerCase() === 'inactive' ? 'text-red-400' : 'text-yellow-400'}`}>
                                        {member.status || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Plan Type</span>
                                    <span className="text-white font-medium">{member.plan || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
                            <h3 className="text-lg font-semibold text-white mb-4">Membership Timeline</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-2 top-2 w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <div className="pl-6">
                                        <div className="text-sm text-gray-400">Last Renewal</div>
                                        <div className="text-white font-medium">{formatDate(member.renewalDate)}</div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-2 top-2 w-2 h-2 bg-red-400 rounded-full"></div>
                                    <div className="pl-6">
                                        <div className="text-sm text-gray-400">Expires</div>
                                        <div className="text-white font-medium">{formatDate(member.expiryDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl text-white font-bold mt-6 mb-2">Payment History</h2>
            <table className="w-full text-sm text-left border border-gray-600 rounded-lg overflow-hidden table-auto">
              <thead className="bg-black">
                <tr>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Date</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Amount</th>
                  <th className="px-6 py-3 text-gray-200 font-semibold">Method</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {paymentHistory.map((payment) => (
                  <tr
                    key={member._id} className="border-b border border-gray-600  transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{formatDate2(payment.date)}</td>
                    <td className="px-6 py-4 text-white font-medium">{payment.amount}</td>
                    <td className="px-6 py-4 text-white font-medium">{payment.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>

        </div>
    );
}

export default MemberDetails;