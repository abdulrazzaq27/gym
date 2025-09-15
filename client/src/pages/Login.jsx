import { useState } from "react";
import axios from "../api/axios"; // make sure your axios instance is set up
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center fixed inset-0">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 hover:cursor-pointer rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Register button */}
        <div className="mt-4 text-center">
          <p className="text-medium text-gray-600">
            Not a user?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-black hover:underline hover:cursor-pointer font-bold"
            >
              Register here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
