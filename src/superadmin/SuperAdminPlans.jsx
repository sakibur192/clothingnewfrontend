import { useEffect, useState } from "react";
import { getPlatformPlans, updatePlatformPlan, togglePlatformPlanFeature, getPlatformFeatures } from "../api/api";

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  function load() {
    getPlatformPlans().then((d) => setPlans(d.plans)).catch((err) => setError(err.message));
    getPlatformFeatures().then((d) => setFeatures(d.features));
  }

  useEffect(() => { load(); }, []);

  function startEdit(plan) {
    setEditingId(plan.id);
    setEditForm({
      price_monthly: plan.price_monthly,
      max_products: plan.max_products,
      max_staff: plan.max_staff,
      max_warehouses: plan.max_warehouses,
      max_orders_monthly: plan.max_orders_monthly,
    });
  }

  async function saveEdit(id) {
    try {
      await updatePlatformPlan(id, editForm);
      setEditingId(null);
      load();
    } catch (err) { setError(err.message); }
  }

  async function toggleFeature(planId, featureKey, currentlyEnabled) {
    try {
      await togglePlatformPlanFeature(planId, featureKey, !currentlyEnabled);
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <div className="page-header"><h2>Plans & Features</h2></div>
      {error && <p className="error-text">{error}</p>}

      {plans.map((plan) => (
        <div className="card" key={plan.id} style={{ marginBottom: 16 }}>
          <div className="page-header" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>{plan.plan_name}</h3>
            {editingId === plan.id ? (
              <div>
                <button className="btn btn-sm" onClick={() => saveEdit(plan.id)}>Save</button>{" "}
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => startEdit(plan)}>Edit Limits & Price</button>
            )}
          </div>

          {editingId === plan.id ? (
            <div className="form-row">
              <div className="form-group">
                <label>Price / month (৳)</label>
                <input type="number" value={editForm.price_monthly} onChange={(e) => setEditForm((f) => ({ ...f, price_monthly: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Max Products</label>
                <input type="number" value={editForm.max_products} onChange={(e) => setEditForm((f) => ({ ...f, max_products: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Max Staff</label>
                <input type="number" value={editForm.max_staff} onChange={(e) => setEditForm((f) => ({ ...f, max_staff: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Max Warehouses</label>
                <input type="number" value={editForm.max_warehouses} onChange={(e) => setEditForm((f) => ({ ...f, max_warehouses: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Max Orders/mo</label>
                <input type="number" value={editForm.max_orders_monthly} onChange={(e) => setEditForm((f) => ({ ...f, max_orders_monthly: e.target.value }))} />
              </div>
            </div>
          ) : (
            <p className="muted">
              ৳{plan.price_monthly}/mo · {plan.max_products} products · {plan.max_staff} staff ·{" "}
              {plan.max_warehouses} warehouses · {plan.max_orders_monthly} orders/mo
            </p>
          )}

          <h4 style={{ marginTop: 16 }}>Features Included</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {features.map((f) => {
              const planFeature = plan.features.find((pf) => pf.feature_key === f.feature_key);
              const enabled = planFeature?.is_enabled || false;
              return (
                <button
                  key={f.feature_key}
                  className={enabled ? "btn btn-sm" : "btn btn-secondary btn-sm"}
                  onClick={() => toggleFeature(plan.id, f.feature_key, enabled)}
                >
                  {enabled ? "✓ " : "+ "}{f.feature_name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
