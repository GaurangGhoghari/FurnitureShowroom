
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import { getAdminUserProfile } from "../../api/api";

const API_BASE_URL = (
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "")
).replace(/\/+$/, "");

const AdminUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminUserProfile(id);

        setUser(response.data.data);
      } catch (error) {
        console.error("User Profile Error:", error);

        setError(
          error.response?.data?.message || "Unable to load user profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return null;

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const handleBack = () => {
    navigate("/admin/users");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FDFBF7] px-4 text-center font-sans text-stone-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-100/70 text-amber-800 shadow-2xs">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-800/20 border-t-amber-800" />
        </div>

        <p className="mt-4 font-serif text-sm font-bold text-stone-900">
          Loading client profile...
        </p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] px-3 py-6 font-sans text-stone-800 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={handleBack}
            className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600 transition hover:text-amber-800 sm:mb-6 sm:text-xs"
          >
            <ArrowLeft size={16} />
            Back to Users
          </button>

          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800 shadow-2xs">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-700" />
            <p className="break-words">{error || "User not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();

  const profileImage = getImageUrl(user.profile_image);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDFBF7] px-3 py-5 font-sans text-stone-800 antialiased sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">

        {/* Back Navigation */}
        <div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-stone-600 transition hover:text-amber-800 sm:text-xs"
          >
            <ArrowLeft size={16} />
            Back to Users
          </button>
        </div>

        {/* Page Header */}
        <div className="border-b border-stone-200/80 pb-5 sm:pb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-800" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-800 sm:text-[11px] sm:tracking-[0.2em]">
              CraftStudio Showroom / Administration
            </span>
          </div>

          <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
            Client Profile
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-500 sm:text-sm">
            Review detailed client credentials, account status, and delivery
            coordinates.
          </p>
        </div>

        {/* Main Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs sm:rounded-3xl">

          {/* Identity Section */}
          <div className="border-b border-stone-100 bg-amber-50/20 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">

              {/* Profile Image */}
              <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={fullName || "User"}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";

                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = "flex";
                      }
                    }}
                    className="h-full w-full rounded-2xl border-2 border-stone-200/80 object-cover shadow-2xs"
                  />
                ) : null}

                <div
                  style={{
                    display: profileImage ? "none" : "flex",
                  }}
                  className="absolute inset-0 items-center justify-center rounded-2xl border-2 border-amber-800/20 bg-amber-800 font-serif text-3xl font-bold text-white shadow-2xs sm:text-4xl"
                >
                  {user.first_name?.[0]?.toUpperCase() || "U"}
                  {user.last_name?.[0]?.toUpperCase() || ""}
                </div>
              </div>

              {/* User Identity */}
              <div className="min-w-0 w-full space-y-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-800">
                  Client Account
                </span>

                <h2 className="break-words font-serif text-xl font-bold text-stone-900 sm:text-2xl lg:text-3xl">
                  {fullName || "User"}
                </h2>

                <p className="break-all text-xs text-stone-500">
                  Client ID: #{user.id}
                </p>

                <div className="flex flex-wrap justify-center gap-2 pt-2 sm:justify-start">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide shadow-2xs sm:text-[11px] ${
                      user.status === "active"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {user.status || "Unknown"}
                  </span>

                  <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-100/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-900 shadow-2xs sm:text-[11px]">
                    {user.role || "user"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-4 sm:p-6 lg:p-8">
            <h3 className="mb-4 font-serif text-base font-bold tracking-tight text-stone-900 sm:mb-5 sm:text-lg">
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <ProfileItem
                icon={<User size={16} />}
                label="First Name"
                value={user.first_name}
              />

              <ProfileItem
                icon={<User size={16} />}
                label="Last Name"
                value={user.last_name}
              />

              <ProfileItem
                icon={<Mail size={16} />}
                label="Email Address"
                value={user.email}
              />

              <ProfileItem
                icon={<Phone size={16} />}
                label="Phone Number"
                value={user.phone_number}
              />

              <ProfileItem
                icon={<MapPin size={16} />}
                label="Primary Address"
                value={user.address1}
              />

              <ProfileItem
                icon={<MapPin size={16} />}
                label="Secondary / Landmark"
                value={user.address2}
              />

              <ProfileItem
                icon={<ShieldCheck size={16} />}
                label="Account Permission"
                value={user.role}
              />

              <ProfileItem
                icon={<Calendar size={16} />}
                label="Registration Date"
                value={
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not available"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ icon, label, value }) => {
  return (
    <div className="min-w-0 rounded-xl border border-stone-200/80 bg-[#FDFBF7] p-3 shadow-2xs transition hover:border-amber-700/30 sm:rounded-2xl sm:p-4">
      <div className="mb-2 flex items-center gap-2 text-amber-800">
        <span className="shrink-0">{icon}</span>

        <span className="text-[9px] font-semibold uppercase tracking-widest text-stone-400 sm:text-[10px]">
          {label}
        </span>
      </div>

      <p className="break-words [overflow-wrap:anywhere] font-serif text-sm font-bold text-stone-900">
        {value || (
          <span className="font-sans text-xs font-normal text-stone-400">
            Not provided
          </span>
        )}
      </p>
    </div>
  );
};

export default AdminUserProfile;