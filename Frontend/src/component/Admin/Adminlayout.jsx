import { useEffect, useState } from "react";
import Adminsidebar from "./Adminsidebar";

const Adminlayout = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("admin-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDark((prev) => !prev);
    };

    window.addEventListener("admin-theme-toggle", handleThemeChange);

    return () => {
      window.removeEventListener("admin-theme-toggle", handleThemeChange);
    };
  }, []);

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        isDark
          ? "dark bg-gray-950 text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <Adminsidebar />

      <main className="min-w-0 flex-1 p-6 transition-colors duration-300">
        {children}
      </main>
    </div>
  );
};

export default Adminlayout;
