
import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api/api";

import {
  showSuccess,
  showError,
  showWarning,
} from "../component/Common/Toast";

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent duplicate submissions
    if (loading) return;

    // Validate required fields
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      showWarning("Please fill all fields.");
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email.trim())) {
      showWarning("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      showWarning("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        ...formData,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
      });

      showSuccess(
        response.data?.message || "Registration successful!"
      );

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Register Error:", error);

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (!error.response) {
        showError("Unable to connect with server.");
      } else if (status === 409) {
        showError(message || "Email is already registered.");
      } else {
        showError(message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-10 font-sans text-stone-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200/80 p-8 lg:p-10">

        {/* Heading / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-amber-700 to-amber-900 text-white font-serif font-bold text-xl shadow-md border border-amber-600/30 mb-4">
            C
          </div>

          <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-wide">
            Create Account
          </h1>

          <p className="text-stone-500 text-sm mt-1.5 uppercase tracking-widest text-[11px] font-medium">
            Furniture Showroom Studio
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* First Name */}
          <div>
            <label
              htmlFor="first_name"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2"
            >
              First Name
            </label>

            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter your first name"
              autoComplete="given-name"
              required
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 transition"
            />
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="last_name"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2"
            >
              Last Name
            </label>

            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter your last name"
              autoComplete="family-name"
              required
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2"
            >
              Email Address
            </label>

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2"
            >
              Password
            </label>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="new-password"
              required
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 transition"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-800 hover:bg-amber-900 text-white py-3.5 rounded-xl font-medium shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating Account..." : "Create Studio Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-stone-500 mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;