import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

/* ─── Helpers ─── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtShort = (n) => {
  const v = Number(n ?? 0);
  if (v >= 1000) return (v / 1000).toFixed(1) + "k";
  return fmt(v);
};
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

/* ─── Mini sparkline SVG ─── */
const Sparkline = ({
  data = [],
  color = "#22c55e",
  height = 40,
  width = 100,
}) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  });
  const area = `M${pts.join("L")}L${pad + w},${pad + h}L${pad},${pad + h}Z`;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity=".3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={pts[pts.length - 1].split(",")[0]}
        cy={pts[pts.length - 1].split(",")[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
};

/* ─── Animated counter ─── */
const AnimCounter = ({ target, duration = 800, prefix = "", suffix = "" }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const t = Number(target) || 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(t * ease);
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return (
    <>
      {prefix}
      {fmt(val)}
      {suffix}
    </>
  );
};

/* ─── KPI Card ─── */
const KpiCard = ({
  title,
  value,
  icon,
  color,
  sub,
  subUp,
  sparkData,
  delay = 0,
}) => {
  const isNeg = Number(value) < 0;
  const displayColor = isNeg ? "#f87171" : color;

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #111827, #0d1525)",
        border: `1px solid ${displayColor}28`,
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 0 0 1px rgba(255,255,255,.04), 0 4px 24px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.04)`,
        animation: `kpiIn .5s ${delay}s ease both`,
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 0 0 1px ${displayColor}40, 0 12px 32px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 0 0 1px rgba(255,255,255,.04), 0 4px 24px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.04)`;
      }}
    >
      {/* Glow blob */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${displayColor}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              color: "rgba(255,255,255,.4)",
              fontSize: "0.72rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "'Outfit',sans-serif",
              marginBottom: 6,
            }}
          >
            {title}
          </p>
          <p
            style={{
              color: "#fff",
              fontSize: "clamp(1.4rem,2.5vw,1.9rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <AnimCounter target={value} duration={900} />
            <span
              style={{
                fontSize: "0.7em",
                color: "rgba(255,255,255,.4)",
                marginLeft: 4,
              }}
            >
              MAD
            </span>
          </p>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `${displayColor}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            flexShrink: 0,
            border: `1px solid ${displayColor}25`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Sparkline */}
      {sparkData?.length > 1 && (
        <div style={{ margin: "-4px -4px -8px" }}>
          <Sparkline
            data={sparkData}
            color={displayColor}
            height={38}
            width={160}
          />
        </div>
      )}

      {/* Sub */}
      {sub && (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              color: subUp ? "#22c55e" : "#f87171",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {subUp ? "▲" : "▼"} {sub}
          </span>
        </div>
      )}
    </div>
  );
};

/* ─── Alert pill ─── */
const AlertPill = ({ product }) => {
  const critical = product.quantity === 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: 10,
        background: critical ? "rgba(239,68,68,.08)" : "rgba(251,191,36,.06)",
        border: `1px solid ${critical ? "rgba(239,68,68,.2)" : "rgba(251,191,36,.18)"}`,
        transition: "background .2s",
      }}
    >
      <div>
        <p
          style={{
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.83rem",
            lineHeight: 1,
            marginBottom: 3,
          }}
        >
          {product.name}
        </p>
        <p style={{ color: "rgba(255,255,255,.3)", fontSize: "0.7rem" }}>
          Seuil min : {product.threshold} u.
        </p>
      </div>
      <span
        style={{
          background: critical ? "rgba(239,68,68,.25)" : "rgba(251,191,36,.2)",
          color: critical ? "#fca5a5" : "#fde68a",
          borderRadius: 20,
          padding: "3px 10px",
          fontSize: "0.75rem",
          fontWeight: 700,
          fontFamily: "'JetBrains Mono',monospace",
          border: `1px solid ${critical ? "rgba(239,68,68,.3)" : "rgba(251,191,36,.3)"}`,
        }}
      >
        {critical ? "⚠ Rupture" : `${product.quantity} u.`}
      </span>
    </div>
  );
};

/* ─── Skeleton ─── */
const Sk = ({ w = "100%", h = 16, r = 8 }) => (
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

/* ─── MAIN DASHBOARD ─── */
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Inject global styles
    if (!document.getElementById("ss-dash")) {
      const s = document.createElement("style");
      s.id = "ss-dash";
      s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes kpiIn    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .ss-tr:hover td { background: rgba(255,255,255,.025) !important; }
        .ss-dash-scroll::-webkit-scrollbar { width: 4px; }
        .ss-dash-scroll::-webkit-scrollbar-track { background: transparent; }
        .ss-dash-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius:4px; }
      `;
      document.head.appendChild(s);
    }

    api
      .get("/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => setError("Impossible de charger les données."))
      .finally(() => setLoading(false));
  }, []);

  // Mock sparkline data (7 derniers jours)
  const revSpark = [40, 65, 45, 80, 55, 90, Number(data?.revenue ?? 0)];
  const expSpark = [80, 70, 90, 60, 85, 70, Number(data?.expenses ?? 0)];
  const profSpark = revSpark.map((v, i) => v - expSpark[i]);

  if (error)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          gap: 12,
          color: "#f87171",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        <span style={{ fontSize: "2.5rem" }}>⚠️</span>
        <p style={{ fontWeight: 600 }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "rgba(22,163,74,.15)",
            border: "1px solid rgba(22,163,74,.3)",
            borderRadius: 8,
            padding: "8px 20px",
            color: "#22c55e",
            cursor: "pointer",
            fontWeight: 600,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Réessayer
        </button>
      </div>
    );

  const isProfit = Number(data?.profit ?? 0) >= 0;

  return (
    <div
      style={{
        fontFamily: "'Outfit',sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          animation: "fadeIn .4s ease",
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
            Tableau de bord
          </h2>
          {loading ? (
            <Sk w={140} h={13} />
          ) : (
            <p
              style={{
                color: "rgba(255,255,255,.35)",
                fontSize: "0.8rem",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              Période : {data?.period}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              background: "rgba(22,163,74,.1)",
              border: "1px solid rgba(22,163,74,.25)",
              borderRadius: 20,
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                animation: "kpiIn .5s ease infinite alternate",
              }}
            />
            <span
              style={{ color: "#22c55e", fontSize: "0.75rem", fontWeight: 600 }}
            >
              Système actif
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 KPI Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: 16,
        }}
      >
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,.03)",
                borderRadius: 16,
                padding: "20px 22px",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  <Sk w="60%" h={10} /> <Sk w="80%" h={26} />
                </div>
                <Sk w={42} h={42} r={12} />
              </div>
              <Sk h={38} />
            </div>
          ))
        ) : (
          <>
            <KpiCard
              title="Chiffre d'affaires"
              value={data.revenue}
              icon="💰"
              color="#22c55e"
              sub="ce mois"
              subUp={true}
              sparkData={revSpark}
              delay={0}
            />
            <KpiCard
              title="Dépenses totales"
              value={data.expenses}
              icon="🛒"
              color="#f87171"
              sub="ce mois"
              subUp={false}
              sparkData={expSpark}
              delay={0.05}
            />
            <KpiCard
              title="Bénéfice net"
              value={data.profit}
              icon={isProfit ? "📈" : "📉"}
              color={isProfit ? "#60a5fa" : "#f87171"}
              sub={isProfit ? "positif" : "négatif"}
              subUp={isProfit}
              sparkData={profSpark}
              delay={0.1}
            />
            <div
              style={{
                background: "linear-gradient(145deg,#111827,#0d1525)",
                border: `1px solid ${data.low_stock_count > 0 ? "rgba(251,191,36,.3)" : "rgba(22,163,74,.25)"}`,
                borderRadius: 16,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,.04), 0 4px 24px rgba(0,0,0,.3)",
                animation: "kpiIn .5s .15s ease both",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${data.low_stock_count > 0 ? "rgba(251,191,36,.12)" : "rgba(22,163,74,.12)"} 0%, transparent 70%)`,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "rgba(255,255,255,.4)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                    }}
                  >
                    Alertes stock
                  </p>
                  <p
                    style={{
                      color: "#fff",
                      fontSize: "clamp(1.4rem,2.5vw,1.9rem)",
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    {data.low_stock_count}
                    <span
                      style={{
                        fontSize: "0.5em",
                        color: "rgba(255,255,255,.35)",
                        marginLeft: 6,
                        fontWeight: 400,
                      }}
                    >
                      produit{data.low_stock_count > 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background:
                      data.low_stock_count > 0
                        ? "rgba(251,191,36,.15)"
                        : "rgba(22,163,74,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    border: `1px solid ${data.low_stock_count > 0 ? "rgba(251,191,36,.25)" : "rgba(22,163,74,.25)"}`,
                  }}
                >
                  {data.low_stock_count > 0 ? "⚠️" : "✅"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    color: data.low_stock_count > 0 ? "#fde68a" : "#22c55e",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {data.low_stock_count > 0
                    ? `▼ ${data.low_stock_count} produit${data.low_stock_count > 1 ? "s" : ""} sous le seuil`
                    : "▲ Tous les stocks OK"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Row 2 : Ventes + Alertes ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Table ventes */}
        <div
          style={{
            background: "linear-gradient(145deg, #111827, #0d1525)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,.25)",
            animation: "slideUp .5s .2s ease both",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(255,255,255,.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: 2,
                }}
              >
                Dernières ventes
              </h3>
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: "0.72rem" }}>
                5 transactions récentes
              </p>
            </div>
            <a
              href="/sales"
              style={{
                color: "#22c55e",
                fontSize: "0.78rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(22,163,74,.1)",
                border: "1px solid rgba(22,163,74,.2)",
                borderRadius: 8,
                padding: "5px 12px",
              }}
            >
              Voir tout →
            </a>
          </div>

          {loading ? (
            <div
              style={{
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {[1, 2, 3].map((i) => (
                <Sk key={i} h={18} />
              ))}
            </div>
          ) : !data.recent_sales?.length ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📭</div>
              <p
                style={{ color: "rgba(255,255,255,.3)", fontSize: "0.875rem" }}
              >
                Aucune vente enregistrée
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
                  >
                    {["Produit", "Qté", "Prix unit.", "Total", "Date"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 18px",
                            textAlign: "left",
                            color: "rgba(255,255,255,.3)",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            background: "rgba(255,255,255,.02)",
                            fontFamily: "'Outfit',sans-serif",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.recent_sales.map((s, i) => (
                    <tr
                      key={s.id}
                      className="ss-tr"
                      style={{
                        borderBottom:
                          i < data.recent_sales.length - 1
                            ? "1px solid rgba(255,255,255,.04)"
                            : "none",
                        animation: `kpiIn .4s ${0.05 * i}s ease both`,
                      }}
                    >
                      <td
                        style={{
                          padding: "13px 18px",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          fontFamily: "'Outfit',sans-serif",
                        }}
                      >
                        {s.product?.name ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          color: "rgba(255,255,255,.5)",
                          fontSize: "0.875rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {s.quantity}
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          color: "rgba(255,255,255,.5)",
                          fontSize: "0.875rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {fmt(s.unit_price)}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span
                          style={{
                            color: "#22c55e",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            fontFamily: "'JetBrains Mono',monospace",
                            background: "rgba(22,163,74,.1)",
                            borderRadius: 6,
                            padding: "3px 8px",
                            border: "1px solid rgba(22,163,74,.2)",
                          }}
                        >
                          {fmt(s.total_price)} MAD
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 18px",
                          color: "rgba(255,255,255,.3)",
                          fontSize: "0.8rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {fmtDate(s.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alertes stock */}
        <div
          style={{
            background: "linear-gradient(145deg, #111827, #0d1525)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,.25)",
            animation: "slideUp .5s .25s ease both",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <h3
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
                marginBottom: 2,
              }}
            >
              Alertes stock
            </h3>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: "0.72rem" }}>
              Produits sous le seuil
            </p>
          </div>

          <div
            className="ss-dash-scroll"
            style={{
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 340,
              overflowY: "auto",
            }}
          >
            {loading ? (
              [1, 2, 3].map((i) => <Sk key={i} h={54} r={10} />)
            ) : !data.low_stock_products?.length ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>✅</div>
                <p
                  style={{
                    color: "#22c55e",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Tous les stocks sont OK !
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,.25)",
                    fontSize: "0.75rem",
                    marginTop: 4,
                  }}
                >
                  Aucun produit sous le seuil.
                </p>
              </div>
            ) : (
              data.low_stock_products.map((p, i) => (
                <div
                  key={p.id}
                  style={{ animation: `kpiIn .4s ${0.05 * i}s ease both` }}
                >
                  <AlertPill product={p} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3 : Mini stats bar ── */}
      {!loading && data && (
        <div
          style={{
            background: "linear-gradient(145deg,#111827,#0d1525)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 16,
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            gap: 16,
            flexWrap: "wrap",
            boxShadow: "0 4px 24px rgba(0,0,0,.25)",
            animation: "slideUp .5s .3s ease both",
          }}
        >
          {[
            {
              label: "Taux de marge",
              value:
                data.revenue > 0
                  ? ((data.profit / data.revenue) * 100).toFixed(1) + "%"
                  : "N/A",
              color: "#60a5fa",
            },
            {
              label: "Dépenses / CA",
              value:
                data.revenue > 0
                  ? ((data.expenses / data.revenue) * 100).toFixed(1) + "%"
                  : "N/A",
              color: "#f87171",
            },
            {
              label: "Produits alertés",
              value: `${data.low_stock_count} / ?`,
              color: "#fde68a",
            },
            {
              label: "Ventes récentes",
              value: data.recent_sales?.length ?? 0,
              color: "#22c55e",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ textAlign: "center", padding: "0 12px" }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,.35)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 6,
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  color: stat.color,
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
