// ============================================================
// POS PAGE
// ============================================================
// Fast in-store checkout: scan/type a SKU or barcode, it adds
// to the cart automatically. Cash/bKash/Nagad/Card all mark the
// sale as paid immediately (see backend posController.js).
// ============================================================

import { useState } from "react";
import { posLookup, posCheckout, validateCoupon } from "../api/api";

export default function POS() {
  const [scanInput, setScanInput] = useState("");
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValid, setCouponValid] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [receipt, setReceipt] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  async function handleScan(e) {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setError("");
    setLookupLoading(true);

    try {
      const data = await posLookup(scanInput.trim());
      const variant = data.variant;

      setCart((prev) => {
        const existing = prev.find((item) => item.variant_id === variant.id);
        if (existing) {
          return prev.map((item) =>
            item.variant_id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [
          ...prev,
          {
            variant_id: variant.id,
            product_name: variant.product_name,
            color: variant.color,
            size: variant.size,
            quantity: 1,
            unit_price: Number(variant.sale_price || variant.regular_price),
            stock: variant.stock_quantity,
          },
        ];
      });
      setScanInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLookupLoading(false);
    }
  }

  function updateQuantity(variantId, quantity) {
    setCart((prev) =>
      prev.map((item) => (item.variant_id === variantId ? { ...item, quantity: Number(quantity) } : item))
    );
  }

  function removeItem(variantId) {
    setCart((prev) => prev.filter((item) => item.variant_id !== variantId));
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    try {
      const data = await validateCoupon({ code: couponCode.trim(), subtotal });
      setCouponMessage(data.message);
      setCouponValid(data.valid);
    } catch (err) {
      setCouponMessage(err.message);
      setCouponValid(false);
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    setError("");
    setCheckingOut(true);

    try {
      const payload = {
        items: cart.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        payment_method: paymentMethod,
      };

      if (couponValid && couponCode.trim()) {
        payload.coupon_code = couponCode.trim();
      }

      if (customerName.trim() && customerPhone.trim()) {
        payload.new_customer = { name: customerName.trim(), phone: customerPhone.trim() };
      }

      const data = await posCheckout(payload);
      setReceipt(data.order);

      // reset for the next sale
      setCart([]);
      setCouponCode("");
      setCouponMessage("");
      setCouponValid(false);
      setCustomerName("");
      setCustomerPhone("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  }

  if (receipt) {
    return (
      <div>
        <div className="page-header">
          <h2>Sale Complete</h2>
        </div>
        <div className="card" style={{ maxWidth: 420 }}>
          <h3>Receipt — {receipt.order_number}</h3>
          <table>
            <tbody>
              {receipt.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    {item.product_name}
                    <div className="muted">
                      {item.color} {item.size} x{item.quantity}
                    </div>
                  </td>
                  <td>৳{item.line_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid var(--color-border)" }} />
          <div className="muted">Subtotal: ৳{receipt.subtotal}</div>
          <div className="muted">Discount: ৳{receipt.discount}</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 6 }}>Total Paid: ৳{receipt.total}</div>
          <p className="muted" style={{ marginTop: 10 }}>
            Payment: {receipt.payment_method.toUpperCase()} — {receipt.payment_status}
          </p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => setReceipt(null)}>
            Start New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Point of Sale</h2>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={handleScan} style={{ display: "flex", gap: 10 }}>
          <input
            autoFocus
            placeholder="Scan or type SKU / barcode, then press Enter"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
          />
          <button className="btn" type="submit" disabled={lookupLoading}>
            {lookupLoading ? "Looking up..." : "Add"}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Cart</h3>
        {cart.length === 0 ? (
          <p className="muted">Scan a product to start a sale.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.variant_id}>
                  <td>
                    {item.product_name}
                    <div className="muted">{item.color} {item.size}</div>
                  </td>
                  <td style={{ width: 70 }}>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.variant_id, e.target.value)}
                    />
                  </td>
                  <td>৳{item.unit_price}</td>
                  <td>৳{item.quantity * item.unit_price}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.variant_id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Coupon (optional)</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button className="btn btn-secondary" type="button" onClick={handleApplyCoupon}>
            Apply
          </button>
        </div>
        {couponMessage && (
          <p className={couponValid ? "muted" : "error-text"} style={{ marginTop: 8 }}>
            {couponMessage}
          </p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Customer (optional)</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Payment</h3>
        <div className="form-group" style={{ maxWidth: 220 }}>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div style={{ textAlign: "right", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          Total: ৳{subtotal}
        </div>

        <button
          className="btn btn-block"
          onClick={handleCheckout}
          disabled={cart.length === 0 || checkingOut}
        >
          {checkingOut ? "Processing..." : "Complete Sale"}
        </button>
      </div>
    </div>
  );
}
