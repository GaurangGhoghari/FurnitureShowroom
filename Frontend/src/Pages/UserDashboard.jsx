import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  PackageCheck,
  Heart,
  Truck,
  Save,
  X,
} from "lucide-react";

import { useAuth } from "../Context/authcontext";
import { updateUserProfile } from "../api/api";

const SERVER_URL = (
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "")
).replace(/\/+$/, "");

const UserDashboard = () => {
  const { logout, currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address1: "",
    address2: "",
  });

  // Current profile image URL
  const profileImageUrl = currentUser?.profile_image
  ? currentUser.profile_image.startsWith("http")
    ? currentUser.profile_image
    : `${SERVER_URL}/${currentUser.profile_(image || "").replace(/^\/+/, "")}`
  : "";

  // Set current user data
  useEffect(() => {
    setFormData({
      first_name: currentUser?.first_name || "",
      last_name: currentUser?.last_name || "",
      email: currentUser?.email || "",
      phone_number: currentUser?.phone_number || "",
      address1: currentUser?.address1 || "",
      address2: currentUser?.address2 || "",
    });
  }, [currentUser]);

  // Form input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  // Profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Only JPG, PNG and WEBP images are allowed."
      );
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(
        "Image size must be less than 5 MB."
      );
      e.target.value = "";
      return;
    }

    // Clear previous preview URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    const imagePreview = URL.createObjectURL(file);

    setProfileImage(file);
    setPreviewImage(imagePreview);

    setErrorMessage("");
    setSuccessMessage("");
  };

  // Save profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim()
    ) {
      setErrorMessage(
        "Please complete all required fields."
      );
      return;
    }

    if (formData.phone_number.trim().length > 20) {
      setErrorMessage(
        "Phone number must be within 20 characters."
      );
      return;
    }

    try {
      setSaving(true);

      // Create FormData
      const data = new FormData();

      data.append(
        "first_name",
        formData.first_name.trim()
      );

      data.append(
        "last_name",
        formData.last_name.trim()
      );

      data.append(
        "email",
        formData.email.trim()
      );

      data.append(
        "phone_number",
        formData.phone_number.trim()
      );

      data.append(
        "address1",
        formData.address1.trim()
      );

      data.append(
        "address2",
        formData.address2.trim()
      );

      // Add profile image only if selected
      if (profileImage) {
        data.append("profile_image", profileImage);
      }

      // API request
      const response = await updateUserProfile(data);

      const updatedUser = response.data?.user;

      if (!updatedUser) {
        setErrorMessage(
          "Profile saved, but response was empty."
        );
        return;
      }

      // Update Auth Context
      setCurrentUser(updatedUser);

      // Update form data
      setFormData({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
        email: updatedUser.email || "",
        phone_number: updatedUser.phone_number || "",
        address1: updatedUser.address1 || "",
        address2: updatedUser.address2 || "",
      });

      // Clear selected image
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      setProfileImage(null);
      setPreviewImage("");

      setSuccessMessage(
        response.data?.message ||
          "Profile updated successfully."
      );

      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      first_name: currentUser?.first_name || "",
      last_name: currentUser?.last_name || "",
      email: currentUser?.email || "",
      phone_number: currentUser?.phone_number || "",
      address1: currentUser?.address1 || "",
      address2: currentUser?.address2 || "",
    });

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    setProfileImage(null);
    setPreviewImage("");

    setErrorMessage("");
    setSuccessMessage("");

    setIsEditing(false);
  };

  // Logout
  const handleLogout = async () => {
    const success = await logout();

    if (success) {
      navigate("/login");
    }
  };

  // User initials
  const initials = `${currentUser?.first_name?.[0] || ""}${
    currentUser?.last_name?.[0] || ""
  }`.toUpperCase();

  const inputStyle =
    "w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-800/10";

  // Sidebar links
  const quickLinks = [
    {
      title: "My Orders",
      description: "View your orders",
      path: "/my-orders",
      icon: PackageCheck,
    },
    {
      title: "Track Orders",
      description: "Track your deliveries",
      path: "/my-orders",
      icon: Truck,
    },
    {
      title: "Wishlist",
      description: "Your saved products",
      path: "/wishlist",
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800">

      {/* Page Header */}
      <section className="border-b border-stone-200 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              My <span className="text-amber-800">Profile</span>
            </h1>

            <p className="mt-1 text-sm text-stone-500">
              Manage your personal information and account details.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">

          {/* Sidebar */}
          <aside className="space-y-5 lg:col-span-4">

            {/* User Card */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-800 text-xl font-bold text-white">

                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || <User size={26} />
                  )}

                </div>

                <div className="min-w-0">

                  <h2 className="truncate text-lg font-bold text-stone-900">
                    {currentUser?.first_name || "Guest"}{" "}
                    {currentUser?.last_name || ""}
                  </h2>

                  <p className="truncate text-sm text-stone-500">
                    {currentUser?.email || "No email available"}
                  </p>

                </div>

              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">

              <p className="px-4 pb-3 pt-3 text-xs font-bold uppercase tracking-wider text-stone-400">
                Account Menu
              </p>

              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="group flex items-center justify-between rounded-xl px-4 py-4 transition hover:bg-amber-50"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 transition group-hover:bg-amber-100">
                        <Icon size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-stone-800">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-xs text-stone-500">
                          {item.description}
                        </p>
                      </div>

                    </div>

                    <ArrowRight
                      size={16}
                      className="text-stone-400 transition group-hover:translate-x-1 group-hover:text-amber-800"
                    />

                  </Link>
                );
              })}

            </div>

          </aside>

          {/* Profile Section */}
          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:col-span-8">

            {/* Profile Header */}
            <div className="flex flex-col gap-4 border-b border-stone-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">

              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Your contact details and delivery address.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setSuccessMessage("");
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}

            </div>

            <div className="p-6 sm:p-8">

              {/* Success Message */}
              {successMessage && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 size={18} />
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  <AlertCircle size={18} />
                  {errorMessage}
                </div>
              )}

              {/* Edit Profile Form */}
              {isEditing ? (

                <form
                  onSubmit={handleProfileUpdate}
                  className="space-y-7"
                >

                  {/* Profile Image Upload */}
                  <div className="border-b border-stone-100 pb-6">

                    <h3 className="mb-4 text-sm font-bold text-stone-900">
                      Profile Picture
                    </h3>

                    <div className="flex flex-wrap items-center gap-5">

                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-amber-800 text-2xl font-bold text-white">

                        {previewImage || profileImageUrl ? (
                          <img
                            src={previewImage || profileImageUrl}
                            alt="Profile Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials || <User size={30} />
                        )}

                      </div>

                      <div>

                        <label
                          htmlFor="profile_image"
                          className="inline-block cursor-pointer rounded-xl bg-amber-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-900"
                        >
                          Choose Profile Image
                        </label>

                        <input
                          id="profile_image"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />

                        <p className="mt-2 text-xs text-stone-500">
                          JPG, PNG or WEBP. Maximum size 5 MB.
                        </p>

                      </div>

                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>

                    <h3 className="mb-4 text-sm font-bold text-stone-900">
                      Personal Details
                    </h3>

                    <div className="grid gap-5 sm:grid-cols-2">

                      {/* First Name */}
                      <div>
                        <label
                          htmlFor="first_name"
                          className="mb-2 block text-sm font-medium text-stone-700"
                        >
                          First Name *
                        </label>

                        <input
                          id="first_name"
                          name="first_name"
                          type="text"
                          value={formData.first_name}
                          onChange={handleChange}
                          maxLength={100}
                          required
                          className={inputStyle}
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label
                          htmlFor="last_name"
                          className="mb-2 block text-sm font-medium text-stone-700"
                        >
                          Last Name *
                        </label>

                        <input
                          id="last_name"
                          name="last_name"
                          type="text"
                          value={formData.last_name}
                          onChange={handleChange}
                          maxLength={100}
                          required
                          className={inputStyle}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-medium text-stone-700"
                        >
                          Email Address
                        </label>

                        <div className="relative">

                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            readOnly
                            className={`${inputStyle} cursor-not-allowed bg-stone-100 pr-10 text-stone-500`}
                          />

                          <Lock
                            size={15}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                          />

                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label
                          htmlFor="phone_number"
                          className="mb-2 block text-sm font-medium text-stone-700"
                        >
                          Phone Number
                        </label>

                        <input
                          id="phone_number"
                          name="phone_number"
                          type="tel"
                          value={formData.phone_number}
                          onChange={handleChange}
                          maxLength={20}
                          placeholder="+91 98765 43210"
                          className={inputStyle}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="border-t border-stone-100 pt-6">

                    <h3 className="mb-4 text-sm font-bold text-stone-900">
                      Delivery Address
                    </h3>

                    <div className="space-y-5">

                      {/* Primary Address */}
                      <div>
                        <label
                          htmlFor="address1"
                          className="mb-2 block text-sm font-medium text-stone-700"
                        >
                          Primary Address
                        </label>

                        <textarea
                          id="address1"
                          name="address1"
                          rows={3}
                          value={formData.address1}
                          onChange={handleChange}
                          placeholder="House / Flat, Area, City, State, Pincode"
                          className={inputStyle}
                        />
                      </div>

                      {/* Additional Address */}
                      <div>
                        <label
                          htmlFor="address2"
                          className="mb-2 block text-sm font-medium text-stone-700"
                        >
                          Additional Address / Landmark
                        </label>

                        <textarea
                          id="address2"
                          name="address2"
                          rows={2}
                          value={formData.address2}
                          onChange={handleChange}
                          placeholder="Landmark or alternate address (optional)"
                          className={inputStyle}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3 border-t border-stone-100 pt-6">

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                    >
                      <X size={16} />
                      Cancel
                    </button>

                  </div>

                </form>

              ) : (

                /* Profile View */
                <div className="space-y-7">

                  {/* Personal Details */}
                  <div>

                    <h3 className="mb-4 text-sm font-bold text-stone-900">
                      Personal Details
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">

                      {/* Full Name */}
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">

                        <div className="mb-2 flex items-center gap-2 text-stone-500">
                          <User size={16} />
                          <span className="text-xs font-medium">
                            Full Name
                          </span>
                        </div>

                        <p className="font-semibold text-stone-900">
                          {currentUser?.first_name || "—"}{" "}
                          {currentUser?.last_name || ""}
                        </p>

                      </div>

                      {/* Email */}
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">

                        <div className="mb-2 flex items-center gap-2 text-stone-500">
                          <Mail size={16} />
                          <span className="text-xs font-medium">
                            Email Address
                          </span>
                        </div>

                        <p className="break-all font-semibold text-stone-900">
                          {currentUser?.email || "—"}
                        </p>

                      </div>

                      {/* Phone */}
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:col-span-2">

                        <div className="mb-2 flex items-center gap-2 text-stone-500">
                          <Phone size={16} />
                          <span className="text-xs font-medium">
                            Phone Number
                          </span>
                        </div>

                        <p className="font-semibold text-stone-900">
                          {currentUser?.phone_number || "Not provided"}
                        </p>

                      </div>

                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="border-t border-stone-100 pt-6">

                    <h3 className="mb-4 text-sm font-bold text-stone-900">
                      Delivery Address
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">

                      {/* Primary Address */}
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">

                        <div className="mb-2 flex items-center gap-2 text-stone-500">
                          <MapPin size={16} />
                          <span className="text-xs font-medium">
                            Primary Address
                          </span>
                        </div>

                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
                          {currentUser?.address1 ||
                            "No primary address added"}
                        </p>

                      </div>

                      {/* Additional Address */}
                      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">

                        <div className="mb-2 flex items-center gap-2 text-stone-500">
                          <MapPin size={16} />
                          <span className="text-xs font-medium">
                            Additional Address
                          </span>
                        </div>

                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
                          {currentUser?.address2 ||
                            "No additional address added"}
                        </p>

                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;