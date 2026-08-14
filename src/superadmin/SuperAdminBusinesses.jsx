import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlatformBusinesses } from "../api/api";

export default function SuperAdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    getPlatformBusinesses(params)
      .then((data) => setBusinesses(data.businesses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function statusBadgeClass(status) {
    if (status === "active") return "badge badge-delivered";
    if (status === "trial") return "badge badge-confirmed";
    if (status === "expired") return "badge badge-cancelled";
    if (status === "suspended") return "badge badge-cancelled";
    return "badge";
  }

  return (
    <div>
      <div className="page-header">
        <h2>Businesses</h2>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Search by name or phone</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="form-group" style={{ alignSelf: "flex-end" }}>
            <button className="btn btn-secondary" onClick={load}>Search</button>
          </div>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : businesses.length === 0 ? (
          <div className="empty-state">No businesses found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Usage</th>
                <th>Signed Up</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id}>
                  <td><Link to={`/superadmin/businesses/${b.id}`}>{b.business_name}</Link></td>
                  <td className="muted">{b.owner_name}<div>{b.phone}</div></td>
                  <td>{b.plan_name}<div className="muted">৳{b.price_monthly}/mo</div></td>
                  <td><span className={statusBadgeClass(b.status)}>{b.status}</span></td>
                  <td className="muted">{b.product_count} products, {b.orders_this_month} orders</td>
                  <td className="muted">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
