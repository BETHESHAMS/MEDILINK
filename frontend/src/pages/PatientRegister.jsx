
import { useState } from "react";
import axios from "axios";
import { HeartPulse, UserRound, ArrowLeft } from "lucide-react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        email: form.email.trim().toLowerCase(),
        age: Number(form.age),
      };

      await axios.post(
        `${API_BASE_URL}/register`,
        payload
      );

      onRegistrationSuccess(form.email);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl md:p-10">

        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Login
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <HeartPulse size={30} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Create Patient Account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Join MediLink and manage your healthcare journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal Information */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <UserRound size={20} className="text-blue-600" />
              Personal Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className={inputClass}
                required
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className={inputClass}
                required
              />

              <input
                name="age"
                type="number"
                min="1"
                max="120"
                value={form.age}
                onChange={handleChange}
                placeholder="Age"
                className={inputClass}
                required
              />

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className={inputClass}
                required
              />

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City / Location"
                className={inputClass}
                required
              />

            </div>
          </section>

          {/* Medical Information */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Medical Information (Optional)
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
                placeholder="Blood group (e.g. B+)"
                className={inputClass}
              />

              <input
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="Known allergies"
                className={inputClass}
              />

              <textarea
                name="medical_conditions"
                value={form.medical_conditions}
                onChange={handleChange}
                placeholder="Medical conditions"
                className={inputClass}
              />

              <textarea
                name="current_medications"
                value={form.current_medications}
                onChange={handleChange}
                placeholder="Current medications"
                className={inputClass}
              />

              <textarea
                name="previous_surgeries"
                value={form.previous_surgeries}
                onChange={handleChange}
                placeholder="Previous surgeries"
                className={inputClass}
              />

            </div>
          </section>

          {/* Emergency Contact */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Emergency Contact (Optional)
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                name="emergency_contact_name"
                value={form.emergency_contact_name}
                onChange={handleChange}
                placeholder="Emergency contact name"
                className={inputClass}
              />

              <input
                name="emergency_contact_phone"
                value={form.emergency_contact_phone}
                onChange={handleChange}
                placeholder="Emergency contact phone"
                className={inputClass}
              />

            </div>
          </section>

          {/* Account Password */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Account Security
            </h2>

            <input
              name="password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={handleChange}
              placeholder="Create password (minimum 8 characters)"
              className={inputClass}
              required
            />
          </section>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Patient Account"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default PatientRegister;
