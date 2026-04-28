import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/* ─── Helpers ─── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ─── Inject styles ─── */
const injectStyles = () => {
  if (document.getElementById("ss-products-styles")) return;
  const s = document.createElement("style");
  s.id = "ss-products-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes slideUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes spin      { to{transform:rotate(360deg)} }

    .ss-tr-prod { transition: background .15s; cursor: default; }
    .ss-tr-prod:hover td { background: rgba(255,255,255,.025) !important; }

    .ss-input-dark {
      width: 100%; background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1); border-radius: 10px;
      padding: 11px 14px; color: #fff; font-size: 0.88rem;
      font-family: 'Outfit', sans-serif; outline: none;
      transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .ss-input-dark::placeholder { color: rgba(255,255,255,.25); }
    .ss-input-dark:focus {
      border-color: rgba(22,163,74,.6);
      background: rgba(255,255,255,.08);
      box-shadow: 0 0 0 3px rgba(22,163,74,.12);
    }
    .ss-input-dark:disabled { opacity: .4; cursor: not-allowed; }

    .ss-select-dark {
      width: 100%; background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1); border-radius: 10px;
      padding: 11px 14px; color: #fff; font-size: 0.88rem;
      font-family: 'Outfit', sans-serif; outline: none;
      appearance: none; cursor: pointer;
      transition: border-color .2s, box-shadow .2s;
    }
    .ss-select-dark option { background: #1a2235; color: #fff; }
    .ss-select-dark:focus { border-color: rgba(22,163,74,.6); box-shadow: 0 0 0 3px rgba(22,163,74,.12); }

    .ss-btn-primary {
      background: linear-gradient(135deg, #15803d, #22c55e);
      border: none; border-radius: 10px; padding: 11px 20px;
      color: #fff; font-size: 0.875rem; font-weight: 600;
      font-family: 'Outfit', sans-serif; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: transform .15s, box-shadow .2s, opacity .2s;
      box-shadow: 0 4px 14px rgba(22,163,74,.3);
      white-space: nowrap;
    }
    .ss-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(22,163,74,.4); }
    .ss-btn-primary:disabled { opacity: .6; cursor: not-allowed; }

    .ss-btn-ghost {
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px; padding: 10px 16px; color: rgba(255,255,255,.6);
      font-size: 0.875rem; font-weight: 500; font-family: 'Outfit', sans-serif;
      cursor: pointer; transition: all .2s;
    }
    .ss-btn-ghost:hover { background: rgba(255,255,255,.1); color: #fff; }

    .ss-btn-danger {
      background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2);
      border-radius: 8px; padding: 7px 12px; color: #f87171;
      font-size: 0.78rem; font-weight: 600; font-family: 'Outfit', sans-serif;
      cursor: pointer; transition: all .2s;
    }
    .ss-btn-danger:hover { background: rgba(239,68,68,.2); border-color: rgba(239,68,68,.35); }

    .ss-btn-edit {
      background: rgba(96,165,250,.1); border: 1px solid rgba(96,165,250,.2);
      border-radius: 8px; padding: 7px 12px; color: #93c5fd;
      font-size: 0.78rem; font-weight: 600; font-family: 'Outfit', sans-serif;
      cursor: pointer; transition: all .2s;
    }
    .ss-btn-edit:hover { background: rgba(96,165,250,.2); border-color: rgba(96,165,250,.35); }

    .ss-modal-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,.7); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; padding: 1rem;
      animation: fadeIn .2s ease;
    }
    .ss-modal-box {
      background: linear-gradient(145deg, #141f35, #0d1525);
      border: 1px solid rgba(255,255,255,.1); border-radius: 20px;
      width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04);
      animation: slideUp .25s ease;
    }
    .ss-modal-box::-webkit-scrollbar { width: 4px; }
    .ss-modal-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }

    .ss-badge-ok   { background: rgba(22,163,74,.15);  color: #86efac; border: 1px solid rgba(22,163,74,.25);  }
    .ss-badge-warn { background: rgba(251,191,36,.12); color: #fde68a; border: 1px solid rgba(251,191,36,.25); }
    .ss-badge-err  { background: rgba(239,68,68,.12);  color: #fca5a5; border: 1px solid rgba(239,68,68,.25);  }

    .ss-search-bar {
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
      border-radius: 10px; padding: 10px 14px 10px 40px;
      color: #fff; font-size: 0.875rem; font-family: 'Outfit',sans-serif;
      outline: none; width: 260px; transition: border-color .2s, width .3s;
    }
    .ss-search-bar::placeholder { color: rgba(255,255,255,.25); }
    .ss-search-bar:focus { border-color: rgba(22,163,74,.4); width: 320px; }
  `;
  document.head.appendChild(s);
};

/* ─── SVG Icons ─── */
const IcoPlus = () => (
  <svg
    width="15"
    height="15"
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
const IcoSearch = () => (
  <svg
    width="15"
    height="15"
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
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IcoClose = () => (
  <svg
    width="16"
    height="16"
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
const IcoBox = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const IcoFilter = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

/* ─── Skeleton row ─── */
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

/* ─── Field ─── */
const Field = ({ label, required, children, hint }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label
      style={{
        color: "rgba(255,255,255,.55)",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        fontFamily: "'Outfit',sans-serif",
      }}
    >
      {label}
      {required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && (
      <p style={{ color: "rgba(255,255,255,.25)", fontSize: "0.7rem" }}>
        {hint}
      </p>
    )}
  </div>
);

/* ─── CATEGORIES ─── */
const CATEGORIES = [
  "Boissons",
  "Alimentation",
  "Hygiène",
  "Électronique",
  "Vêtements",
  "Papeterie",
  "Autre",
];

/* ═══ MODAL PRODUIT ═══ */
const EMPTY = {
  name: "",
  purchase_price: "",
  selling_price: "",
  quantity: "",
  threshold: "",
  category: "",
};

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
      if (isEdit) {
        await api.put(`/products/${product.id}`, form);
      } else {
        await api.post("/products", form);
      }
      onSaved();
      onClose();
    } catch (err) {
      if (err.response?.status === 422) setErrs(err.response.data.errors ?? {});
    } finally {
      setLd(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
            padding: "22px 24px 18px",
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
                fontSize: "1.05rem",
                fontFamily: "'Outfit',sans-serif",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {isEdit ? "✏️ Modifier le produit" : "📦 Nouveau produit"}
            </h3>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: "0.75rem" }}>
              {isEdit
                ? `ID #${product.id}`
                : "Remplissez les informations du produit"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,.5)",
              transition: "all .2s",
            }}
          >
            <IcoClose />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Nom */}
          <Field label="Nom du produit" required>
            <input
              className="ss-input-dark"
              placeholder="ex: Coca-Cola 33cl"
              value={form.name}
              onChange={set("name")}
              required
            />
            {errors.name && (
              <p style={{ color: "#f87171", fontSize: "0.72rem" }}>
                {errors.name[0]}
              </p>
            )}
          </Field>

          {/* Catégorie */}
          <Field label="Catégorie">
            <div style={{ position: "relative" }}>
              <select
                className="ss-select-dark"
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
                  fontSize: "0.7rem",
                }}
              >
                ▼
              </span>
            </div>
          </Field>

          {/* Prix */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <Field label="Prix d'achat (MAD)" required>
              <input
                className="ss-input-dark"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.purchase_price}
                onChange={set("purchase_price")}
                required
              />
              {errors.purchase_price && (
                <p style={{ color: "#f87171", fontSize: "0.72rem" }}>
                  {errors.purchase_price[0]}
                </p>
              )}
            </Field>
            <Field label="Prix de vente (MAD)" required>
              <input
                className="ss-input-dark"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.selling_price}
                onChange={set("selling_price")}
                required
              />
              {errors.selling_price && (
                <p style={{ color: "#f87171", fontSize: "0.72rem" }}>
                  {errors.selling_price[0]}
                </p>
              )}
            </Field>
          </div>

          {/* Marge calculée */}
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
                    ? "rgba(22,163,74,.1)"
                    : "rgba(239,68,68,.1)",
                border: `1px solid ${parseFloat(margin) > 0 ? "rgba(22,163,74,.2)" : "rgba(239,68,68,.2)"}`,
              }}
            >
              <span style={{ fontSize: "0.8rem" }}>
                {parseFloat(margin) > 0 ? "📈" : "📉"}
              </span>
              <span
                style={{
                  color: parseFloat(margin) > 0 ? "#86efac" : "#fca5a5",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Marge calculée : {margin}%
              </span>
            </div>
          )}

          {/* Quantité + Seuil */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <Field
              label="Quantité en stock"
              required
              hint="Nombre d'unités actuellement disponibles"
            >
              <input
                className="ss-input-dark"
                type="number"
                min="0"
                placeholder="0"
                value={form.quantity}
                onChange={set("quantity")}
                required
              />
              {errors.quantity && (
                <p style={{ color: "#f87171", fontSize: "0.72rem" }}>
                  {errors.quantity[0]}
                </p>
              )}
            </Field>
            <Field
              label="Seuil d'alerte"
              required
              hint="Alerte si stock ≤ ce nombre"
            >
              <input
                className="ss-input-dark"
                type="number"
                min="0"
                placeholder="ex: 10"
                value={form.threshold}
                onChange={set("threshold")}
                required
              />
              {errors.threshold && (
                <p style={{ color: "#f87171", fontSize: "0.72rem" }}>
                  {errors.threshold[0]}
                </p>
              )}
            </Field>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
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

/* ═══ MODAL SUPPRESSION ═══ */
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
      className="ss-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ss-modal-box" style={{ maxWidth: 420 }}>
        <div
          style={{
            padding: "28px 28px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(239,68,68,.12)",
              border: "1px solid rgba(239,68,68,.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
            }}
          >
            ⚠️
          </div>
          <div>
            <h3
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.05rem",
                marginBottom: 8,
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              Supprimer ce produit ?
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,.4)",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              Vous êtes sur le point de supprimer{" "}
              <strong style={{ color: "#fff" }}>{product.name}</strong>.<br />
              Cette action est{" "}
              <strong style={{ color: "#f87171" }}>irréversible</strong> et
              supprimera l'historique lié.
            </p>
          </div>
          <div
            style={{ display: "flex", gap: 10, width: "100%", marginTop: 4 }}
          >
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
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                transition: "all .2s",
              }}
            >
              {loading ? <IcoSpin /> : <IcoTrash />}
              {loading ? "Suppression..." : "Oui, supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ PAGE PRINCIPALE ═══ */
export default function Products() {
  injectStyles();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || p.category === category;
    return matchSearch && matchCat;
  });

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const statsBar = {
    total: products.length,
    lowStock: products.filter((p) => p.quantity <= p.threshold).length,
    outOfStock: products.filter((p) => p.quantity === 0).length,
    avgMargin: products.length
      ? (
          products.reduce(
            (acc, p) =>
              acc +
              ((p.selling_price - p.purchase_price) / (p.purchase_price || 1)) *
                100,
            0,
          ) / products.length
        ).toFixed(1)
      : 0,
  };

  const getStockStatus = (p) => {
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
            fontSize: "0.875rem",
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
            Produits
          </h2>
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: "0.8rem" }}>
            {loading
              ? "..."
              : `${products.length} produit${products.length > 1 ? "s" : ""} enregistré${products.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="ss-btn-primary" onClick={() => setModal("create")}>
          <IcoPlus /> Nouveau produit
        </button>
      </div>

      {/* Stats mini-bar */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: 12,
          }}
        >
          {[
            {
              label: "Total produits",
              value: statsBar.total,
              color: "#60a5fa",
              icon: "📦",
            },
            {
              label: "Stock bas",
              value: statsBar.lowStock,
              color: "#fde68a",
              icon: "⚠️",
            },
            {
              label: "Rupture",
              value: statsBar.outOfStock,
              color: "#f87171",
              icon: "🔴",
            },
            {
              label: "Marge moyenne",
              value: `${statsBar.avgMargin}%`,
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
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,.2)",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
              <div>
                <p
                  style={{
                    color: s.color,
                    fontWeight: 800,
                    fontSize: "1.15rem",
                    lineHeight: 1,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,.3)",
                    fontSize: "0.68rem",
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
        {/* Recherche */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
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
            className="ss-search-bar"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {/* Filtre catégorie */}
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,.3)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <IcoFilter />
          </span>
          <select
            className="ss-select-dark"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ paddingLeft: 32, width: "auto", minWidth: 160 }}
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        {(search || category) && (
          <button
            className="ss-btn-ghost"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
            style={{ padding: "10px 14px" }}
          >
            ✕ Réinitialiser
          </button>
        )}
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
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.02)",
                }}
              >
                {[
                  "Produit",
                  "Catégorie",
                  "Prix achat",
                  "Prix vente",
                  "Marge",
                  "Stock",
                  "Seuil",
                  "Statut",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "rgba(255,255,255,.3)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
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
                [1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <Sk w={j === 9 ? 80 : j === 1 ? 120 : 60} h={13} />
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
                        fontSize: "0.9rem",
                      }}
                    >
                      {search || category
                        ? "Aucun produit ne correspond à votre recherche."
                        : "Aucun produit enregistré. Ajoutez votre premier produit !"}
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
                  const status = getStockStatus(p);
                  return (
                    <tr
                      key={p.id}
                      className="ss-tr-prod"
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? "1px solid rgba(255,255,255,.04)"
                            : "none",
                        animation: `fadeUp .3s ${i * 0.04}s ease both`,
                      }}
                    >
                      <td style={{ padding: "13px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 9,
                              background: "rgba(22,163,74,.12)",
                              border: "1px solid rgba(22,163,74,.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <IcoBox />
                          </div>
                          <div>
                            <p
                              style={{
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                lineHeight: 1,
                                marginBottom: 3,
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                color: "rgba(255,255,255,.25)",
                                fontSize: "0.7rem",
                                fontFamily: "'JetBrains Mono',monospace",
                              }}
                            >
                              #{p.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          color: "rgba(255,255,255,.45)",
                          fontSize: "0.82rem",
                        }}
                      >
                        <span
                          style={{
                            background: "rgba(255,255,255,.05)",
                            border: "1px solid rgba(255,255,255,.08)",
                            borderRadius: 6,
                            padding: "3px 8px",
                          }}
                        >
                          {p.category || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          color: "rgba(255,255,255,.55)",
                          fontSize: "0.82rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {fmt(p.purchase_price)}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {fmt(p.selling_price)}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            color:
                              parseFloat(margin) >= 30
                                ? "#86efac"
                                : parseFloat(margin) >= 15
                                  ? "#fde68a"
                                  : "#fca5a5",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            fontFamily: "'JetBrains Mono',monospace",
                          }}
                        >
                          {margin}%
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {p.quantity}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          color: "rgba(255,255,255,.4)",
                          fontSize: "0.82rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {p.threshold}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          className={status.cls}
                          style={{
                            borderRadius: 20,
                            padding: "3px 10px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="ss-btn-edit"
                            onClick={() => {
                              setSelected(p);
                              setModal("edit");
                            }}
                            title="Modifier"
                          >
                            <IcoEdit />
                          </button>
                          <button
                            className="ss-btn-danger"
                            onClick={() => {
                              setSelected(p);
                              setModal("delete");
                            }}
                            title="Supprimer"
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

        {/* Footer table */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(255,255,255,.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ color: "rgba(255,255,255,.25)", fontSize: "0.75rem" }}>
              {filtered.length} / {products.length} produit
              {products.length > 1 ? "s" : ""}
              {search || category ? " (filtré)" : ""}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <span
                style={{
                  color: "rgba(34,197,94,.7)",
                  fontSize: "0.72rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "rgba(34,197,94,.7)",
                    display: "inline-block",
                  }}
                />{" "}
                En stock
              </span>
              <span
                style={{
                  color: "rgba(251,191,36,.7)",
                  fontSize: "0.72rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "rgba(251,191,36,.7)",
                    display: "inline-block",
                  }}
                />{" "}
                Stock bas
              </span>
              <span
                style={{
                  color: "rgba(239,68,68,.7)",
                  fontSize: "0.72rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,.7)",
                    display: "inline-block",
                  }}
                />{" "}
                Rupture
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "create" && (
        <ProductModal
          product={null}
          onClose={() => setModal(null)}
          onSaved={() => {
            load();
            showToast("Produit créé avec succès !");
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
