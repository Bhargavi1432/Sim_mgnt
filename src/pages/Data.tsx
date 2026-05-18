import { useEffect, useState, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import {
  FaPlus,
  FaUpload,
  FaEllipsisV,
  FaEdit,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import DashboardLayout from "../layouts/dashboardlayout";
import "../styles/data.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

type Epoch = number | "";

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
  activationDate: Epoch;
  creationDate: Epoch;
  planName: string;
  productType: string;
  businessUnit: string;
  status: string;
  lastStatusChangeDate: Epoch;
  currentDate: number;
}

const EMPTY_ROW: Omit<SimRow, "id" | "currentDate"> = {
  subscriptionId: "",
  msisdn: "",
  iccid: "",
  imsi: "",
  eid: "",
  propositionID: "",
  accountID: "",
  personID: "",
  billingDOM: 0,
  activationDate: "",
  creationDate: "",
  planName: "",
  productType: "",
  businessUnit: "",
  status: "",
  lastStatusChangeDate: "",
};

const STORAGE_KEY = "simData";

const columns: (keyof SimRow)[] = [
  "subscriptionId","msisdn","iccid","imsi","eid",
  "propositionID","accountID","personID","billingDOM",
  "activationDate","creationDate","planName","productType",
  "businessUnit","status","lastStatusChangeDate",
];

const toEpoch = (value: any): Epoch => {
  if (!value) return "";
  if (typeof value === "number") {
    return new Date((value - 25569) * 86400 * 1000).getTime();
  }
  return new Date(value).getTime();
};

const toDateTimeLocal = (value: Epoch): string =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

const formatDate = (value: Epoch | number): string =>
  value ? new Date(value).toLocaleString() : "";

const get = (obj: any, key: string) =>
  obj[key] ?? obj[key?.toUpperCase()] ?? obj[key?.toLowerCase()] ?? "";

export default function DataPage() {
  const { company } = useParams<{ company: string }>();

  const [allRows, setAllRows] = useState<SimRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [rows, setRows] = useState<SimRow[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  /* ✅ DROPDOWN STATE */
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRows));
    window.dispatchEvent(new Event("storage"));
  }, [allRows]);

  useEffect(() => {
    if (!company) setRows(allRows);
    else setRows(
      allRows.filter(
        (row) =>
          row.businessUnit?.toLowerCase() === company.toLowerCase()
      )
    );
  }, [company, allRows]);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = localStorage.getItem(STORAGE_KEY);
      if (updated) setAllRows(JSON.parse(updated));
    };
    window.addEventListener("local-update", handleUpdate);
    return () =>
      window.removeEventListener("local-update", handleUpdate);
  }, []);

  /* ✅ FIXED OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        !target.closest(".action-dropdown") &&
        !target.closest(".action-menu-btn")
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addRow = () => {
    setAllRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...EMPTY_ROW,
        businessUnit: company ?? "",
        currentDate: Date.now(),
      },
    ]);
    setEditingIndex(rows.length);
  };

  const deleteRow = (index: number) => {
    const id = rows[index].id;
    setAllRows((prev) =>
      prev.filter((row) => row.id !== id)
    );
    setEditingIndex(null);
  };

  const updateCell = (
    index: number,
    field: keyof SimRow,
    value: string
  ) => {
    const id = rows[index].id;
    setAllRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "activationDate" ||
                field === "creationDate" ||
                field === "lastStatusChangeDate"
                  ? toEpoch(value)
                  : value,
            }
          : row
      )
    );
  };

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    setAllRows((prev) => [
      ...prev,
      ...data.map((item) => ({
        id: Date.now() + Math.random(),
        subscriptionId: get(item, "Subscription Id"),
        msisdn: get(item, "MSISDN"),
        iccid: get(item, "ICCID"),
        imsi: get(item, "IMSI"),
        eid: get(item, "EID"),
        propositionID: get(item, "Proposition ID"),
        accountID: get(item, "Account ID"),
        personID: get(item, "Person ID"),
        billingDOM: parseInt(get(item, "BillingDOM")) || 0,
        activationDate: toEpoch(get(item, "Activation Date")),
        creationDate: toEpoch(
          get(item, "Subscriber Creation Date")
        ),
        planName: get(item, "Subscriber Plan Name"),
        productType: get(item, "Product Type"),
        businessUnit:
          company ?? get(item, "Business Unit Name"),
        status: get(item, "Product Status"),
        lastStatusChangeDate: toEpoch(
          get(item, "Last Status Change Date")
        ),
        currentDate: Date.now(),
      })),
    ]);

    e.target.value = "";
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="toolbar">
          <button className="btn icon-btn add" onClick={addRow}>
            <FaPlus />
          </button>

          <label className="btn icon-btn upload">
            <FaUpload />
            <input type="file" hidden onChange={handleFileUpload} />
          </label>
        </div>

        <div className="table-wrapper">
          <div className="table">
            <div className="table-header">
              {[
                "ID","Subscription ID","MSISDN","ICCID","IMSI","EID",
                "Proposition ID","Account ID","Person ID","Billing DOM",
                "Activation Date","Creation Date","Plan Name","Product Type",
                "Business Unit","Status","Last Status Change",
                "Current Date","Actions"
              ].map((h) => (
                <div key={h} className="th">{h}</div>
              ))}
            </div>

            <div className="table-body">
              {rows.map((row, index) => (
                <div key={row.id} className="table-row">

                  <div className="td">{index + 1}</div>

                  {columns.map((field) => (
                    <div key={field} className="td">
                      {field === "status" ? (
                        <span className="status-badge">{row.status || "-"}</span>
                      ) : editingIndex === index ? (
                        ["activationDate","creationDate","lastStatusChangeDate"].includes(field) ? (
                          <input
                            type="datetime-local"
                            value={toDateTimeLocal(row[field] as Epoch)}
                            onChange={(e) => updateCell(index, field, e.target.value)}
                          />
                        ) : (
                          <input
                            value={(row[field] ?? "") as any}
                            onChange={(e) => updateCell(index, field, e.target.value)}
                          />
                        )
                      ) : ["activationDate","creationDate","lastStatusChangeDate"].includes(field) ? (
                        formatDate(row[field] as number)
                      ) : (
                        row[field] ?? ""
                      )}
                    </div>
                  ))}
                  
                  <div className="td">{formatDate(row.currentDate)}</div>

                  {/* ✅ ACTION MENU */}
                  <div className="td">
                    <div className="action-menu-wrapper">
                      <button
                        className="action-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(prev =>
                            prev === row.id ? null : row.id
                          );
                        }}
                      >
                        <FaEllipsisV />
                      </button>

                      <div
                        className="action-dropdown"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          opacity: openMenuId === row.id ? 1 : 0,
                          pointerEvents: openMenuId === row.id ? "auto" : "none"
                        }}
                      >
                        <div className="dropdown-item" onClick={() => setEditingIndex(index)}>
                          <FaEdit /> <span>Edit</span>
                        </div>

                        <div className="dropdown-item" onClick={() => setEditingIndex(null)}>
                          <FaSave /> <span>Save</span>
                        </div>

                        <div className="dropdown-item delete" onClick={() => deleteRow(index)}>
                          <FaTrash /> <span>Delete</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
