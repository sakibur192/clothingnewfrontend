// ============================================================
// SUPER ADMIN LAYOUT
// ============================================================
// A separate shell from the tenant admin's <Layout> - different
// sidebar links, different auth, visually distinct (dark sidebar
// with a different accent) so it's never confusable with a
// regular tenant's admin panel.
// ============================================================

import { NavLink, Navigate } from "react-router-dom";
import { useSuperAdminAuth } from "../context/SuperAdminAuthContext";

const links = [
  { to: "/superadmin", label: "Dashboard", end: true },
  { to: "/superadmin/businesses", label: "Businesses" },
  { to: "/superadmin/plans", label: "Plans & Features" },
  { to: "/superadmin/audit-logs", label: "Audit Logs" },
];

export function SuperAdminLayout({ children }) {
  const { superAdmin, logout } = useSuperAdminAuth();

  return (
    <div className="app-shell">
      <div className="sidebar superadmin-sidebar">
        <div className="sidebar-brand">
          Platform Control
          <span>Super Admin</span>
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="main-content">
        <div className="topbar">
          <div />
          <div className="topbar-right">
            <span>{superAdmin?.name}</span>
            <button className="btn btn-secondary btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SuperAdminProtectedRoute({ children }) {
  const { superAdmin, loading } = useSuperAdminAuth();

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!superAdmin) return <Navigate to="/superadmin/login" replace />;

  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
