// ============================================================
// COUPONS PAGE
// ============================================================
// Percentage / Fixed / Free Shipping, scoped to All/Product/
// Category/Brand, with Expiry + Scheduling, Usage Limits, Min
// Purchase, Max Discount, One Time (usage_limit: 1), and Single
// User coupons (restricted to one specific customer).
// ============================================================

import { useEffect, useState } from "react";
import { getCoupons, createCoupon, deleteCoupon, getCategories, getProducts, getCustomers } from "../api/api";

const emptyForm = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_purchase_amount: "",
  max_discount_amount: "",
  usage_limit: "",
  per_customer_limit: "1",
  expires_at: "",
  starts_at: "",
  applies_to: "all",
  category_id: "",
  product_id: "",
  brand: "",
  single_customer_id: "",
  is_stackable: true,
};

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function loadCoupons() {
    getCoupons().then((data) => setCoupons(data.coupons)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCoupons();
    getCategories().then((data) => setCategories(data.categories));
    getProducts().then((data) => setProducts(data.products));
    getCustomers().then((data) => setCustomers(data.customers));
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await createCoupon(form);
      setForm(emptyForm);
      setShowForm(false);
      loadCoupons();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      loadCoupons();
    } catch (err) {
      setError(err.message);
    }
  }

  function describeCoupon(c) {
    const scope = c.applies_to === "all" ? "" : c.applies_to === "category" ? ` (${c.category_name})` : c.applies_to === "product" ? ` (${c.product_name})` : ` (${c.brand})`;
    if (c.discount_type === "percentage") return `${c.discount_value}% off${scope}`;
    if (c.discount_type === "fixed") return `৳${c.discount_value} off${scope}`;
    if (c.discount_type === "free_shipping") return "Free shipping";
    return c.discount_type;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Coupons</h2>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "+ Create Coupon"}</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label>Coupon Code</label>
                <input value={form.code} onChange={(e) => updateField("code", e.target.value.toUpperCase())} placeholder="e.g. EID30" required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.discount_type} onChange={(e) => updateField("discount_type", e.target.value)}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
            </div>

            {form.discount_type !== "free_shipping" && (
              <div className="form-row">
                <div className="form-group">
                  <label>{form.discount_type === "percentage" ? "Percentage (%)" : "Amount (৳)"}</label>
                  <input type="number" value={form.discount_value} onChange={(e) => updateField("discount_value", e.target.value)} />
                </div>
                {form.discount_type === "percentage" && (
                  <div className="form-group">
                    <label>Max Discount Cap (৳, optional)</label>
                    <input type="number" value={form.max_discount_amount} onChange={(e) => updateField("max_discount_amount", e.target.value)} />
                  </div>
                )}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Applies To</label>
                <select value={form.applies_to} onChange={(e) => updateField("applies_to", e.target.value)}>
                  <option value="all">All Products</option>
                  <option value="category">Specific Category (Category Coupon)</option>
                  <option value="product">Specific Product (Product Coupon)</option>
                  <option value="brand">Specific Brand (Brand Coupon)</option>
                </select>
              </div>
              {form.applies_to === "category" && (
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category_id} onChange={(e) => updateField("category_id", e.target.value)}>
                    <option value="">-- Select --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              {form.applies_to === "product" && (
                <div className="form-group">
                  <label>Product</label>
                  <select value={form.product_id} onChange={(e) => updateField("product_id", e.target.value)}>
                    <option value="">-- Select --</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {form.applies_to === "brand" && (
                <div className="form-group">
                  <label>Brand Name</label>
                  <input value={form.brand} onChange={(e) => updateField("brand", e.target.value)} />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Minimum Purchase (৳)</label>
                <input type="number" value={form.min_purchase_amount} onChange={(e) => updateField("min_purchase_amount", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Total Usage Limit (1 = One Time Coupon)</label>
                <input type="number" value={form.usage_limit} onChange={(e) => updateField("usage_limit", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Per Customer Limit</label>
                <input type="number" value={form.per_customer_limit} onChange={(e) => updateField("per_customer_limit", e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Single User Coupon (optional — restrict to one specific customer)</label>
              <select value={form.single_customer_id} onChange={(e) => updateField("single_customer_id", e.target.value)}>
                <option value="">-- Anyone can use it --</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Starts At (Coupon Scheduling, optional)</label>
                <input type="date" value={form.starts_at} onChange={(e) => updateField("starts_at", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Expires At (optional)</label>
                <input type="date" value={form.expires_at} onChange={(e) => updateField("expires_at", e.target.value)} />
              </div>
            </div>

            <label>
              <input type="checkbox" checked={form.is_stackable} onChange={(e) => updateField("is_stackable", e.target.checked)} style={{ width: "auto", marginRight: 6 }} />
              Stackable (can combine with active offers — uncheck for an exclusive coupon)
            </label>

            <div style={{ marginTop: 12 }}>
              <button className="btn" type="submit">Create Coupon</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : coupons.length === 0 ? (
          <div className="empty-state">No coupons yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Code</th><th>Rule</th><th>Restrictions</th><th>Used</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td className="muted">{describeCoupon(c)}</td>
                  <td className="muted" style={{ fontSize: 12 }}>
                    {c.single_customer_name ? `Only: ${c.single_customer_name}` : ""}
                    {!c.is_stackable ? " · Exclusive" : ""}
                  </td>
                  <td className="muted">{c.used_count} / {c.usage_limit || "∞"}</td>
                  <td><span className={c.is_active ? "badge badge-delivered" : "badge badge-cancelled"}>{c.is_active ? "Active" : "Inactive"}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
