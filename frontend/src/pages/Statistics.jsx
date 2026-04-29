import { useState, useEffect, useCallback, Component } from "react";
import api from "../api/axios";

/* ─── Helpers ─── */
const fmt = (n) =>
  Number(n ?? 0).toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtK = (n) => {
  const v = Number(n ?? 0);
  return v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0);
};
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f87171",
  "#fbbf24",
  "#a78bfa",
  "#22d3ee",
];

/* ─── Error Boundary ─── */
class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <div
          style={{
            height: this.props.height || 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>📊</span>
          <p style={{ color: "rgba(255,255,255,.3)", fontSize: ".8rem" }}>
            Installez recharts :{" "}
            <code style={{ color: "#22c55e", fontFamily: "monospace" }}>
              npm install recharts
            </code>
          </p>
        </div>
      );
    return this.props.children;
  }
}

/* ─── Lazy-load recharts ─── */
let RC = null;
const getRecharts = async () => {
  if (RC) return RC;
  try {
    RC = await import("recharts");
    return RC;
  } catch {
    return null;
  }
};

/* ─── Inject styles ─── */
const injectStyles = () => {
  if (document.getElementById("ss-stats-styles")) return;
  const s = document.createElement("style");
  s.id = "ss-stats-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    .ss-period { padding:7px 16px; border-radius:8px; font-size:.78rem; font-weight:600; font-family:'Outfit',sans-serif; cursor:pointer; border:1px solid transparent; transition:all .2s; white-space:nowrap; }
    .ss-period.active { background:rgba(34,197,94,.15); border-color:rgba(34,197,94,.3); color:#86efac; }
    .ss-period:not(.active) { background:rgba(255,255,255,.04); color:rgba(255,255,255,.4); border-color:rgba(255,255,255,.07); }
    .ss-period:not(.active):hover { background:rgba(255,255,255,.08); color:rgba(255,255,255,.7); }
    .recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line { stroke:rgba(255,255,255,.06) !important; }
    .recharts-text { fill:rgba(255,255,255,.35) !important; font-family:'Outfit',sans-serif !important; font-size:.72rem !important; }
    .recharts-legend-item-text { color:rgba(255,255,255,.55) !important; font-family:'Outfit',sans-serif !important; font-size:.78rem !important; }
  `;
  document.head.appendChild(s);
};

const Sk = ({ w = "100%", h = 200, r = 12 }) => (
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

const ChartCard = ({ title, subtitle, children, delay = 0, height = 220 }) => (
  <div
    style={{
      background: "linear-gradient(145deg,#111827,#0d1525)",
      border: "1px solid rgba(255,255,255,.07)",
      borderRadius: 16,
      padding: "20px 22px",
      boxShadow: "0 4px 24px rgba(0,0,0,.25)",
      animation: `fadeUp .5s ${delay}s ease both`,
    }}
  >
    <div style={{ marginBottom: 16 }}>
      <h3
        style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: ".95rem",
          fontFamily: "'Outfit',sans-serif",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p style={{ color: "rgba(255,255,255,.3)", fontSize: ".75rem" }}>
          {subtitle}
        </p>
      )}
    </div>
    <ChartErrorBoundary height={height}>{children}</ChartErrorBoundary>
  </div>
);

/* ─── Build data helpers ─── */
const buildTimeline = (sales, purchases, days) => {
  const map = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
    map[key] = { date: key, CA: 0, Dépenses: 0, Bénéfice: 0 };
  }
  sales.forEach((s) => {
    const k = fmtDate(s.created_at);
    if (map[k]) map[k].CA += Number(s.total_price);
  });
  purchases.forEach((p) => {
    const k = fmtDate(p.created_at);
    if (map[k]) map[k].Dépenses += Number(p.total_cost);
  });
  return Object.values(map).map((d) => ({ ...d, Bénéfice: d.CA - d.Dépenses }));
};

const buildTopProducts = (sales) => {
  const map = {};
  sales.forEach((s) => {
    const n = s.product?.name ?? "Inconnu";
    if (!map[n]) map[n] = { name: n, ventes: 0, revenus: 0 };
    map[n].ventes += Number(s.quantity);
    map[n].revenus += Number(s.total_price);
  });
  return Object.values(map)
    .sort((a, b) => b.revenus - a.revenus)
    .slice(0, 7);
};

const PERIODS = [
  { label: "7 jours", value: 7 },
  { label: "30 jours", value: 30 },
  { label: "90 jours", value: 90 },
];

/* ─── Charts component (loaded lazily) ─── */
function ChartsSection({
  timeline,
  topProducts,
  totalCA,
  totalDep,
  totalProfit,
  period,
}) {
  const [RC, setRC] = useState(null);

  useEffect(() => {
    getRecharts().then(setRC);
  }, []);

  if (!RC)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <Sk key={i} h={240} />
        ))}
      </div>
    );

  const {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
  } = RC;

  const CustomTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: "rgba(13,21,37,.95)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 10,
          padding: "10px 14px",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,.5)",
            fontSize: ".72rem",
            marginBottom: 6,
          }}
        >
          {label}
        </p>
        {payload.map((p, i) => (
          <p
            key={i}
            style={{
              color: p.color,
              fontWeight: 700,
              fontSize: ".82rem",
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            {p.name} : {fmt(p.value)} MAD
          </p>
        ))}
      </div>
    );
  };

  const margeData = [
    { name: "Bénéfice", value: Math.max(0, totalProfit), fill: "#22c55e" },
    { name: "Dépenses", value: totalDep, fill: "#f87171" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Area chart */}
      <ChartCard
        title="Évolution CA / Dépenses / Bénéfice"
        subtitle={`${period} derniers jours`}
        delay={0.1}
        height={220}
      >
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={timeline}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {[
                ["gCA", "#22c55e"],
                ["gDep", "#f87171"],
                ["gBen", "#3b82f6"],
              ].map(([id, c]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,.3)", fontSize: ".65rem" }}
              interval={period > 30 ? 6 : period > 7 ? 3 : 0}
            />
            <YAxis
              tickFormatter={fmtK}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,.3)", fontSize: ".65rem" }}
            />
            <Tooltip content={<CustomTip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Area
              type="monotone"
              dataKey="CA"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#gCA)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="Dépenses"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#gDep)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="Bénéfice"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gBen)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Bar + Pie */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}
      >
        <ChartCard
          title="Top produits par revenus"
          subtitle="Classé par CA généré"
          delay={0.15}
          height={260}
        >
          {topProducts.length === 0 ? (
            <div
              style={{
                height: 260,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span style={{ fontSize: "2rem" }}>📦</span>
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: ".85rem" }}>
                Aucune vente sur la période
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={fmtK}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(255,255,255,.3)", fontSize: ".65rem" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "rgba(255,255,255,.5)", fontSize: ".72rem" }}
                />
                <Tooltip content={<CustomTip />} />
                <Bar
                  dataKey="revenus"
                  name="Revenus"
                  fill="#22c55e"
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Répartition financière"
          subtitle="Bénéfice vs Dépenses"
          delay={0.2}
          height={260}
        >
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={margeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {margeData.map((e, i) => (
                  <Cell key={i} fill={e.fill} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${fmt(v)} MAD`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {margeData.map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: d.fill,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(255,255,255,.5)",
                      fontSize: ".78rem",
                    }}
                  >
                    {d.name}
                  </span>
                </div>
                <span
                  style={{
                    color: d.fill,
                    fontWeight: 700,
                    fontSize: ".78rem",
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {fmt(d.value)} MAD
                </span>
              </div>
            ))}
            {totalCA > 0 && (
              <div
                style={{
                  textAlign: "center",
                  paddingTop: 4,
                  borderTop: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,.3)", fontSize: ".72rem" }}
                >
                  Taux de marge :{" "}
                </span>
                <span
                  style={{
                    color: totalProfit >= 0 ? "#22c55e" : "#f87171",
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {((totalProfit / totalCA) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function Statistics() {
  injectStyles();
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, pRes, prRes] = await Promise.all([
        api.get("/sales"),
        api.get("/purchases"),
        api.get("/products"),
      ]);
      setSales(sRes.data.data);
      setPurchases(pRes.data.data);
      setProducts(prRes.data.data);
    } catch (e) {
      setError("Impossible de charger les données.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period);
  const filtSales = sales.filter((s) => new Date(s.created_at) >= cutoff);
  const filtPurch = purchases.filter((p) => new Date(p.created_at) >= cutoff);

  const totalCA = filtSales.reduce((a, s) => a + Number(s.total_price), 0);
  const totalDep = filtPurch.reduce((a, p) => a + Number(p.total_cost), 0);
  const totalProfit = totalCA - totalDep;

  const timeline = buildTimeline(filtSales, filtPurch, period);
  const topProducts = buildTopProducts(filtSales);

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
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        <span style={{ fontSize: "2rem" }}>⚠️</span>
        <p style={{ color: "#f87171", fontWeight: 600 }}>{error}</p>
        <button
          onClick={load}
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
            Statistiques
          </h2>
          <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".8rem" }}>
            Analyse des performances commerciales
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`ss-period${period === p.value ? " active" : ""}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 12,
        }}
      >
        {[
          {
            label: "Chiffre d'affaires",
            value: `${fmt(totalCA)} MAD`,
            color: "#22c55e",
            icon: "💰",
          },
          {
            label: "Dépenses",
            value: `${fmt(totalDep)} MAD`,
            color: "#f87171",
            icon: "💸",
          },
          {
            label: "Bénéfice net",
            value: `${fmt(totalProfit)} MAD`,
            color: totalProfit >= 0 ? "#3b82f6" : "#f87171",
            icon: totalProfit >= 0 ? "📈" : "📉",
          },
          {
            label: "Transactions",
            value: filtSales.length,
            color: "#a78bfa",
            icon: "🧾",
          },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              background: "linear-gradient(145deg,#111827,#0d1525)",
              border: `1px solid ${s.color}22`,
              borderRadius: 12,
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              animation: `fadeUp .4s ${i * 0.06}s ease both`,
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>{s.icon}</span>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  color: s.color,
                  fontWeight: 800,
                  fontSize: ".95rem",
                  lineHeight: 1,
                  fontFamily: "'JetBrains Mono',monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "..." : s.value}
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

      {/* Charts */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[240, 280].map((h, i) => (
            <Sk key={i} h={h} />
          ))}
        </div>
      ) : (
        <ChartsSection
          timeline={timeline}
          topProducts={topProducts}
          totalCA={totalCA}
          totalDep={totalDep}
          totalProfit={totalProfit}
          period={period}
        />
      )}

      {/* Tableau récap */}
      {!loading && topProducts.length > 0 && (
        <div
          style={{
            background: "linear-gradient(145deg,#111827,#0d1525)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,.25)",
            animation: "fadeUp .5s .35s ease both",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid rgba(255,255,255,.07)",
            }}
          >
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: ".95rem" }}>
              Classement des produits
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,.3)",
                fontSize: ".75rem",
                marginTop: 2,
              }}
            >
              Sur les {period} derniers jours
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,.06)",
                    background: "rgba(255,255,255,.02)",
                  }}
                >
                  {["Rang", "Produit", "Unités", "Revenus", "Part du CA"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 18px",
                          textAlign: "left",
                          color: "rgba(255,255,255,.3)",
                          fontSize: ".68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".08em",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr
                    key={p.name}
                    style={{
                      borderBottom:
                        i < topProducts.length - 1
                          ? "1px solid rgba(255,255,255,.04)"
                          : "none",
                    }}
                  >
                    <td style={{ padding: "12px 18px" }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            i === 0
                              ? "rgba(251,191,36,.15)"
                              : i === 1
                                ? "rgba(148,163,184,.1)"
                                : "rgba(255,255,255,.04)",
                          color:
                            i === 0
                              ? "#fbbf24"
                              : i === 1
                                ? "#94a3b8"
                                : "rgba(255,255,255,.4)",
                          fontWeight: 800,
                          fontSize: ".75rem",
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 18px",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: ".875rem",
                      }}
                    >
                      {p.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 18px",
                        color: "#3b82f6",
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: ".85rem",
                      }}
                    >
                      {p.ventes} u.
                    </td>
                    <td
                      style={{
                        padding: "12px 18px",
                        color: "#22c55e",
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: ".85rem",
                      }}
                    >
                      {fmt(p.revenus)} MAD
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 5,
                            borderRadius: 5,
                            background: "rgba(255,255,255,.08)",
                            overflow: "hidden",
                            maxWidth: 100,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 5,
                              background: COLORS[i % COLORS.length],
                              width: `${totalCA > 0 ? (p.revenus / totalCA) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            color: "rgba(255,255,255,.45)",
                            fontSize: ".75rem",
                            fontFamily:
                              "'JetBrains Mono',monospace',minWidth:32",
                          }}
                        >
                          {totalCA > 0
                            ? ((p.revenus / totalCA) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
