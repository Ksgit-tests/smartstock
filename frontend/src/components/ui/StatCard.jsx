/**
 * StatCard — Carte de statistique réutilisable
 *
 * Props :
 *   title    {string}  — Libellé (ex: "Chiffre d'affaires")
 *   value    {string}  — Valeur affichée (ex: "12 450 MAD")
 *   icon     {string}  — Emoji (ex: "💰")
 *   color    {string}  — Couleur principale (ex: "#16a34a")
 *   trend    {string?} — Tendance optionnelle (ex: "↑ 8% vs mois dernier")
 *   trendUp  {bool?}   — true = vert, false = rouge
 *   alert    {bool?}   — true = afficher une bordure d'alerte
 */
export default function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  trendUp,
  alert,
}) {
  const bg = color + "18"; // couleur avec 10% opacité
  const border = alert ? "#ef444455" : color + "30";

  return (
    <div
      style={{
        background: "#ffffff",
        border: `1.5px solid ${border}`,
        borderRadius: 14,
        padding: "1.25rem 1.4rem",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "transform .2s, box-shadow .2s",
        cursor: "default",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      {/* Cercle décoratif en arrière-plan */}
      <div
        style={{
          position: "absolute",
          right: -20,
          top: -20,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: bg,
          pointerEvents: "none",
        }}
      />

      {/* Header : icône + titre */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </span>
      </div>

      {/* Valeur principale */}
      <div
        style={{
          fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
          fontWeight: 800,
          color: "#111827",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      {/* Tendance optionnelle */}
      {trend && (
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: trendUp === false ? "#ef4444" : "#16a34a",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>{trendUp === false ? "↓" : "↑"}</span>
          {trend}
        </div>
      )}

      {/* Alerte stock */}
      {alert && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#ef4444",
            boxShadow: "0 0 0 3px rgba(239,68,68,0.2)",
          }}
        />
      )}
    </div>
  );
}
