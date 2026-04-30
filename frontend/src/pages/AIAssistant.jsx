import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";

/* ─── Inject styles ─── */
const injectStyles = () => {
  if (document.getElementById("ss-ai-styles")) return;
  const s = document.createElement("style");
  s.id = "ss-ai-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes msgIn     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes pulse-ai  { 0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,.4)} 50%{box-shadow:0 0 0 8px rgba(168,85,247,0)} }

    .ss-ai-input {
      flex:1; background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.1); border-radius:12px;
      padding:14px 18px; color:#fff; font-size:.9rem;
      font-family:'Outfit',sans-serif; outline:none; resize:none;
      transition:border-color .2s,box-shadow .2s;
      min-height:50px; max-height:120px;
      line-height:1.5;
    }
    .ss-ai-input::placeholder { color:rgba(255,255,255,.22); }
    .ss-ai-input:focus { border-color:rgba(168,85,247,.5); box-shadow:0 0 0 3px rgba(168,85,247,.1); }

    .ss-suggestion-chip {
      background:rgba(168,85,247,.1); border:1px solid rgba(168,85,247,.2);
      border-radius:20px; padding:7px 14px; color:rgba(255,255,255,.6);
      font-size:.78rem; font-weight:500; font-family:'Outfit',sans-serif;
      cursor:pointer; transition:all .2s; white-space:nowrap;
    }
    .ss-suggestion-chip:hover { background:rgba(168,85,247,.2); border-color:rgba(168,85,247,.4); color:#fff; }

    .ss-insight-card {
      background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
      border-radius:12px; padding:14px 16px; cursor:pointer;
      transition:all .2s;
    }
    .ss-insight-card:hover { background:rgba(168,85,247,.08); border-color:rgba(168,85,247,.2); }

    .ss-msgs::-webkit-scrollbar { width:4px; }
    .ss-msgs::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }
  `;
  document.head.appendChild(s);
};

/* ─── Icons ─── */
const IcoSend = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IcoClear = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);
const IcoBot = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4M8 15h.01M16 15h.01" />
  </svg>
);
const IcoUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IcoSpark = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

/* ─── Typing dots ─── */
const TypingDots = () => (
  <div
    style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "rgba(168,85,247,.7)",
          animation: `blink 1.2s ${i * 0.2}s ease-in-out infinite`,
        }}
      />
    ))}
  </div>
);

/* ─── Format AI response (markdown-like) ─── */
const FormatMessage = ({ text }) => {
  const lines = text.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {lines.map((line, i) => {
        if (line.startsWith("### "))
          return (
            <p
              key={i}
              style={{
                color: "#e2e8f0",
                fontWeight: 700,
                fontSize: ".9rem",
                margin: "6px 0 2px",
              }}
            >
              {line.slice(4)}
            </p>
          );
        if (line.startsWith("## "))
          return (
            <p
              key={i}
              style={{
                color: "#f1f5f9",
                fontWeight: 800,
                fontSize: "1rem",
                margin: "8px 0 2px",
              }}
            >
              {line.slice(3)}
            </p>
          );
        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <p
              key={i}
              style={{ color: "#fff", fontWeight: 700, fontSize: ".875rem" }}
            >
              {line.slice(2, -2)}
            </p>
          );
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div
              key={i}
              style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
            >
              <span style={{ color: "#a78bfa", marginTop: 2, flexShrink: 0 }}>
                •
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,.8)",
                  fontSize: ".875rem",
                  lineHeight: 1.6,
                }}
              >
                {line.slice(2)}
              </span>
            </div>
          );
        if (line.match(/^\d+\./))
          return (
            <div
              key={i}
              style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
            >
              <span
                style={{
                  color: "#a78bfa",
                  fontWeight: 700,
                  fontSize: ".78rem",
                  marginTop: 2,
                  flexShrink: 0,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {line.split(".")[0]}.
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,.8)",
                  fontSize: ".875rem",
                  lineHeight: 1.6,
                }}
              >
                {line.slice(line.indexOf(".") + 1).trim()}
              </span>
            </div>
          );
        if (line.trim() === "") return <div key={i} style={{ height: 4 }} />;
        return (
          <p
            key={i}
            style={{
              color: "rgba(255,255,255,.8)",
              fontSize: ".875rem",
              lineHeight: 1.65,
            }}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
};

/* ─── SUGGESTIONS ─── */
const SUGGESTIONS = [
  "Quels produits dois-je réapprovisionner ?",
  "Quelle est ma marge moyenne ce mois ?",
  "Quels sont mes produits les plus rentables ?",
  "Quels produits se vendent le moins ?",
  "Comment optimiser mes marges ?",
  "Analyse mes ventes de cette semaine",
];

/* ─── INSIGHTS PROACTIFS ─── */
const buildInsights = (products, sales, purchases) => {
  const insights = [];
  const lowStock = products.filter((p) => p.quantity <= p.threshold);
  if (lowStock.length > 0) {
    insights.push({
      icon: "⚠️",
      color: "#fbbf24",
      title: "Stock critique",
      desc: `${lowStock.length} produit${lowStock.length > 1 ? "s" : ""} sous le seuil minimal`,
      query: `Analyse le stock critique de mes produits : ${lowStock.map((p) => p.name).join(", ")}`,
    });
  }
  const totalCA = sales.reduce((a, s) => a + Number(s.total_price), 0);
  const totalDep = purchases.reduce((a, p) => a + Number(p.total_cost), 0);
  const margin =
    totalCA > 0 ? (((totalCA - totalDep) / totalCA) * 100).toFixed(1) : 0;
  insights.push({
    icon: "📊",
    color: "#22c55e",
    title: "Taux de marge",
    desc: `Marge actuelle : ${margin}%`,
    query: `Ma marge est de ${margin}%. Est-ce bon pour mon secteur ? Comment l'améliorer ?`,
  });
  if (sales.length > 0) {
    const map = {};
    sales.forEach((s) => {
      const n = s.product?.name ?? "?";
      map[n] = (map[n] ?? 0) + Number(s.total_price);
    });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    if (top)
      insights.push({
        icon: "🏆",
        color: "#a78bfa",
        title: "Meilleure vente",
        desc: `${top[0]} en tête`,
        query: `Donne-moi des conseils pour capitaliser sur le succès de ${top[0]}, mon produit le plus vendu.`,
      });
  }
  insights.push({
    icon: "💡",
    color: "#60a5fa",
    title: "Conseil du jour",
    desc: "Stratégie de pricing",
    query:
      "Donne-moi 3 conseils concrets pour optimiser ma stratégie de prix et augmenter mon chiffre d'affaires.",
  });
  return insights;
};

