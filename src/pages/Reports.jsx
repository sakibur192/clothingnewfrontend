// ============================================================
// REPORTS PAGE — Profit & Loss
// ============================================================
// Buy price vs sell price profit/loss: totals, by product, by
// purchase lot, and time-series charts (day/week/month/year),
// plus week-over-week / month-over-month / year-over-year
// comparison cards. Uses recharts for the line/bar/pie charts.
// ============================================================

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  getReportsSummary, getReportsTimeSeries, getReportsByProduct,
  getReportsByLot, getReportsCompare,
} from "../api/api";

const COLORS = ["#14532d", "#b45309", "#2563eb", "#dc2626", "#7c3aed", "#0891b2"];

function formatPeriodLabel(period, groupBy) {
  const d = new Date(period);
  if (groupBy === "year") return d.getFullYear().toString();
  if (groupBy === "month") return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  if (groupBy === "week") return `Wk of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [byProduct, setByProduct] = useState([]);
  const [byLot, setByLot] = useState([]);
  const [groupBy, setGroupBy] = useState("day");
  const [comparePeriod, setComparePeriod] = useState("month");
  const [compare, setCompare] = useState(null);
  const [error, setError] = useState("");

  function loadAll() {
    getReportsSummary().then(setSummary).catch((err) => setError(err.message));
    getReportsTimeSeries({ groupBy }).then((data) =>
      setSeries(data.series.map((s) => ({ ...s, label: formatPeriodLabel(s.period, groupBy) })))
    );
    getReportsByProduct({ limit: 8 }).then((data) => setByProduct(data.products));
    getReportsByLot().then((data) => setByLot(data.lots));
    getReportsCompare({ period: comparePeriod }).then(setCompare);
  }

  useEffect(() => {
    getReportsTimeSeries({ groupBy }).then((data) =>
      setSeries(data.series.map((s) => ({ ...s, label: formatPeriodLabel(s.period, groupBy) })))
    );
  }, [groupBy]);

  useEffect(() => {
    getReportsCompare({ period: comparePeriod }).then(setCompare);
  }, [comparePeriod]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p className="error-text">{error}</p>;
  if (!summary) return <p className="muted">Loading reports...</p>;

  const pieData = byProduct.slice(0, 6).map((p) => ({ name: p.productName, value: p.revenue }));

  return (
    <div>
      <div className="page-header">
        <h2>Reports — Profit &amp; Loss</h2>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="label">Revenue</div><div className="value">৳{summary.summary.revenue.toLocaleString()}</div></div>
        <div className="stat-card"><div className="label">Cost of Goods</div><div className="value">৳{summary.summary.cost.toLocaleString()}</div></div>
        <div className="stat-card"><div className="label">Profit</div><div className="value">৳{summary.summary.profit.toLocaleString()}</div></div>
        <div className="stat-card"><div className="label">Margin</div><div className="value">{summary.summary.marginPercent}%</div></div>
        <div className="stat-card"><div className="label">Units Sold</div><div className="value">{summary.summary.unitsSold}</div></div>
        <div className="stat-card"><div className="label">Orders</div><div className="value">{summary.summary.orderCount}</div></div>
      </div>

      {/* ---- Period comparison (WoW / MoM / YoY) ---- */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="page-header" style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Period Comparison</h3>
          <select value={comparePeriod} onChange={(e) => setComparePeriod(e.target.value)}>
            <option value="week">Week over Week</option>
            <option value="month">Month over Month</option>
            <option value="year">Year over Year</option>
          </select>
        </div>
        {compare && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Revenue</div>
              <div className="value">৳{compare.current.revenue.toLocaleString()}</div>
              <div className={compare.change.revenuePercent >= 0 ? "muted" : "error-text"} style={{ fontSize: 12 }}>
                {compare.change.revenuePercent >= 0 ? "▲" : "▼"} {Math.abs(compare.change.revenuePercent)}% vs previous {compare.period}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Profit</div>
              <div className="value">৳{compare.current.profit.toLocaleString()}</div>
              <div className={compare.change.profitPercent >= 0 ? "muted" : "error-text"} style={{ fontSize: 12 }}>
                {compare.change.profitPercent >= 0 ? "▲" : "▼"} {Math.abs(compare.change.profitPercent)}% vs previous {compare.period}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Orders</div>
              <div className="value">{compare.current.orderCount}</div>
              <div className={compare.change.orderCountPercent >= 0 ? "muted" : "error-text"} style={{ fontSize: 12 }}>
                {compare.change.orderCountPercent >= 0 ? "▲" : "▼"} {Math.abs(compare.change.orderCountPercent)}% vs previous {compare.period}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---- Time series line chart ---- */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="page-header" style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Revenue &amp; Profit Over Time</h3>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(v) => `৳${Number(v).toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#14532d" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="profit" stroke="#b45309" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* ---- Bar chart: profit by product ---- */}
        <div className="card">
          <h3>Profit by Product</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byProduct} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="productName" width={100} fontSize={11} />
              <Tooltip formatter={(v) => `৳${Number(v).toLocaleString()}`} />
              <Bar dataKey="profit" fill="#14532d" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ---- Pie chart: revenue distribution ---- */}
        <div className="card">
          <h3>Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d) => d.name}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `৳${Number(v).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---- Detail tables ---- */}
      <div className="card" style={{ marginTop: 16, marginBottom: 16 }}>
        <h3>Profit by Product</h3>
        <table>
          <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Margin</th></tr></thead>
          <tbody>
            {byProduct.map((p) => (
              <tr key={p.productId}>
                <td>{p.productName}</td>
                <td>{p.unitsSold}</td>
                <td>৳{p.revenue.toLocaleString()}</td>
                <td className="muted">৳{p.cost.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: p.profit >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>৳{p.profit.toLocaleString()}</td>
                <td className="muted">{p.marginPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Profit by Purchase Lot</h3>
        <p className="muted">Each batch of stock received keeps its own cost — useful for seeing which purchase batch was most profitable.</p>
        {byLot.length === 0 ? (
          <p className="muted">No purchase lots recorded yet. Use Inventory → Record Purchase to start tracking cost by batch.</p>
        ) : (
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Cost/Unit</th><th>Qty Received</th><th>Sold</th><th>Remaining</th><th>COGS So Far</th></tr></thead>
            <tbody>
              {byLot.map((l) => (
                <tr key={l.lotId}>
                  <td>{l.productName}</td>
                  <td className="muted">{l.sku}</td>
                  <td>৳{l.costPrice}</td>
                  <td>{l.quantity}</td>
                  <td>{l.unitsSoldFromLot}</td>
                  <td className="muted">{l.remainingQuantity}</td>
                  <td>৳{l.costOfGoodsSold.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
