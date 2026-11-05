import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  getCurrentUser,
  logoutUser,
} from "../api/api";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // CHECK CURRENT USER FROM BACKEND
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();

      console.log("Current User Response:", response.data);

      const user = response.data?.user || null;

      setCurrentUser(user);

      return user;
    } catch (error) {
      console.log(
        "Current User Error:",
        error.response?.status,
        error.response?.data || error.message
      );

      setCurrentUser(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // LOGOUT USER
  const logout = async () => {
    try {
      await logoutUser();

      // Clear user only after successful backend logout
      setCurrentUser(null);

      return true;
    } catch (error) {
      console.log(
        "Logout Error:",
        error.response?.status,
        error.response?.data || error.message
      );

      return false;
    }
  };

  // CHECK LOGIN WHEN PAGE LOADS OR REFRESHES
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        fetchCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// CUSTOM AUTH HOOK
const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };