// ============================================================
// APP - ROUTES
// ============================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/Layout";
import { SuperAdminAuthProvider } from "./context/SuperAdminAuthContext";
import { SuperAdminProtectedRoute } from "./superadmin/SuperAdminLayout";
import SuperAdminLogin from "./superadmin/SuperAdminLogin";
import SuperAdminDashboard from "./superadmin/SuperAdminDashboard";
import SuperAdminBusinesses from "./superadmin/SuperAdminBusinesses";
import SuperAdminBusinessDetail from "./superadmin/SuperAdminBusinessDetail";
import SuperAdminPlans from "./superadmin/SuperAdminPlans";
import SuperAdminAuditLogs from "./superadmin/SuperAdminAuditLogs";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import VariantManager from "./pages/VariantManager";
import Orders from "./pages/Orders";
import OrderForm from "./pages/OrderForm";
import OrderDetail from "./pages/OrderDetail";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Staff from "./pages/Staff";
import Offers from "./pages/Offers";
import Coupons from "./pages/Coupons";
import StorefrontBuilder from "./pages/StorefrontBuilder";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <SuperAdminAuthProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route
            path="/superadmin"
            element={
              <SuperAdminProtectedRoute>
                <SuperAdminDashboard />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/businesses"
            element={
              <SuperAdminProtectedRoute>
                <SuperAdminBusinesses />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/businesses/:id"
            element={
              <SuperAdminProtectedRoute>
                <SuperAdminBusinessDetail />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/plans"
            element={
              <SuperAdminProtectedRoute>
                <SuperAdminPlans />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/audit-logs"
            element={
              <SuperAdminProtectedRoute>
                <SuperAdminAuditLogs />
              </SuperAdminProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/variants"
            element={
              <ProtectedRoute>
                <VariantManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <ProtectedRoute>
                <OrderForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <POS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute>
                <Offers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coupons"
            element={
              <ProtectedRoute>
                <Coupons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/storefront"
            element={
              <ProtectedRoute>
                <StorefrontBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      </SuperAdminAuthProvider>
    </BrowserRouter>
  );
}
