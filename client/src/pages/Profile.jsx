import { useState, useEffect } from 'react';
import { User, Mail, Building, Code, Lock, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/utils/ThemeContext.jsx';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Theme classes
  const themeClasses = {
    background: isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900',
    backgroundGradient: isDarkMode 
      ? 'bg-gradient-to-br from-slate-900 via-blue-900/10 to-purple-900/10' 
      : 'bg-gradient-to-br from-gray-50 via-blue-50/10 to-purple-50/10',
    card: isDarkMode 
      ? 'bg-slate-800/70 backdrop-blur-sm border-slate-700/50' 
      : 'bg-white/70 backdrop-blur-sm border-gray-200/50',
    headerButton: isDarkMode 
      ? 'bg-slate-800/90 border-slate-700/50 hover:bg-slate-700/90 text-white' 
      : 'bg-white/90 border-gray-200/50 hover:bg-gray-100/90 text-gray-900',
    titleText: isDarkMode ? 'text-white' : 'text-gray-900',
    subtitleText: isDarkMode ? 'text-slate-400' : 'text-gray-600',
    label: isDarkMode ? 'text-slate-300' : 'text-gray-700',
    input: isDarkMode 
      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20' 
      : 'bg-gray-100/50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20',
    inputDisabled: isDarkMode 
      ? 'bg-slate-600/50 border-slate-600/50 text-slate-400 cursor-not-allowed' 
      : 'bg-gray-200/50 border-gray-300/50 text-gray-500 cursor-not-allowed',
    inputIcon: isDarkMode ? 'text-slate-400 group-focus-within:text-cyan-400' : 'text-gray-400 group-focus-within:text-blue-500',
    button: isDarkMode 
      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    sectionBorder: isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50',
    avatar: isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-purple-500',
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/profile');
      setUser(res.data);
      setName(res.data.name);
      setEmail(res.data.email);
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/auth/profile', { name, email });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} relative`}>
      <div className={`absolute inset-0 ${themeClasses.backgroundGradient}`}></div>
      
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`p-3 rounded-xl ${themeClasses.headerButton} transition-all duration-200 shadow-sm hover:cursor-pointer`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.titleText}`}>Profile</h1>
            <p className={`${themeClasses.subtitleText} mt-1`}>Manage your account settings</p>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className={`${themeClasses.card} rounded-2xl border shadow-xl p-8 mb-6`}>
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 ${themeClasses.avatar} rounded-full flex items-center justify-center shadow-lg`}>
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${themeClasses.titleText}`}>{user?.name}</h2>
              <p className={`${themeClasses.subtitleText} mt-1`}>{user?.email}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className={`${themeClasses.card} rounded-2xl border shadow-xl p-6`}>
            <h3 className={`text-xl font-semibold ${themeClasses.titleText} mb-6 pb-3 border-b ${themeClasses.sectionBorder}`}>
              Personal Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="group">
                <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full ${themeClasses.button} text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:cursor-pointer`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Gym Information */}
          <div className={`${themeClasses.card} rounded-2xl border shadow-xl p-6`}>
            <h3 className={`text-xl font-semibold ${themeClasses.titleText} mb-6 pb-3 border-b ${themeClasses.sectionBorder}`}>
              Gym Information
            </h3>
            <div className="space-y-4">
              <div className="group">
                <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                  Gym Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className={`w-4 h-4 ${themeClasses.inputIcon}`} />
                  </div>
                  <input
                    type="text"
                    value={user?.gymName || 'N/A'}
                    disabled
                    className={`w-full pl-10 pr-4 py-3 ${themeClasses.inputDisabled} rounded-lg`}
                  />
                </div>
              </div>

              <div className="group">
                <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                  Gym Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Code className={`w-4 h-4 ${themeClasses.inputIcon}`} />
                  </div>
                  <input
                    type="text"
                    value={user?.gymCode || 'N/A'}
                    disabled
                    className={`w-full pl-10 pr-4 py-3 ${themeClasses.inputDisabled} rounded-lg`}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-100/50'}`}>
                <p className={`text-sm ${themeClasses.subtitleText}`}>
                  Gym information is managed by your administrator and cannot be changed here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className={`${themeClasses.card} rounded-2xl border shadow-xl p-6 mt-6`}>
          <h3 className={`text-xl font-semibold ${themeClasses.titleText} mb-6 pb-3 border-b ${themeClasses.sectionBorder}`}>
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-2xl">
            <div className="group">
              <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-400 transition-colors hover:cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="group">
              <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-400 transition-colors hover:cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="group">
              <label className={`block text-sm font-medium ${themeClasses.label} mb-2`}>
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`w-4 h-4 ${themeClasses.inputIcon} transition-colors duration-200`} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 ${themeClasses.input} rounded-lg focus:outline-none focus:ring-1 transition-all duration-200`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-400 transition-colors hover:cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className={`${themeClasses.button} text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:cursor-pointer`}
            >
              {changingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
