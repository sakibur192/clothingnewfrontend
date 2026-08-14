// ============================================================
// OFFERS PAGE
// ============================================================
// Covers the full offer taxonomy: cart-wide percentage/fixed
// (scoped to all/product/category/brand - this is how Category
// Discount, Brand Discount, Clearance Sale, Flash Sale, Weekend
// Discount, Happy Hour and Midnight Sale are all built), Buy X
// Get Y (incl. cross-category "Buy Shirt Get Pant"), Free
// Delivery, and Combo/Bundle offers. Multiple can be active at
// once - the Stackable toggle controls whether an offer combines
// with others or applies exclusively.
// ============================================================

import { useEffect, useState } from "react";
import { getOffers, createOffer, deleteOffer, getCategories, getProducts } from "../api/api";

const emptyForm = {
  name: "",
  offer_type: "percentage",
  value: "",
  min_purchase_amount: "",
  applies_to: "all",
  category_id: "",
  product_id: "",
  brand: "",
  buy_quantity: "",
  get_quantity: "",
  get_discount_percent: "100",
  cross_reward_category_id: "",
  cross_reward_discount_percent: "",
  active_days_of_week: [],
  active_time_start: "",
  active_time_end: "",
  requires_first_order: false,
  requires_birthday_window: false,
  customer_group: "",
  is_stackable: true,
  start_date: "",
  end_date: "",
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function loadOffers() {
    getOffers().then((data) => setOffers(data.offers)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOffers();
    getCategories().then((data) => setCategories(data.categories));
    getProducts().then((data) => setProducts(data.products));
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(day) {
    setForm((prev) => ({
      ...prev,
      active_days_of_week: prev.active_days_of_week.includes(day)
        ? prev.active_days_of_week.filter((d) => d !== day)
        : [...prev.active_days_of_week, day],
    }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await createOffer({ ...form, active_days_of_week: form.active_days_of_week.length ? form.active_days_of_week.join(",") : null });
      setForm(emptyForm);
      setShowForm(false);
      loadOffers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await deleteOffer(id);
      loadOffers();
    } catch (err) {
      setError(err.message);
    }
  }

  function describeOffer(o) {
    const scope = o.applies_to === "all" ? "all products" : o.applies_to === "category" ? `category: ${o.category_name}` : o.applies_to === "product" ? `product: ${o.product_name}` : `brand: ${o.brand}`;
    if (o.offer_type === "percentage") return `${o.value}% off ${scope}`;
    if (o.offer_type === "fixed") return `৳${o.value} off ${scope}`;
    if (o.offer_type === "buy_x_get_y") return `Buy ${o.buy_quantity} Get ${o.get_quantity} at ${o.get_discount_percent}% off (${scope})`;
    if (o.offer_type === "buy_x_get_y_cross") return `Buy from ${scope}, get ${o.cross_reward_discount_percent}% off category ${o.cross_reward_category_id}`;
    if (o.offer_type === "free_delivery") return `Free delivery on orders over ৳${o.min_purchase_amount}`;
    if (o.offer_type === "bundle") return `Bundle: ${(o.bundle_items || []).length} items, ${o.bundle_discount_type === "percentage" ? o.bundle_discount_value + "%" : "৳" + o.bundle_discount_value} off`;
    return o.offer_type;
  }

  function describeConditions(o) {
    const bits = [];
    if (o.requires_first_order) bits.push("First order only");
    if (o.requires_birthday_window) bits.push("Birthday window");
    if (o.customer_group) bits.push(`Group: ${o.customer_group}`);
    if (o.active_days_of_week) bits.push(o.active_days_of_week);
    if (o.active_time_start) bits.push(`${o.active_time_start}–${o.active_time_end}`);
    if (!o.is_stackable) bits.push("Exclusive (won't stack)");
    return bits.join(" · ");
  }

  return (
    <div>
      <div className="page-header">
        <h2>Offers</h2>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "+ Create Offer"}</button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label>Offer Name</label>
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Weekend Sale" required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.offer_type} onChange={(e) => updateField("offer_type", e.target.value)}>
                  <option value="percentage">Percentage off (Category/Brand/Clearance/Weekend/Happy Hour)</option>
                  <option value="fixed">Fixed amount off (Spend X Get Y Off)</option>
                  <option value="buy_x_get_y">Buy X Get Y (BOGO, Buy 2 Get 20%)</option>
                  <option value="buy_x_get_y_cross">Buy X Get Y — different item (Buy Shirt Get Pant 50%)</option>
                  <option value="free_delivery">Free Delivery (Spend X)</option>
                  <option value="bundle">Combo / Bundle Offer</option>
                </select>
              </div>
            </div>

            {(form.offer_type === "percentage" || form.offer_type === "fixed") && (
              <div className="form-row">
                <div className="form-group">
                  <label>{form.offer_type === "percentage" ? "Percentage (%)" : "Amount (৳)"}</label>
                  <input type="number" value={form.value} onChange={(e) => updateField("value", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Minimum Purchase (৳)</label>
                  <input type="number" value={form.min_purchase_amount} onChange={(e) => updateField("min_purchase_amount", e.target.value)} />
                </div>
              </div>
            )}

            {form.offer_type === "free_delivery" && (
              <div className="form-group">
                <label>Minimum Spend for Free Delivery (৳)</label>
                <input type="number" value={form.min_purchase_amount} onChange={(e) => updateField("min_purchase_amount", e.target.value)} />
              </div>
            )}

            {(form.offer_type === "buy_x_get_y" || form.offer_type === "buy_x_get_y_cross") && (
              <div className="form-row">
                <div className="form-group">
                  <label>Buy Quantity</label>
                  <input type="number" value={form.buy_quantity} onChange={(e) => updateField("buy_quantity", e.target.value)} placeholder="2" />
                </div>
                {form.offer_type === "buy_x_get_y" && (
                  <>
                    <div className="form-group">
                      <label>Get Quantity</label>
                      <input type="number" value={form.get_quantity} onChange={(e) => updateField("get_quantity", e.target.value)} placeholder="1" />
                    </div>
                    <div className="form-group">
                      <label>Discount on "Get" items (%)</label>
                      <input type="number" value={form.get_discount_percent} onChange={(e) => updateField("get_discount_percent", e.target.value)} placeholder="100 = free" />
                    </div>
                  </>
                )}
                {form.offer_type === "buy_x_get_y_cross" && (
                  <>
                    <div className="form-group">
                      <label>Reward Category</label>
                      <select value={form.cross_reward_category_id} onChange={(e) => updateField("cross_reward_category_id", e.target.value)}>
                        <option value="">-- Select --</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Reward Discount (%)</label>
                      <input type="number" value={form.cross_reward_discount_percent} onChange={(e) => updateField("cross_reward_discount_percent", e.target.value)} placeholder="50" />
                    </div>
                  </>
                )}
              </div>
            )}

            {form.offer_type === "bundle" && (
              <p className="muted">Bundles need specific product IDs — create this one via the API/Postman collection (see "Combo/Bundle Offer" example) for now; a dedicated bundle-item picker is a good next addition.</p>
            )}

            {form.offer_type !== "bundle" && form.offer_type !== "free_delivery" && (
              <div className="form-row">
                <div className="form-group">
                  <label>Applies To</label>
                  <select value={form.applies_to} onChange={(e) => updateField("applies_to", e.target.value)}>
                    <option value="all">All Products</option>
                    <option value="category">Specific Category</option>
                    <option value="product">Specific Product</option>
                    <option value="brand">Specific Brand</option>
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
            )}

            <div className="card" style={{ background: "#faf9f6", marginTop: 12 }}>
              <h4 style={{ marginTop: 0 }}>Who & When (optional)</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Group</label>
                  <input value={form.customer_group} onChange={(e) => updateField("customer_group", e.target.value)} placeholder="e.g. vip, wholesale" />
                </div>
                <div className="form-group" style={{ alignSelf: "center", paddingTop: 18 }}>
                  <label><input type="checkbox" checked={form.requires_first_order} onChange={(e) => updateField("requires_first_order", e.target.checked)} style={{ width: "auto", marginRight: 6 }} /> First order only</label>
                </div>
                <div className="form-group" style={{ alignSelf: "center", paddingTop: 18 }}>
                  <label><input type="checkbox" checked={form.requires_birthday_window} onChange={(e) => updateField("requires_birthday_window", e.target.checked)} style={{ width: "auto", marginRight: 6 }} /> Birthday Discount</label>
                </div>
              </div>

              <label>Active Days (Weekend Discount) — leave blank for every day</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {DAYS.map((d) => (
                  <button type="button" key={d} className={form.active_days_of_week.includes(d) ? "btn btn-sm" : "btn btn-secondary btn-sm"} onClick={() => toggleDay(d)}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time Window Start (Happy Hour / Midnight Sale)</label>
                  <input type="time" value={form.active_time_start} onChange={(e) => updateField("active_time_start", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Time Window End</label>
                  <input type="time" value={form.active_time_end} onChange={(e) => updateField("active_time_end", e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date (Flash/Clearance Sale)</label>
                  <input type="date" value={form.start_date} onChange={(e) => updateField("start_date", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => updateField("end_date", e.target.value)} />
                </div>
              </div>

              <label>
                <input type="checkbox" checked={form.is_stackable} onChange={(e) => updateField("is_stackable", e.target.checked)} style={{ width: "auto", marginRight: 6 }} />
                Stackable (can combine with other offers/coupons at checkout — uncheck for an exclusive offer)
              </label>
            </div>

            <button className="btn" type="submit" style={{ marginTop: 12 }}>Create Offer</button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : offers.length === 0 ? (
          <div className="empty-state">No offers yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Rule</th><th>Conditions</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td className="muted">{describeOffer(o)}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{describeConditions(o) || "—"}</td>
                  <td><span className={o.is_active ? "badge badge-delivered" : "badge badge-cancelled"}>{o.is_active ? "Active" : "Inactive"}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
