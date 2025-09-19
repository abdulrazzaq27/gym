import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Users, CreditCard, DollarSign, FileText, CheckCircle2, ChevronDown, MapPin } from 'lucide-react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

function CreateMember() {
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  const planPrices = {
    Monthly: 1000,
    Quarterly: 2700,
    'Half-Yearly': 5100,
    Yearly: 9600,
  };

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
  const [loading, setLoading] = useState(false);

  const planDurations = {
    '': 0,
    Monthly: 1,
    Quarterly: 3,
    'Half-Yearly': 6,
    Yearly: 12,
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === 'plan') {
        return {
          ...prev,
          plan: value,
          amount: planPrices[value] || '',
        };
      }

      return { ...prev, [name]: value };
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     // Simulate API call
  //     await new Promise(resolve => setTimeout(resolve, 1500));

  //     // Mock success
  //     alert("Member created successfully!");
  //     navigate('/members');
  //   } catch (err) {
  //     console.error("Create member failed", err);
  //     alert("Failed to create member. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/members', {
        ...formData,
        renewalDate: formData.joinDate,
        expiryDate,
      });
      navigate('/members');
    } catch (err) {
      console.error("Create member failed", err);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Content */}
      <div className={`relative z-10 p-6 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-white/80 border border-gray-300/50 hover:bg-gray-100/80 text-gray-900 transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Member</h1>
            <p className="text-gray-500 mt-1">Create a new membership account</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-300/50 shadow-xl max-w-4xl mx-auto">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Personal Information Section */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-300/50">
                  <div className="p-2 bg-cyan-500 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                </div>

                <div className="space-y-6">

                  {/* First Row: Name, Phone, Email */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Name Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Home Address (Full Width) */}
                  <div className="grid grid-cols-1 gap-6">

                    {/* Address Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Home Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter home address"
                          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Third Row: Gender, DOB */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Gender Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Gender *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200 appearance-none cursor-pointer"
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
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Membership Information Section */}
              <div>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-300/50">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Membership Information</h2>
                </div>

                <div className="space-y-6">

                  {/* First Row: Join Date, Membership Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Join Date Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Join Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <input
                          type="date"
                          name="joinDate"
                          value={formData.joinDate}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Plan Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Membership Plan *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        <select
                          name="plan"
                          value={formData.plan}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200 appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select Plan</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly (3 months)</option>
                          <option value="Half-Yearly">Half-Yearly (6 months)</option>
                          <option value="Yearly">Yearly (12 months)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Amount, Payment Method, Expiry Date */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Amount Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Amount (₹) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          name="amount"
                          type="number"
                          value={formData.amount}
                          disabled
                          placeholder="Amount"
                          className="w-full pl-10 pr-4 py-3 bg-gray-100/50 border border-gray-300/50 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Payment Method Field */}
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Payment Method *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-600 transition-colors duration-200" />
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-3 bg-white/80 border border-gray-300/50 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all duration-200 appearance-none cursor-pointer"
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
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Plan Expiry Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="date"
                          value={expiryDate}
                          disabled
                          className="w-full pl-10 pr-4 py-3 bg-gray-100/50 border border-gray-300/50 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              {formData.amount && (
                <div className="bg-green-50 border border-green-300/50 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">
                      ₹{formData.amount}
                    </span>
                  </div>
                  <p className="text-green-700 text-sm">Total Amount to be Paid</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg font-semibold text-white transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center gap-2"
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