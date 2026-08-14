// ============================================================
// CREATE ORDER PAGE
// ============================================================
// Simple manual order entry: pick a variant + quantity, add to
// a cart list, pick or type a customer, then submit.
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getCustomers, createOrder } from "../api/api";

export default function OrderForm() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  const [customerMode, setCustomerMode] = useState("existing"); // 'existing' | 'new'
  const [customerId, setCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" });

  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingAddress, setShippingAddress] = useState("");

  useEffect(() => {
    getProducts().then((data) => setProducts(data.products));
    getCustomers().then((data) => setCustomers(data.customers));
  }, []);

  // flatten products into a variant picklist
  const variantOptions = products.flatMap((p) =>
    p.variants.map((v) => ({
      id: v.id,
      label: `${p.name} - ${v.color || ""} ${v.size || ""} (Stock: ${v.stock_quantity})`,
      price: v.sale_price || v.regular_price,
      product_name: p.name,
      color: v.color,
      size: v.size,
      stock: v.stock_quantity,
    }))
  );

  function addToCart() {
    const variant = variantOptions.find((v) => String(v.id) === String(selectedVariantId));
    if (!variant || quantity <= 0) return;

    setCart((prev) => [
      ...prev,
      {
        variant_id: variant.id,
        product_name: variant.product_name,
        color: variant.color,
        size: variant.size,
        quantity: Number(quantity),
        unit_price: Number(variant.price),
      },
    ]);
    setSelectedVariantId("");
    setQuantity(1);
  }

  function removeFromCart(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const total = subtotal - Number(discount || 0) + Number(deliveryCharge || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Add at least one product to the order");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        discount: Number(discount) || 0,
        delivery_charge: Number(deliveryCharge) || 0,
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
      };

      if (customerMode === "existing" && customerId) {
        payload.customer_id = Number(customerId);
      } else if (customerMode === "new") {
        payload.new_customer = newCustomer;
      }

      await createOrder(payload);
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Create Order</h2>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <h3>Add Products</h3>
        <div className="form-row">
          <div className="form-group" style={{ flex: 3 }}>
            <label>Product / Variant</label>
            <select value={selectedVariantId} onChange={(e) => setSelectedVariantId(e.target.value)}>
              <option value="">-- Select a variant --</option>
              {variantOptions.map((v) => (
                <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                  {v.label} - ৳{v.price}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={addToCart}>
              Add
            </button>
          </div>
        </div>

        {cart.length > 0 && (
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
              {cart.map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.product_name} <span className="muted">({item.color} {item.size})</span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>৳{item.unit_price}</td>
                  <td>৳{item.quantity * item.unit_price}</td>
                  <td>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFromCart(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3>Customer</h3>
          <div className="form-row" style={{ marginBottom: 10 }}>
            <label>
              <input
                type="radio"
                checked={customerMode === "existing"}
                onChange={() => setCustomerMode("existing")}
                style={{ width: "auto", marginRight: 6 }}
              />
              Existing customer
            </label>
            <label>
              <input
                type="radio"
                checked={customerMode === "new"}
                onChange={() => setCustomerMode("new")}
                style={{ width: "auto", marginRight: 6 }}
              />
              New customer
            </label>
          </div>

          {customerMode === "existing" ? (
            <div className="form-group">
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">-- Select customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Shipping Address</label>
            <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
          </div>
        </div>

        <div className="card">
          <h3>Payment & Charges</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Discount (৳)</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Delivery Charge (৳)</label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cod">Cash on Delivery</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          <div style={{ textAlign: "right", fontSize: 15, marginTop: 10 }}>
            <div className="muted">Subtotal: ৳{subtotal}</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Total: ৳{total}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Placing order..." : "Place Order"}
          </button>{" "}
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/orders")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
