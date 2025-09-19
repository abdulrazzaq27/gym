import React, { useState, useEffect, useRef } from "react";
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
    DollarSign
} from 'lucide-react';

export default function Drawer() {
    const [open, setOpen] = useState(false);
    const closeBtnRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState('/dashboard');

    // Mock auth - replace with your auth logic
    const token = true; // localStorage.getItem("token");

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const isActive = (path) => currentPath === path;

    const logout = () => {
        // localStorage.removeItem("token");
        // navigate("/login");
        console.log("Logout clicked");
    };

    const navigate = (path) => {
        setCurrentPath(path);
        setOpen(false);
        setIsMenuOpen(false);
        console.log("Navigate to:", path);
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
            if (window.innerWidth >= 1024) { // lg breakpoint
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* NAVBAR */}
            <nav className="bg-white border-b border-white/50 shadow-2xl backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Logo and Nav Links */}
                        <div className="flex items-center gap-8">
                            {/* Sidebar Toggle Button - Only show on larger screens */}
                            <button
                                onClick={() => setOpen(true)}
                                className="hidden md:block p-2.5 rounded-xl bg-gray-300 text-gray-900 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
                                aria-label="Open sidebar"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 group">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                                        <Activity className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-200"></div>
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-gray-900">
                                        FitZone Pro
                                    </span>
                                    <div className="text-xs text-gray-900 font-medium">Gym Management</div>
                                </div>
                            </button>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Profile Button */}
                            <button className="relative p-2.5 rounded-xl bg-gray-300 cursor-pointer text-gray-900 hover:bg-white/20 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20 group">
                                <User className="w-5 h-5" />
                                {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div> */}
                            </button>

                            {/* Auth Button - Hidden on small screens */}
                            {token ? (
                                <button
                                    onClick={logout}
                                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Login</span>
                                </button>
                            )}

                            {/* Mobile Menu Button - Only show on screens smaller than lg */}
                            <button
                                onClick={toggleMenu}
                                className="lg:hidden md:hidden p-2.5 rounded-xl bg-gray-300 text-gray-900 cursor-pointer hover:bg-white/20 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav Links - Only show on screens smaller than lg */}
                    {isMenuOpen && (
                        <div className="lg:hidden md:hidden border-t border-white/10 bg-white rounded backdrop-blur-sm">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${active
                                                ? 'bg-white/20 text-white shadow-lg border border-white/20 backdrop-blur-sm'
                                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </button>
                                    );
                                })}

                                {/* Mobile Auth Button */}
                                <div className="pt-2 border-t border-white/10">
                                    {token ? (
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all duration-200"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Logout
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate("/login")}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 transition-all duration-200"
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
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
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
                className={`fixed top-0 left-0 z-50 h-full w-80 bg-slate-900/95 shadow-2xl border-r border-white/20 backdrop-blur-sm transform transition-all duration-300 ${open ? "translate-x-0" : "-translate-x-full"
                    } flex flex-col`}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gray-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">FitZone Pro</h2>
                                <p className="text-sm text-gray-800">Management Suite</p>
                            </div>
                        </div>

                        <button
                            ref={closeBtnRef}
                            onClick={() => setOpen(false)}
                            className="p-2 rounded-xl bg-gray-300 text-gray-900 cursor-pointer transition-all duration-200"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Navigation</h4>
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                        ? 'bg-slate-700/70 text-white shadow-lg border border-white/20'
                                        : 'text-gray-900 hover:text-white hover:bg-slate-700/50 hover:shadow-lg'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-gray-700'}`} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-gray-300">
                    <div className="text-center text-xs text-gray-900">
                        <p>FitZone Pro v2.1</p>
                        <p className="mt-1">© 2025 Gym Management System</p>
                    </div>
                </div>
            </aside>
        </>
    );
}