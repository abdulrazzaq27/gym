import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios'; // ✅ Adjust path if needed
import { User, Mail, Phone, Calendar, CreditCard, Shield, FileText, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RenewMember = () => {

    const { id } = useParams();

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        plan: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        amount: '',
        paymentMethod: '',
        notes: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === 'plan') {
                return {
                    ...prev,
                    plan: value,
                    amount: planPrices[value] || '', // auto-update amount
                };
            }

            return { ...prev, [name]: value };
        });
    };
    const [expiryDate, setExpiryDate] = useState('');

    useEffect(() => {
        if (formData.plan && formData.joinDate) {
            const renewal = new Date(formData.joinDate);
            const expiry = new Date(renewal);
            expiry.setMonth(expiry.getMonth() + planDurations[formData.plan]);
            setExpiryDate(expiry.toISOString().split('T')[0]);
        } else {
            setExpiryDate('');
        }
    }, [formData.plan, formData.joinDate]);

    useEffect(() => {
        axios.get(`/api/members/${id}`)
            .then(res => setMember(res.data))
            .catch(err => console.error("Error fetching member:", err));
    }, [id]);

    const planDurations = {
        '': 0,
        Monthly: 1,
        Quarterly: 3,
        'Half-Yearly': 6,
        Yearly: 12,
    };

    const planPrices = {
        Monthly: 1000,
        Quarterly: 2700,
        'Half-Yearly': 5100,
        Yearly: 9600,
    };

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
            case 'active': return <CheckCircle className="w-8 h-8" />;
            case 'inactive': return <XCircle className="w-6 h-6" />;
            case 'suspended': return <Clock className="w-4 h-4" />;
            default: return <Shield className="w-4 h-4" />;
        }
    }

    if (!member) {
        return <div className="text-white text-center">Loading member info...</div>;
    }


    return (
        <>
            <div className="w-full flex justify-center mb-6">
                <h1 className="text-3xl font-bold text-white">Renew Member</h1>
            </div>

            <div className="mb-8">
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 hover:cursor-pointer text-gray-300 hover:text-blue-300 transition-colors duration-200 mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Details
                </button>
                <div className='flex justify-center gap-4 mb-2'>

                    <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                    </div>
                </div>

                <div className="flex justify-center gap-4 mb-2">

                    <div>
                        <h1 className="text-4xl font-bold text-white mb-1">{member.name}</h1>
                    </div>

                </div>
                <div className="flex justify-center mb-2">
                    <div className={`w-64 h-16 flex items-center justify-center px-3 py-1 rounded-full text-2xl font-medium ${getStatusColor(member.status)}`}>
                        <div className="flex items-center justify-center gap-2">
                            {getStatusIcon(member.status)}
                            <span>{member.status || 'Unknown'}</span>
                        </div>
                    </div>
                </div>

            </div>

            <div className='lg:col-span-2 space-y-6'>
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
            </div>

            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">Membership Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="joinDate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Renewal Date*
                        </label>
                        <input
                            id="joinDate"
                            type="date"
                            name="joinDate"
                            value={formData.joinDate}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="plan" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Membership Plan *
                        </label>
                        <select
                            id="plan"
                            name="plan"
                            value={formData.plan}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            required
                        >
                            <option value="">Select Plan</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly (3 months)</option>
                            <option value="Half-Yearly">Half-Yearly (6 months)</option>
                            <option value="Yearly">Yearly (12 months)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="expiryDate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Plan Expiry Date
                        </label>
                        <input
                            id="expiryDate"
                            name="expiryDate"
                            type="date"
                            value={expiryDate}
                            disabled
                            className="w-full p-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 rounded-lg text-gray-700 dark:text-white cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white cursor-not-allowed"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="paymentMethod" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Method *
                        </label>
                        <select
                            id="paymentMethod"
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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

            {!formData.amount ? ('') :
                (<h1 className='text-4xl flex font-bold justify-center text-green-500'>Total Amount to be Paid: {formData.amount}</h1>)}

            {/* Submit Button */}
            <div className="pt-6 flex justify-center">
                <button
                    type="submit"
                    style={{ backgroundColor: '#5a6eff' }}
                    className="w-3/4 bg-green-600 text-black py-3 px-8 rounded-lg hover:bg-green-700 hover:cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all font-semibold text-lg"
                >
                    Renew
                </button>
            </div>

        </>
    )
}

export default RenewMember