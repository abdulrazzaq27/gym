import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { useTheme } from '../components/utils/ThemeContext.jsx';

import { 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    CreditCard, 
    Shield, 
    FileText, 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Clock,
    DollarSign,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RenewMember = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isDarkMode } = useTheme();

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        plan: '',
        renewalDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        amount: '',
        paymentMethod: '',
        notes: '',
    });

    const [settings, setSettings] = useState(null);

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
        formCard: isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
        backButton: isDarkMode 
            ? 'text-gray-300 hover:text-blue-300' 
            : 'text-gray-600 hover:text-blue-600',
        input: isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500',
        disabledInput: isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-gray-300 cursor-not-allowed' 
            : 'bg-gray-200 border-gray-300 text-gray-600 cursor-not-allowed',
        label: isDarkMode ? 'text-gray-300' : 'text-gray-700',
        infoItem: isDarkMode ? 'bg-gray-900/30' : 'bg-gray-100/50',
        infoLabel: isDarkMode ? 'text-gray-400' : 'text-gray-600',
        infoValue: isDarkMode ? 'text-white' : 'text-gray-900',
        submitButton: isDarkMode 
            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
        loadingText: isDarkMode ? 'text-white' : 'text-gray-900',
        amountDisplay: isDarkMode ? 'text-green-400' : 'text-green-600',
        sectionTitle: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === 'plan') {
                const selectedPlan = settings?.membershipPlans?.find(
                    (p) => p.name === value
                );
                return {
                    ...prev,
                    plan: value,
                    amount: selectedPlan ? selectedPlan.price : '',
                };
            }

            return { ...prev, [name]: value };
        });
    };

    const [expiryDate, setExpiryDate] = useState('');

    // make sure no direct access to renew member by manual entering url
    useEffect(() => {
        async function checkMemberStatus(e) {
            try {
                const res = await axios.get(`/api/members/${id}`);
                const member = res.data;

                if (member.status === 'Active') {
                    // redirect to details page if already active
                    navigate(`/members/${id}`, { replace: true });
                }
            } catch (err) {
                console.error("Error fetching member:", err);
                // Optional: navigate to 404 or error page
                navigate('/members', { replace: true });
            }
        }

        checkMemberStatus();
    }, [id, navigate]);

    useEffect(() => {
        if (formData.plan && formData.renewalDate) {
            const renewal = new Date(formData.renewalDate);
            const expiry = new Date(renewal);
            expiry.setMonth(expiry.getMonth() + planDurations[formData.plan]);
            setExpiryDate(expiry.toISOString().split('T')[0]);
        } else {
            setExpiryDate('');
        }
    }, [formData.plan, formData.renewalDate]);

    useEffect(() => {
        axios.get(`/api/members/${id}`)
            .then(res => setMember(res.data))
            .catch(err => console.error("Error fetching member:", err));
    }, [id]);

    const planDurations = settings?.membershipPlans?.reduce((acc, plan) => {
        acc[plan.name] = plan.durationInMonths;
        return acc;
    }, {}) || {
        '': 0,
    };

    useEffect(() => {
        // Load settings (including membership pricing)
        async function fetchSettings() {
            try {
                const res = await axios.get('/api/settings');
                setSettings(res.data);
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        }

        fetchSettings();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`/api/members/renew/${id}`, {
                renewalDate: formData.renewalDate,
                expiryDate,
                status: 'Active',
                plan: formData.plan,
                amount: formData.amount,
                paymentMethod: formData.paymentMethod,
            });

            navigate(`/members/${id}`, { replace: true });
        }
        catch (e) {
            console.log("Error renewing member ", e);
            alert('Error Renewing Member...');
        } finally {
            setLoading(false);
        }
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

    function getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'active': return isDarkMode ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-100/50';
            case 'inactive': return isDarkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-100/50';
            case 'suspended': return isDarkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-100/50';
            default: return isDarkMode ? 'text-gray-400 bg-gray-900/20' : 'text-gray-600 bg-gray-100/50';
        }
    }

    function getStatusIcon(status) {
        switch (status?.toLowerCase()) {
            case 'active': return <CheckCircle className="w-8 h-8" />;
            case 'inactive': return <XCircle className="w-6 h-6" />;
            case 'suspended': return <Clock className="w-4 h-4" />;
            default: return <Shield className="w-4 h-4" />;
        }
    }

    if (!member) {
        return (
            <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className={`text-center ${themeClasses.loadingText}`}>Loading member info...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeClasses.background}`}>
            <div className="p-6">
                {/* Header */}
                <div className="w-full flex justify-center mb-6">
                    <div className="flex items-center gap-3">
                        <RefreshCw className={`w-8 h-8 ${themeClasses.primaryText}`} />
                        <h1 className={`text-3xl font-bold ${themeClasses.primaryText}`}>Renew Member</h1>
                    </div>
                </div>

                {/* Back Button and Member Info */}
                <div className="mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className={`inline-flex items-center gap-2 hover:cursor-pointer ${themeClasses.backButton} transition-colors duration-200 mb-6 group`}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back to Details
                    </button>

                    {/* Member Profile Card */}
                    <div className={`${themeClasses.cardBackground} rounded-2xl p-6 border shadow-lg mb-6`}>
                        <div className='flex justify-center gap-4 mb-4'>
                            <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                                <User className="w-20 h-20 text-white" />
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mb-4">
                            <div>
                                <h1 className={`text-4xl font-bold ${themeClasses.primaryText} mb-1 text-center`}>{member.name}</h1>
                            </div>
                        </div>

                        <div className="flex justify-center mb-4">
                            <div className={`flex items-center justify-center px-6 py-3 rounded-full text-xl font-medium ${getStatusColor(member.status)} border shadow-md`}>
                                <div className="flex items-center justify-center gap-2">
                                    {getStatusIcon(member.status)}
                                    <span>{member.status || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className={`${themeClasses.cardBackground} rounded-2xl p-6 border shadow-lg mb-6`}>
                        <h2 className={`text-xl font-semibold ${themeClasses.primaryText} mb-4 flex items-center gap-2`}>
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
                </div>

                {/* Renewal Form */}
                <div className={`${themeClasses.formCard} rounded-2xl p-6 border shadow-xl`}>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <h2 className={`text-xl font-semibold ${themeClasses.primaryText} border-b ${themeClasses.sectionTitle} pb-3 mb-6 flex items-center gap-2`}>
                                <CreditCard className="w-6 h-6 text-blue-400" />
                                Membership Renewal Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="renewalDate" className={`block mb-2 text-sm font-medium ${themeClasses.label}`}>
                                        Renewal Date *
                                    </label>
                                    <input
                                        id="renewalDate"
                                        type="date"
                                        name="renewalDate"
                                        value={formData.renewalDate}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg transition-colors ${themeClasses.input}`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="plan" className={`block mb-2 text-sm font-medium ${themeClasses.label}`}>
                                        Membership Plan *
                                    </label>
                                    <select
                                        id="plan"
                                        name="plan"
                                        value={formData.plan}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg transition-colors ${themeClasses.input}`}
                                        required
                                    >
                                        <option value="">Select Plan</option>
                                        {settings?.membershipPlans
                                            ?.filter((p) => p.isActive)
                                            .map((plan) => (
                                                <option key={plan.name} value={plan.name}>
                                                    {plan.name} ({plan.durationInMonths} months)
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="expiryDate" className={`block mb-2 text-sm font-medium ${themeClasses.label}`}>
                                        Plan Expiry Date
                                    </label>
                                    <input
                                        id="expiryDate"
                                        name="expiryDate"
                                        type="date"
                                        value={expiryDate}
                                        disabled
                                        className={`w-full p-3 border rounded-lg ${themeClasses.disabledInput}`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="amount" className={`block mb-2 text-sm font-medium ${themeClasses.label}`}>
                                        Amount (₹) *
                                    </label>
                                    <input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        disabled
                                        placeholder="Amount"
                                        className={`w-full p-3 border rounded-lg ${themeClasses.disabledInput}`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="paymentMethod" className={`block mb-2 text-sm font-medium ${themeClasses.label}`}>
                                        Payment Method *
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg transition-colors ${themeClasses.input}`}
                                        required
                                    >
                                        <option value="">Select Method</option>
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Card">Card</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Amount Display */}
                        {formData.amount && (
                            <div className={`${themeClasses.cardBackground} rounded-2xl p-6 border shadow-lg mt-6`}>
                                <div className="flex items-center justify-center gap-3">
                                    <DollarSign className={`w-8 h-8 ${themeClasses.amountDisplay}`} />
                                    <h1 className={`text-4xl font-bold ${themeClasses.amountDisplay}`}>
                                        Total Amount: ₹{formData.amount}
                                    </h1>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-6 flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-3/4 ${themeClasses.submitButton} text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" />
                                        Renew Membership
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RenewMember;