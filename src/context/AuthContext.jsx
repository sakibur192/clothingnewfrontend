// ============================================================
// AUTH CONTEXT
// ============================================================
// Handles TWO kinds of login: the business owner (full access)
// and staff members (role-limited access). Both end up with a
// JWT token and a "role" - the UI uses `role` to show/hide menu
// items, and the backend enforces the real permission checks.
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [business, setBusiness] = useState(null);
  const [role, setRole] = useState(null); // 'owner', 'admin', 'manager', 'cashier', 'warehouse'
  const [staffName, setStaffName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    const savedStaffName = localStorage.getItem("staffName");

    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((data) => {
        setBusiness(data.business);
        setRole(savedRole || "owner");
        setStaffName(savedStaffName || null);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("staffName");
      })
      .finally(() => setLoading(false));
  }, []);

  // Business owner login
  function login(token, businessData) {
    localStorage.setItem("token", token);
    localStorage.setItem("role", "owner");
    localStorage.removeItem("staffName");
    setBusiness(businessData);
    setRole("owner");
    setStaffName(null);
  }

  // Staff login - fetches business info separately since the staff
  // login response only contains the staff's own name/role
  async function staffLoginSuccess(token, staffData) {
    localStorage.setItem("token", token);
    localStorage.setItem("role", staffData.role);
    localStorage.setItem("staffName", staffData.name);
    setRole(staffData.role);
    setStaffName(staffData.name);

    const data = await getMe();
    setBusiness(data.business);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("staffName");
    setBusiness(null);
    setRole(null);
    setStaffName(null);
  }

  return (
    <AuthContext.Provider
      value={{ business, role, staffName, loading, login, staffLoginSuccess, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
