import { useState } from "react";
import axios from "axios";
import { HeartPulse, UserRound, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../config/api";

function PatientRegister({ onBack, onRegistrationSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    phone: "",
    location: "",
    blood_group: "",
    allergies: "",
    medical_conditions: "",
    current_medications: "",
    previous_surgeries: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    // 1. Name
    if (!form.name.trim() || form.name.trim().length < 2) {
      return "Please enter your full name (minimum 2 characters).";
    }

    // 2. Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email.trim())) {
      return "Please enter a valid email address (e.g. name@example.com).";
    }

    // 3. Age
    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return "Please enter a valid age between 1 and 120.";
    }

    // 4. Gender
    if (!form.gender) {
      return "Please select your gender.";
    }

    // 5. Phone validation (10 digits starting with 6-9, avoiding dummy repeating numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    const phoneClean = form.phone.trim();
    if (!phoneRegex.test(phoneClean) || /^(\d)\1{9}$/.test(phoneClean)) {
      return "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.";
    }

    // 6. Location
    if (!form.location.trim() || form.location.trim().length < 2) {
      return "Please enter your city or area.";
    }

    // 7. Password
    if (!form.password || form.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    // 8. Emergency contact phone (optional, but if provided must be valid)
    if (form.emergency_contact_phone.trim()) {
      const ecPhone = form.emergency_contact_phone.trim();
      if (!phoneRegex.test(ecPhone) || /^(\d)\1{9}$/.test(ecPhone)) {
        return "Emergency contact phone must be a valid 10-digit mobile number.";
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        age: Number(form.age),
        blood_group: form.blood_group || null,
        location: form.location.trim(),
        emergency_contact_phone: form.emergency_contact_phone.trim() || null,
      };

      await axios.post(`${API_BASE_URL}/register`, payload);

      onRegistrationSuccess(form.email);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Registration failed. Please check your information and try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 sm:p-10 shadow-xl border border-slate-100">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft size={16} />
          Back to Login / Home
        </button>

        <div
          className="mb-8 text-center cursor-pointer group"
          onClick={onBack}
          title="Click to return to Main Page"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition group-hover:scale-105">
            <HeartPulse size={30} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Medi<span className="text-blue-600">Link</span> Patient Registration
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            Create your confidential medical profile
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Personal Information */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-bold text-slate-800">
              <UserRound size={19} className="text-blue-600" />
              Personal Details <span className="text-xs text-rose-500 font-normal">*Required</span>
            </h2>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Age *
                </label>
                <input
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 28"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  10-Digit Mobile Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  City / Location *
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Delhi, Noida, Mumbai"
                  className={inputClass}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Account Password * (Min 6 characters)
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </section>

          {/* Medical Information */}
          <section className="border-t border-slate-100 pt-6">
            <h2 className="mb-4 text-base sm:text-lg font-bold text-slate-800">
              Medical Profile <span className="text-xs text-slate-400 font-normal">(Optional but recommended)</span>
            </h2>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Blood Group
                </label>
                <select
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Known Allergies
                </label>
                <input
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin, Peanuts, Dust"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Chronic Conditions
                </label>
                <textarea
                  name="medical_conditions"
                  rows={2}
                  value={form.medical_conditions}
                  onChange={handleChange}
                  placeholder="e.g. Hypertension, Asthma, Diabetes"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Current Medications
                </label>
                <input
                  name="current_medications"
                  value={form.current_medications}
                  onChange={handleChange}
                  placeholder="e.g. Metformin 500mg"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Previous Surgeries
                </label>
                <input
                  name="previous_surgeries"
                  value={form.previous_surgeries}
                  onChange={handleChange}
                  placeholder="e.g. Appendectomy (2020)"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="border-t border-slate-100 pt-6">
            <h2 className="mb-4 text-base sm:text-lg font-bold text-slate-800">
              Emergency Contact
            </h2>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Contact Person Name
                </label>
                <input
                  name="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Parent / Spouse / Relative"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Contact Phone Number
                </label>
                <input
                  name="emergency_contact_phone"
                  type="tel"
                  maxLength={10}
                  value={form.emergency_contact_phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 sm:py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          Your medical records are encrypted and protected under healthcare confidentiality
        </p>
      </div>
    </div>
  );
}

export default PatientRegister;
