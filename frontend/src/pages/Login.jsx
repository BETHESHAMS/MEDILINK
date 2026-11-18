import { useState } from "react";
import axios from "axios";
import {
  HeartPulse,
  UserRound,
  Stethoscope,
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

function Login({ onLoginSuccess, onBack, onShowRegister }) {
  const [role, setRole] = useState("patient");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (value) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
  };

  const isValidMobile = (value) => {
    // 10 digits starting with 6-9, avoiding repeated dummy digits like 0000000000, 1111111111
    return /^[6-9]\d{9}$/.test(value) && !/^(\d)\1{9}$/.test(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const loginValue = identifier.trim();
    const isEmail = isValidEmail(loginValue);
    const isMobile = isValidMobile(loginValue);

    if (!isEmail && !isMobile) {
      setError(
        "Please enter a valid email address (e.g. name@example.com) or a valid 10-digit mobile number."
      );
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: loginValue.toLowerCase(),
        password: password,
      });

      const data = response.data;

      if (data.role !== role) {
        setError(
          `This account is registered as ${data.role}. Please select the ${data.role} tab above.`
        );
        return;
      }

      sessionStorage.setItem("medilink_token", data.access_token);
      sessionStorage.setItem("medilink_role", data.role);

      onLoginSuccess(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to log in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-xl">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft size={16} />
          Back to Main Page
        </button>

        <div
          className="mb-6 text-center cursor-pointer group"
          onClick={onBack}
          title="Click to return to Main Page"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition group-hover:scale-105">
            <HeartPulse size={30} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Medi<span className="text-blue-600">Link</span>
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            Sign in to access your healthcare portal
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setRole("patient");
              setError("");
            }}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition ${
              role === "patient"
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <UserRound size={18} />
            Patient
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("doctor");
              setError("");
            }}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition ${
              role === "doctor"
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Stethoscope size={18} />
            Doctor
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          <div>
            <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700">
              Email or Mobile Number
            </label>

            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 focus-within:border-blue-500 focus-within:bg-white transition">
              <Mail size={18} className="text-slate-400 shrink-0" />

              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or 10-digit mobile"
                autoComplete="username"
                className="w-full min-w-0 bg-transparent px-3 py-3 sm:py-3.5 text-sm outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Enter your registered email or 10-digit mobile number
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 focus-within:border-blue-500 focus-within:bg-white transition">
              <Lock size={18} className="text-slate-400 shrink-0" />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full min-w-0 bg-transparent px-3 py-3 sm:py-3.5 text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs sm:text-sm text-red-600 border border-red-100">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 sm:py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : `Sign In as ${role === "patient" ? "Patient" : "Doctor"}`}
          </button>
        </form>

        {role === "patient" && (
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-600">
            New to MediLink?{" "}
            <button
              type="button"
              onClick={onShowRegister}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create an account
            </button>
          </p>
        )}

        {role === "doctor" && (
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500">
            Doctor accounts are provisioned by hospital administrators.
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
