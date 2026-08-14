// ============================================================
// PRODUCTS LIST PAGE
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../api/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function loadProducts() {
    setLoading(true);
    getProducts()
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this product and all its variants?")) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function totalStock(product) {
    return product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  }

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <Link className="btn" to="/products/new">
          + Add Product
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            No products yet. <Link to="/products/new">Add your first product</Link>.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Variants</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="muted">{p.category_name || "-"}</td>
                  <td className="muted">{p.variants.length}</td>
                  <td>{totalStock(p)}</td>
                  <td>
                    <span className="badge badge-confirmed">{p.status}</span>
                  </td>
                  <td>
                    <Link className="btn btn-secondary btn-sm" to={`/products/${p.id}/edit`}>
                      Edit
                    </Link>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
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
