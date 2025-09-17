// import { useState } from "react";
// import axios from "../api/axios"; // make sure your axios instance is set up
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await axios.post("/api/auth/login", { email, password });

//       // Assuming backend returns { token, user }
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.admin));

//       navigate("/dashboard"); // redirect to dashboard
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center fixed inset-0">
//       <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="text-2xl font-bold">
//             <span className="relative inline-block">
//               <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-30"></span>
//               <span className="relative text-cyan-400">FitZone</span>
//             </span>
//           </div>
//           <div className="flex gap-4">
//             <button className="px-6 py-2 text-slate-300 hover:text-white transition-colors duration-300">
//               Login
//             </button>
//             <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25">
//               Start Free Trial
//             </button>
//           </div>
//         </div>
//       </nav>
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-2xl shadow-md w-96"
//       >
//         <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

//         {error && (
//           <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
//             {error}
//           </div>
//         )}

//         <div className="mb-4">
//           <label className="block text-gray-700 mb-1">Email</label>
//           <input
//             type="email"
//             placeholder="Enter your email"
//             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className="mb-6">
//           <label className="block text-gray-700 mb-1">Password</label>
//           <input
//             type="password"
//             placeholder="Enter your password"
//             className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white py-2 hover:cursor-pointer rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         {/* Register button */}
//         <div className="mt-4 text-center">
//           <p className="text-medium text-gray-600">
//             Not a user?{" "}
//             <button
//               type="button"
//               onClick={() => navigate("/register")}
//               className="text-black hover:underline hover:cursor-pointer font-bold"
//             >
//               Register here
//             </button>
//           </p>
//         </div>
//       </form>
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import axios from "../api/axios";
import { useNavigate } from 'react-router-dom';
export default function EnergeticLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);

  //   try {
  //     // Simulate API call
  //     await new Promise(resolve => setTimeout(resolve, 1500));
      
  //     // Mock successful login
  //     localStorage.setItem("token", "mock-token");
  //     localStorage.setItem("user", JSON.stringify({ email, name: "Admin User" }));
      
  //     // In real app: navigate("/dashboard");
  //     alert("Login successful! (Mock implementation)");
  //   } catch (err) {
  //     setError("Login failed. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", { email, password });

      // Assuming backend returns { token, user }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.admin));

      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigate("/register");
    // alert("Navigate to register page");
  };

  return (
    <div className="h-screen bg-slate-900 text-white overflow-hidden relative flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20"></div>
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="./background.jpg"
          alt="Fitness background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95"></div>
      </div>

      {/* Navigation */}
      <nav className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-30"></span>
              <span className="relative text-cyan-400">FitZone</span>
            </span>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 text-slate-300 hover:text-white transition-colors duration-300">
              Login
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className={`w-full max-w-xs transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Form Container */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-slate-700/50 relative overflow-hidden">
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-1">
                  Welcome{' '}
                  <span className="relative inline-block">
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-50"></span>
                    <span className="relative text-cyan-400">Back</span>
                  </span>
                </h2>
                <p className="text-slate-400 text-xs">Sign in to your FitZone account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 text-red-300 p-2 rounded-lg mb-3 backdrop-blur-sm animate-shake">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    {error}
                  </div>
                </div>
              )}

              {/* Login Form */}
              <div className="space-y-3">
                {/* Email Field */}
                <div className="group">
                  <label className="block text-slate-300 font-medium mb-1 text-sm">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="block text-slate-300 font-medium mb-1 text-sm">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-400 transition-colors duration-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors duration-300 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
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
                    <div className="w-full border-t border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-slate-800/80 text-slate-400">or</span>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-slate-400 mb-2 text-xs">
                    Don't have an account?
                  </p>
                  <button
                    type="button"
                    onClick={navigateToRegister}
                    className="group px-4 py-1.5 border border-slate-600 rounded-lg font-medium text-xs text-slate-300 hover:bg-slate-800 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 transform hover:scale-105"
                  >
                    Create Account
                    <ArrowRight className="inline ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Visual Elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>
      </div>
    </div>
  );
}