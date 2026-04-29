import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const fmt = (n) =>
  Number(n ?? 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const injectStyles = () => {
  if (document.getElementById("ss-products-styles")) return;
  const s = document.createElement("style");
  s.id = "ss-products-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes spin    { to{transform:rotate(360deg)} }

    .ss-tr-p { transition:background .15s; }
    .ss-tr-p:hover td { background:rgba(255,255,255,.025) !important; }

    .ss-inp {
      width:100%; background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.1); border-radius:10px;
      padding:11px 14px; color:#fff; font-size:.87rem;
      font-family:'Outfit',sans-serif; outline:none;
      transition:border-color .2s,box-shadow .2s,background .2s;
    }
    .ss-inp::placeholder { color:rgba(255,255,255,.22); }
    .ss-inp:focus { border-color:rgba(22,163,74,.55); background:rgba(255,255,255,.08); box-shadow:0 0 0 3px rgba(22,163,74,.1); }

    .ss-sel {
      width:100%; background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.1); border-radius:10px;
      padding:11px 14px; color:#fff; font-size:.87rem;
      font-family:'Outfit',sans-serif; outline:none; appearance:none; cursor:pointer;
    }
    .ss-sel option { background:#1a2235; color:#fff; }
    .ss-sel:focus { border-color:rgba(22,163,74,.55); box-shadow:0 0 0 3px rgba(22,163,74,.1); }

    .ss-modal-ov {
      position:fixed; inset:0; z-index:200;
      background:rgba(0,0,0,.72); backdrop-filter:blur(6px);
      display:flex; align-items:center; justify-content:center; padding:1rem;
      animation:fadeIn .2s ease;
    }
    .ss-modal-bx {
      background:linear-gradient(145deg,#141f35,#0d1525);
      border:1px solid rgba(255,255,255,.1); border-radius:20px;
      width:100%; max-width:500px; max-height:92vh; overflow-y:auto;
      box-shadow:0 24px 60px rgba(0,0,0,.6); animation:slideUp .25s ease;
    }
    .ss-modal-bx::-webkit-scrollbar { width:3px; }
    .ss-modal-bx::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:3px; }

    .ss-badge-ok   { background:rgba(22,163,74,.14);  color:#86efac; border:1px solid rgba(22,163,74,.25);  border-radius:20px; padding:3px 10px; font-size:.7rem; font-weight:700; white-space:nowrap; }
    .ss-badge-warn { background:rgba(251,191,36,.12); color:#fde68a; border:1px solid rgba(251,191,36,.25); border-radius:20px; padding:3px 10px; font-size:.7rem; font-weight:700; white-space:nowrap; }
    .ss-badge-err  { background:rgba(239,68,68,.12);  color:#fca5a5; border:1px solid rgba(239,68,68,.25);  border-radius:20px; padding:3px 10px; font-size:.7rem; font-weight:700; white-space:nowrap; }

    .ss-btn-green-sm {
      background:linear-gradient(135deg,#15803d,#22c55e); border:none; border-radius:10px;
      padding:10px 18px; color:#fff; font-size:.875rem; font-weight:600;
      font-family:'Outfit',sans-serif; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center; gap:7px;
      transition:transform .15s,box-shadow .2s;
      box-shadow:0 4px 14px rgba(22,163,74,.3); white-space:nowrap;
    }
    .ss-btn-green-sm:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(22,163,74,.4); }
    .ss-btn-green-full {
      width:100%; background:linear-gradient(135deg,#15803d,#22c55e); border:none; border-radius:10px;
      padding:12px 18px; color:#fff; font-size:.875rem; font-weight:600;
      font-family:'Outfit',sans-serif; cursor:pointer;
      display:flex; align-items:center; justify-content:center; gap:7px;
      transition:transform .15s,box-shadow .2s; box-shadow:0 4px 14px rgba(22,163,74,.3);
    }
    .ss-btn-green-full:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 18px rgba(22,163,74,.4); }
    .ss-btn-green-full:disabled { opacity:.6; cursor:not-allowed; }

    .ss-btn-ghost-sm {
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
      border-radius:10px; padding:10px 16px; color:rgba(255,255,255,.6);
      font-size:.875rem; font-weight:500; font-family:'Outfit',sans-serif;
      cursor:pointer; transition:all .2s; white-space:nowrap;
    }
    .ss-btn-ghost-sm:hover { background:rgba(255,255,255,.1); color:#fff; }

    .ss-search {
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09);
      border-radius:10px; padding:10px 14px 10px 38px;
      color:#fff; font-size:.85rem; font-family:'Outfit',sans-serif;
      outline:none; flex:1; transition:border-color .2s;
    }
    .ss-search::placeholder { color:rgba(255,255,255,.22); }
    .ss-search:focus { border-color:rgba(22,163,74,.4); }

    .ss-filter-sel {
      background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09);
      border-radius:10px; padding:10px 14px; color:rgba(255,255,255,.6);
      font-size:.82rem; font-family:'Outfit',sans-serif; outline:none;
      appearance:none; cursor:pointer; min-width:160px;
    }
    .ss-filter-sel option { background:#1a2235; color:#fff; }
  `;
  document.head.appendChild(s);
};

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
const IcoEdit = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
const IcoSearch = () => (
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
);
const IcoSpin = () => (
  <span
    style={{
      width: 14,
      height: 14,
      border: "2px solid rgba(255,255,255,.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      display: "inline-block",
      animation: "spin .7s linear infinite",
    }}
  />
);

const Sk = ({ w = "100%", h = 13, r = 6 }) => (
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

const Field = ({ label, required, hint, children }) => (
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
    {hint && (
      <p style={{ color: "rgba(255,255,255,.25)", fontSize: ".7rem" }}>
        {hint}
      </p>
    )}
  </div>
);

const CATEGORIES = [
  "Boissons",
  "Alimentation",
  "Hygiène",
  "Électronique",
  "Vêtements",
  "Papeterie",
  "Autre",
];
const EMPTY = {
  name: "",
  purchase_price: "",
  selling_price: "",
  quantity: "",
  threshold: "",
  category: "",
};

/* ═══ MODAL ═══ */
function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(isEdit ? { ...product } : { ...EMPTY });
  const [loading, setLd] = useState(false);
  const [errors, setErrs] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const margin =
    form.selling_price && form.purchase_price
      ? (
          ((form.selling_price - form.purchase_price) / form.purchase_price) *
          100
        ).toFixed(1)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrs({});
    setLd(true);
    try {
      isEdit
        ? await api.put(`/products/${product.id}`, form)
        : await api.post("/products", form);
      onSaved();
      onClose();
    } catch (err) {
      if (err.response?.status === 422) setErrs(err.response.data.errors ?? {});
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
      className="ss-modal-ov"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ss-modal-bx">
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
              {isEdit ? "✏️ Modifier" : "📦 Nouveau produit"}
            </h3>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>
              {isEdit ? `ID #${product.id}` : "Remplissez les informations"}
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
          <Field label="Nom du produit" required>
            <input
              className="ss-inp"
              placeholder="ex: Coca-Cola 33cl"
              value={form.name}
              onChange={set("name")}
              required
            />
            {errors.name && (
              <p style={{ color: "#f87171", fontSize: ".7rem" }}>
                {errors.name[0]}
              </p>
            )}
          </Field>
          <Field label="Catégorie">
            <div style={{ position: "relative" }}>
              <select
                className="ss-sel"
                value={form.category}
                onChange={set("category")}
              >
                <option value="">— Sélectionner —</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <Field label="Prix d'achat (MAD)" required>
              <input
                className="ss-inp"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.purchase_price}
                onChange={set("purchase_price")}
                required
              />
            </Field>
            <Field label="Prix de vente (MAD)" required>
              <input
                className="ss-inp"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.selling_price}
                onChange={set("selling_price")}
                required
              />
            </Field>
          </div>
          {margin !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 8,
                background:
                  parseFloat(margin) > 0
                    ? "rgba(22,163,74,.08)"
                    : "rgba(239,68,68,.08)",
                border: `1px solid ${parseFloat(margin) > 0 ? "rgba(22,163,74,.18)" : "rgba(239,68,68,.18)"}`,
              }}
            >
              <span>{parseFloat(margin) > 0 ? "📈" : "📉"}</span>
              <span
                style={{
                  color: parseFloat(margin) > 0 ? "#86efac" : "#fca5a5",
                  fontSize: ".8rem",
                  fontWeight: 600,
                }}
              >
                Marge calculée : {margin}%
              </span>
            </div>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <Field label="Quantité en stock" required hint="Unités disponibles">
              <input
                className="ss-inp"
                type="number"
                min="0"
                placeholder="0"
                value={form.quantity}
                onChange={set("quantity")}
                required
              />
            </Field>
            <Field
              label="Seuil d'alerte"
              required
              hint="Alerte si stock ≤ ce chiffre"
            >
              <input
                className="ss-inp"
                type="number"
                min="0"
                placeholder="ex: 10"
                value={form.threshold}
                onChange={set("threshold")}
                required
              />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, paddingTop: 2 }}>
            <button
              type="button"
              className="ss-btn-ghost-sm"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="ss-btn-green-full"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? <IcoSpin /> : isEdit ? <IcoEdit /> : <IcoPlus />}
              {loading
                ? "Enregistrement..."
                : isEdit
                  ? "Mettre à jour"
                  : "Créer le produit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ product, onClose, onDeleted }) {
  const [loading, setLd] = useState(false);
  const confirm = async () => {
    setLd(true);
    try {
      await api.delete(`/products/${product.id}`);
      onDeleted();
      onClose();
    } finally {
      setLd(false);
    }
  };
  return (
    <div
      className="ss-modal-ov"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ss-modal-bx" style={{ maxWidth: 420 }}>
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
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "rgba(239,68,68,.12)",
              border: "1px solid rgba(239,68,68,.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ⚠️
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
              Supprimer ce produit ?
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,.4)",
                fontSize: ".85rem",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "#fff" }}>{product.name}</strong> sera
              supprimé définitivement.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button
              className="ss-btn-ghost-sm"
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
                background: "rgba(239,68,68,.14)",
                border: "1px solid rgba(239,68,68,.28)",
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
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {loading ? <IcoSpin /> : <IcoTrash />}{" "}
              {loading ? "..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ PAGE ═══ */
export default function Products() {
  injectStyles();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = products.filter((p) => {
    const ms =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase());
    return ms && (!category || p.category === category);
  });

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const lowStockCount = products.filter(
    (p) => p.quantity <= p.threshold,
  ).length;
  const outStockCount = products.filter((p) => p.quantity === 0).length;
  const avgMargin = products.length
    ? (
        products.reduce(
          (acc, p) =>
            acc +
            ((p.selling_price - p.purchase_price) / (p.purchase_price || 1)) *
              100,
          0,
        ) / products.length
      ).toFixed(1)
    : 0;

  const getStatus = (p) => {
    if (p.quantity === 0) return { label: "Rupture", cls: "ss-badge-err" };
    if (p.quantity <= p.threshold)
      return { label: "Stock bas", cls: "ss-badge-warn" };
    return { label: "En stock", cls: "ss-badge-ok" };
  };

  return (
    <div
      style={{
        fontFamily: "'Outfit',sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        animation: "fadeUp .4s ease",
      }}
    >
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

      {/* ── Header ── */}
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
            Produits
          </h2>
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".8rem" }}>
            {loading
              ? "..."
              : `${products.length} produit${products.length > 1 ? "s" : ""} enregistré${products.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {/* Bouton taille auto — pas pleine largeur */}
        <button className="ss-btn-green-sm" onClick={() => setModal("create")}>
          <IcoPlus /> Nouveau produit
        </button>
      </div>

      {/* ── Mini stats ── */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
            gap: 10,
          }}
        >
          {[
            {
              label: "Total",
              value: products.length,
              color: "#60a5fa",
              icon: "📦",
            },
            {
              label: "Stock bas",
              value: lowStockCount,
              color: "#fde68a",
              icon: "⚠️",
            },
            {
              label: "Rupture",
              value: outStockCount,
              color: "#f87171",
              icon: "🔴",
            },
            {
              label: "Marge moy.",
              value: `${avgMargin}%`,
              color: "#86efac",
              icon: "📈",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "linear-gradient(145deg,#111827,#0d1525)",
                border: `1px solid ${s.color}20`,
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
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
                    fontSize: ".66rem",
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
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
            <IcoSearch />
          </span>
          <input
            className="ss-search"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ position: "relative" }}>
          <select
            className="ss-filter-sel"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {(search || category) && (
          <button
            className="ss-btn-ghost-sm"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* ── Table ── */}
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
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.02)",
                }}
              >
                {[
                  { label: "Produit", w: 180 },
                  { label: "Catégorie", w: 110 },
                  { label: "Prix achat", w: 100 },
                  { label: "Prix vente", w: 100 },
                  { label: "Marge", w: 80 },
                  { label: "Stock", w: 70 },
                  { label: "Seuil", w: 70 },
                  { label: "Statut", w: 100 },
                  { label: "Actions", w: 100 },
                ].map((h) => (
                  <th
                    key={h.label}
                    style={{
                      padding: "11px 14px",
                      textAlign: "left",
                      color: "rgba(255,255,255,.3)",
                      fontSize: ".67rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      minWidth: h.w,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}
                  >
                    {[180, 100, 80, 80, 60, 50, 50, 80, 90].map((w, j) => (
                      <td key={j} style={{ padding: "13px 14px" }}>
                        <Sk w={w} h={13} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ padding: "4rem", textAlign: "center" }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
                      {search || category ? "🔍" : "📦"}
                    </div>
                    <p
                      style={{
                        color: "rgba(255,255,255,.3)",
                        fontSize: ".9rem",
                      }}
                    >
                      {search || category
                        ? "Aucun produit trouvé."
                        : "Aucun produit. Ajoutez votre premier produit !"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const margin = (
                    ((p.selling_price - p.purchase_price) /
                      (p.purchase_price || 1)) *
                    100
                  ).toFixed(1);
                  const status = getStatus(p);
                  return (
                    <tr
                      key={p.id}
                      className="ss-tr-p"
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? "1px solid rgba(255,255,255,.04)"
                            : "none",
                        animation: `fadeUp .3s ${i * 0.04}s ease both`,
                      }}
                    >
                      <td style={{ padding: "12px 14px", maxWidth: 180 }}>
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
                              flexShrink: 0,
                              fontSize: ".85rem",
                            }}
                          >
                            📦
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: ".85rem",
                                lineHeight: 1.2,
                                marginBottom: 2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 130,
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                color: "rgba(255,255,255,.25)",
                                fontSize: ".68rem",
                                fontFamily: "'JetBrains Mono',monospace",
                              }}
                            >
                              #{p.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            background: "rgba(255,255,255,.05)",
                            border: "1px solid rgba(255,255,255,.08)",
                            borderRadius: 6,
                            padding: "3px 8px",
                            color: "rgba(255,255,255,.5)",
                            fontSize: ".76rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.category || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "rgba(255,255,255,.5)",
                          fontSize: ".8rem",
                          fontFamily: "'JetBrains Mono',monospace",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt(p.purchase_price)}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: ".82rem",
                          fontFamily: "'JetBrains Mono',monospace",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt(p.selling_price)}
                      </td>
                      <td
                        style={{ padding: "12px 14px", whiteSpace: "nowrap" }}
                      >
                        <span
                          style={{
                            color:
                              parseFloat(margin) >= 30
                                ? "#86efac"
                                : parseFloat(margin) >= 15
                                  ? "#fde68a"
                                  : "#fca5a5",
                            fontWeight: 700,
                            fontSize: ".8rem",
                            fontFamily: "'JetBrains Mono',monospace",
                          }}
                        >
                          {margin}%
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: ".88rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {p.quantity}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "rgba(255,255,255,.4)",
                          fontSize: ".8rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {p.threshold}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span className={status.cls}>{status.label}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => {
                              setSelected(p);
                              setModal("edit");
                            }}
                            style={{
                              background: "rgba(96,165,250,.1)",
                              border: "1px solid rgba(96,165,250,.2)",
                              borderRadius: 8,
                              padding: "6px 10px",
                              color: "#93c5fd",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: ".74rem",
                              fontWeight: 600,
                              fontFamily: "'Outfit',sans-serif",
                              transition: "all .2s",
                            }}
                          >
                            <IcoEdit />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(p);
                              setModal("delete");
                            }}
                            style={{
                              background: "rgba(239,68,68,.08)",
                              border: "1px solid rgba(239,68,68,.18)",
                              borderRadius: 8,
                              padding: "6px 10px",
                              color: "#f87171",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: ".74rem",
                              fontWeight: 600,
                              fontFamily: "'Outfit',sans-serif",
                              transition: "all .2s",
                            }}
                          >
                            <IcoTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div
            style={{
              padding: "10px 18px",
              borderTop: "1px solid rgba(255,255,255,.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ color: "rgba(255,255,255,.22)", fontSize: ".73rem" }}>
              {filtered.length}/{products.length} produit
              {products.length > 1 ? "s" : ""}
              {search || category ? " (filtré)" : ""}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                ["rgba(34,197,94,.7)", "En stock"],
                ["rgba(251,191,36,.7)", "Stock bas"],
                ["rgba(239,68,68,.7)", "Rupture"],
              ].map(([c, l]) => (
                <span
                  key={l}
                  style={{
                    color: c,
                    fontSize: ".7rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: c,
                      display: "inline-block",
                    }}
                  />
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal === "create" && (
        <ProductModal
          product={null}
          onClose={() => setModal(null)}
          onSaved={() => {
            load();
            showToast("Produit créé !");
          }}
        />
      )}
      {modal === "edit" && selected && (
        <ProductModal
          product={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
          onSaved={() => {
            load();
            showToast("Produit mis à jour !");
          }}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteModal
          product={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
          onDeleted={() => {
            load();
            showToast("Produit supprimé.");
          }}
        />
      )}
    </div>
  );
}
