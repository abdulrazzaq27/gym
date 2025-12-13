import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useTheme } from "../components/utils/ThemeContext.jsx";
import {
  Settings as SettingsIcon,
  Save,
  Plus,
  Trash2,
  Clock,
  Building2,
  Phone,
  Mail,
  IndianRupee,
  User,
  Lock,
  Download,
  Upload,
  Palette,
  Shield,
  TrendingUp,
  Bell,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";

const emptyPlan = { name: "", durationInMonths: 1, price: 0, isActive: true };

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [form, setForm] = useState({
    gymName: "",
    gymCode: "",
    address: "",
    phone: "",
    email: "",
    openingTime: "",
    closingTime: "",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    currency: "INR",
    membershipPlans: [
      { name: "Monthly", durationInMonths: 1, price: 1000, isActive: true },
      { name: "Quarterly", durationInMonths: 3, price: 2700, isActive: true },
      { name: "Half-Yearly", durationInMonths: 6, price: 5100, isActive: true },
      { name: "Yearly", durationInMonths: 12, price: 9600, isActive: true },
    ],
    renewalReminderDays: 7,
    lowAttendanceAlertThreshold: 5,
    // New settings
    emailNotifications: true,
    smsNotifications: false,
    birthdayWishes: true,
    sessionTimeout: 30,
    defaultDateRange: 30,
    monthlyRevenueTarget: 50000,
    dailyAttendanceTarget: 50,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await axios.get("/api/settings");
        if (res.data) {
          setForm((prev) => ({
            ...prev,
            ...res.data,
            membershipPlans:
              res.data.membershipPlans && res.data.membershipPlans.length
                ? res.data.membershipPlans
                : prev.membershipPlans,
          }));
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleWorkingDay = (day) => {
    setForm((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day],
      };
    });
  };

  const handlePlanChange = (index, field, value) => {
    setForm((prev) => {
      const plans = [...prev.membershipPlans];
      plans[index] = {
        ...plans[index],
        [field]: field === "price" || field === "durationInMonths" ? Number(value) : value
      };
      return { ...prev, membershipPlans: plans };
    });
  };

  const addPlan = () => {
    setForm((prev) => ({
      ...prev,
      membershipPlans: [...prev.membershipPlans, { ...emptyPlan }],
    }));
  };

  const removePlan = (index) => {
    setForm((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await axios.put("/api/settings", form);
      setSuccess("Settings saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await axios.post("/api/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleExportData = async (type) => {
    try {
      const endpoint = type === 'members' ? '/api/members/export' : '/api/payments/export';
      const response = await axios.get(endpoint, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Failed to export ${type} data`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const themeClasses = {
    background: isDarkMode
      ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      : "bg-gradient-to-br from-gray-50 via-white to-gray-100",
    card: isDarkMode
      ? "bg-gray-800/70 border-gray-700"
      : "bg-white/80 border-gray-200",
    heading: isDarkMode ? "text-white" : "text-gray-900",
    label: isDarkMode ? "text-gray-300" : "text-gray-700",
    input: isDarkMode
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500",
    sectionTitle: isDarkMode ? "border-gray-700" : "border-gray-200",
    tab: isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900",
    activeTab: isDarkMode ? "text-blue-400 border-blue-400" : "text-blue-600 border-blue-600",
  };

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "account", label: "Account", icon: User },
    { id: "data", label: "Data", icon: Download },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${themeClasses.heading}`}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} p-6`}>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.heading}`}>Settings</h1>
              <p className="text-sm text-gray-400">
                Manage your gym configuration and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 px-4 py-2 text-sm">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className={`rounded-2xl border ${themeClasses.card} p-2 shadow-lg`}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                      ? `${themeClasses.activeTab} bg-blue-500/10`
                      : themeClasses.tab
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <>
              {/* General Info */}
              <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-4`}>
                <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle} flex items-center gap-2`}>
                  <Building2 className="w-5 h-5 text-blue-400" />
                  General Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Gym Name</label>
                    <input
                      type="text"
                      name="gymName"
                      value={form.gymName || ""}
                      onChange={handleChange}
                      className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                      placeholder="FitZone Gym"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Gym Code</label>
                    <input
                      type="text"
                      name="gymCode"
                      value={form.gymCode || ""}
                      onChange={handleChange}
                      className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                      placeholder="FIT123"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Phone</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="phone"
                        value={form.phone || ""}
                        onChange={handleChange}
                        className={`w-full rounded-lg pl-9 pr-3 py-2 border ${themeClasses.input}`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Email</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={form.email || ""}
                        onChange={handleChange}
                        className={`w-full rounded-lg pl-9 pr-3 py-2 border ${themeClasses.input}`}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Address</label>
                    <textarea
                      name="address"
                      value={form.address || ""}
                      onChange={handleChange}
                      rows={2}
                      className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                      placeholder="Street, City, State, Pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Timings */}
              <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-4`}>
                <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle} flex items-center gap-2`}>
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Timings & Working Days
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Opening Time</label>
                    <input
                      type="time"
                      name="openingTime"
                      value={form.openingTime || ""}
                      onChange={handleChange}
                      className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Closing Time</label>
                    <input
                      type="time"
                      name="closingTime"
                      value={form.closingTime || ""}
                      onChange={handleChange}
                      className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const active = form.workingDays?.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWorkingDay(day)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${active
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-transparent text-gray-400 border-gray-600 hover:border-blue-400 hover:text-blue-400"
                            }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Membership pricing */}
              <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-4`}>
                <div className="flex items-center justify-between gap-2 border-b pb-3">
                  <h2 className={`text-xl font-semibold ${themeClasses.heading} flex items-center gap-2`}>
                    <IndianRupee className="w-5 h-5 text-emerald-400" />
                    Membership Plans & Pricing
                  </h2>
                  <button
                    type="button"
                    onClick={addPlan}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Plan
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {form.membershipPlans.map((plan, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end rounded-xl bg-black/5 dark:bg-white/5 p-3 border border-gray-700/40"
                    >
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Plan Name</label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handlePlanChange(index, "name", e.target.value)}
                          className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                          placeholder="Monthly"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Duration (months)</label>
                        <input
                          type="number"
                          min={1}
                          value={plan.durationInMonths}
                          onChange={(e) => handlePlanChange(index, "durationInMonths", e.target.value)}
                          className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${themeClasses.label}`}>Price ({form.currency})</label>
                        <input
                          type="number"
                          min={0}
                          value={plan.price}
                          onChange={(e) => handlePlanChange(index, "price", e.target.value)}
                          className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            id={`active-${index}`}
                            type="checkbox"
                            checked={plan.isActive}
                            onChange={(e) => handlePlanChange(index, "isActive", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`active-${index}`} className={`text-xs font-medium ${themeClasses.label}`}>
                            Active
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePlan(index)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-500/60 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-4`}>
                <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle} flex items-center gap-2`}>
                  <Bell className="w-5 h-5 text-purple-400" />
                  Notifications & Alerts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>
                      Renewal reminder (days before expiry)
                    </label>
                    <input
                      type="number"
                      min={0}
                      name="renewalReminderDays"
                      value={form.renewalReminderDays ?? 7}
                      onChange={handleChange}
                      className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>
                      Low attendance alert threshold (visits / month)
                    </label>
                    <input
                      type="number"
                      min={0}
                      name="lowAttendanceAlertThreshold"
                      value={form.lowAttendanceAlertThreshold ?? 5}
                      onChange={handleChange}
                      className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="emailNotifications"
                      type="checkbox"
                      name="emailNotifications"
                      checked={form.emailNotifications}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="emailNotifications" className={`text-sm font-medium ${themeClasses.label}`}>
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="birthdayWishes"
                      type="checkbox"
                      name="birthdayWishes"
                      checked={form.birthdayWishes}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="birthdayWishes" className={`text-sm font-medium ${themeClasses.label}`}>
                      Send Birthday Wishes
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-6`}>
              <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle} flex items-center gap-2`}>
                <User className="w-5 h-5 text-blue-400" />
                Account Settings
              </h2>

              {/* Change Password Section */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  {showPasswordSection ? "Hide" : "Change"} Password
                </button>

                {showPasswordSection && (
                  <div className="mt-4 space-y-4 p-4 rounded-lg bg-black/10 dark:bg-white/5">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className={`w-full rounded-lg px-3 py-2 pr-10 border ${themeClasses.input}`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className={`w-full rounded-lg px-3 py-2 pr-10 border ${themeClasses.input}`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className={`w-full rounded-lg px-3 py-2 pr-10 border ${themeClasses.input}`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              {/* Logout */}
              <div className="pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === "data" && (
            <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-4`}>
              <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle} flex items-center gap-2`}>
                <Download className="w-5 h-5 text-green-400" />
                Data Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleExportData('members')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/30"
                >
                  <Download className="w-5 h-5" />
                  Export Members (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleExportData('payments')}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/30"
                >
                  <Download className="w-5 h-5" />
                  Export Payments (CSV)
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Export your data for backup or analysis purposes. Data will be downloaded as CSV files.
              </p>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-4`}>
              <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle} flex items-center gap-2`}>
                <Palette className="w-5 h-5 text-pink-400" />
                Appearance
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>Theme</label>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/30"
                  >
                    <Palette className="w-5 h-5" />
                    Current: {isDarkMode ? "Dark Mode" : "Light Mode"}
                    <span className="ml-auto text-xs">Click to toggle</span>
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  More customization options coming soon (logo upload, brand colors, etc.)
                </p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-4`}>
              <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle} flex items-center gap-2`}>
                <Shield className="w-5 h-5 text-red-400" />
                Security Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    name="sessionTimeout"
                    value={form.sessionTimeout ?? 30}
                    onChange={handleChange}
                    className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                  />
                  <p className="text-xs text-gray-400 mt-1">Auto-logout after inactivity</p>
                </div>
                <p className="text-sm text-gray-400">
                  Additional security features (2FA, login history) coming soon
                </p>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className={`rounded-2xl border ${themeClasses.card} p-5 shadow-lg space-y-4`}>
              <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle} flex items-center gap-2`}>
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Business Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>
                    Default Date Range (days)
                  </label>
                  <select
                    name="defaultDateRange"
                    value={form.defaultDateRange ?? 30}
                    onChange={handleChange}
                    className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>
                    Monthly Revenue Target (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="monthlyRevenueTarget"
                    value={form.monthlyRevenueTarget ?? 50000}
                    onChange={handleChange}
                    className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${themeClasses.label}`}>
                    Daily Attendance Target
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="dailyAttendanceTarget"
                    value={form.dailyAttendanceTarget ?? 50}
                    onChange={handleChange}
                    className={`w-full rounded-lg px-3 py-2 border ${themeClasses.input}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
