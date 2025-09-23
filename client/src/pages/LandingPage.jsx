import React, { useState, useEffect } from 'react';
import { ChevronRight, Activity, Users, CreditCard, BarChart3, Check, Star, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EnergeticFitZoneLanding() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const timer = setTimeout(() => setIsVisible(true), 500);
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const features = [
    {
      icon: Activity,
      title: "Attendance Tracking",
      description: "Monitor entry/exit patterns with real-time analytics",
      color: isDarkMode ? "from-cyan-400 to-blue-500" : "from-cyan-300 to-blue-400"
    },
    {
      icon: Users,
      title: "Membership Plans",
      description: "Manage gym memberships and subscription tiers",
      color: isDarkMode ? "from-green-400 to-emerald-500" : "from-green-300 to-emerald-400"
    },
    {
      icon: CreditCard,
      title: "Payments",
      description: "Handle all financial transactions and billing cycles",
      color: isDarkMode ? "from-orange-400 to-red-500" : "from-orange-300 to-red-400"
    },
    {
      icon: BarChart3,
      title: "Reports",
      description: "Detailed analytics and revenue insights",
      color: isDarkMode ? "from-purple-400 to-pink-500" : "from-purple-300 to-pink-400"
    }
  ];

  const testimonials = [
    {
      name: "Amanda Lee",
      role: "Gym Owner",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b176?w=100&h=100&fit=crop&crop=face",
      text: "FitZone transformed my gym operations. Revenue increased by 40% in just 3 months!"
    },
    {
      name: "Mark Howard",
      role: "Fitness Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      text: "Streamlined operations and member satisfaction has never been higher."
    },
    {
      name: "Sarah Chen",
      role: "Business Owner",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      text: "The analytics dashboard gives me insights I never had before. Game changer!"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: 19,
      features: ["Up to 100 members", "Basic reporting", "Email support", "Mobile app access"]
    },
    {
      name: "Professional",
      price: 49,
      features: ["Up to 500 members", "Advanced analytics", "Priority support", "Custom branding", "API access"],
      popular: true
    },
    {
      name: "Enterprise",
      price: 99,
      features: ["Unlimited members", "White-label solution", "24/7 phone support", "Custom integrations", "Dedicated manager"]
    }
  ];

  // Theme-based classes
  const themeClasses = {
    background: isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900',
    backgroundGradient: isDarkMode 
      ? 'from-slate-900 via-blue-900/20 to-purple-900/20' 
      : 'from-white via-blue-50/20 to-purple-50/20',
    navBackground: isDarkMode ? 'bg-slate-900/80' : 'bg-white/80',
    navBorder: isDarkMode ? 'border-slate-800' : 'border-gray-200',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-gray-500',
    cardBackground: isDarkMode 
      ? 'from-slate-800/50 to-slate-900/50' 
      : 'from-gray-50/50 to-white/50',
    cardBorder: isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50',
    cardHover: isDarkMode 
      ? 'hover:from-slate-700/50 hover:to-slate-800/50' 
      : 'hover:from-gray-100/50 hover:to-gray-50/50',
    dashboardBackground: isDarkMode
      ? 'from-slate-800/80 to-slate-900/80'
      : 'from-gray-100/80 to-white/80',
    dashboardChart: isDarkMode
      ? 'from-slate-700/50 to-slate-600/50'
      : 'from-gray-200/50 to-gray-100/50',
    footerBorder: isDarkMode ? 'border-slate-800' : 'border-gray-200',
    brandColor: isDarkMode ? 'text-cyan-400' : 'text-cyan-500',
    loginButton: isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900',
    demoButton: isDarkMode 
      ? 'border-slate-600 hover:bg-slate-800' 
      : 'border-gray-300 hover:bg-gray-100',
    overlayGradient: isDarkMode
      ? 'from-slate-900/90 via-slate-900/70 to-slate-900/90'
      : 'from-white/90 via-white/70 to-white/90',
    overlayBottom: isDarkMode
      ? 'from-slate-900 via-transparent to-transparent'
      : 'from-white via-transparent to-transparent'
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} overflow-hidden`}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${themeClasses.backgroundGradient}`}></div>
        <div className={`absolute top-1/4 -left-40 w-80 h-80 ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-200/10'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-1/4 -right-40 w-96 h-96 ${isDarkMode ? 'bg-green-500/10' : 'bg-green-200/10'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-200/10'} rounded-full blur-3xl animate-pulse delay-2000`}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 ${themeClasses.navBackground} backdrop-blur-xl border-b ${themeClasses.navBorder}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-30"></span>
              <span className={`relative ${themeClasses.brandColor}`}>FitZone</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <Link
              to="/login"
              className={`px-6 py-2 ${themeClasses.loginButton} transition-colors duration-300`}
            >
              Login
            </Link>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 text-white">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 w-full">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="./background.jpg"
            alt="Fitness background"
            className={`w-full h-full object-cover ${isDarkMode ? 'opacity-30' : 'opacity-50'}`}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.overlayGradient}`}></div>
          <div className={`absolute inset-0 bg-gradient-to-t ${themeClasses.overlayBottom}`}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                MANAGE YOUR{' '}
                <span className="relative inline-block">
                  <span className={`absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-sm ${isDarkMode ? 'opacity-50' : 'opacity-20'} animate-pulse`}></span>
                  <span className={`relative bg-gradient-to-r ${isDarkMode ? 'from-cyan-400 to-blue-500' : 'from-cyan-600 to-blue-700'} bg-clip-text text-transparent font-extrabold animate-pulse`}>GYM SMARTER</span>
                </span>{' '}
                WITH FITZONE
              </h1>
              
              <p className={`text-xl ${themeClasses.textSecondary} mb-8 max-w-lg`}>
                All-in-one platform for gym owners and fitness lovers to streamline operations and boost revenue.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/25 text-white">
                  START FREE TRIAL
                  <ChevronRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className={`px-8 py-4 border ${themeClasses.demoButton} rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${themeClasses.text}`}>
                  BOOK A DEMO
                </button>
              </div>
            </div>

            {/* Right Content - Removed since background image takes its place */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className={themeClasses.text}>FEATURES</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 bg-gradient-to-br ${themeClasses.cardBackground} rounded-2xl border ${themeClasses.cardBorder} backdrop-blur-sm ${themeClasses.cardHover} transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className={`w-full h-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${themeClasses.text}`}>{feature.title}</h3>
                <p className={`${themeClasses.textMuted} group-hover:${isDarkMode ? 'text-slate-300' : 'text-gray-800'} transition-colors duration-300`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FitZone Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Analytics Dashboard Mockup */}
            <div className="relative">
              <div className={`bg-gradient-to-br ${themeClasses.dashboardBackground} rounded-2xl p-8 backdrop-blur-sm border ${themeClasses.cardBorder} shadow-2xl`}>
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className={`text-sm ${themeClasses.textMuted}`}>Dashboard</div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`bg-gradient-to-r ${isDarkMode ? 'from-cyan-500/20 to-blue-500/20' : 'from-cyan-500/10 to-blue-500/10'} rounded-lg p-4`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>$12.5K</div>
                    <div className={`text-sm ${themeClasses.textMuted}`}>Monthly Revenue</div>
                  </div>
                  <div className={`bg-gradient-to-r ${isDarkMode ? 'from-green-500/20 to-emerald-500/20' : 'from-green-500/10 to-emerald-500/10'} rounded-lg p-4`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>847</div>
                    <div className={`text-sm ${themeClasses.textMuted}`}>Active Members</div>
                  </div>
                </div>
                
                {/* Chart Mockup */}
                <div className={`h-32 bg-gradient-to-r ${themeClasses.dashboardChart} rounded-lg flex items-end justify-around p-4`}>
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t animate-pulse"
                      style={{ 
                        height: `${height}%`, 
                        width: '12px',
                        animationDelay: `${i * 200}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                WHY FITZONE?
              </h2>
              <h3 className={`text-2xl lg:text-3xl font-bold mb-6 ${themeClasses.brandColor}`}>
                SAVE TIME, BOOST REVENUE, AND GIVE MEMBERS THE BEST EXPERIENCE
              </h3>
              <p className={`text-lg ${themeClasses.textSecondary} mb-8 leading-relaxed`}>
                Stop managing spreadsheets and paper records. Get real-time insights, automate billing, 
                and create exceptional member experiences with our comprehensive gym management platform.
              </p>
              
              <div className="space-y-4">
                {["Real-time Analytics", "Automated Billing", "Member Portal", "Mobile App"].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className={isDarkMode ? 'text-slate-200' : 'text-gray-800'}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">PRICING</h2>
            <p className={`text-xl ${themeClasses.textMuted}`}>Choose the perfect plan for your gym</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-gradient-to-br ${themeClasses.cardBackground} rounded-2xl p-8 backdrop-blur-sm border transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  plan.popular 
                    ? `${isDarkMode ? 'border-cyan-400 shadow-cyan-400/25 ring-1 ring-cyan-400/50' : 'border-cyan-300 shadow-cyan-300/25 ring-1 ring-cyan-300/50'}` 
                    : `${themeClasses.cardBorder} hover:${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className={`bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 rounded-full text-sm font-bold ${isDarkMode ? 'text-slate-900' : 'text-white'}`}>
                      POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>{plan.name}</h3>
                  <div className={`text-5xl font-extrabold ${themeClasses.text} mb-2`}>
                    ${plan.price}
                    <span className={`text-lg ${themeClasses.textMuted}`}>/mo</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                      <span className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25'
                    : `border ${themeClasses.cardBorder} ${themeClasses.cardHover} ${themeClasses.text}`
                }`}>
                  GET STARTED
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6">
            TAKE YOUR{' '}
            <span className="relative inline-block">
              <span className={`absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-sm ${isDarkMode ? 'opacity-50' : 'opacity-20'} animate-pulse`}></span>
              <span className={`relative bg-gradient-to-r ${isDarkMode ? 'from-cyan-400 to-blue-500' : 'from-cyan-600 to-blue-700'} bg-clip-text text-transparent font-extrabold animate-pulse`}>GYM</span>
            </span>
            <br />
            TO THE NEXT LEVEL
          </h2>
          
          <p className={`text-xl ${themeClasses.textSecondary} mb-8 max-w-2xl mx-auto`}>
            Join thousands of gym owners who have already transformed their business with FitZone.
          </p>
          
          <button className="group px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-110 hover:from-green-600 hover:to-emerald-700 shadow-2xl shadow-green-500/25 text-white">
            START YOUR FREE TRIAL
            <ChevronRight className="inline ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 px-6 border-t ${themeClasses.footerBorder} text-center ${themeClasses.textMuted} relative z-10`}>
        <p>© {new Date().getFullYear()} FitZone. All rights reserved.</p>
      </footer>
    </div>
  );
}