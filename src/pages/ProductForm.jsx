// ============================================================
// PRODUCT FORM PAGE (Add / Edit)
// ============================================================
// Product creation is now ONLY storefront/master data - name,
// description, category, brand, fabric, etc. NO color/size/
// price/stock here anymore - that all happens afterward in
// Inventory → Manage Variants, which is where photos, pricing,
// and stock actually live. This mirrors how a real clothing ERP
// separates "what is this product" from "what do we have of it."
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getCategories, createProduct, updateProduct, getProductById } from "../api/api";

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingVariants, setExistingVariants] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    short_description: "",
    description: "",
    brand: "",
    gender: "unisex",
    fabric: "",
    material: "",
    pattern: "",
    fit: "",
  });

  useEffect(() => {
    getCategories().then((data) => setCategories(data.categories));

    if (isEdit) {
      getProductById(id).then((data) => {
        const p = data.product;
        setForm({
          name: p.name || "",
          category_id: p.category_id || "",
          short_description: p.short_description || "",
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (isEdit) {
        await updateProduct(id, form);
        navigate("/products");
      } else {
        const result = await createProduct(form);
        // straight into variant management for this brand-new product -
        // that's where color/size/price/stock/photos actually get added
        navigate(`/products/${result.product.id}/variants`);
      }
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
              <select value={form.category_id} onChange={(e) => updateField("category_id", e.target.value)}>
                <option value="">-- Select category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input value={form.brand} onChange={(e) => updateField("brand", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Short Description <span className="muted">(teaser shown on storefront product cards)</span></label>
            <input
              value={form.short_description}
              onChange={(e) => updateField("short_description", e.target.value)}
              placeholder="e.g. Soft cotton, everyday essential"
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label>Full Description <span className="muted">(shown on the storefront product page)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={5}
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
              <input value={form.fit} onChange={(e) => updateField("fit", e.target.value)} placeholder="e.g. Oversized, Slim" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fabric</label>
              <input value={form.fabric} onChange={(e) => updateField("fabric", e.target.value)} placeholder="e.g. Cotton" />
            </div>
            <div className="form-group">
              <label>Material</label>
              <input value={form.material} onChange={(e) => updateField("material", e.target.value)} placeholder="e.g. 100% Cotton" />
            </div>
            <div className="form-group">
              <label>Pattern</label>
              <input value={form.pattern} onChange={(e) => updateField("pattern", e.target.value)} placeholder="e.g. Solid, Printed" />
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="card">
            <div className="page-header" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Variants</h3>
              <Link className="btn btn-secondary btn-sm" to={`/products/${id}/variants`}>
                Manage Variants ({existingVariants.length})
              </Link>
            </div>
            <p className="muted">
              Colors, sizes, prices, stock and photos are managed separately — this keeps product info
              (for the storefront) and inventory (what you actually have) cleanly split.
            </p>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product & Add Variants"}
          </button>{" "}
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/products")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
