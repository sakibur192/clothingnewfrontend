// ============================================================
// DASHBOARD PAGE
// ============================================================

import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardSummary()
      .then((data) => setSummary(data.summary))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error-text">{error}</p>;
  if (!summary) return <p className="muted">Loading dashboard...</p>;

  const stats = [
    { label: "Today's Sales", value: `৳${summary.todaysSales}` },
    { label: "Today's Orders", value: summary.todaysOrders },
    { label: "Pending Orders", value: summary.pendingOrders },
    { label: "Delivered Orders", value: summary.deliveredOrders },
    { label: "Total Products", value: summary.totalProducts },
    { label: "Total Customers", value: summary.totalCustomers },
    { label: "Low Stock Items", value: summary.lowStockCount },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="label">{stat.label}</div>
            <div className="value">{stat.value}</div>
          </div>
        ))}
      </div>

      {summary.usage && (
        <div className="card">
          <h3>Plan Usage</h3>
          <table>
            <tbody>
              <tr>
                <td>Products used</td>
                <td>{summary.usage.product_count}</td>
              </tr>
              <tr>
                <td>Orders this month</td>
                <td>{summary.usage.orders_this_month}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
