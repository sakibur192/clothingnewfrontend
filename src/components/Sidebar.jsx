// ============================================================
// SIDEBAR
// ============================================================
// Links are filtered by role so staff only see what their role
// can use. This is a UI convenience only - the backend is the
// real enforcement (see middleware/roleMiddleware.js).
// ============================================================

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const allLinks = [
  { to: "/", label: "Dashboard", end: true, roles: "all" },
  { to: "/pos", label: "POS (Sell)", roles: ["owner", "admin", "manager", "cashier"] },
  { to: "/products", label: "Products", roles: "all" },
  { to: "/categories", label: "Categories", roles: "all" },
  { to: "/orders", label: "Orders", roles: "all" },
  { to: "/customers", label: "Customers", roles: "all" },
  { to: "/inventory", label: "Inventory", roles: ["owner", "admin", "manager", "warehouse"] },
  { to: "/offers", label: "Offers", roles: ["owner", "admin", "manager"] },
  { to: "/coupons", label: "Coupons", roles: ["owner", "admin", "manager"] },
  { to: "/storefront", label: "Storefront", roles: ["owner", "admin", "manager"] },
  { to: "/reports", label: "Reports", roles: ["owner", "admin", "manager"] },
  { to: "/courier-settings", label: "Courier (Steadfast)", roles: ["owner", "admin"] },
  { to: "/staff", label: "Staff", roles: ["owner", "admin"] },
];

export default function Sidebar() {
  const { role } = useAuth();

  const visibleLinks = allLinks.filter(
    (link) => link.roles === "all" || link.roles.includes(role)
  );

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        Clothing SaaS
        <span>Admin Panel</span>
      </div>
      {visibleLinks.map((link) => (
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
  );
}
