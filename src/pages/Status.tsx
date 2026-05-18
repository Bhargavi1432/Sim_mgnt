import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/dashboardlayout";
import "../styles/status.css";

interface SimRow {
  id: number;
  msisdn: string;
  iccid: string;
  imsi: string;
  status: string;
  lastStatusChangeDate?: number;
}

const STORAGE_KEY = "simData";

const STATUS_OPTIONS = ["PRE-ACTIVE", "ACTIVE", "SUSPEND", "TERMINATED"];

export default function SimStatus() {
  const [rows, setRows] = useState<SimRow[]>([]);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setRows(stored ? JSON.parse(stored) : []);
  }, []);

  /* =========================
     UPDATE STATUS
  ========================= */
  const updateStatus = (id: number, newStatus: string) => {
    setRows((prev) => {
      const updated = prev.map((row: any) =>
        row.id === id
          ? {
              ...row,
              status:
                row.status === "TERMINATED" ? row.status : newStatus,

              // ✅ update timestamp
              lastStatusChangeDate:
                row.status !== newStatus && row.status !== "TERMINATED"
                  ? Date.now()
                  : row.lastStatusChangeDate,
            }
          : row
      );

      // ✅ save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // ✅ trigger update for other pages (same tab)
      window.dispatchEvent(new Event("local-update"));

      return updated;
    });
  };

  return (
    <DashboardLayout>
      <div className="status-container">
        <h2 className="page-title">SIM Status Management</h2>

        <div className="status-table">
          <div className="status-header">
            <div>MSISDN</div>
            <div>ICCID</div>
            <div>IMSI</div>
            <div>STATUS</div>
          </div>

          {rows.map((row) => (
            <div key={row.id} className="status-row">
              <div>{row.msisdn}</div>
              <div>{row.iccid}</div>
              <div>{row.imsi}</div>

              <div>
                {row.status === "TERMINATED" ? (
                  <span className="status terminated">
                    Terminated
                  </span>
                ) : (
                  <select
                    value={row.status || "PRE-ACTIVE"}
                    onChange={(e) =>
                      updateStatus(row.id, e.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}