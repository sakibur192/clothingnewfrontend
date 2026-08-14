// ============================================================
// CUSTOMERS PAGE
// ============================================================

import { useEffect, useState } from "react";
import { getCustomers, createCustomer } from "../api/api";

const emptyForm = { name: "", phone: "", email: "", address: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function loadCustomers() {
    getCustomers()
      .then((data) => setCustomers(data.customers))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await createCustomer(form);
      setForm(emptyForm);
      setShowForm(false);
      loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Customers</h2>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleAdd}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input value={form.address} onChange={(e) => updateField("address", e.target.value)} />
              </div>
            </div>
            <button className="btn" type="submit">Save Customer</button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : customers.length === 0 ? (
          <div className="empty-state">No customers yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td className="muted">{c.email || "-"}</td>
                  <td className="muted">{c.address || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
