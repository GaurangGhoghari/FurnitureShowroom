import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/authcontext";

const AuthRoute = ({
  type,
  role,
  children,
  loginMessage,
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // 1. Wait until backend checks the login cookie
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-900" />

          <h2 className="text-xl font-semibold text-rose-900">
            Checking login...
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please wait while we verify your session.
          </p>
        </div>
      </div>
    );
  }

  // 2. PUBLIC ROUTES: Home, About, Contact
  if (type === "public") {
    return children;
  }

  // 3. GUEST ROUTES: Login, Register
  if (type === "guest") {
    if (currentUser) {
      const dashboard =
        currentUser.role === "admin"
          ? "/admindashboard"
          : "/userdashboard";

      return <Navigate to={dashboard} replace />;
    }

    return children;
  }

  // 4. PROTECTED ROUTES: User and Admin pages
  if (type === "protected") {
    // Redirect to login only when no valid user exists
    if (!currentUser) {
      return (
        <Navigate
          to="/login"
          state={{
            message: loginMessage || null,
            from: location,
          }}
          replace
        />
      );
    }

    // Verify user role
    if (role && currentUser.role !== role) {
      const correctDashboard =
        currentUser.role === "admin"
          ? "/admindashboard"
          : "/userdashboard";

      return (
        <Navigate
          to={correctDashboard}
          replace
        />
      );
    }

    // User is authenticated and has the correct role
    return children;
  }

  // 5. Unknown route type
  return <Navigate to="/" replace />;
};

export default AuthRoute;