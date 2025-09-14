// src/pages/LandingPage.js
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* Logo / Title */}
      <h1 className="text-4xl font-bold text-blue-600 mb-4">FitZone Admin</h1>
      <p className="text-lg text-gray-700 mb-6">
        Manage your gym members, attendance, and revenue easily.``
      </p>

      {/* Buttons */}
      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
