// ============================================================
// CATEGORIES PAGE
// ============================================================

import { useEffect, useState } from "react";
import { getCategories, createCategory } from "../api/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function loadCategories() {
    getCategories()
      .then((data) => setCategories(data.categories))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({ name });
      setName("");
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Categories</h2>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="e.g. T-Shirt, Saree, Kurti"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn" type="submit">
            Add Category
          </button>
        </form>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : categories.length === 0 ? (
          <div className="empty-state">No categories yet. Add your first one above.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td className="muted">{new Date(cat.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
