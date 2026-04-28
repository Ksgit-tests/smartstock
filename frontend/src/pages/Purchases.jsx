import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

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

const injectStyles = () => {
  if (document.getElementById("ss-purchases-styles")) return;
  const s = document.createElement("style");
  s.id = "ss-purchases-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes pop     { 0%{transform:scale(.9);opacity:0} 70%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
    @keyframes slideTab{ from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
    .ss-tr-pur { transition:background .15s; }
    .ss-tr-pur:hover td { background:rgba(255,255,255,.02) !important; }
    .ss-input-p { width:100%; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:12px 14px; color:#fff; font-size:.88rem; font-family:'Outfit',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s,background .2s; }
    .ss-input-p::placeholder { color:rgba(255,255,255,.22); }
    .ss-input-p:focus { border-color:rgba(96,165,250,.6); background:rgba(255,255,255,.08); box-shadow:0 0 0 3px rgba(96,165,250,.1); }
    .ss-input-p:disabled { opacity:.4; cursor:not-allowed; }
    .ss-select-p { width:100%; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:12px 14px; color:#fff; font-size:.88rem; font-family:'Outfit',sans-serif; outline:none; appearance:none; cursor:pointer; }
    .ss-select-p option { background:#1a2235; color:#fff; }
    .ss-select-p:focus { border-color:rgba(96,165,250,.6); box-shadow:0 0 0 3px rgba(96,165,250,.1); }
    .ss-btn-ghost-p { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:10px 16px; color:rgba(255,255,255,.6); font-size:.875rem; font-weight:500; font-family:'Outfit',sans-serif; cursor:pointer; transition:all .2s; }
    .ss-btn-ghost-p:hover { background:rgba(255,255,255,.1); color:#fff; }
    .ss-tab-p { padding:9px 18px; border-radius:9px; font-size:.82rem; font-weight:600; font-family:'Outfit',sans-serif; cursor:pointer; border:1px solid transparent; transition:all .2s; display:flex; align-items:center; gap:6px; }
    .ss-tab-p.active { background:rgba(96,165,250,.15); border-color:rgba(96,165,250,.3); color:#93c5fd; }
    .ss-tab-p:not(.active) { background:rgba(255,255,255,.04); color:rgba(255,255,255,.45); }
    .ss-tab-p:not(.active):hover { background:rgba(255,255,255,.08); color:rgba(255,255,255,.7); }
    .ss-modal-ov { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.75); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s ease; }
    .ss-modal-p { background:linear-gradient(145deg,#141f35,#0d1525); border:1px solid rgba(255,255,255,.1); border-radius:20px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,.6); animation:slideUp .25s ease; }
    .ss-modal-p::-webkit-scrollbar { width:4px; }
    .ss-modal-p::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }
    .ss-filter-p { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); border-radius:8px; padding:7px 14px; color:rgba(255,255,255,.5); font-size:.78rem; font-weight:600; font-family:'Outfit',sans-serif; cursor:pointer; transition:all .2s; white-space:nowrap; }
    .ss-filter-p.active { background:rgba(96,165,250,.15); border-color:rgba(96,165,250,.3); color:#93c5fd; }
    .ss-filter-p:hover:not(.active) { background:rgba(255,255,255,.09); color:#fff; }
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

function PurchaseModal({ products, onClose, onSaved }) {
  const [mode, setMode] = useState("existing");
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    unit_cost: "",
    product_name: "",
    selling_price: "",
    threshold: "5",
    category: "",
  });
  const [loading, setLd] = useState(false);
  const [error, setErr] = useState("");
  const [selProd, setSel] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!form.product_id || mode === "new") {
      setSel(null);
      return;
    }
    const p = products.find((p) => p.id === parseInt(form.product_id));
    if (p) {
      setSel(p);
      setForm((f) => ({ ...f, unit_cost: p.purchase_price }));
    }
  }, [form.product_id, products, mode]);

  const total = (Number(form.quantity) || 0) * (Number(form.unit_cost) || 0);
  const margin =
    mode === "new" && form.selling_price && form.unit_cost
      ? (
          ((form.selling_price - form.unit_cost) / (form.unit_cost || 1)) *
          100
        ).toFixed(1)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLd(true);
    try {
      const payload =
        mode === "existing"
          ? {
              product_id: parseInt(form.product_id),
              quantity: Number(form.quantity),
              unit_cost: Number(form.unit_cost),
            }
          : {
              product_name: form.product_name,
              selling_price: Number(form.selling_price),
              threshold: Number(form.threshold),
              category: form.category || null,
              quantity: Number(form.quantity),
              unit_cost: Number(form.unit_cost),
            };
      await api.post("/purchases", payload);
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
      className="ss-modal-ov"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ss-modal-p">
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
              🛒 Nouvel achat fournisseur
            </h3>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}>
              Enregistrer une réception de marchandise
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
        <div
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: "4px",
              background: "rgba(255,255,255,.04)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.07)",
            }}
          >
            <button
              className={`ss-tab-p${mode === "existing" ? " active" : ""}`}
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setMode("existing")}
            >
              📦 Produit existant
            </button>
            <button
              className={`ss-tab-p${mode === "new" ? " active" : ""}`}
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setMode("new")}
            >
              ⚡ Nouveau produit
            </button>
          </div>
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
                gap: 8,
                alignItems: "center",
              }}
            >
              ⚠️ {error}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {mode === "existing" && (
              <div style={{ animation: "slideTab .2s ease" }}>
                <Field label="Produit" required>
                  <div style={{ position: "relative" }}>
                    <select
                      className="ss-select-p"
                      value={form.product_id}
                      onChange={set("product_id")}
                      required
                    >
                      <option value="">— Choisir un produit —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock : {p.quantity})
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
                {selProd && (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,.04)",
                      border: "1px solid rgba(255,255,255,.07)",
                      marginTop: 12,
                      animation: "pop .2s ease",
                    }}
                  >
                    {[
                      {
                        label: "Stock actuel",
                        value: selProd.quantity,
                        color: "#86efac",
                      },
                      {
                        label: "Prix achat",
                        value: `${fmt(selProd.purchase_price)} MAD`,
                        color: "#93c5fd",
                      },
                      {
                        label: "Catégorie",
                        value: selProd.category || "—",
                        color: "rgba(255,255,255,.6)",
                      },
                    ].map((i) => (
                      <div
                        key={i.label}
                        style={{ flex: 1, textAlign: "center" }}
                      >
                        <p
                          style={{
                            color: "rgba(255,255,255,.3)",
                            fontSize: ".65rem",
                            marginBottom: 3,
                          }}
                        >
                          {i.label.toUpperCase()}
                        </p>
                        <p
                          style={{
                            color: i.color,
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: ".85rem",
                          }}
                        >
                          {i.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {mode === "new" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  animation: "slideTab .2s ease",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(96,165,250,.08)",
                    border: "1px solid rgba(96,165,250,.2)",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <span>💡</span>
                  <p
                    style={{
                      color: "rgba(255,255,255,.5)",
                      fontSize: ".78rem",
                      lineHeight: 1.6,
                    }}
                  >
                    Le produit sera créé automatiquement dans votre catalogue.
                  </p>
                </div>
                <Field label="Nom du produit" required>
                  <input
                    className="ss-input-p"
                    placeholder="ex: Fanta Orange 50cl"
                    value={form.product_name}
                    onChange={set("product_name")}
                    required
                  />
                </Field>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <Field
                    label="Prix de vente (MAD)"
                    required
                    hint="Prix client"
                  >
                    <input
                      className="ss-input-p"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.selling_price}
                      onChange={set("selling_price")}
                      required
                    />
                  </Field>
                  <Field label="Seuil d'alerte">
                    <input
                      className="ss-input-p"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={form.threshold}
                      onChange={set("threshold")}
                    />
                  </Field>
                </div>
                <Field label="Catégorie">
                  <div style={{ position: "relative" }}>
                    <select
                      className="ss-select-p"
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
                    <span>{parseFloat(margin) > 0 ? "📈" : "📉"}</span>
                    <span
                      style={{
                        color: parseFloat(margin) > 0 ? "#86efac" : "#fca5a5",
                        fontSize: ".8rem",
                        fontWeight: 600,
                      }}
                    >
                      Marge prévisionnelle : {margin}%
                    </span>
                  </div>
                )}
              </div>
            )}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,.06)",
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,.3)",
                  fontSize: ".72rem",
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  fontWeight: 600,
                }}
              >
                Détails de la réception
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Quantité reçue" required>
                  <input
                    className="ss-input-p"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={form.quantity}
                    onChange={set("quantity")}
                    required
                  />
                </Field>
                <Field
                  label="Coût unitaire (MAD)"
                  required
                  hint="Prix fournisseur"
                >
                  <input
                    className="ss-input-p"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.unit_cost}
                    onChange={set("unit_cost")}
                    required
                  />
                </Field>
              </div>
              {total > 0 && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "rgba(96,165,250,.08)",
                    border: "1px solid rgba(96,165,250,.2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    animation: "pop .2s ease",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "rgba(255,255,255,.4)",
                        fontSize: ".72rem",
                        marginBottom: 2,
                      }}
                    >
                      Coût total commande
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,.3)",
                        fontSize: ".7rem",
                      }}
                    >
                      {form.quantity || 0} u. × {fmt(form.unit_cost || 0)} MAD
                    </p>
                  </div>
                  <span
                    style={{
                      color: "#93c5fd",
                      fontWeight: 800,
                      fontSize: "1.15rem",
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    {fmt(total)} MAD
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, paddingTop: 2 }}>
              <button
                type="button"
                className="ss-btn-ghost-p"
                style={{ flex: 1 }}
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || (mode === "existing" && !form.product_id)}
                style={{
                  flex: 2,
                  background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: ".875rem",
                  fontFamily: "'Outfit',sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  opacity:
                    loading || (mode === "existing" && !form.product_id)
                      ? ".6"
                      : "1",
                  boxShadow: "0 4px 14px rgba(37,99,235,.3)",
                }}
              >
                {loading ? <IcoSpin /> : "🛒"}
                {loading ? "Enregistrement..." : "Valider la réception"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ purchase, onClose, onDeleted }) {
  const [loading, setLd] = useState(false);
  const confirm = async () => {
    setLd(true);
    try {
      await api.delete(`/purchases/${purchase.id}`);
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
      <div className="ss-modal-p" style={{ maxWidth: 420 }}>
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
              Supprimer cet achat ?
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,.4)",
                fontSize: ".85rem",
                lineHeight: 1.6,
              }}
            >
              Achat de{" "}
              <strong style={{ color: "#fff" }}>
                {purchase.product?.name}
              </strong>
              <br />
              Le stock sera{" "}
              <strong style={{ color: "#fde68a" }}>décrémenté</strong> de{" "}
              {purchase.quantity} unités.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button
              className="ss-btn-ghost-p"
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

