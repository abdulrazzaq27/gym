import { useEffect, useState } from "react";
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
} from "lucide-react";

const emptyPlan = { name: "", durationInMonths: 1, price: 0, isActive: true };

export default function SettingsPage() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      plans[index] = { ...plans[index], [field]: field === "price" || field === "durationInMonths" ? Number(value) : value };
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
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
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
  };

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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.heading}`}>Gym Settings</h1>
            <p className="text-sm text-gray-400">
              Manage your gym information, timings, membership plans, and pricing.
            </p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                        active
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
            <h2 className={`text-xl font-semibold ${themeClasses.heading} border-b pb-3 ${themeClasses.sectionTitle}`}>
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
            </div>
          </div>

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


