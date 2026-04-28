import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/* ─── Helpers ─── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

/* ─── Inject styles ─── */
const injectStyles = () => {
  if (document.getElementById("ss-sales-styles")) return;
  const s = document.createElement("style");
  s.id = "ss-sales-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes pop     { 0%{transform:scale(.8);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }

    .ss-tr-sale { transition: background .15s; }
    .ss-tr-sale:hover td { background: rgba(255,255,255,.02) !important; }

    .ss-input-dark {
      width:100%; background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.1); border-radius:10px;
      padding:12px 14px; color:#fff; font-size:.88rem;
      font-family:'Outfit',sans-serif; outline:none;
      transition:border-color .2s,box-shadow .2s,background .2s;
    }
    .ss-input-dark::placeholder { color:rgba(255,255,255,.22); }
    .ss-input-dark:focus { border-color:rgba(22,163,74,.6); background:rgba(255,255,255,.08); box-shadow:0 0 0 3px rgba(22,163,74,.1); }
    .ss-input-dark:disabled { opacity:.4; cursor:not-allowed; }

    .ss-select-dark {
      width:100%; background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.1); border-radius:10px;
      padding:12px 14px; color:#fff; font-size:.88rem;
      font-family:'Outfit',sans-serif; outline:none; appearance:none; cursor:pointer;
      transition:border-color .2s;
    }
    .ss-select-dark option { background:#1a2235; color:#fff; }
    .ss-select-dark:focus { border-color:rgba(22,163,74,.6); box-shadow:0 0 0 3px rgba(22,163,74,.1); }

    .ss-btn-primary {
      background:linear-gradient(135deg,#15803d,#22c55e); border:none; border-radius:10px;
      padding:12px 20px; color:#fff; font-size:.875rem; font-weight:600;
      font-family:'Outfit',sans-serif; cursor:pointer;
      display:flex; align-items:center; justify-content:center; gap:7px;
      transition:transform .15s,box-shadow .2s,opacity .2s;
      box-shadow:0 4px 14px rgba(22,163,74,.3); width:100%;
    }
    .ss-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 20px rgba(22,163,74,.4); }
    .ss-btn-primary:disabled { opacity:.6; cursor:not-allowed; }

    .ss-btn-ghost {
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:10px 16px; color:rgba(255,255,255,.6);
      font-size:.875rem; font-weight:500; font-family:'Outfit',sans-serif;
      cursor:pointer; transition:all .2s;
    }
    .ss-btn-ghost:hover { background:rgba(255,255,255,.1); color:#fff; }

    .ss-modal-overlay {
      position:fixed; inset:0; z-index:200;
      background:rgba(0,0,0,.75); backdrop-filter:blur(6px);
      display:flex; align-items:center; justify-content:center; padding:1rem;
      animation:fadeIn .2s ease;
    }
    .ss-modal-box {
      background:linear-gradient(145deg,#141f35,#0d1525);
      border:1px solid rgba(255,255,255,.1); border-radius:20px;
      width:100%; max-width:440px; overflow:hidden;
      box-shadow:0 24px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04);
      animation:slideUp .25s ease;
    }
    .ss-filter-btn {
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09);
      border-radius:8px; padding:7px 14px; color:rgba(255,255,255,.5);
      font-size:.78rem; font-weight:600; font-family:'Outfit',sans-serif;
      cursor:pointer; transition:all .2s; white-space:nowrap;
    }
    .ss-filter-btn.active { background:rgba(22,163,74,.15); border-color:rgba(22,163,74,.3); color:#86efac; }
    .ss-filter-btn:hover:not(.active) { background:rgba(255,255,255,.09); color:#fff; }
  `;
  document.head.appendChild(s);
};

/* ─── Icons ─── */
const IcoPlus = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcoTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
const IcoClose = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IcoCart = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IcoSpin = () => (
  <span
    style={{
      width: 15,
      height: 15,
      border: "2px solid rgba(255,255,255,.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      display: "inline-block",
      animation: "spin .7s linear infinite",
    }}
  />
);
const IcoCsv = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const Sk = ({ w = "100%", h = 14, r = 6 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background: "linear-gradient(90deg,#1a2235 25%,#232f44 50%,#1a2235 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s infinite",
    }}
  />
);

const Field = ({ label, required, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label
      style={{
        color: "rgba(255,255,255,.5)",
        fontSize: ".72rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: ".08em",
        fontFamily: "'Outfit',sans-serif",
      }}
    >
      {label}
      {required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
);

/* ═══ MODAL NOUVELLE VENTE ═══ */
function SaleModal({ products, onClose, onSaved }) {
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    unit_price: "",
  });
  const [loading, setLd] = useState(false);
  const [error, setErr] = useState("");
  const [stockInfo, setStk] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Auto-fill unit_price quand on choisit un produit
  useEffect(() => {
    if (!form.product_id) {
      setStk(null);
      return;
    }
    const p = products.find((p) => p.id === parseInt(form.product_id));
    if (p) {
      setForm((f) => ({ ...f, unit_price: p.selling_price }));
      setStk(p);
    }
  }, [form.product_id, products]);

  const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);
  const overStock = stockInfo && Number(form.quantity) > stockInfo.quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (overStock) {
      setErr(`Stock insuffisant. Disponible : ${stockInfo.quantity} unité(s).`);
      return;
    }
    setLd(true);
    try {
      await api.post("/sales", {
        ...form,
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
      });
      onSaved();
      onClose();
    } catch (err) {
      setErr(err.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally {
      setLd(false);
    }
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="ss-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ss-modal-box">
        {/* Header */}
        <div
          style={{
            padding: "20px 22px 16px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                fontFamily: "'Outfit',sans-serif",
                lineHeight: 1,
                marginBottom: 3,
              }}
            >
              💰 Nouvelle vente
            </h3>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>
              Enregistrer une transaction
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,.5)",
            }}
          >
            <IcoClose />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.25)",
                borderRadius: 9,
                padding: "10px 14px",
                color: "#fca5a5",
                fontSize: ".82rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Produit */}
          <Field label="Produit" required>
            <div style={{ position: "relative" }}>
              <select
                className="ss-select-dark"
                value={form.product_id}
                onChange={set("product_id")}
                required
              >
                <option value="">— Choisir un produit —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                    {p.name}{" "}
                    {p.quantity === 0 ? "(Rupture)" : `(Stock: ${p.quantity})`}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,.3)",
                  pointerEvents: "none",
                  fontSize: ".7rem",
                }}
              >
                ▼
              </span>
            </div>
          </Field>

          {/* Info stock */}
          {stockInfo && (
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.07)",
                animation: "pop .2s ease",
              }}
            >
              <div style={{ flex: 1, textAlign: "center" }}>
                <p
                  style={{
                    color: "rgba(255,255,255,.35)",
                    fontSize: ".68rem",
                    marginBottom: 3,
                  }}
                >
                  STOCK DISPO
                </p>
                <p
                  style={{
                    color:
                      stockInfo.quantity <= stockInfo.threshold
                        ? "#fde68a"
                        : "#86efac",
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {stockInfo.quantity}
                </p>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,.07)" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <p
                  style={{
                    color: "rgba(255,255,255,.35)",
                    fontSize: ".68rem",
                    marginBottom: 3,
                  }}
                >
                  PRIX VENTE
                </p>
                <p
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {fmt(stockInfo.selling_price)} MAD
                </p>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,.07)" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <p
                  style={{
                    color: "rgba(255,255,255,.35)",
                    fontSize: ".68rem",
                    marginBottom: 3,
                  }}
                >
                  CATÉGORIE
                </p>
                <p
                  style={{ color: "#fff", fontWeight: 600, fontSize: ".8rem" }}
                >
                  {stockInfo.category || "—"}
                </p>
              </div>
            </div>
          )}

          {/* Quantité + Prix */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Field label="Quantité" required>
              <input
                className={`ss-input-dark${overStock ? " " : ""}`.trim()}
                type="number"
                min="1"
                max={stockInfo?.quantity}
                placeholder="0"
                value={form.quantity}
                onChange={set("quantity")}
                required
                style={overStock ? { borderColor: "#ef4444" } : {}}
              />
              {overStock && (
                <p style={{ color: "#f87171", fontSize: ".7rem" }}>
                  Dépasse le stock disponible
                </p>
              )}
            </Field>
            <Field label="Prix unitaire (MAD)" required>
              <input
                className="ss-input-dark"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.unit_price}
                onChange={set("unit_price")}
                required
              />
            </Field>
          </div>

          {/* Total calculé */}
          {total > 0 && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background:
                  "linear-gradient(135deg,rgba(22,163,74,.12),rgba(22,163,74,.06))",
                border: "1px solid rgba(22,163,74,.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                animation: "pop .2s ease",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,.5)",
                  fontSize: ".82rem",
                  fontWeight: 500,
                }}
              >
                Total de la vente
              </span>
              <span
                style={{
                  color: "#22c55e",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {fmt(total)} MAD
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 2 }}>
            <button
              type="button"
              className="ss-btn-ghost"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="ss-btn-primary"
              style={{ flex: 2 }}
              disabled={loading || overStock || !form.product_id}
            >
              {loading ? <IcoSpin /> : <IcoCart />}
              {loading ? "Enregistrement..." : "Enregistrer la vente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Delete Modal ─── */
function DeleteModal({ sale, onClose, onDeleted }) {
  const [loading, setLd] = useState(false);
  const confirm = async () => {
    setLd(true);
    try {
      await api.delete(`/sales/${sale.id}`);
      onDeleted();
      onClose();
    } finally {
      setLd(false);
    }
  };
  return (
    <div
      className="ss-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ss-modal-box" style={{ maxWidth: 400 }}>
        <div
          style={{
            padding: "28px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(239,68,68,.12)",
              border: "1px solid rgba(239,68,68,.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            🗑️
          </div>
          <div>
            <h3
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                marginBottom: 8,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              Supprimer cette vente ?
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,.4)",
                fontSize: ".85rem",
                lineHeight: 1.6,
              }}
            >
              Vente de{" "}
              <strong style={{ color: "#fff" }}>{sale.product?.name}</strong> —{" "}
              <strong
                style={{
                  color: "#22c55e",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {fmt(sale.total_price)} MAD
              </strong>
              <br />
              Le stock{" "}
              <strong style={{ color: "#fde68a" }}>
                ne sera pas restauré
              </strong>{" "}
              automatiquement.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button
              className="ss-btn-ghost"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              onClick={confirm}
              disabled={loading}
              style={{
                flex: 1,
                background: "rgba(239,68,68,.15)",
                border: "1px solid rgba(239,68,68,.3)",
                borderRadius: 10,
                padding: "11px",
                color: "#f87171",
                fontWeight: 700,
                fontSize: ".875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                transition: "all .2s",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {loading ? <IcoSpin /> : <IcoTrash />}
              {loading ? "..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ PAGE VENTES ═══ */
const FILTERS = [
  { label: "Aujourd'hui", value: "today" },
  { label: "7 jours", value: "week" },
  { label: "Ce mois", value: "month" },
  { label: "Tout", value: "all" },
];

export default function Sales() {
  injectStyles();

  const [sales, setSales] = useState([]);
  const [products, setProds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSel] = useState(null);
  const [filter, setFilter] = useState("month");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        api.get("/sales"),
        api.get("/products"),
      ]);
      setSales(sRes.data.data);
      setProds(pRes.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Filtrage */
  const filtered = sales.filter((s) => {
    const date = new Date(s.created_at);
    const now = new Date();
    let ok = true;
    if (filter === "today") ok = date.toDateString() === now.toDateString();
    else if (filter === "week") ok = now - date <= 7 * 86400000;
    else if (filter === "month")
      ok =
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    const matchSearch =
      !search ||
      (s.product?.name ?? "").toLowerCase().includes(search.toLowerCase());
    return ok && matchSearch;
  });

  /* Stats */
  const totalCA = filtered.reduce((acc, s) => acc + Number(s.total_price), 0);
  const totalQty = filtered.reduce((acc, s) => acc + Number(s.quantity), 0);
  const avgSale = filtered.length ? totalCA / filtered.length : 0;

  /* Export CSV */
  const exportCSV = () => {
    const rows = [["ID", "Produit", "Quantité", "Prix unit.", "Total", "Date"]];
    filtered.forEach((s) =>
      rows.push([
        s.id,
        s.product?.name,
        s.quantity,
        s.unit_price,
        s.total_price,
        fmtDate(s.created_at),
      ]),
    );
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ventes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        fontFamily: "'Outfit',sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        animation: "fadeUp .4s ease",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "rgba(22,163,74,.9)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: ".875rem",
            zIndex: 300,
            animation: "slideUp .3s ease",
            boxShadow: "0 8px 24px rgba(0,0,0,.4)",
          }}
        >
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              color: "#fff",
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            Ventes
          </h2>
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".8rem" }}>
            {loading
              ? "..."
              : `${filtered.length} transaction${filtered.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="ss-btn-ghost"
            onClick={exportCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 16px",
            }}
          >
            <IcoCsv /> Exporter CSV
          </button>
          <button
            className="ss-btn-primary"
            style={{ width: "auto", padding: "10px 18px" }}
            onClick={() => setModal("create")}
          >
            <IcoPlus /> Nouvelle vente
          </button>
        </div>
      </div>

      {/* Mini stats */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 12,
          }}
        >
          {[
            {
              label: "CA total",
              value: `${fmt(totalCA)} MAD`,
              color: "#22c55e",
              icon: "💰",
            },
            {
              label: "Unités vendues",
              value: totalQty,
              color: "#60a5fa",
              icon: "📦",
            },
            {
              label: "Vente moyenne",
              value: `${fmt(avgSale)} MAD`,
              color: "#fde68a",
              icon: "📊",
            },
            {
              label: "Transactions",
              value: filtered.length,
              color: "#c4b5fd",
              icon: "🧾",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "linear-gradient(145deg,#111827,#0d1525)",
                border: `1px solid ${s.color}20`,
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,.2)",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
              <div>
                <p
                  style={{
                    color: s.color,
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    lineHeight: 1,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,.3)",
                    fontSize: ".68rem",
                    marginTop: 3,
                  }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Filtres période */}
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`ss-filter-btn${filter === f.value ? " active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div style={{ position: "relative", marginLeft: "auto" }}>
          <span
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,.3)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            style={{
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 10,
              padding: "9px 14px 9px 36px",
              color: "#fff",
              fontSize: ".85rem",
              outline: "none",
              width: 220,
              fontFamily: "'Outfit',sans-serif",
            }}
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "linear-gradient(145deg,#111827,#0d1525)",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.02)",
                }}
              >
                {[
                  "#",
                  "Produit",
                  "Quantité",
                  "Prix unitaire",
                  "Total",
                  "Date & Heure",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign:
                        h === "Total" || h === "Quantité" ? "right" : "left",
                      color: "rgba(255,255,255,.3)",
                      fontSize: ".68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <Sk w={j === 2 ? 120 : j === 5 ? 80 : 60} h={13} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: "4rem", textAlign: "center" }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>
                      🧾
                    </div>
                    <p
                      style={{
                        color: "rgba(255,255,255,.3)",
                        fontSize: ".9rem",
                      }}
                    >
                      {search
                        ? "Aucun résultat trouvé."
                        : "Aucune vente sur cette période."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className="ss-tr-sale"
                    style={{
                      borderBottom:
                        i < filtered.length - 1
                          ? "1px solid rgba(255,255,255,.04)"
                          : "none",
                      animation: `fadeUp .3s ${i * 0.03}s ease both`,
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "rgba(255,255,255,.25)",
                        fontSize: ".72rem",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      #{s.id}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(22,163,74,.1)",
                            border: "1px solid rgba(22,163,74,.18)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: ".85rem",
                            flexShrink: 0,
                          }}
                        >
                          💰
                        </div>
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: ".875rem",
                          }}
                        >
                          {s.product?.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        color: "rgba(255,255,255,.6)",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: ".85rem",
                      }}
                    >
                      {s.quantity}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "rgba(255,255,255,.5)",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: ".82rem",
                      }}
                    >
                      {fmt(s.unit_price)} MAD
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <span
                        style={{
                          color: "#22c55e",
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: ".9rem",
                          background: "rgba(22,163,74,.1)",
                          borderRadius: 6,
                          padding: "3px 9px",
                          border: "1px solid rgba(22,163,74,.2)",
                        }}
                      >
                        {fmt(s.total_price)} MAD
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p
                        style={{
                          color: "rgba(255,255,255,.6)",
                          fontSize: ".8rem",
                          fontFamily: "'JetBrains Mono',monospace",
                          lineHeight: 1,
                          marginBottom: 3,
                        }}
                      >
                        {fmtDate(s.created_at)}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,.25)",
                          fontSize: ".7rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {fmtTime(s.created_at)}
                      </p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => {
                          setSel(s);
                          setModal("delete");
                        }}
                        style={{
                          background: "rgba(239,68,68,.08)",
                          border: "1px solid rgba(239,68,68,.18)",
                          borderRadius: 8,
                          padding: "6px 11px",
                          color: "#f87171",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: ".75rem",
                          fontWeight: 600,
                          transition: "all .2s",
                          fontFamily: "'Outfit',sans-serif",
                        }}
                      >
                        <IcoTrash /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Footer total */}
            {!loading && filtered.length > 0 && (
              <tfoot>
                <tr
                  style={{
                    borderTop: "1px solid rgba(255,255,255,.08)",
                    background: "rgba(22,163,74,.04)",
                  }}
                >
                  <td
                    colSpan={4}
                    style={{
                      padding: "12px 16px",
                      color: "rgba(255,255,255,.35)",
                      fontSize: ".78rem",
                      fontWeight: 600,
                    }}
                  >
                    TOTAL — {filtered.length} transaction
                    {filtered.length > 1 ? "s" : ""} · {totalQty} unités
                  </td>
                  <td
                    colSpan={3}
                    style={{ padding: "12px 16px", textAlign: "right" }}
                  >
                    <span
                      style={{
                        color: "#22c55e",
                        fontWeight: 800,
                        fontSize: "1.05rem",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {fmt(totalCA)} MAD
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal === "create" && (
        <SaleModal
          products={products}
          onClose={() => setModal(null)}
          onSaved={() => {
            load();
            showToast("Vente enregistrée avec succès !");
          }}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteModal
          sale={selected}
          onClose={() => {
            setModal(null);
            setSel(null);
          }}
          onDeleted={() => {
            load();
            showToast("Vente supprimée.");
          }}
        />
      )}
    </div>
  );
}
