import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Users, CreditCard, DollarSign, IndianRupee, FileText, CheckCircle2, ChevronDown, MapPin, Sun, Moon } from 'lucide-react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/utils/ThemeContext.jsx';
import toast from 'react-hot-toast';

function CreateMember() {
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dob: '',
    plan: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    amount: '',
    paymentMethod: '',
    notes: '',
  });

  const [expiryDate, setExpiryDate] = useState('');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const planDurations = settings?.membershipPlans?.reduce((acc, plan) => {
    acc[plan.name] = plan.durationInMonths;
    return acc;
  }, {}) || {
    '': 0,
  };

  const { isDarkMode } = useTheme();
  // Theme-based classes
  const themeClasses = {
    background: isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900',
    backgroundGradient: isDarkMode
      ? 'bg-gradient-to-br from-slate-900 via-blue-900/10 to-purple-900/10'
      : 'bg-gradient-to-br from-gray-50 via-blue-50/10 to-purple-50/10',
    overlay: isDarkMode ? 'bg-slate-900/20' : 'bg-gray-100/20',
    headerButton: isDarkMode
      ? 'bg-slate-800/90 border-slate-700/50 hover:bg-slate-700/90 text-white'
      : 'bg-white/90 border-gray-200/50 hover:bg-gray-100/90 text-gray-900',
    titleText: isDarkMode ? 'text-white' : 'text-gray-900',
    subtitleText: isDarkMode ? 'text-slate-400' : 'text-gray-600',
    formContainer: isDarkMode
      ? 'bg-slate-800/70 backdrop-blur-sm border-slate-700/50'
      : 'bg-white/70 backdrop-blur-sm border-gray-200/50',
    sectionHeaderBg: isDarkMode ? 'bg-cyan-500' : 'bg-blue-500',
    sectionHeaderText: isDarkMode ? 'text-white' : 'text-gray-900',
    sectionBorder: isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50',
    label: isDarkMode ? 'text-slate-300' : 'text-gray-700',
    input: isDarkMode
      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20'
      : 'bg-gray-100/50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20',
    inputIcon: isDarkMode ? 'text-slate-400 group-focus-within:text-cyan-400' : 'text-gray-400 group-focus-within:text-blue-500',
    inputDisabled: isDarkMode
      ? 'bg-slate-600/50 border-slate-600/50 text-slate-400'
      : 'bg-gray-200/50 border-gray-300/50 text-gray-500',
    inputDisabledIcon: isDarkMode ? 'text-slate-500' : 'text-gray-400',
    amountDisplayBg: isDarkMode
      ? 'bg-green-900/30 border-green-600/30'
      : 'bg-green-100/50 border-green-300/50',
    amountDisplayIcon: isDarkMode ? 'text-green-400' : 'text-green-600',
    amountDisplayText: isDarkMode ? 'text-green-400' : 'text-green-600',
    amountDisplaySubtext: isDarkMode ? 'text-green-300' : 'text-green-700',
    submitButton: isDarkMode
      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    toggleHover: isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100',
    sunColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-500',
    moonColor: isDarkMode ? 'text-gray-400' : 'text-gray-700',
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/members', {
        ...formData,
        renewalDate: formData.joinDate,
        expiryDate,
      });
      toast.success(`${formData.name} added successfully!`);
      navigate('/members');
    } catch (err) {
      console.error("Create member failed", err);
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} relative`}>
      {/* Theme Toggle Button - Fixed Position */}
      {/* <div className="fixed top-6 right-6 z-50">
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
      </div> */}

      {/* Clean background */}
      <div className={`absolute inset-0 ${themeClasses.backgroundGradient}`}></div>
      <div className={`absolute inset-0 ${themeClasses.overlay}`}></div>

      {/* Content */}
      <div className={`relative z-10 p-6 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`p-3 rounded-xl ${themeClasses.headerButton} transition-all duration-200 shadow-sm`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className={`text-2xl font-bold ${themeClasses.titleText}`}>Add New Member</h1>
            <p className={`${themeClasses.subtitleText} mt-1`}>Create a new membership account</p>
          </div>
        </div>

        {/* Form Container */}
        <div className={`${themeClasses.formContainer} rounded-2xl border shadow-xl w-full mx-auto`}>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Personal Information Section */}
              <div>
                <div className={`flex items-center gap-3 mb-6 pb-3 border-b ${themeClasses.sectionBorder}`}>
                  <div className={`p-2 ${themeClasses.sectionHeaderBg} rounded-lg`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-xl font-semibold ${themeClasses.sectionHeaderText}`}>Personal Information</h2>
                </div>

                <div className="space-y-6">

                  {/* First Row: Name, Phone, Email */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Name Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Home Address (Full Width) */}
                  <div className="grid grid-cols-1 gap-6">

                    {/* Address Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Home Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter home address"
                          className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Third Row: Gender, DOB */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Gender Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Gender *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                        </div>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200 appearance-none cursor-pointer`}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* DOB Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Date of Birth
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Membership Information Section */}
              <div>
                <div className={`flex items-center gap-3 mb-6 pb-3 border-b ${themeClasses.sectionBorder}`}>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-xl font-semibold ${themeClasses.sectionHeaderText}`}>Membership Information</h2>
                </div>

                <div className="space-y-6">

                  {/* First Row: Join Date, Membership Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Join Date Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Join Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <input
                          type="date"
                          name="joinDate"
                          value={formData.joinDate}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                          required
                        />
                      </div>
                    </div>

                    {/* Plan Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Membership Plan *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                        </div>
                        <select
                          name="plan"
                          value={formData.plan}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200 appearance-none cursor-pointer`}
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
                    </div>
                  </div>

                  {/* Second Row: Amount, Payment Method, Expiry Date */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Amount Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Amount (₹) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className={`w-4 h-4 ${themeClasses.inputDisabledIcon}`} />
                        </div>
                        <input
                          name="amount"
                          type="number"
                          value={formData.amount}
                          disabled
                          placeholder="Amount"
                          className={`w-full pl-10 pr-4 py-3 ${themeClasses.inputDisabled} rounded-lg cursor-not-allowed`}
                        />
                      </div>
                    </div>

                    {/* Payment Method Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Payment Method *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                        </div>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200 appearance-none cursor-pointer`}
                          required
                        >
                          <option value="">Select Method</option>
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="Card">Card</option>
                        </select>
                      </div>
                    </div>

                    {/* Expiry Date Field */}
                    <div className="group">
                      <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                        Plan Expiry Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className={`w-4 h-4 ${themeClasses.inputDisabledIcon}`} />
                        </div>
                        <input
                          type="date"
                          value={expiryDate}
                          disabled
                          className={`w-full pl-10 pr-4 py-3 ${themeClasses.inputDisabled} rounded-lg cursor-not-allowed`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              {formData.amount && (
                <div className={`${themeClasses.amountDisplayBg} border rounded-xl p-6 text-center`}>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {/* <IndianRupee className={`w-6 h-6 ${themeClasses.amountDisplayIcon}`} /> */}
                    <span className={`text-3xl font-bold ${themeClasses.amountDisplayText}`}>
                      ₹{formData.amount}
                    </span>
                  </div>
                  <p className={`${themeClasses.amountDisplaySubtext} text-sm`}>Total Amount to be Paid</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 cursor-pointer ${themeClasses.submitButton} rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateMember;