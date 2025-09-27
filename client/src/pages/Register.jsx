import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Sun, Moon, Building, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "../api/axios";

export default function EnergeticRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [gymCode, setGymCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!gymName || !gymCode) {
      setError("Gym name and code are required");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/register", { name, email, password, role: "admin", gymName, gymCode });
      // After successful registration → go to login
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    }
    finally {
      setLoading(false);
    }
  };

  // Theme-based classes
  const themeClasses = {
    background: isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900',
    backgroundGradient: isDarkMode 
      ? 'from-slate-900 via-blue-900/20 to-purple-900/20' 
      : 'from-white via-blue-50/20 to-purple-50/20',
    blob1: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-200/10',
    blob2: isDarkMode ? 'bg-green-500/10' : 'bg-green-200/10',
    blob3: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-200/10',
    navBackground: isDarkMode ? 'bg-slate-900/80' : 'bg-white/80',
    navBorder: isDarkMode ? 'border-slate-800' : 'border-gray-200',
    brandColor: isDarkMode ? 'text-cyan-400' : 'text-cyan-500',
    loginButton: isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900',
    bgImageOpacity: isDarkMode ? 'opacity-20' : 'opacity-40',
    overlayGradient: isDarkMode 
      ? 'from-slate-900/95 via-slate-900/90 to-slate-900/95' 
      : 'from-white/95 via-white/90 to-white/95',
    formBackground: isDarkMode ? 'from-slate-800/80 to-slate-900/80' : 'from-gray-100/80 to-white/80',
    formBorder: isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50',
    glowingBorder: isDarkMode ? 'from-cyan-500/20 via-blue-500/20 to-purple-500/20' : 'from-cyan-300/20 via-blue-300/20 to-purple-300/20',
    headerText: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    errorBackground: isDarkMode ? 'from-red-500/20 to-pink-500/20' : 'from-red-300/20 to-pink-300/20',
    errorBorder: isDarkMode ? 'border-red-500/50' : 'border-red-300/50',
    errorText: isDarkMode ? 'text-red-300' : 'text-red-600',
    errorPulse: isDarkMode ? 'bg-red-400' : 'bg-red-500',
    label: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    inputBackground: isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100/50',
    inputBorder: isDarkMode ? 'border-slate-600' : 'border-gray-300',
    inputPlaceholder: isDarkMode ? 'placeholder-slate-400' : 'placeholder-gray-400',
    inputText: isDarkMode ? 'text-white' : 'text-gray-900',
    inputFocusBorder: isDarkMode ? 'focus:border-cyan-400' : 'focus:border-cyan-500',
    inputFocusRing: isDarkMode ? 'focus:ring-cyan-400/20' : 'focus:ring-cyan-500/20',
    inputIcon: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    inputIconFocus: isDarkMode ? 'group-focus-within:text-cyan-400' : 'group-focus-within:text-cyan-500',
    inputToggle: isDarkMode ? 'text-slate-400 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-500',
    termsText: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    termsLink: isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-500 hover:text-cyan-400',
    dividerBorder: isDarkMode ? 'border-slate-600' : 'border-gray-300',
    dividerBg: isDarkMode ? 'bg-slate-800/80' : 'bg-gray-100/80',
    dividerText: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    signInButtonBorder: isDarkMode ? 'border-slate-600' : 'border-gray-300',
    signInButtonText: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    signInButtonHoverBg: isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100',
    signInButtonHoverBorder: isDarkMode ? 'hover:border-cyan-400' : 'hover:border-cyan-500',
    signInButtonHoverText: isDarkMode ? 'hover:text-cyan-400' : 'hover:text-cyan-500',
    toggleHover: isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100',
    sunColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-500',
    moonColor: isDarkMode ? 'text-gray-400' : 'text-gray-700',
    extraBlob1: isDarkMode ? 'bg-green-400/10' : 'bg-green-200/10',
    extraBlob2: isDarkMode ? 'bg-emerald-400/10' : 'bg-emerald-200/10',
  };

  return (
    <div className={`h-screen ${themeClasses.background} overflow-hidden relative flex flex-col`}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${themeClasses.backgroundGradient}`}></div>
        <div className={`absolute top-1/4 -left-40 w-80 h-80 ${themeClasses.blob1} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-1/4 -right-40 w-96 h-96 ${themeClasses.blob2} rounded-full blur-3xl animate-pulse delay-1000`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${themeClasses.blob3} rounded-full blur-3xl animate-pulse delay-2000`}></div>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/background.jpg"
          alt="Fitness background"
          className={`w-full h-full object-cover ${themeClasses.bgImageOpacity}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.overlayGradient}`}></div>
      </div>

      {/* Navigation */}
      <nav className={`w-full ${themeClasses.navBackground} backdrop-blur-xl border-b ${themeClasses.navBorder} flex-shrink-0`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-30"></span>
              <span className={`relative ${themeClasses.brandColor}`}>FitZone</span>
            </span>
          </div>
          <div className="flex gap-4 items-center">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${themeClasses.toggleHover}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className={`w-5 h-5 ${themeClasses.sunColor}`} />
              ) : (
                <Moon className={`w-5 h-5 ${themeClasses.moonColor}`} />
              )}
            </button>
            <button 
              onClick={() => navigate("/login")}
              className={`px-6 py-2 ${themeClasses.loginButton} transition-colors duration-300`}
            >
              Login
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className={`w-full max-w-sm transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Form Container */}
          <div className={`bg-gradient-to-br ${themeClasses.formBackground} backdrop-blur-xl rounded-xl p-4 shadow-2xl border ${themeClasses.formBorder} relative overflow-hidden`}>
            {/* Glowing border effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.glowingBorder} rounded-xl blur-xl opacity-50`}></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-1">
                  Join{' '}
                  <span className="relative inline-block">
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-50"></span>
                    <span className={`relative ${themeClasses.brandColor}`}>FitZone</span>
                  </span>
                </h2>
                <p className={`text-xs ${themeClasses.headerText}`}>Create your gym management account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`bg-gradient-to-r ${themeClasses.errorBackground} border ${themeClasses.errorBorder} ${themeClasses.errorText} p-2 rounded-lg mb-3 backdrop-blur-sm animate-shake`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${themeClasses.errorPulse} rounded-full animate-pulse`}></div>
                    <span className="text-xs">{error}</span>
                  </div>
                </div>
              )}

              {/* Register Form */}
              <div className="space-y-3">
                {/* Name Field */}
                <div className="group">
                  <label className={`block font-medium mb-1 text-sm ${themeClasses.label}`}>Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`w-4 h-4 ${themeClasses.inputIcon} ${themeClasses.inputIconFocus} transition-colors duration-300`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-2 ${themeClasses.inputBackground} border ${themeClasses.inputBorder} rounded-lg ${themeClasses.inputText} text-sm ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocusBorder} focus:ring-1 ${themeClasses.inputFocusRing} transition-all duration-300 backdrop-blur-sm`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="group">
                  <label className={`block font-medium mb-1 text-sm ${themeClasses.label}`}>Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`w-4 h-4 ${themeClasses.inputIcon} ${themeClasses.inputIconFocus} transition-colors duration-300`} />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={`w-full pl-10 pr-4 py-2 ${themeClasses.inputBackground} border ${themeClasses.inputBorder} rounded-lg ${themeClasses.inputText} text-sm ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocusBorder} focus:ring-1 ${themeClasses.inputFocusRing} transition-all duration-300 backdrop-blur-sm`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Gym Name Field */}
                <div className="group">
                  <label className={`block font-medium mb-1 text-sm ${themeClasses.label}`}>Gym Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className={`w-4 h-4 ${themeClasses.inputIcon} ${themeClasses.inputIconFocus} transition-colors duration-300`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your gym name"
                      className={`w-full pl-10 pr-4 py-2 ${themeClasses.inputBackground} border ${themeClasses.inputBorder} rounded-lg ${themeClasses.inputText} text-sm ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocusBorder} focus:ring-1 ${themeClasses.inputFocusRing} transition-all duration-300 backdrop-blur-sm`}
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Gym Code Field */}
                <div className="group">
                  <label className={`block font-medium mb-1 text-sm ${themeClasses.label}`}>Gym Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Code className={`w-4 h-4 ${themeClasses.inputIcon} ${themeClasses.inputIconFocus} transition-colors duration-300`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your gym code (e.g., OSM001)"
                      className={`w-full pl-10 pr-4 py-2 ${themeClasses.inputBackground} border ${themeClasses.inputBorder} rounded-lg ${themeClasses.inputText} text-sm ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocusBorder} focus:ring-1 ${themeClasses.inputFocusRing} transition-all duration-300 backdrop-blur-sm`}
                      value={gymCode}
                      onChange={(e) => setGymCode(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className={`block font-medium mb-1 text-sm ${themeClasses.label}`}>Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`w-4 h-4 ${themeClasses.inputIcon} ${themeClasses.inputIconFocus} transition-colors duration-300`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-10 py-2 ${themeClasses.inputBackground} border ${themeClasses.inputBorder} rounded-lg ${themeClasses.inputText} text-sm ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocusBorder} focus:ring-1 ${themeClasses.inputFocusRing} transition-all duration-300 backdrop-blur-sm`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center ${themeClasses.inputToggle} transition-colors duration-300`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="group">
                  <label className={`block font-medium mb-1 text-sm ${themeClasses.label}`}>Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckCircle className={`w-4 h-4 ${themeClasses.inputIcon} ${themeClasses.inputIconFocus} transition-colors duration-300`} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`w-full pl-10 pr-10 py-2 ${themeClasses.inputBackground} border ${themeClasses.inputBorder} rounded-lg ${themeClasses.inputText} text-sm ${themeClasses.inputPlaceholder} focus:outline-none ${themeClasses.inputFocusBorder} focus:ring-1 ${themeClasses.inputFocusRing} transition-all duration-300 backdrop-blur-sm`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center ${themeClasses.inputToggle} transition-colors duration-300`}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="text-center">
                  <p className={`text-xs ${themeClasses.termsText}`}>
                    By registering, you agree to our{' '}
                    <button className={`${themeClasses.termsLink} underline transition-colors duration-300`}>
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button className={`${themeClasses.termsLink} underline transition-colors duration-300`}>
                      Privacy Policy
                    </button>
                  </p>
                </div>

                {/* Register Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                  
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>

                {/* Divider */}
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${themeClasses.dividerBorder}`}></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className={`px-3 ${themeClasses.dividerBg} ${themeClasses.dividerText}`}>or</span>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className={`mb-2 text-xs ${themeClasses.termsText}`}>
                    Already have an account?
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className={`group px-4 py-1.5 border ${themeClasses.signInButtonBorder} rounded-lg font-medium text-xs ${themeClasses.signInButtonText} ${themeClasses.signInButtonHoverBg} ${themeClasses.signInButtonHoverBorder} ${themeClasses.signInButtonHoverText} transition-all duration-300 transform hover:scale-105`}
                  >
                    Sign In
                    <ArrowRight className="inline ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Visual Elements */}
          <div className={`absolute -top-10 -left-10 w-20 h-20 ${themeClasses.extraBlob1} rounded-full blur-xl animate-pulse`}></div>
          <div className={`absolute -bottom-10 -right-10 w-24 h-24 ${themeClasses.extraBlob2} rounded-full blur-xl animate-pulse delay-1000`}></div>
        </div>
      </div>
    </div>
  );
}