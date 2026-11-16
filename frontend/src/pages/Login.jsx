
import { useState } from "react";
import axios from "axios";
import { HeartPulse, UserRound, Stethoscope, Lock, Mail } from "lucide-react";
import { API_BASE_URL } from "../config/api";

function Login({ onLoginSuccess, onBack, onShowRegister }) {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        {
          email: email.trim().toLowerCase(),
          password: password,
        }
      );

      const data = response.data;

      // Ensure the selected login type matches the account
      if (data.role !== role) {
        setError(
          `This account is registered as ${data.role}. Please select the correct login option.`
        );
        return;
      }

      // Store the JWT for this browser tab
      sessionStorage.setItem("medilink_token", data.access_token);
      sessionStorage.setItem("medilink_role", data.role);

      onLoginSuccess(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to log in. Please check your connection and credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-10">

      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">

        <button
          onClick={onBack}
          className="mb-6 text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          ← Back to MediLink
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <HeartPulse size={30} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Welcome to MediLink
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to continue your healthcare journey
          </p>
        </div>

        {/* Select login type */}
        <div className="mb-6 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={() => {
              setRole("patient");
              setError("");
            }}
            className={`flex items-center justify-center gap-2 rounded-xl border p-4 font-semibold transition ${
              role === "patient"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <UserRound size={19} />
            Patient
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("doctor");
              setError("");
            }}
            className={`flex items-center justify-center gap-2 rounded-xl border p-4 font-semibold transition ${
              role === "doctor"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Stethoscope size={19} />
            Doctor
          </button>

        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email address
            </label>

            <div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-blue-500">
              <Mail size={18} className="text-slate-400" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent px-3 py-4 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-blue-500">
              <Lock size={18} className="text-slate-400" />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent px-3 py-4 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : `Login as ${role}`}
          </button>

        </form>
        {role === "patient" && (
  <p className="mt-6 text-center text-sm text-slate-600">
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
  <p className="mt-6 text-center text-sm text-slate-500">
    Doctor accounts are created by MediLink administration.
  </p>
)}

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure access to your MediLink account
        </p>

      </div>
    </div>
  );
}

export default Login;
