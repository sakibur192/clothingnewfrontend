// ============================================================
// ORDER DETAIL PAGE
// ============================================================

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, chargePayment, bookCourier, syncCourierStatus, getCourierCredentials, updateOrderStatus } from "../api/api";

const ORDER_STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [busy, setBusy] = useState(false);
  const [courierConnected, setCourierConnected] = useState(null); // null = still checking

  function loadOrder() {
    getOrderById(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadOrder();
    getCourierCredentials()
      .then((data) => setCourierConnected(data.connected))
      .catch(() => setCourierConnected(false));
  }, [id]);

  async function handleManualStatusChange(status) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await updateOrderStatus(id, status);
      if (result.courierWarning) setMessage(result.courierWarning);
      loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCharge() {
    setBusy(true);
    setError("");
    try {
      await chargePayment({ order_id: Number(id), method: paymentMethod });
      loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleBookCourier() {
    setBusy(true);
    setError("");
    try {
      await bookCourier({ order_id: Number(id) });
      loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSync(bookingId) {
    setBusy(true);
    setError("");
    try {
      await syncCourierStatus(bookingId);
      loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="error-text">{error}</p>;
  if (!order) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Order {order.order_number}</h2>
        <Link className="btn btn-secondary" to="/orders">Back to Orders</Link>
      </div>

      {message && <p className="muted">{message}</p>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="page-header" style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Status</h3>
        </div>
        <select
          value={order.status}
          onChange={(e) => handleManualStatusChange(e.target.value)}
          disabled={busy}
          className={`badge badge-${order.status}`}
          style={{ border: "none", fontWeight: 600, padding: "6px 14px" }}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          This works whether or not you use a courier service — set it manually anytime.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.product_name}
                  <div className="muted">{item.color} {item.size}</div>
                </td>
                <td>{item.quantity}</td>
                <td>৳{item.unit_price}</td>
                <td>৳{item.line_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: "right", marginTop: 10 }}>
          <div className="muted">Subtotal: ৳{order.subtotal}</div>
          <div className="muted">Discount: ৳{order.discount}</div>
          <div className="muted">Delivery: ৳{order.delivery_charge}</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Total: ৳{order.total}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Payment</h3>
        <p>
          Status: <span className="badge badge-confirmed">{order.payment_status}</span>{" "}
          <span className="muted">via {order.payment_method}</span>
        </p>

        {order.payments && order.payments.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {order.payments.map((p) => (
                <tr key={p.id}>
                  <td className="muted">{p.method}</td>
                  <td>৳{p.amount}</td>
                  <td>{p.status}</td>
                  <td className="muted">{p.transaction_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {order.payment_status !== "paid" && (
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="sslcommerz">SSLCommerz</option>
              <option value="card">Card</option>
            </select>
            <button className="btn" onClick={handleCharge} disabled={busy}>
              Charge Payment (simulated)
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Courier — Steadfast</h3>

        {courierConnected === null ? (
          <p className="muted">Checking...</p>
        ) : !courierConnected ? (
          <div>
            <p className="muted">
              You're not using a courier service right now — that's completely fine. Use the <strong>Status</strong>{" "}
              dropdown above to move this order through Packed → Shipped → Delivered manually, exactly as before.
            </p>
            <p className="muted">
              Want deliveries booked and tracked automatically instead?{" "}
              <Link to="/courier-settings">Connect Steadfast</Link> — it only takes a minute, and won't change
              anything about how existing orders are handled.
            </p>
          </div>
        ) : order.courierBookings && order.courierBookings.length > 0 ? (
          order.courierBookings.map((b) => (
            <div key={b.id} style={{ marginBottom: 14 }}>
              {b.status === "booking_failed" ? (
                <div>
                  <p className="error-text">Booking failed: {b.booking_error}</p>
                  <button className="btn btn-secondary btn-sm" onClick={handleBookCourier} disabled={busy}>
                    Retry Booking
                  </button>
                </div>
              ) : (
                <table>
                  <tbody>
                    <tr><td>Status</td><td><span className="badge badge-confirmed">{b.status}</span> {b.booked_automatically && <span className="muted">(auto-booked)</span>}</td></tr>
                    <tr><td>Consignment ID</td><td className="muted">{b.consignment_id}</td></tr>
                    <tr><td>Tracking Code</td><td className="muted">{b.tracking_code}</td></tr>
                    <tr>
                      <td>Tracking Link</td>
                      <td>
                        {b.tracking_url && (
                          <a href={b.tracking_url} target="_blank" rel="noopener noreferrer">{b.tracking_url}</a>
                        )}
                      </td>
                    </tr>
                    <tr><td>COD Amount</td><td>৳{b.cod_amount}</td></tr>
                    <tr><td>Last Synced</td><td className="muted">{b.last_synced_at ? new Date(b.last_synced_at).toLocaleString() : "Not synced yet"}</td></tr>
                  </tbody>
                </table>
              )}
              {b.status !== "booking_failed" && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleSync(b.id)} disabled={busy} style={{ marginTop: 8 }}>
                  {busy ? "Checking..." : "Sync Live Status"}
                </button>
              )}
            </div>
          ))
        ) : (
          <div>
            <p className="muted">
              Not booked yet. If auto-booking is on (Courier Settings), this happens automatically when you confirm
              the order — or book it manually now:
            </p>
            <button className="btn" onClick={handleBookCourier} disabled={busy}>
              {busy ? "Booking..." : "Book with Steadfast"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