/* ═══ MAIN COMPONENT ═══ */
export default function AIAssistant() {
  injectStyles();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLd] = useState(true);
  const [bizData, setBizData] = useState({
    products: [],
    sales: [],
    purchases: [],
    dashboard: null,
  });
  const [insights, setInsights] = useState([]);
  const msgsRef = useRef(null);
  const inputRef = useRef(null);

  /* Load business data */
  const loadData = useCallback(async () => {
    setDataLd(true);
    try {
      const [pRes, sRes, purRes, dRes] = await Promise.all([
        api.get("/products"),
        api.get("/sales"),
        api.get("/purchases"),
        api.get("/dashboard"),
      ]);
      const data = {
        products: pRes.data.data,
        sales: sRes.data.data,
        purchases: purRes.data.data,
        dashboard: dRes.data.data,
      };
      setBizData(data);
      setInsights(buildInsights(data.products, data.sales, data.purchases));
    } finally {
      setDataLd(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* Scroll to bottom */
  useEffect(() => {
    if (msgsRef.current)
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  /* Build context for AI */
  const buildContext = (data) => {
    const { products, sales, purchases, dashboard } = data;
    const totalCA = Number(dashboard?.revenue ?? 0);
    const totalDep = Number(dashboard?.expenses ?? 0);
    const profit = Number(dashboard?.profit ?? 0);
    const lowStock = products.filter((p) => p.quantity <= p.threshold);
    const topSales = sales
      .slice(0, 10)
      .map(
        (s) => `${s.product?.name}: ${s.quantity} unités à ${s.unit_price} MAD`,
      )
      .join(", ");
    return `Tu es un assistant commercial expert pour SmartStock Insight, une application de gestion de stock pour petits commerçants.

DONNÉES ACTUELLES DU COMMERCE (mois en cours) :
- Chiffre d'affaires : ${totalCA.toFixed(2)} MAD
- Dépenses totales : ${totalDep.toFixed(2)} MAD
- Bénéfice net : ${profit.toFixed(2)} MAD
- Taux de marge : ${totalCA > 0 ? ((profit / totalCA) * 100).toFixed(1) : 0}%
- Nombre de produits : ${products.length}
- Produits en alerte stock : ${lowStock.length} (${lowStock.map((p) => p.name + "(" + p.quantity + " u.)").join(", ") || "aucun"})

PRODUITS EN CATALOGUE :
${products
  .slice(0, 15)
  .map(
    (p) =>
      `- ${p.name} | Stock: ${p.quantity} | Seuil: ${p.threshold} | Prix achat: ${p.purchase_price} MAD | Prix vente: ${p.selling_price} MAD | Marge: ${p.purchase_price > 0 ? (((p.selling_price - p.purchase_price) / p.purchase_price) * 100).toFixed(1) : 0}%`,
  )
  .join("\n")}

DERNIÈRES VENTES : ${topSales || "Aucune vente enregistrée"}

INSTRUCTIONS :
- Tu as accès aux données ci-dessus, ne demande jamais à l'utilisateur de les fournir
- Analyse directement et donne des recommandations concrètes basées sur ces données
- Réponds toujours en français
- Sois concis, pratique et orienté action
- Base tes recommandations sur les vraies données ci-dessus
- Utilise des listes à puces pour la clarté
- Si tu proposes des actions, numérote-les
- Ton ton est professionnel mais accessible pour un petit commerçant`;
  };

  /* Send message */
  const sendMessage = async (userText) => {
    if (!userText.trim() || loading) return;

    const userMsg = { role: "user", content: userText.trim(), ts: Date.now() };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const context = buildContext(bizData);

      const history = newMessages
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await api.post("/ai/chat", {
        system: context,
        messages: history,
      });

      const aiText =
        response.data?.choices?.[0]?.message?.content ?? "Pas de réponse.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiText, ts: Date.now() },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Erreur serveur IA.",
          ts: Date.now(),
          error: true,
        },
      ]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const fmtTime = (ts) =>
    new Date(ts).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return (
    <div
      style={{
        fontFamily: "'Outfit',sans-serif",
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: 20,
        height: "calc(100vh - 112px)",
        animation: "fadeUp .4s ease",
      }}
    >
      {/* ═══ ZONE CHAT ═══ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(145deg,#111827,#0d1525)",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse-ai 3s ease-in-out infinite",
              }}
            >
              <IcoBot />
            </div>
            <div>
              <h3
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1rem",
                  lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                Assistant IA SmartStock
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#22c55e",
                    animation: "blink 2s ease-in-out infinite",
                  }}
                />
                <p
                  style={{
                    color: "rgba(255,255,255,.35)",
                    fontSize: ".72rem",
                  }}
                >
                  Actif · Données du commerce chargées
                </p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 8,
                padding: "7px 12px",
                color: "rgba(255,255,255,.4)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: ".75rem",
                fontFamily: "'Outfit',sans-serif",
                transition: "all .2s",
              }}
            >
              <IcoClear /> Effacer
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          ref={msgsRef}
          className="ss-msgs"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Welcome message */}
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                gap: 16,
                animation: "fadeIn .5s ease",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  animation: "pulse-ai 3s ease-in-out infinite",
                }}
              >
                🤖
              </div>
              <div style={{ textAlign: "center", maxWidth: 380 }}>
                <h3
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    marginBottom: 8,
                  }}
                >
                  Bonjour ! Je suis votre assistant IA
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,.4)",
                    fontSize: ".875rem",
                    lineHeight: 1.6,
                  }}
                >
                  Je connais vos données en temps réel : stocks, ventes, achats
                  et finances. Posez-moi n'importe quelle question sur votre
                  commerce.
                </p>
              </div>
              {/* Suggestions */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                  maxWidth: 480,
                }}
              >
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="ss-suggestion-chip"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages list */}
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                animation: "msgIn .3s ease",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg,#15803d,#22c55e)"
                      : "linear-gradient(135deg,#7c3aed,#a78bfa)",
                }}
              >
                {msg.role === "user" ? <IcoUser /> : <IcoBot />}
              </div>
              {/* Bubble */}
              <div style={{ maxWidth: "75%" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg,rgba(22,163,74,.25),rgba(22,163,74,.12))"
                        : msg.error
                          ? "rgba(239,68,68,.1)"
                          : "rgba(255,255,255,.05)",
                    border: `1px solid ${msg.role === "user" ? "rgba(22,163,74,.3)" : msg.error ? "rgba(239,68,68,.2)" : "rgba(255,255,255,.08)"}`,
                  }}
                >
                  {msg.role === "user" ? (
                    <p
                      style={{
                        color: "#fff",
                        fontSize: ".875rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {msg.content}
                    </p>
                  ) : (
                    <FormatMessage text={msg.content} />
                  )}
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,.2)",
                    fontSize: ".65rem",
                    marginTop: 4,
                    textAlign: msg.role === "user" ? "right" : "left",
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {fmtTime(msg.ts)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                animation: "msgIn .3s ease",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                }}
              >
                <IcoBot />
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {/* Input zone */}
        <div
          style={{
            padding: "16px 22px",
            borderTop: "1px solid rgba(255,255,255,.07)",
            flexShrink: 0,
          }}
        >
          {/* Quick suggestions during chat */}
          {messages.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s}
                  className="ss-suggestion-chip"
                  style={{ fontSize: ".72rem", padding: "5px 11px" }}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              className="ss-ai-input"
              placeholder="Posez votre question sur votre commerce..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                flexShrink: 0,
                background: input.trim()
                  ? "linear-gradient(135deg,#7c3aed,#a78bfa)"
                  : "rgba(255,255,255,.06)",
                border: `1px solid ${input.trim() ? "transparent" : "rgba(255,255,255,.1)"}`,
                cursor: input.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: input.trim() ? "#fff" : "rgba(255,255,255,.3)",
                transition: "all .2s",
                boxShadow: input.trim()
                  ? "0 4px 14px rgba(124,58,237,.35)"
                  : "none",
              }}
            >
              {loading ? (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }}
                />
              ) : (
                <IcoSend />
              )}
            </button>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,.18)",
              fontSize: ".68rem",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Entrée pour envoyer · Shift+Entrée pour saut de ligne
          </p>
        </div>
      </div>

      {/* ═══ PANNEAU DROIT — INSIGHTS ═══ */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          overflowY: "auto",
        }}
      >
        {/* Header panneau */}
        <div
          style={{
            background: "linear-gradient(145deg,#111827,#0d1525)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 16,
            padding: "18px 18px 16px",
            boxShadow: "0 4px 24px rgba(0,0,0,.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <IcoSpark />
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: ".9rem" }}>
              Insights automatiques
            </h3>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,.3)",
              fontSize: ".75rem",
              lineHeight: 1.5,
            }}
          >
            Analyses générées à partir de vos données en temps réel. Cliquez
            pour en savoir plus.
          </p>
        </div>

        {/* Insight cards */}
        {dataLoading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,.03)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <Sk w="60%" h={12} />
                <div style={{ height: 6 }} />
                <Sk h={10} />
              </div>
            ))
          : insights.map((ins, i) => (
              <div
                key={i}
                className="ss-insight-card"
                onClick={() => sendMessage(ins.query)}
                style={{ animation: `fadeUp .4s ${i * 0.08}s ease both` }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${ins.color}18`,
                      border: `1px solid ${ins.color}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      flexShrink: 0,
                    }}
                  >
                    {ins.icon}
                  </div>
                  <div>
                    <p
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: ".83rem",
                        lineHeight: 1,
                        marginBottom: 4,
                      }}
                    >
                      {ins.title}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,.4)",
                        fontSize: ".75rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {ins.desc}
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    color: ins.color,
                    fontSize: ".7rem",
                    fontWeight: 600,
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <IcoSpark /> Analyser →
                </p>
              </div>
            ))}

        {/* Stats rapides */}
        {!dataLoading && bizData.dashboard && (
          <div
            style={{
              background: "linear-gradient(145deg,#111827,#0d1525)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 16,
              padding: "16px",
              boxShadow: "0 4px 24px rgba(0,0,0,.25)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,.35)",
                fontSize: ".72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 12,
              }}
            >
              Données en contexte
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  label: "Produits",
                  value: bizData.products.length,
                  color: "#60a5fa",
                },
                {
                  label: "Ventes",
                  value: bizData.sales.length,
                  color: "#22c55e",
                },
                {
                  label: "Achats",
                  value: bizData.purchases.length,
                  color: "#93c5fd",
                },
                {
                  label: "En alerte",
                  value: bizData.products.filter(
                    (p) => p.quantity <= p.threshold,
                  ).length,
                  color: "#fbbf24",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,.4)",
                      fontSize: ".78rem",
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      color: s.color,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: ".82rem",
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div
          style={{
            background:
              "linear-gradient(135deg,rgba(124,58,237,.12),rgba(124,58,237,.06))",
            border: "1px solid rgba(168,85,247,.2)",
            borderRadius: 16,
            padding: "16px",
          }}
        >
          <p
            style={{
              color: "#c4b5fd",
              fontWeight: 700,
              fontSize: ".82rem",
              marginBottom: 8,
            }}
          >
            💡 Astuce
          </p>
          <p
            style={{
              color: "rgba(255,255,255,.45)",
              fontSize: ".75rem",
              lineHeight: 1.6,
            }}
          >
            L'IA analyse vos vraies données. Plus vous avez de ventes et
            d'achats enregistrés, plus les recommandations seront précises.
          </p>
        </div>
      </div>
    </div>
  );
}
