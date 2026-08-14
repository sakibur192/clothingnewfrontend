// ============================================================
// LOGIN PAGE
// ============================================================
// Two tabs: business owner login, and staff login (needs the
// business's own phone number too, since staff belong to one
// specific business).
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginBusiness, staffLogin } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("owner"); // 'owner' | 'staff'

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, staffLoginSuccess } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "owner") {
        const data = await loginBusiness({ phone, password });
        login(data.token, data.business);
      } else {
        const data = await staffLogin({ business_phone: businessPhone, phone, password });
        await staffLoginSuccess(data.token, data.staff);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to manage your store</p>

        <div className="form-row" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={mode === "owner" ? "btn btn-sm" : "btn btn-secondary btn-sm"}
            onClick={() => setMode("owner")}
            style={{ flex: 1 }}
          >
            Business Owner
          </button>
          <button
            type="button"
            className={mode === "staff" ? "btn btn-sm" : "btn btn-secondary btn-sm"}
            onClick={() => setMode("staff")}
            style={{ flex: 1 }}
          >
            Staff Login
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          {mode === "staff" && (
            <div className="form-group">
              <label>Business Phone Number</label>
              <input
                type="text"
                placeholder="The phone number the business signed up with"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>{mode === "staff" ? "Your Phone Number" : "Phone Number"}</label>
            <input
              type="text"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {mode === "owner" && (
          <p className="auth-switch">
            New business? <Link to="/register">Start your free trial</Link>
          </p>
        )}
      </div>
    </div>
  );
}
