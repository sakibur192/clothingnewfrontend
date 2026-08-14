// ============================================================
// ORDER DETAIL PAGE
// ============================================================

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, chargePayment, bookCourier, updateCourierStatus } from "../api/api";

const COURIER_STATUSES = ["pending", "picked_up", "in_transit", "delivered", "returned"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [courierName, setCourierName] = useState("pathao");
  const [busy, setBusy] = useState(false);

  function loadOrder() {
    getOrderById(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

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
      await bookCourier({ order_id: Number(id), courier_name: courierName });
      loadOrder();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCourierStatusChange(bookingId, status) {
    try {
      await updateCourierStatus(bookingId, status);
      loadOrder();
    } catch (err) {
      setError(err.message);
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
        <h3>Courier</h3>

        {order.courierBookings && order.courierBookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Courier</th>
                <th>Courier Order ID</th>
                <th>COD Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {order.courierBookings.map((b) => (
                <tr key={b.id}>
                  <td className="muted">{b.courier_name}</td>
                  <td className="muted">{b.courier_order_id}</td>
                  <td>৳{b.cod_amount}</td>
                  <td>
                    <select
                      value={b.status}
                      onChange={(e) => handleCourierStatusChange(b.id, e.target.value)}
                    >
                      {COURIER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <select value={courierName} onChange={(e) => setCourierName(e.target.value)}>
              <option value="pathao">Pathao</option>
              <option value="steadfast">Steadfast</option>
              <option value="redx">RedX</option>
            </select>
            <button className="btn" onClick={handleBookCourier} disabled={busy}>
              Book Courier (simulated)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
