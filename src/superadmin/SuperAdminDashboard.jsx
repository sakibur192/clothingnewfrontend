import { useEffect, useState } from "react";
import { getPlatformDashboard } from "../api/api";

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlatformDashboard()
      .then((data) => setSummary(data.summary))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error-text">{error}</p>;
  if (!summary) return <p className="muted">Loading...</p>;

  const stats = [
    { label: "Total Businesses", value: summary.totalBusinesses },
    { label: "Active", value: summary.statusCounts.active || 0 },
    { label: "Trial", value: summary.statusCounts.trial || 0 },
    { label: "Expired", value: summary.statusCounts.expired || 0 },
    { label: "Suspended", value: summary.statusCounts.suspended || 0 },
    { label: "Estimated MRR", value: `৳${summary.mrr.toLocaleString()}` },
    { label: "Revenue This Month", value: `৳${summary.revenueThisMonth.toLocaleString()}` },
    { label: "New Signups This Month", value: summary.newBusinessesThisMonth },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Platform Dashboard</h2>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Businesses by Plan</h3>
        <table>
          <thead>
            <tr><th>Plan</th><th>Businesses</th></tr>
          </thead>
          <tbody>
            {summary.planBreakdown.map((p) => (
              <tr key={p.plan_name}>
                <td>{p.plan_name}</td>
                <td>{p.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summary.expiringTrials.length > 0 && (
        <div className="card">
          <h3>Trials Expiring in 3 Days</h3>
          <table>
            <thead>
              <tr><th>Business</th><th>Trial Ends</th></tr>
            </thead>
            <tbody>
              {summary.expiringTrials.map((b) => (
                <tr key={b.id}>
                  <td>{b.business_name}</td>
                  <td className="muted">{new Date(b.trial_ends_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
