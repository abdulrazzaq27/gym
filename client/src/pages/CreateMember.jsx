
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

function CreateMember() {
  const navigate = useNavigate();

  function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    plan: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    notes: '',
  });

  const [expiryDate, setExpiryDate] = useState('');

  const planDurations = {
    '': 0,
    Monthly: 1,
    Quarterly: 3,
    'Half-Yearly': 6,
    Yearly: 12,
  };

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/members', {
        ...formData,
        renewalDate: formData.joinDate,
        expiryDate,
      });
      navigate('/');
    } catch (err) {
      console.error("Create member failed", err);
    }
  };

  return (
    <div className="w-full max-w-none flex flex-col items-start">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Add New Member</h1>
      </div>

      {/* Light-themed form card */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Personal Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name *
                </label>
                <input 
                  id="name"
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Enter full name" 
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input 
                  id="email"
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Enter email address" 
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                />
              </div>

              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number *
                </label>
                <input 
                  id="phone"
                  name="phone" 
                  type="tel"
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Enter phone number" 
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender *
                </label>
                <select 
                  id="gender"
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="dob" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <input 
                  id="dob"
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange} 
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                />
              </div>
            </div>
          </div>

          {/* Membership Information Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">Membership Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="joinDate" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Join Date *
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

              {expiryDate && (
                <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-blue-800 dark:text-blue-300 font-medium">
                    📅 Plan Expires On: {formatDate(expiryDate)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Duration: {planDurations[formData.plan]} month{planDurations[formData.plan] > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all font-semibold text-lg"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMember;
