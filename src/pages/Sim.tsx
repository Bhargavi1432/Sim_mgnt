import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import DashboardLayout from "../layouts/dashboardlayout";
import "../styles/sim.css";

/* =========================
   Types
========================= */
interface SimRow {
  id: number;
  subscriptionId: string;
  msisdn: string;
  iccid: string;
  imsi: string;
  eid: string;
  propositionID: string;
  accountID: string;
  personID: string;
  billingDOM: number;
  activationDate: number | "";
  creationDate: number | "";
  planName: string;
  productType: string;
  businessUnit: string;
  status: string;
  lastStatusChangeDate: number | "";
  currentDate: number;
}

/* =========================
   Storage Keys
========================= */
const STORAGE_KEY = "simData";
const SEARCH_STORAGE_KEY = "simSearchResults";

/* =========================
   Utils
========================= */
const normalize = (value: unknown): string =>
  String(value ?? "").trim().toLowerCase();

/* =========================
   Component
========================= */
export default function SimSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"msisdn" | "iccid" | "imsi">("msisdn");
  const [results, setResults] = useState<SimRow[]>([]);
  const [notFound, setNotFound] = useState(false);

  /* =========================
     Restore previous searches
  ========================= */
  useEffect(() => {
    const stored = sessionStorage.getItem(SEARCH_STORAGE_KEY);
    if (stored) {
      setResults(JSON.parse(stored));
      setNotFound(false);
    }
  }, []);

  /* =========================
     Fetch SIMs (APPEND MODE)
  ========================= */
  const handleFetch = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: SimRow[] = raw ? JSON.parse(raw) : [];

    const searchValue = normalize(query);
    if (!searchValue) return;

    const matches = data.filter((sim) =>
      normalize(sim[category]) === searchValue
    );

    if (matches.length === 0) {
      setNotFound(true);
      return;
    }

    setResults((prev) => {
      // ✅ prevent duplicates using SIM id
      const existingIds = new Set(prev.map((s) => s.id));
      const newUnique = matches.filter(
        (sim) => !existingIds.has(sim.id)
      );

      const updated = [...prev, ...newUnique];

      // persist entire history
      sessionStorage.setItem(
        SEARCH_STORAGE_KEY,
        JSON.stringify(updated)
      );

      return updated;
    });

    setNotFound(false);
  };

  const formatDate = (value: number | "") =>
    value ? new Date(value).toLocaleString() : "-";

  /* =========================
     Render
  ========================= */
  return (
    <DashboardLayout>
      <div className="sim-search-container">
        <h2>Search</h2>
        <div className="sim-search-bar">
          <input
            placeholder="Enter value"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        <div className="action-blue-btn">
          <select
            defaultValue=""
            onChange={(e) => {
              setCategory(e.target.value as "msisdn" | "iccid" | "imsi")
            }}
          >
            <option value="" hidden></option>
            <option value="msisdn">MSISDN</option>
            <option value="iccid">ICCID</option>
            <option value="imsi">IMSI</option>
          </select>
        </div>
          <button onClick={handleFetch} title="Fetch SIM">
            <FaSearch />
          </button>
        </div>

        {/* SIM CARDS */}
        {results.map((sim) => (
          <div key={sim.id} className="sim-card">
            <h3>SIM Details</h3>

            <div className="sim-grid">
              <div><span>Subscription ID</span>{sim.subscriptionId}</div>
              <div><span>MSISDN</span>{sim.msisdn}</div>
              <div><span>ICCID</span>{sim.iccid}</div>
              <div><span>IMSI</span>{sim.imsi}</div>
              <div><span>EID</span>{sim.eid}</div>
              <div><span>PROPOSITIONID</span>{sim.propositionID}</div>
              <div><span>ACCOUNTID</span>{sim.accountID}</div>
              <div><span>PERSONID</span>{sim.personID}</div>
              <div><span>BILLINGDOM</span>{sim.billingDOM}</div>
              <div><span>Activation Date</span>{formatDate(sim.activationDate)}</div>
              <div><span>Creation Date</span>{formatDate(sim.creationDate)}</div>
              <div><span>Plan</span>{sim.planName}</div>
              <div><span>Product Type</span>{sim.productType}</div>
              <div><span>Status</span>{sim.status}</div>
              <div><span>LastStatusChangeDate</span>{sim.lastStatusChangeDate}</div>
              <div><span>Business Unit</span>{sim.businessUnit}</div>
            </div>
          </div>
        ))}

        {notFound && (
          <p className="not-found">
            No SIM found for given value
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}