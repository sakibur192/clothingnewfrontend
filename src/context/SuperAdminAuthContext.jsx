// ============================================================
// SUPER ADMIN AUTH CONTEXT
// ============================================================
// Deliberately separate from AuthContext (tenant/staff login).
// Uses its own localStorage key so a super admin session and a
// tenant session can coexist in the same browser without
// clobbering each other.
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";
import { getSuperAdminMe } from "../api/api";

const SuperAdminAuthContext = createContext(null);

export function SuperAdminAuthProvider({ children }) {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("superAdminToken");
    if (!token) {
      setLoading(false);
      return;
    }

    getSuperAdminMe()
      .then((data) => setSuperAdmin(data.superAdmin))
      .catch(() => localStorage.removeItem("superAdminToken"))
      .finally(() => setLoading(false));
  }, []);

  function login(token, superAdminData) {
    localStorage.setItem("superAdminToken", token);
    setSuperAdmin(superAdminData);
  }

  function logout() {
    localStorage.removeItem("superAdminToken");
    setSuperAdmin(null);
  }

  return (
    <SuperAdminAuthContext.Provider value={{ superAdmin, loading, login, logout }}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

export function useSuperAdminAuth() {
  return useContext(SuperAdminAuthContext);
}
