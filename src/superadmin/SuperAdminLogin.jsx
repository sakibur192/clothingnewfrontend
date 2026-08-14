import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { superAdminLogin } from "../api/api";
import { useSuperAdminAuth } from "../context/SuperAdminAuthContext";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useSuperAdminAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await superAdminLogin({ email, password });
      login(data.token, data.superAdmin);
      navigate("/superadmin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page superadmin-auth-page">
      <div className="auth-box">
        <h1>Platform Control Center</h1>
        <p className="subtitle">Super admin sign-in</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Super admin accounts are created via the setup API, not self-registration.
        </p>
      </div>
    </div>
  );
}
