// ============================================================
// API CLIENT
// ============================================================
// One place that knows how to talk to the backend. Every page
// imports functions from here instead of calling fetch() directly.
// ============================================================

// Change this if your backend runs on a different port/host.
const BASE_URL = "http://ygk4so4wkoos80ww0w0ws484.76.13.223.236.sslip.io";

function getToken() {
  return localStorage.getItem("token");
}

// Generic request helper - adds the auth header automatically
// if a token exists, and throws a readable error on failure.
async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ---------------- AUTH ----------------
export function registerBusiness(payload) {
  return request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function loginBusiness(payload) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function getMe() {
  return request("/auth/me");
}

// ---------------- DASHBOARD ----------------
export function getDashboardSummary() {
  return request("/dashboard/summary");
}

// ---------------- CATEGORIES ----------------
export function getCategories() {
  return request("/categories");
}

export function createCategory(payload) {
  return request("/categories", { method: "POST", body: JSON.stringify(payload) });
}

// ---------------- PRODUCTS ----------------
export function getProducts() {
  return request("/products");
}

export function getProductById(id) {
  return request(`/products/${id}`);
}

export function createProduct(payload) {
  return request("/products", { method: "POST", body: JSON.stringify(payload) });
}

export function updateProduct(id, payload) {
  return request(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteProduct(id) {
  return request(`/products/${id}`, { method: "DELETE" });
}

// ---------------- INVENTORY ----------------
export function getLowStock(threshold = 5) {
  return request(`/inventory/low-stock?threshold=${threshold}`);
}

export function adjustStock(payload) {
  return request("/inventory/adjust", { method: "POST", body: JSON.stringify(payload) });
}

export function getStockMovements() {
  return request("/inventory/movements");
}

// ---------------- CUSTOMERS ----------------
export function getCustomers() {
  return request("/customers");
}

export function createCustomer(payload) {
  return request("/customers", { method: "POST", body: JSON.stringify(payload) });
}

// ---------------- ORDERS ----------------
export function getOrders() {
  return request("/orders");
}

export function getOrderById(id) {
  return request(`/orders/${id}`);
}

export function createOrder(payload) {
  return request("/orders", { method: "POST", body: JSON.stringify(payload) });
}

export function updateOrderStatus(id, status) {
  return request(`/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// ---------------- STAFF ----------------
export function getStaffList() {
  return request("/staff");
}

export function createStaffMember(payload) {
  return request("/staff", { method: "POST", body: JSON.stringify(payload) });
}

export function updateStaffMember(id, payload) {
  return request(`/staff/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteStaffMember(id) {
  return request(`/staff/${id}`, { method: "DELETE" });
}

export function staffLogin(payload) {
  return request("/staff/login", { method: "POST", body: JSON.stringify(payload) });
}

// ---------------- OFFERS ----------------
export function getOffers() {
  return request("/offers");
}

export function createOffer(payload) {
  return request("/offers", { method: "POST", body: JSON.stringify(payload) });
}

export function updateOffer(id, payload) {
  return request(`/offers/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteOffer(id) {
  return request(`/offers/${id}`, { method: "DELETE" });
}

// ---------------- COUPONS ----------------
export function getCoupons() {
  return request("/coupons");
}

export function createCoupon(payload) {
  return request("/coupons", { method: "POST", body: JSON.stringify(payload) });
}

export function deleteCoupon(id) {
  return request(`/coupons/${id}`, { method: "DELETE" });
}

export function validateCoupon(payload) {
  return request("/coupons/validate", { method: "POST", body: JSON.stringify(payload) });
}

// ---------------- POS ----------------
export function posLookup(code) {
  return request(`/pos/lookup?code=${encodeURIComponent(code)}`);
}

export function posCheckout(payload) {
  return request("/pos/checkout", { method: "POST", body: JSON.stringify(payload) });
}

// ---------------- PAYMENTS ----------------
export function chargePayment(payload) {
  return request("/payments/charge", { method: "POST", body: JSON.stringify(payload) });
}

// ---------------- COURIER ----------------
export function getCourierBookings() {
  return request("/courier");
}

export function bookCourier(payload) {
  return request("/courier/book", { method: "POST", body: JSON.stringify(payload) });
}

export function updateCourierStatus(id, status) {
  return request(`/courier/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// ---------------- WAREHOUSES ----------------
export function getWarehouses() {
  return request("/inventory/warehouses");
}

export function createWarehouse(payload) {
  return request("/inventory/warehouses", { method: "POST", body: JSON.stringify(payload) });
}

// ---------------- UPLOADS ----------------
export async function uploadImages(files) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  for (const file of files) formData.append("images", file);

  const response = await fetch(`${BASE_URL}/uploads/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Upload failed");
  }
  return data;
}

// ---------------- ATTRIBUTE OPTIONS (color/size presets) ----------------
export function getAttributeOptions(type) {
  return request(`/attributes/${type}`);
}

// ---------------- VARIANTS ----------------
export function addProductVariant(productId, payload) {
  return request(`/products/${productId}/variants`, { method: "POST", body: JSON.stringify(payload) });
}

export function updateProductVariant(variantId, payload) {
  return request(`/products/variants/${variantId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteProductVariant(variantId) {
  return request(`/products/variants/${variantId}`, { method: "DELETE" });
}

export function transferStock(payload) {
  return request("/inventory/transfer", { method: "POST", body: JSON.stringify(payload) });
}

export function getStockTransfers() {
  return request("/inventory/transfers");
}

// ---------------- STOREFRONT (admin builder) ----------------
export function getStorefrontTemplates() {
  return request("/storefront/templates");
}

export function applyStorefrontTemplate(key) {
  return request(`/storefront/templates/${key}/apply`, { method: "POST" });
}

export function getStorefrontSettings() {
  return request("/storefront/settings");
}

export function updateStorefrontSettings(payload) {
  return request("/storefront/settings", { method: "PUT", body: JSON.stringify(payload) });
}

export function getStorefrontPages() {
  return request("/storefront/pages");
}

export function getStorefrontPage(slug) {
  return request(`/storefront/pages/${slug}`);
}

export function saveStorefrontPage(slug, payload) {
  return request(`/storefront/pages/${slug}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteStorefrontPage(slug) {
  return request(`/storefront/pages/${slug}`, { method: "DELETE" });
}

export function getDomainStatus() {
  return request("/storefront/domain");
}

export function setStorefrontDomain(custom_domain) {
  return request("/storefront/domain", { method: "POST", body: JSON.stringify({ custom_domain }) });
}

export function verifyStorefrontDomain() {
  return request("/storefront/domain/verify", { method: "POST" });
}

export function removeStorefrontDomain() {
  return request("/storefront/domain", { method: "DELETE" });
}

// ---------------- SUBSCRIPTION (business owner view) ----------------
export function getSubscriptionStatus() {
  return request("/subscription/status");
}

// ---------------- SUPER ADMIN AUTH ----------------
async function superAdminRequest(path, options = {}) {
  const token = localStorage.getItem("superAdminToken");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export function superAdminLogin(payload) {
  return superAdminRequest("/superadmin/login", { method: "POST", body: JSON.stringify(payload) });
}

export function getSuperAdminMe() {
  return superAdminRequest("/superadmin/me");
}

// ---------------- PLATFORM (super admin control center) ----------------
export function getPlatformDashboard() {
  return superAdminRequest("/platform/dashboard");
}

export function getPlatformBusinesses(params = {}) {
  const query = new URLSearchParams(params).toString();
  return superAdminRequest(`/platform/businesses${query ? `?${query}` : ""}`);
}

export function getPlatformBusinessDetail(id) {
  return superAdminRequest(`/platform/businesses/${id}`);
}

export function suspendPlatformBusiness(id, reason) {
  return superAdminRequest(`/platform/businesses/${id}/suspend`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function activatePlatformBusiness(id) {
  return superAdminRequest(`/platform/businesses/${id}/activate`, { method: "POST" });
}

export function assignPlatformPlan(id, plan_id) {
  return superAdminRequest(`/platform/businesses/${id}/assign-plan`, {
    method: "POST",
    body: JSON.stringify({ plan_id }),
  });
}

export function recordPlatformPayment(id, payload) {
  return superAdminRequest(`/platform/businesses/${id}/record-payment`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function extendPlatformSubscription(id, days) {
  return superAdminRequest(`/platform/businesses/${id}/extend`, {
    method: "POST",
    body: JSON.stringify({ days }),
  });
}

export function setPlatformFeatureOverride(id, payload) {
  return superAdminRequest(`/platform/businesses/${id}/feature-override`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginAsPlatformBusiness(id) {
  return superAdminRequest(`/platform/businesses/${id}/login-as`, { method: "POST" });
}

export function getPlatformPlans() {
  return superAdminRequest("/platform/plans");
}

export function createPlatformPlan(payload) {
  return superAdminRequest("/platform/plans", { method: "POST", body: JSON.stringify(payload) });
}

export function updatePlatformPlan(id, payload) {
  return superAdminRequest(`/platform/plans/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function togglePlatformPlanFeature(planId, featureKey, is_enabled) {
  return superAdminRequest(`/platform/plans/${planId}/features/${featureKey}`, {
    method: "PUT",
    body: JSON.stringify({ is_enabled }),
  });
}

export function getPlatformFeatures() {
  return superAdminRequest("/platform/features");
}

export function getPlatformAuditLogs() {
  return superAdminRequest("/platform/audit-logs");
}

// ---------------- REPORTS (profit & loss) ----------------
export function getReportsSummary(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/reports/summary${query ? `?${query}` : ""}`);
}

export function getReportsTimeSeries(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/reports/time-series${query ? `?${query}` : ""}`);
}

export function getReportsByProduct(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/reports/by-product${query ? `?${query}` : ""}`);
}

export function getReportsByVariant(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/reports/by-variant${query ? `?${query}` : ""}`);
}

export function getReportsByLot(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/reports/by-lot${query ? `?${query}` : ""}`);
}

export function getReportsCompare(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/reports/compare${query ? `?${query}` : ""}`);
}

export function createPurchaseLot(payload) {
  return request("/inventory/purchase-lots", { method: "POST", body: JSON.stringify(payload) });
}

export function getPurchaseLots(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/inventory/purchase-lots${query ? `?${query}` : ""}`);
}
