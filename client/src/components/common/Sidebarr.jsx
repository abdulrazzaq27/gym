import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../utils/ThemeContext.jsx";

import {
    LayoutDashboard,
    Users,
    UserPlus,
    CreditCard,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    LogIn,
    Menu,
    X,
    User,
    Activity,
    TrendingUp,
    DollarSign,
    Sun,
    Moon
} from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";

export default function Drawer() {
    const [open, setOpen] = useState(false);
    const closeBtnRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const token = localStorage.getItem('token');
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation(); // Add this to get current location
    
    // Get current path from location instead of state
    const currentPath = location.pathname;

    // Theme-based classes
    const themeClasses = {
        navbar: isDarkMode 
            ? 'bg-gray-800/95 border-gray-700/50 backdrop-blur-sm' 
            : 'bg-white/95 border-gray-200/50 backdrop-blur-sm',
        navbarText: isDarkMode ? 'text-white' : 'text-gray-900',
        navbarSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        logoGradient: isDarkMode 
            ? 'from-white to-blue-300' 
            : 'from-gray-900 to-blue-600',
        button: isDarkMode 
            ? 'bg-gray-700/50 text-white hover:bg-gray-600/50 border-gray-600/30' 
            : 'bg-gray-100/50 text-gray-900 hover:bg-gray-200/50 border-gray-300/30',
        authButton: isDarkMode 
            ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
            : 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        loginButton: isDarkMode 
            ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
            : 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
        mobileMenu: isDarkMode 
            ? 'bg-gray-800/95 border-gray-700/30' 
            : 'bg-white/95 border-gray-200/30',
        mobileNavItem: isDarkMode 
            ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50',
        mobileNavActive: isDarkMode 
            ? 'bg-gray-700/70 text-white border-gray-600/30' 
            : 'bg-gray-200/50 text-gray-900 border-gray-300/30',
        overlay: 'bg-black/30 backdrop-blur-sm',
        drawer: isDarkMode 
            ? 'bg-gray-900/95 border-gray-700/50' 
            : 'bg-white/95 border-gray-200/50',
        drawerHeader: isDarkMode ? 'bg-gray-800/50 border-gray-700/30' : 'bg-gray-50/50 border-gray-200/30',
        drawerContent: isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50/30',
        drawerText: isDarkMode ? 'text-white' : 'text-gray-900',
        drawerSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        drawerNavItem: isDarkMode 
            ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50',
        drawerNavActive: isDarkMode 
            ? 'bg-gray-700/70 text-white border-gray-600/30' 
            : 'bg-gray-200/50 text-gray-900 border-gray-300/30',
        drawerFooter: isDarkMode ? 'bg-gray-800/50 border-gray-700/30' : 'bg-gray-50/50 border-gray-200/30',
        closeButton: isDarkMode 
            ? 'bg-gray-700/50 text-white hover:bg-gray-600/50' 
            : 'bg-gray-200/50 text-gray-900 hover:bg-gray-300/50',
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const isActive = (path) => currentPath === path;

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Updated handleNavigation function to close menus
    const handleNavigation = (path) => {
        navigate(path);
        setOpen(false); // Close sidebar
        setIsMenuOpen(false); // Close mobile menu
    };

    // Navigation items
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/members', label: 'Members', icon: Users },
        { path: '/member/new', label: 'Add Member', icon: UserPlus },
        { path: '/attendance', label: 'Attendance', icon: Calendar },
        { path: '/payments', label: 'Payments', icon: CreditCard },
        { path: '/reports', label: 'Reports', icon: BarChart3 },
        { path: '/settings', label: 'Settings', icon: Settings }
    ];

    // close on Escape
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape" && open) setOpen(false);
            if (e.key === "Escape" && isMenuOpen) setIsMenuOpen(false);
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, isMenuOpen]);

    // focus close button when drawer opens
    useEffect(() => {
        if (open && closeBtnRef.current) {
            closeBtnRef.current.focus();
        }
    }, [open]);

    // Close mobile menu when screen size changes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar and mobile menu when route changes
    useEffect(() => {
        setOpen(false);
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            {/* NAVBAR */}
            <nav className={`${themeClasses.navbar} border-b shadow-2xl sticky top-0 z-40 transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Logo and Nav Links */}
                        <div className="flex items-center gap-8">
                            {/* Sidebar Toggle Button - Only show on larger screens */}
                            <button
                                onClick={() => setOpen(true)}
                                className={`hidden md:block p-2.5 rounded-xl ${themeClasses.button} cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border`}
                                aria-label="Open sidebar"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            <button onClick={() => handleNavigation('/dashboard')} className="flex items-center space-x-3 group hover:cursor-pointer">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-200"></div>
                                </div>
                                <div className="hidden sm:block">
                                    <span className={`text-2xl font-bold bg-gradient-to-r ${themeClasses.logoGradient} bg-clip-text text-transparent`}>
                                        FitZone Pro
                                    </span>
                                    <div className={`text-xs ${themeClasses.navbarSecondary} font-medium`}>Gym Management</div>
                                </div>
                            </button>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Profile Button */}
                            <button 
                                onClick={() => handleNavigation('/profile')}
                                className={`relative p-2.5 rounded-xl ${themeClasses.button} hover:cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border group`}
                            >
                                <User className="w-5 h-5" />
                            </button>

                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2.5 rounded-xl ${themeClasses.button} hover:cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border`}
                                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDarkMode ? (
                                    <Sun className="w-5 h-5 text-yellow-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-gray-600" />
                                )}
                            </button>

                            {/* Auth Button - Hidden on small screens */}
                            {token ? (
                                <button
                                    onClick={logout}
                                    className={`hidden sm:flex items-center gap-2 bg-gradient-to-r ${themeClasses.authButton} text-white px-4 py-2.5 rounded-xl font-medium hover:cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl`}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className={`hidden sm:flex items-center gap-2 bg-gradient-to-r ${themeClasses.loginButton} text-white px-4 py-2.5 rounded-xl font-medium hover:cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl`}
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Login</span>
                                </button>
                            )}

                            {/* Mobile Menu Button - Only show on screens smaller than lg */}
                            <button
                                onClick={toggleMenu}
                                className={`lg:hidden md:hidden p-2.5 rounded-xl ${themeClasses.button} cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border`}
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav Links - Only show on screens smaller than lg */}
                    {isMenuOpen && (
                        <div className={`lg:hidden md:hidden border-t ${themeClasses.mobileMenu} rounded-b-xl backdrop-blur-sm transition-colors duration-300`}>
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => handleNavigation(item.path)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:cursor-pointer transition-all duration-200 ${active
                                                ? `${themeClasses.mobileNavActive} shadow-lg border backdrop-blur-sm`
                                                : themeClasses.mobileNavItem
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </button>
                                    );
                                })}

                                {/* Mobile Auth Button */}
                                <div className={`pt-2 border-t ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/30'}`}>
                                    {token ? (
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:cursor-pointer transition-all duration-200"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate("/login")}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 hover:cursor-pointer transition-all duration-200"
                                        >
                                            <LogIn className="w-5 h-5" />
                                            Login
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* OVERLAY */}
            {open && (
                <div
                    className={`fixed inset-0 z-40 ${themeClasses.overlay} transition-opacity duration-300`}
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* SIDEBAR DRAWER */}
            <aside
                id="drawer-navigation"
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-navigation-label"
                className={`fixed top-0 left-0 z-50 h-full w-80 ${themeClasses.drawer} shadow-2xl border-r backdrop-blur-sm transform transition-all duration-300 ${open ? "translate-x-0" : "-translate-x-full"
                    } flex flex-col`}
            >
                {/* Header */}
                <div className={`p-6 border-b ${themeClasses.drawerHeader}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold ${themeClasses.drawerText}`}>FitZone Pro</h2>
                                <p className={`text-sm ${themeClasses.drawerSecondary}`}>Management Suite</p>
                            </div>
                        </div>

                        <button
                            ref={closeBtnRef}
                            onClick={() => setOpen(false)}
                            className={`p-2 rounded-xl ${themeClasses.closeButton} cursor-pointer transition-all duration-200`}
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className={`flex-1 overflow-y-auto p-6 ${themeClasses.drawerContent}`}>
                    <h4 className={`text-sm font-semibold ${themeClasses.drawerSecondary} uppercase tracking-wide mb-4`}>Navigation</h4>
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium hover:cursor-pointer transition-all duration-200 group ${active
                                        ? `${themeClasses.drawerNavActive} shadow-lg border`
                                        : `${themeClasses.drawerNavItem} hover:shadow-lg`
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 transition-colors ${active ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className={`p-6 border-t ${themeClasses.drawerFooter}`}>
                    <div className={`text-center text-xs ${themeClasses.drawerSecondary}`}>
                        <p>FitZone Pro v2.1</p>
                        <p className="mt-1">© 2025 Gym Management System</p>
                    </div>
                </div>
            </aside>
        </>
    );
}