// ============================================================
// VARIANT MANAGER (Inventory → Manage Variants)
// ============================================================
// This is where color/size/price/stock/photos actually get added
// for a product - decoupled from product creation on purpose.
// Color and size use a ComboBox: pick from a preloaded list, or
// just type a new one (which gets remembered for next time).
// Margin is auto-calculated from price vs cost so there's no
// manual math needed.
// ============================================================

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getProductById,
  getAttributeOptions,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../api/api";
import ComboBox from "../components/ComboBox";
import PhotoUploader from "../components/PhotoUploader";

const emptyForm = {
  color: "", size: "", sku: "", barcode: "",
  regular_price: "", sale_price: "", cost_price: "", stock_quantity: "",
  image_urls: [],
};

function marginPercent(regularPrice, costPrice) {
  const price = Number(regularPrice) || 0;
  const cost = Number(costPrice) || 0;
  if (price <= 0) return null;
  return (((price - cost) / price) * 100).toFixed(1);
}

export default function VariantManager() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    getProductById(id).then((data) => setProduct(data.product)).catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
    getAttributeOptions("color").then((data) => setColorOptions(data.options));
    getAttributeOptions("size").then((data) => setSizeOptions(data.options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(variant) {
    setEditingId(variant.id);
    setForm({
      color: variant.color || "",
      size: variant.size || "",
      sku: variant.sku || "",
      barcode: variant.barcode || "",
      regular_price: variant.regular_price,
      sale_price: variant.sale_price || "",
      cost_price: variant.cost_price,
      stock_quantity: variant.stock_quantity,
      image_urls: variant.image_urls || [],
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      regular_price: Number(form.regular_price) || 0,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      cost_price: Number(form.cost_price) || 0,
      stock_quantity: Number(form.stock_quantity) || 0,
    };

    try {
      if (editingId) {
        await updateProductVariant(editingId, payload);
      } else {
        await addProductVariant(id, payload);
      }
      cancelEdit();
      load();
      getAttributeOptions("color").then((data) => setColorOptions(data.options));
      getAttributeOptions("size").then((data) => setSizeOptions(data.options));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variantId) {
    if (!window.confirm("Delete this variant?")) return;
    try {
      await deleteProductVariant(variantId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!product) return <p className="muted">Loading...</p>;

  const liveMargin = marginPercent(form.regular_price, form.cost_price);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ marginBottom: 2 }}>{product.name}</h2>
          <Link to={`/products/${id}/edit`} className="muted" style={{ fontSize: 13 }}>
            &larr; Edit product info
          </Link>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>{editingId ? "Edit Variant" : "Add Variant"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <ComboBox value={form.color} onChange={(v) => updateField("color", v)} options={colorOptions} placeholder="e.g. Black" />
            </div>
            <div className="form-group">
              <label>Size</label>
              <ComboBox value={form.size} onChange={(v) => updateField("size", v)} options={sizeOptions} placeholder="e.g. M" />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input value={form.sku} onChange={(e) => updateField("sku", e.target.value)} placeholder="Auto-generate or type your own" />
            </div>
            <div className="form-group">
              <label>Barcode</label>
              <input value={form.barcode} onChange={(e) => updateField("barcode", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cost Price (৳)</label>
              <input type="number" value={form.cost_price} onChange={(e) => updateField("cost_price", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Regular Price (৳)</label>
              <input type="number" value={form.regular_price} onChange={(e) => updateField("regular_price", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Sale Price (৳, optional)</label>
              <input type="number" value={form.sale_price} onChange={(e) => updateField("sale_price", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" value={form.stock_quantity} onChange={(e) => updateField("stock_quantity", e.target.value)} />
            </div>
          </div>

          {liveMargin !== null && (
            <p className="muted" style={{ fontSize: 13 }}>
              Margin at regular price: <strong>{liveMargin}%</strong> (auto-calculated from cost vs. price)
            </p>
          )}

          <div className="form-group">
            <label>Photos</label>
            <PhotoUploader imageUrls={form.image_urls} onChange={(urls) => updateField("image_urls", urls)} />
          </div>

          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Variant"}
          </button>{" "}
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
          )}
        </form>
      </div>

      <div className="card">
        <h3>Existing Variants ({product.variants.length})</h3>
        {product.variants.length === 0 ? (
          <div className="empty-state">No variants yet — add the first one above.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Photo</th><th>Color</th><th>Size</th><th>SKU</th>
                <th>Price</th><th>Cost</th><th>Margin</th><th>Stock</th><th></th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.image_url ? (
                      <img src={v.image_url.startsWith("http") ? v.image_url : `http://localhost:5000${v.image_url}`} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, background: "#f2f0eb", borderRadius: 4 }} />
                    )}
                  </td>
                  <td>{v.color}</td>
                  <td>{v.size}</td>
                  <td className="muted">{v.sku}</td>
                  <td>৳{v.sale_price || v.regular_price}</td>
                  <td className="muted">৳{v.cost_price}</td>
                  <td className="muted">{marginPercent(v.regular_price, v.cost_price)}%</td>
                  <td>
                    <span className={v.stock_quantity <= 5 ? "badge badge-cancelled" : ""}>{v.stock_quantity}</span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(v)}>Edit</button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
