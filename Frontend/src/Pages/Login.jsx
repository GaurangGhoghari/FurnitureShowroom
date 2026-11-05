import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authcontext";
import { showSuccess, showError, showWarning } from "../component/Common/Toast";
import { loginUser } from "../api/api";

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const [formData, setFormData] = useState({
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

    if (loading) return;

    if (!formData.email.trim() || !formData.password) {
      showWarning("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(formData);
      const user = response.data?.user;

      if (!user) {
        showError("User information was not returned by the server.");
        return;
      }

      setCurrentUser(user);
      showSuccess("Login successful!");

      setFormData({
        email: "",
        password: "",
      });

      const destination =
        user.role === "admin" ? "/admindashboard" : "/userdashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        showError(error.response.data?.message || "Login failed.");
      } else {
        showError("Unable to connect with server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-10 font-sans text-stone-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200/80 p-8 lg:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-amber-700 to-amber-900 text-white font-serif font-bold text-xl shadow-md border border-amber-600/30 mb-4">
            C
          </div>

          <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-wide">
            Welcome Back
          </h1>

          <p className="text-stone-500 text-sm mt-1.5 uppercase tracking-widest text-[11px] font-medium">
            Furniture Showroom Studio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              autoComplete="current-password"
              required
              className="w-full bg-stone-50/50 border border-stone-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-800 hover:bg-amber-900 text-white py-3.5 rounded-xl font-medium shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Signing in..." : "Login to Studio"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-8">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-4"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
