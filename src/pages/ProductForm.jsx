// ============================================================
// PRODUCT FORM PAGE (Add / Edit)
// ============================================================
// Add mode: create the product with a list of variants in one
// request (POST /products).
// Edit mode: only updates the product's own fields - variants
// are shown read-only here in Phase 1 (managing individual
// variants after creation can be added in a later phase).
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategories,
  createProduct,
  updateProduct,
  getProductById,
} from "../api/api";

const emptyVariant = () => ({
  color: "",
  size: "",
  sku: "",
  regular_price: "",
  sale_price: "",
  cost_price: "",
  stock_quantity: "",
});

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    description: "",
    brand: "",
    gender: "unisex",
    fabric: "",
    material: "",
    pattern: "",
    fit: "",
  });

  const [variants, setVariants] = useState([emptyVariant()]);
  const [existingVariants, setExistingVariants] = useState([]);

  useEffect(() => {
    getCategories().then((data) => setCategories(data.categories));

    if (isEdit) {
      getProductById(id).then((data) => {
        const p = data.product;
        setForm({
          name: p.name || "",
          category_id: p.category_id || "",
          description: p.description || "",
          brand: p.brand || "",
          gender: p.gender || "unisex",
          fabric: p.fabric || "",
          material: p.material || "",
          pattern: p.pattern || "",
          fit: p.fit || "",
        });
        setExistingVariants(p.variants);
      });
    }
  }, [id, isEdit]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateVariant(index, field, value) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function addVariantRow() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariantRow(index) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (isEdit) {
        await updateProduct(id, form);
      } else {
        const payload = {
          ...form,
          variants: variants.map((v) => ({
            ...v,
            regular_price: Number(v.regular_price) || 0,
            sale_price: v.sale_price ? Number(v.sale_price) : null,
            cost_price: Number(v.cost_price) || 0,
            stock_quantity: Number(v.stock_quantity) || 0,
          })),
        };
        await createProduct(payload);
      }
      navigate("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>{isEdit ? "Edit Product" : "Add Product"}</h2>
      </div>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label>Product Name</label>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Premium Oversized T-Shirt"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={form.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
              >
                <option value="">-- Select category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input value={form.brand} onChange={(e) => updateField("brand", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fit</label>
              <input
                value={form.fit}
                onChange={(e) => updateField("fit", e.target.value)}
                placeholder="e.g. Oversized, Slim"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fabric</label>
              <input
                value={form.fabric}
                onChange={(e) => updateField("fabric", e.target.value)}
                placeholder="e.g. Cotton"
              />
            </div>
            <div className="form-group">
              <label>Material</label>
              <input
                value={form.material}
                onChange={(e) => updateField("material", e.target.value)}
                placeholder="e.g. 100% Cotton"
              />
            </div>
            <div className="form-group">
              <label>Pattern</label>
              <input
                value={form.pattern}
                onChange={(e) => updateField("pattern", e.target.value)}
                placeholder="e.g. Solid, Printed"
              />
            </div>
          </div>
        </div>

        {!isEdit && (
          <div className="card">
            <h3>Variants (Color / Size / Price / Stock)</h3>
            <p className="muted">Add one row per color+size combination.</p>

            {variants.map((v, index) => (
              <div className="variant-row" key={index}>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    value={v.color}
                    onChange={(e) => updateVariant(index, "color", e.target.value)}
                    placeholder="Black"
                  />
                </div>
                <div className="form-group">
                  <label>Size</label>
                  <input
                    value={v.size}
                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                    placeholder="M"
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    value={v.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                    placeholder="OT-BLK-M"
                  />
                </div>
                <div className="form-group">
                  <label>Regular Price</label>
                  <input
                    type="number"
                    value={v.regular_price}
                    onChange={(e) => updateVariant(index, "regular_price", e.target.value)}
                    placeholder="999"
                  />
                </div>
                <div className="form-group">
                  <label>Sale Price</label>
                  <input
                    type="number"
                    value={v.sale_price}
                    onChange={(e) => updateVariant(index, "sale_price", e.target.value)}
                    placeholder="899"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Qty</label>
                  <input
                    type="number"
                    value={v.stock_quantity}
                    onChange={(e) => updateVariant(index, "stock_quantity", e.target.value)}
                    placeholder="20"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeVariantRow(index)}
                  disabled={variants.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}

            <button type="button" className="btn btn-secondary btn-sm" onClick={addVariantRow}>
              + Add Another Variant
            </button>
          </div>
        )}

        {isEdit && existingVariants.length > 0 && (
          <div className="card">
            <h3>Existing Variants</h3>
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {existingVariants.map((v) => (
                  <tr key={v.id}>
                    <td>{v.sku}</td>
                    <td>{v.color}</td>
                    <td>{v.size}</td>
                    <td>৳{v.sale_price || v.regular_price}</td>
                    <td>{v.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted" style={{ marginTop: 10 }}>
              Manage stock quantity from the Inventory page.
            </p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>{" "}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/products")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
