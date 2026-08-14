// ============================================================
// REGISTER PAGE
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerBusiness } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    business_name: "",
    owner_name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerBusiness(form);
      login(data.token, data.business);
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
        <h1>Start your free trial</h1>
        <p className="subtitle">14 days free on the Wantapreneur plan</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              placeholder="e.g. ABC Fashion"
              value={form.business_name}
              onChange={(e) => updateField("business_name", e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Owner Name</label>
            <input
              type="text"
              value={form.owner_name}
              onChange={(e) => updateField("owner_name", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="01XXXXXXXXX"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email (optional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
            />
          </div>
          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? "Creating your store..." : "Create My Store"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
