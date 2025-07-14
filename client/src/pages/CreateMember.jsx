import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

function CreateMember() {
  const navigate = useNavigate();

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');     // dd
    const month = String(date.getMonth() + 1).padStart(2, '0'); // mm
    const year = date.getFullYear();                          // yyyy
    return `${day}/${month}/${year}`;
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
      navigate('/members');
    } catch (err) {
      console.error("Create member failed", err);
    }
  };


  return (
    <div className="max-w-full mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg mb-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Add New Member</h1>

      <div className="space-y-6">
        {/* Personal Information Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                Full Name *
              </label>
              <input 
                id="name"
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter full name" 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required 
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                Email Address
              </label>
              <input 
                id="email"
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter email address" 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-2 font-medium text-gray-700">
                Phone Number *
              </label>
              <input 
                id="phone"
                name="phone" 
                type="tel"
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="Enter phone number" 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required 
              />
            </div>

            <div>
              <label htmlFor="gender" className="block mb-2 font-medium text-gray-700">
                Gender *
              </label>
              <select 
                id="gender"
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="dob" className="block mb-2 font-medium text-gray-700">
                Date of Birth
              </label>
              <input 
                id="dob"
                type="date" 
                name="dob" 
                value={formData.dob} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Membership Information Section */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Membership Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="joinDate" className="block mb-2 font-medium text-gray-700">
                Join Date *
              </label>
              <input 
                id="joinDate"
                type="date" 
                name="joinDate" 
                value={formData.joinDate} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required 
              />
            </div>

            <div>
              <label htmlFor="plan" className="block mb-2 font-medium text-gray-700">
                Membership Plan *
              </label>
              <select 
                id="plan"
                name="plan" 
                value={formData.plan} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required
              >
                <option value="">Select Plan</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly (3 months)</option>
                <option value="Half-Yearly">Half-Yearly (6 months)</option>
                <option value="Yearly">Yearly (12 months)</option>
              </select>
            </div>

            {/* <div>
              <label htmlFor="status" className="block mb-2 font-medium text-gray-700">
                Status
              </label>
              <select 
                id="status"
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div> */}

            {expiryDate && (
              <div className="bg-blue-50 p-4 rounded-md border border-gray-200">
                <p className="text-red-800 font-medium">
                  📅 Plan Expires On: {formatDate(expiryDate)}
                </p>
                <p className="text-sm text-black-600 mt-1">
                  Duration: {planDurations[formData.plan]} month{planDurations[formData.plan] > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        {/* <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Additional Information</h2>
          <div>
            <label htmlFor="notes" className="block mb-2 font-medium text-gray-700">
              Notes
            </label>
            <textarea 
              id="notes"
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="Enter any additional notes or comments..." 
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-24 resize-none" 
            />
          </div>
        </div> */}

        {/* Submit Button */}
        <div className="pt-6">
          <button 
            type="button" 
            onClick={handleSubmit}
            style={{ backgroundColor: '#ed5728' }}
            className="w-full text-white py-3 px-6 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-lg hover:cursor-pointer"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateMember;
