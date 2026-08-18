// ============================================================
// COURIER SETTINGS PAGE
// ============================================================
// Where the business connects their OWN Steadfast merchant
// account. Once connected with auto-booking on, confirming an
// order (Orders page) automatically books it with Steadfast, and
// delivery status updates arrive automatically via webhook - no
// further manual action needed.
// ============================================================

import { useEffect, useState } from "react";
import {
  getCourierCredentials,
  saveCourierCredentials,
  testCourierConnection,
  removeCourierCredentials,
} from "../api/api";

export default function CourierSettings() {
  const [status, setStatus] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [autoBook, setAutoBook] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  function load() {
    getCourierCredentials().then(setStatus).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await saveCourierCredentials({ api_key: apiKey, secret_key: secretKey, auto_book_on_confirm: autoBook });
      setApiKey("");
      setSecretKey("");
      setMessage("Credentials saved. Copy the webhook URL below into your Steadfast dashboard to enable automatic status updates.");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setError("");
    setMessage("");
    setTesting(true);
    try {
      const result = await testCourierConnection();
      setMessage(`${result.message} Current balance: ৳${result.balance}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Disconnect Steadfast? Automatic booking will stop until you reconnect.")) return;
    try {
      await removeCourierCredentials();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function copyWebhookUrl() {
    navigator.clipboard?.writeText(status.webhookUrl);
    setMessage("Webhook URL copied to clipboard.");
  }

  return (
    <div>
      <div className="page-header">
        <h2>Courier — Steadfast</h2>
      </div>

      {error && <p className="error-text">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="card" style={{ marginBottom: 16, background: "#f7f5f2" }}>
        <p className="muted" style={{ margin: 0 }}>
          <strong>This is entirely optional.</strong> If you don't use a courier service — or use one that isn't
          Steadfast — just skip this page. Your orders work exactly the same either way: move them through
          Pending → Confirmed → Packed → Shipped → Delivered manually from Order Detail or the Orders list.
          Connecting Steadfast here only adds automatic booking and tracking on top of that — it never changes
          how orders behave if you leave it disconnected.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>How this works, if you connect it</h3>
        <p className="muted">
          1. Connect your own Steadfast merchant account below (get your Api Key and Secret Key from your{" "}
          <a href="https://steadfast.com.bd" target="_blank" rel="noopener noreferrer">steadfast.com.bd</a> dashboard → API).<br />
          2. When you mark an order <strong>Confirmed</strong> on the Orders page, it's automatically booked with Steadfast — no extra click.<br />
          3. Paste the webhook URL below into your Steadfast dashboard so delivery status updates flow back automatically — delivered orders are marked paid and closed out with zero manual work.
        </p>
      </div>

      {status?.connected ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Connected</h3>
          <table>
            <tbody>
              <tr><td>Api Key</td><td className="muted">{status.apiKeyPreview}</td></tr>
              <tr><td>Status</td><td><span className={status.isActive ? "badge badge-delivered" : "badge badge-cancelled"}>{status.isActive ? "Active" : "Inactive"}</span></td></tr>
              <tr><td>Auto-book on confirm</td><td>{status.autoBookOnConfirm ? "On" : "Off"}</td></tr>
            </tbody>
          </table>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Webhook URL — paste this into Steadfast's dashboard</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={status.webhookUrl} readOnly />
              <button className="btn btn-secondary btn-sm" onClick={copyWebhookUrl}>Copy</button>
            </div>
          </div>

          <button className="btn" onClick={handleTest} disabled={testing}>
            {testing ? "Checking..." : "Test Connection & Check Balance"}
          </button>{" "}
          <button className="btn btn-danger" onClick={handleRemove}>Disconnect</button>
        </div>
      ) : (
        <div className="card">
          <h3>Connect Your Steadfast Account</h3>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label>Api Key</label>
                <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Secret Key</label>
                <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required />
              </div>
            </div>
            <label style={{ display: "block", marginBottom: 12 }}>
              <input type="checkbox" checked={autoBook} onChange={(e) => setAutoBook(e.target.checked)} style={{ width: "auto", marginRight: 8 }} />
              Automatically book with Steadfast when I confirm an order
            </label>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Connecting..." : "Connect Steadfast"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
