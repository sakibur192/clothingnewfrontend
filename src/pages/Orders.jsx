// ============================================================
// ORDERS LIST PAGE
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, updateOrderStatus } from "../api/api";

const STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function loadOrders() {
    getOrders()
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <Link className="btn" to="/orders/new">
          + Create Order
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            No orders yet. <Link to="/orders/new">Create your first order</Link>.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/orders/${o.id}`}>{o.order_number}</Link>
                    {o.source === "pos" && <div className="muted">POS sale</div>}
                  </td>
                  <td>
                    {o.customer_name || "-"}
                    <div className="muted">{o.customer_phone}</div>
                  </td>
                  <td>৳{o.total}</td>
                  <td>
                    <span className="muted">{o.payment_method.toUpperCase()}</span> /{" "}
                    <span className="muted">{o.payment_status}</span>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`badge badge-${o.status}`}
                      style={{ border: "none", fontWeight: 600 }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="muted">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
