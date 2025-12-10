import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, BarChart3, Users, Calendar, Loader2 } from 'lucide-react';
import axios from '../api/axios';

const LandingPage = () => {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDemoLogin = async () => {
    setLoadingDemo(true);
    try {
      const res = await axios.post("/api/auth/login", { 
        email: "owner@owner.com", 
        password: "password" 
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || res.data.admin));

      navigate("/dashboard");
    } catch (err) {
      console.error("Demo login failed:", err);
      alert("Demo login failed. Please try again later.");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-blue-900">
            FitZone<span className="text-blue-600">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Stop Functioning. <br className="hidden md:block" />
            <span className="text-blue-600">Start Thriving.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The minimal, professional dashboard for modern gym owners who want to focus on fitness, not spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Login
            </Link>
            <button 
              onClick={handleDemoLogin}
              disabled={loadingDemo}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              {loadingDemo ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "View Demo"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution Section */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* The Problem */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium">
                <XCircle size={16} />
                The Struggle
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Drowning in Admin Work?</h2>
              <p className="text-gray-600 leading-relaxed">
                Running a gym shouldn't mean spending hours buried in paperwork, chasing payments, and manually tracking attendance.
              </p>
              <ul className="space-y-3">
                {[
                  "Lost revenue from missed renewals",
                  "Scattered member records on paper/excel",
                  "Unknown daily/monthly attendance numbers",
                  "Zero insight into true financial health"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Solution */}
            <div className="space-y-6 relative">
             <div className="absolute inset-0 bg-blue-50 rounded-3xl -rotate-2 scale-105 z-0" />
              <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
                  <CheckCircle size={16} />
                  The Solution
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Clarity & Control</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  FitZone brings everything into one clean, secure dashboard. Automate the boring stuff so you can grow your community.
                </p>
                <ul className="space-y-3">
                  {[
                    "Automated membership expiry alerts",
                    "Centralized, searchable member database",
                    "Real-time revenue & growth analytics",
                    "One-click attendance tracking"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights - Minimal Grid */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Essentials only. No clutter.</h2>
            <p className="text-gray-600 mt-4">Everything you need to manage your facility effectively.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-blue-600" />}
              title="Member Management"
              description="Add, edit, and track members with ease. View history, plan details, and personal goals in one tap."
            />
             <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
              title="Financial Insights"
              description="Visual reports for monthly revenue, growth trends, and projected income. Know your numbers."
            />
             <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-blue-600" />}
              title="Smart Attendance"
              description="Track daily footfall. Identify peak hours and loyal members. Optimise your staffing."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-900 font-bold text-lg">FitZone<span className="text-blue-600">Admin</span></div>
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} FitZone Inc. Focused on your growth.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">Terms</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

export default LandingPage;