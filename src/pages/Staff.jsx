// ============================================================
// STAFF PAGE (owner/admin only)
// ============================================================

import { useEffect, useState } from "react";
import { getStaffList, createStaffMember, updateStaffMember, deleteStaffMember } from "../api/api";

const emptyForm = { name: "", phone: "", email: "", password: "", role: "cashier" };

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function loadStaff() {
    getStaffList()
      .then((data) => setStaffList(data.staff))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStaff();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await createStaffMember(form);
      setForm(emptyForm);
      setShowForm(false);
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(member) {
    try {
      await updateStaffMember(member.id, { ...member, is_active: !member.is_active });
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this staff member?")) return;
    try {
      await deleteStaffMember(id);
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Staff</h2>
        <button className="btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Staff Member"}
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
                <label>Phone (used to log in)</label>
                <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={(e) => updateField("role", e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
              />
            </div>
            <button className="btn" type="submit">Save Staff Member</button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : staffList.length === 0 ? (
          <div className="empty-state">No staff members yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="muted">{s.phone}</td>
                  <td>
                    <span className="badge badge-confirmed">{s.role}</span>
                  </td>
                  <td>
                    <span className={s.is_active ? "badge badge-delivered" : "badge badge-cancelled"}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(s)}>
                      {s.is_active ? "Deactivate" : "Activate"}
                    </button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                      Remove
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
