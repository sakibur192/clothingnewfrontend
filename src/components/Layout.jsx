// ============================================================
// LAYOUT + PROTECTED ROUTE
// ============================================================

import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import SubscriptionBanner from "./SubscriptionBanner";
import { useAuth } from "../context/AuthContext";

export function Layout({ children }) {
  const { business, role, staffName, logout } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div />
          <div className="topbar-right">
            <span>{staffName ? `${staffName} (${role})` : business?.business_name}</span>
            {!staffName && (
              <span className="muted">({business?.plan_name || "Trial"})</span>
            )}
            <button className="btn btn-secondary btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <SubscriptionBanner />
        {children}
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { business, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!business) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}
