// ============================================================
// INVENTORY PAGE
// ============================================================

import { useEffect, useState } from "react";
import { getProducts, getLowStock, adjustStock, getStockMovements, createPurchaseLot } from "../api/api";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState("");

  const [variantId, setVariantId] = useState("");
  const [movementType, setMovementType] = useState("in");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const [lotVariantId, setLotVariantId] = useState("");
  const [lotQuantity, setLotQuantity] = useState(1);
  const [lotCostPrice, setLotCostPrice] = useState("");
  const [lotSupplier, setLotSupplier] = useState("");
  const [lotMessage, setLotMessage] = useState("");

  function loadAll() {
    getProducts().then((data) => setProducts(data.products));
    getLowStock(5).then((data) => setLowStock(data.lowStockVariants));
    getStockMovements().then((data) => setMovements(data.movements));
  }

  useEffect(() => {
    loadAll();
  }, []);

  const variantOptions = products.flatMap((p) =>
    p.variants.map((v) => ({
      id: v.id,
      label: `${p.name} - ${v.color || ""} ${v.size || ""} (SKU: ${v.sku || "-"}, Stock: ${v.stock_quantity})`,
    }))
  );

  async function handleAdjust(e) {
    e.preventDefault();
    setError("");
    if (!variantId || !quantity) return;

    try {
      await adjustStock({
        variant_id: Number(variantId),
        movement_type: movementType,
        quantity: Number(quantity),
        note,
      });
      setVariantId("");
      setQuantity(1);
      setNote("");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRecordLot(e) {
    e.preventDefault();
    setError("");
    setLotMessage("");
    if (!lotVariantId || !lotQuantity || lotCostPrice === "") return;

    try {
      await createPurchaseLot({
        variant_id: Number(lotVariantId),
        quantity: Number(lotQuantity),
        cost_price: Number(lotCostPrice),
        supplier_name: lotSupplier || undefined,
      });
      setLotMessage("Purchase recorded — stock updated and cost tracked for profit reports.");
      setLotVariantId("");
      setLotQuantity(1);
      setLotCostPrice("");
      setLotSupplier("");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Inventory</h2>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Record Purchase (track cost for profit reports)</h3>
        <p className="muted">
          Recording stock this way (instead of a plain adjustment) keeps this batch's exact cost for accurate
          profit-by-lot reporting, even if you restock the same item later at a different price.
        </p>
        <form onSubmit={handleRecordLot}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Product Variant</label>
              <select value={lotVariantId} onChange={(e) => setLotVariantId(e.target.value)}>
                <option value="">-- Select variant --</option>
                {variantOptions.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" value={lotQuantity} onChange={(e) => setLotQuantity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Cost per Unit (৳)</label>
              <input type="number" min="0" value={lotCostPrice} onChange={(e) => setLotCostPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Supplier (optional)</label>
              <input value={lotSupplier} onChange={(e) => setLotSupplier(e.target.value)} />
            </div>
          </div>
          <button className="btn" type="submit">Record Purchase</button>
          {lotMessage && <span className="muted" style={{ marginLeft: 12 }}>{lotMessage}</span>}
        </form>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Adjust Stock</h3>
        <form onSubmit={handleAdjust}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 3 }}>
              <label>Product Variant</label>
              <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
                <option value="">-- Select variant --</option>
                {variantOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={movementType} onChange={(e) => setMovementType(e.target.value)}>
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="adjustment">Adjustment</option>
                <option value="damaged">Damaged</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Note (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. New stock received from supplier" />
          </div>
          <button className="btn" type="submit">Save Adjustment</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Low Stock Alerts (5 or fewer)</h3>
        {lowStock.length === 0 ? (
          <p className="muted">No low stock items right now.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Color / Size</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((v) => (
                <tr key={v.id}>
                  <td>{v.product_name}</td>
                  <td className="muted">{v.sku}</td>
                  <td className="muted">{v.color} {v.size}</td>
                  <td>
                    <span className="badge badge-cancelled">{v.stock_quantity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Recent Stock Movements</h3>
        {movements.length === 0 ? (
          <p className="muted">No stock movements yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Note</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.product_name} <span className="muted">({m.color} {m.size})</span>
                  </td>
                  <td className="muted">{m.movement_type}</td>
                  <td>{m.quantity}</td>
                  <td className="muted">{m.note || "-"}</td>
                  <td className="muted">{new Date(m.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
