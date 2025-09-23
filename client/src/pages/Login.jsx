import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import axios from "../api/axios";
import { useNavigate } from 'react-router-dom';

export default function EnergeticLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Invalid email format";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || res.data.admin));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 text-white overflow-hidden flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex-shrink-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-cyan-400">FitZone</div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Motivational Section (Visible on larger screens) */}
          <div className={`hidden lg:block w-full lg:w-1/2 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <div className="p-8 rounded-xl bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-md border border-cyan-700/20 shadow-xl">
              <h1 className="text-4xl font-bold mb-4 text-cyan-300">Unlock Your Potential</h1>
              <p className="text-slate-300 mb-6">Join FitZone and transform your fitness journey with personalized workouts, expert guidance, and a community that motivates you every step of the way.</p>
              <ul className="space-y-3 text-slate-200">
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-400" /> Custom training plans</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-400" /> Progress tracking</li>
                <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-cyan-400" /> Expert nutrition advice</li>
              </ul>
            </div>
          </div>

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit} 
            className={`w-full max-w-md transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl p-8 shadow-2xl border border-slate-700/50 relative overflow-hidden">
              
              {/* Header */}
              <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Welcome Back</h2>

              {/* Global error (backend) */}
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="block text-slate-300 mb-1 text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border rounded-lg text-white text-sm focus:outline-none transition-colors 
                      ${fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-cyan-400"}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-slate-300 mb-1 text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border rounded-lg text-white text-sm focus:outline-none transition-colors 
                      ${fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-cyan-400"}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <p className="text-right mb-6">
                <button 
                  type="button" 
                  onClick={() => navigate("/forgot-password")} 
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Forgot password?
                </button>
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-sm transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 transform hover:scale-105 shadow-md hover:shadow-blue-500/50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Register link */}
              <p className="text-xs text-center mt-6 text-slate-400">
                Don’t have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => navigate("/register")} 
                  className="text-cyan-400 hover:underline font-medium"
                >
                  Create one
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}