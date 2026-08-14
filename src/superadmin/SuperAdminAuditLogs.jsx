import { useEffect, useState } from "react";
import { getPlatformAuditLogs } from "../api/api";

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlatformAuditLogs().then((d) => setLogs(d.logs)).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <div className="page-header"><h2>Audit Logs</h2></div>
      {error && <p className="error-text">{error}</p>}
      <div className="card">
        {logs.length === 0 ? (
          <p className="muted">No actions logged yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Admin</th><th>Action</th><th>Business</th><th>Details</th><th>When</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="muted">{log.super_admin_name}</td>
                  <td>{log.action.replace(/_/g, " ")}</td>
                  <td className="muted">{log.target_business_name || "-"}</td>
                  <td className="muted">{log.details || "-"}</td>
                  <td className="muted">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