const FILTERS = [
  { label: "Aujourd'hui", value: "today" },
  { label: "7 jours", value: "week" },
  { label: "Ce mois", value: "month" },
  { label: "Tout", value: "all" },
];

export default function Purchases() {
  injectStyles();
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
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
      const [purRes, prodRes] = await Promise.all([
        api.get("/purchases"),
        api.get("/products"),
      ]);
      setPurchases(purRes.data.data);
      setProducts(prodRes.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = purchases.filter((p) => {
    const date = new Date(p.created_at);
    const now = new Date();
    let ok = true;
    if (filter === "today") ok = date.toDateString() === now.toDateString();
    else if (filter === "week") ok = now - date <= 7 * 86400000;
    else if (filter === "month")
      ok =
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    return (
      ok &&
      (!search ||
        (p.product?.name ?? "").toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalDep = filtered.reduce((acc, p) => acc + Number(p.total_cost), 0);
  const totalQty = filtered.reduce((acc, p) => acc + Number(p.quantity), 0);
  const avgAchat = filtered.length ? totalDep / filtered.length : 0;

  const exportCSV = () => {
    const rows = [["ID", "Produit", "Quantité", "Coût unit.", "Total", "Date"]];
    filtered.forEach((p) =>
      rows.push([
        p.id,
        p.product?.name,
        p.quantity,
        p.unit_cost,
        p.total_cost,
        fmtDate(p.created_at),
      ]),
    );
    const blob = new Blob([rows.map((r) => r.join(";")).join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "achats.csv";
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
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "rgba(37,99,235,.9)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: ".875rem",
            zIndex: 300,
            animation: "slideUp .3s ease",
          }}
        >
          ✓ {toast}
        </div>
      )}
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
            Achats fournisseurs
          </h2>
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".8rem" }}>
            {loading
              ? "..."
              : `${filtered.length} achat${filtered.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="ss-btn-ghost-p"
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
            onClick={() => setModal("create")}
            style={{
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              color: "#fff",
              fontWeight: 600,
              fontSize: ".875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 4px 14px rgba(37,99,235,.3)",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            <IcoPlus /> Nouvel achat
          </button>
        </div>
      </div>
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
              label: "Dépenses totales",
              value: `${fmt(totalDep)} MAD`,
              color: "#f87171",
              icon: "💸",
            },
            {
              label: "Unités reçues",
              value: totalQty,
              color: "#60a5fa",
              icon: "📦",
            },
            {
              label: "Achat moyen",
              value: `${fmt(avgAchat)} MAD`,
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
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`ss-filter-p${filter === f.value ? " active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
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
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}
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
                  "Coût unitaire",
                  "Total",
                  "Date & Heure",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
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
                        <Sk w={j === 2 ? 120 : 60} h={13} />
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
                      🛒
                    </div>
                    <p
                      style={{
                        color: "rgba(255,255,255,.3)",
                        fontSize: ".9rem",
                      }}
                    >
                      {search
                        ? "Aucun résultat."
                        : "Aucun achat sur cette période."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className="ss-tr-pur"
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
                      #{p.id}
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
                            background: "rgba(96,165,250,.1)",
                            border: "1px solid rgba(96,165,250,.18)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: ".85rem",
                            flexShrink: 0,
                          }}
                        >
                          🛒
                        </div>
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: ".875rem",
                          }}
                        >
                          {p.product?.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "rgba(255,255,255,.6)",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: ".85rem",
                      }}
                    >
                      {p.quantity}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "rgba(255,255,255,.5)",
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: ".82rem",
                      }}
                    >
                      {fmt(p.unit_cost)} MAD
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          color: "#93c5fd",
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: ".9rem",
                          background: "rgba(96,165,250,.1)",
                          borderRadius: 6,
                          padding: "3px 9px",
                          border: "1px solid rgba(96,165,250,.2)",
                        }}
                      >
                        {fmt(p.total_cost)} MAD
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
                        {fmtDate(p.created_at)}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,.25)",
                          fontSize: ".7rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {fmtTime(p.created_at)}
                      </p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => {
                          setSel(p);
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
            {!loading && filtered.length > 0 && (
              <tfoot>
                <tr
                  style={{
                    borderTop: "1px solid rgba(255,255,255,.08)",
                    background: "rgba(96,165,250,.04)",
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
                    TOTAL — {filtered.length} achat
                    {filtered.length > 1 ? "s" : ""} · {totalQty} unités
                  </td>
                  <td colSpan={3} style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        color: "#93c5fd",
                        fontWeight: 800,
                        fontSize: "1.05rem",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {fmt(totalDep)} MAD
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      {modal === "create" && (
        <PurchaseModal
          products={products}
          onClose={() => setModal(null)}
          onSaved={() => {
            load();
            showToast("Achat enregistré !");
          }}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteModal
          purchase={selected}
          onClose={() => {
            setModal(null);
            setSel(null);
          }}
          onDeleted={() => {
            load();
            showToast("Achat supprimé.");
          }}
        />
      )}
    </div>
  );
}
