import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPlatformBusinessDetail,
  suspendPlatformBusiness,
  activatePlatformBusiness,
  assignPlatformPlan,
  recordPlatformPayment,
  extendPlatformSubscription,
  setPlatformFeatureOverride,
  loginAsPlatformBusiness,
  getPlatformPlans,
  getPlatformFeatures,
} from "../api/api";

export default function SuperAdminBusinessDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [suspendReason, setSuspendReason] = useState("");
  const [assignPlanId, setAssignPlanId] = useState("");
  const [extendDays, setExtendDays] = useState("30");
  const [overrideFeature, setOverrideFeature] = useState("");
  const [overrideExpiry, setOverrideExpiry] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    plan_id: "", billing_cycle: "monthly", amount: "", discount: "0", payment_method: "bkash", transaction_id: "",
  });

  function load() {
    getPlatformBusinessDetail(id).then(setData).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
    getPlatformPlans().then((d) => setPlans(d.plans));
    getPlatformFeatures().then((d) => setFeatures(d.features));
  }, [id]);

  function flash(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  }

  async function handleSuspend() {
    try {
      await suspendPlatformBusiness(id, suspendReason);
      setSuspendReason("");
      load();
      flash("Business suspended.");
    } catch (err) { setError(err.message); }
  }

  async function handleActivate() {
    try {
      await activatePlatformBusiness(id);
      load();
      flash("Business activated.");
    } catch (err) { setError(err.message); }
  }

  async function handleAssignPlan() {
    if (!assignPlanId) return;
    try {
      await assignPlatformPlan(id, Number(assignPlanId));
      load();
      flash("Plan assigned (no payment recorded).");
    } catch (err) { setError(err.message); }
  }

  async function handleExtend() {
    try {
      await extendPlatformSubscription(id, Number(extendDays));
      load();
      flash(`Extended by ${extendDays} days.`);
    } catch (err) { setError(err.message); }
  }

  async function handleFeatureOverride() {
    if (!overrideFeature) return;
    try {
      await setPlatformFeatureOverride(id, {
        feature_key: overrideFeature,
        is_enabled: true,
        expires_at: overrideExpiry || null,
      });
      load();
      flash(`${overrideFeature} enabled for this business.`);
    } catch (err) { setError(err.message); }
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    try {
      await recordPlatformPayment(id, {
        ...paymentForm,
        plan_id: Number(paymentForm.plan_id),
        amount: Number(paymentForm.amount),
        discount: Number(paymentForm.discount) || 0,
      });
      load();
      flash("Payment recorded and subscription activated.");
      setPaymentForm({ plan_id: "", billing_cycle: "monthly", amount: "", discount: "0", payment_method: "bkash", transaction_id: "" });
    } catch (err) { setError(err.message); }
  }

  async function handleLoginAs() {
    try {
      const result = await loginAsPlatformBusiness(id);
      // Sets the TENANT admin panel's own login keys, then opens it
      // in a new tab - same browser, same origin, separate session
      // from the super admin login.
      localStorage.setItem("token", result.token);
      localStorage.setItem("role", "owner");
      localStorage.removeItem("staffName");
      window.open("/", "_blank");
    } catch (err) { setError(err.message); }
  }

  if (error) return <p className="error-text">{error}</p>;
  if (!data) return <p className="muted">Loading...</p>;

  const { business, usage, subscriptions, invoices, featureOverrides } = data;

  return (
    <div>
      <div className="page-header">
        <h2>{business.business_name}</h2>
        <button className="btn" onClick={handleLoginAs}>Log In As This Business</button>
      </div>

      {message && <p className="muted">{message}</p>}

      <div className="stat-grid">
        <div className="stat-card"><div className="label">Status</div><div className="value">{business.status}</div></div>
        <div className="stat-card"><div className="label">Plan</div><div className="value">{business.plan_name}</div></div>
        <div className="stat-card"><div className="label">Products</div><div className="value">{usage?.product_count ?? 0}</div></div>
        <div className="stat-card"><div className="label">Staff</div><div className="value">{usage?.staff_count ?? 0}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Business Info</h3>
        <table>
          <tbody>
            <tr><td>Owner</td><td>{business.owner_name}</td></tr>
            <tr><td>Phone</td><td>{business.phone}</td></tr>
            <tr><td>Email</td><td className="muted">{business.email || "-"}</td></tr>
            <tr><td>Subdomain</td><td className="muted">{business.subdomain}</td></tr>
            <tr><td>Trial Ends</td><td className="muted">{business.trial_ends_at ? new Date(business.trial_ends_at).toLocaleString() : "-"}</td></tr>
            <tr><td>Subscription Ends</td><td className="muted">{business.subscription_ends_at ? new Date(business.subscription_ends_at).toLocaleString() : "-"}</td></tr>
            {business.suspended_reason && <tr><td>Suspended Reason</td><td className="muted">{business.suspended_reason}</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Account Actions</h3>
        <div className="form-row" style={{ marginBottom: 12 }}>
          {business.status === "suspended" ? (
            <button className="btn" onClick={handleActivate}>Reactivate Business</button>
          ) : (
            <>
              <input placeholder="Reason for suspension" value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} />
              <button className="btn btn-danger" onClick={handleSuspend}>Suspend</button>
            </>
          )}
        </div>

        <div className="form-row" style={{ marginBottom: 12 }}>
          <select value={extendDays} onChange={(e) => setExtendDays(e.target.value)}>
            <option value="7">+7 days</option>
            <option value="14">+14 days</option>
            <option value="30">+30 days</option>
            <option value="90">+90 days</option>
          </select>
          <button className="btn btn-secondary" onClick={handleExtend}>Extend Subscription</button>
        </div>

        <div className="form-row">
          <select value={assignPlanId} onChange={(e) => setAssignPlanId(e.target.value)}>
            <option value="">-- Select plan to assign (no charge) --</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={handleAssignPlan}>Assign Plan</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Record a Manual Payment</h3>
        <p className="muted">For bKash/Nagad/bank transfer subscription payments - activates the business immediately.</p>
        <form onSubmit={handleRecordPayment}>
          <div className="form-row">
            <div className="form-group">
              <label>Plan</label>
              <select value={paymentForm.plan_id} onChange={(e) => setPaymentForm((p) => ({ ...p, plan_id: e.target.value }))} required>
                <option value="">-- Select --</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name} (৳{p.price_monthly}/mo)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Billing Cycle</label>
              <select value={paymentForm.billing_cycle} onChange={(e) => setPaymentForm((p) => ({ ...p, billing_cycle: e.target.value }))}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Amount (৳)</label>
              <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Discount (৳)</label>
              <input type="number" value={paymentForm.discount} onChange={(e) => setPaymentForm((p) => ({ ...p, discount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_method: e.target.value }))}>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transaction ID</label>
              <input value={paymentForm.transaction_id} onChange={(e) => setPaymentForm((p) => ({ ...p, transaction_id: e.target.value }))} />
            </div>
          </div>
          <button className="btn" type="submit">Record Payment & Activate</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Feature Override</h3>
        <p className="muted">Give this business a feature outside their plan (promo, beta test, VIP deal).</p>
        <div className="form-row">
          <select value={overrideFeature} onChange={(e) => setOverrideFeature(e.target.value)}>
            <option value="">-- Select feature --</option>
            {features.map((f) => <option key={f.feature_key} value={f.feature_key}>{f.feature_name}</option>)}
          </select>
          <input type="date" value={overrideExpiry} onChange={(e) => setOverrideExpiry(e.target.value)} placeholder="Expiry (optional)" />
          <button className="btn btn-secondary" onClick={handleFeatureOverride}>Grant Access</button>
        </div>

        {featureOverrides.length > 0 && (
          <table style={{ marginTop: 12 }}>
            <thead><tr><th>Feature</th><th>Enabled</th><th>Expires</th></tr></thead>
            <tbody>
              {featureOverrides.map((o) => (
                <tr key={o.id}>
                  <td>{o.feature_name}</td>
                  <td>{o.is_enabled ? "Yes" : "No"}</td>
                  <td className="muted">{o.expires_at ? new Date(o.expires_at).toLocaleDateString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Invoices</h3>
        {invoices.length === 0 ? <p className="muted">No invoices yet.</p> : (
          <table>
            <thead><tr><th>Plan</th><th>Total</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.plan_name}</td>
                  <td>৳{inv.total}</td>
                  <td className="muted">{inv.payment_method}</td>
                  <td>{inv.status}</td>
                  <td className="muted">{new Date(inv.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Subscription History</h3>
        {subscriptions.length === 0 ? <p className="muted">No subscription history yet.</p> : (
          <table>
            <thead><tr><th>Plan</th><th>Cycle</th><th>Status</th><th>Start</th><th>End</th></tr></thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id}>
                  <td>{s.plan_name}</td>
                  <td className="muted">{s.billing_cycle}</td>
                  <td>{s.status}</td>
                  <td className="muted">{new Date(s.start_date).toLocaleDateString()}</td>
                  <td className="muted">{s.end_date ? new Date(s.end_date).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
