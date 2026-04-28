import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap";

const NAV = [
  { path: "/", icon: "⬛", label: "Dashboard", emoji: "📊" },
  { path: "/products", icon: "⬛", label: "Produits", emoji: "📦" },
  { path: "/sales", icon: "⬛", label: "Ventes", emoji: "💰" },
  { path: "/purchases", icon: "⬛", label: "Achats", emoji: "🛒" },
  { path: "/statistics", icon: "⬛", label: "Statistiques", emoji: "📈" },
  { path: "/ai", icon: "⬛", label: "Assistant IA", emoji: "🤖" },
];

const SVG_ICONS = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <rect x="1" y="1" width="7" height="7" rx="1.5" />
      <rect x="12" y="1" width="7" height="7" rx="1.5" />
      <rect x="1" y="12" width="7" height="7" rx="1.5" />
      <rect x="12" y="12" width="7" height="7" rx="1.5" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M10 1L2 5v10l8 4 8-4V5L10 1zm0 2.2l5.5 2.75L10 8.7 4.5 5.95 10 3.2zM3.5 7.3l5.75 2.88V17L3.5 14.12V7.3zm7.25 9.7V10.18l5.75-2.88v6.82L10.75 17z" />
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M2 3h2l2.4 8H15l2-6H6" />
      <circle cx="9" cy="17" r="1.5" />
      <circle cx="14" cy="17" r="1.5" />
    </svg>
  ),
  purchases: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M10 2a6 6 0 0 1 6 6v1h2v9H2V9h2V8a6 6 0 0 1 6-6zm0 2a4 4 0 0 0-4 4v1h8V8a4 4 0 0 0-4-4z" />
    </svg>
  ),
  statistics: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <rect x="1" y="10" width="3" height="8" rx="1" />
      <rect x="6" y="6" width="3" height="12" rx="1" />
      <rect x="11" y="3" width="3" height="15" rx="1" />
      <rect x="16" y="8" width="3" height="10" rx="1" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.2 3.2l2.1 2.1M14.7 14.7l2.1 2.1M3.2 16.8l2.1-2.1M14.7 5.3l2.1-2.1" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6zm0 16a2 2 0 0 0 2-2H8a2 2 0 0 0 2 2z" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3M13 14l4-4-4-4M17 10H7" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path d="M13 15l-5-5 5-5" />
    </svg>
  ),
};

const NAV_ICONS = [
  SVG_ICONS.dashboard,
  SVG_ICONS.products,
  SVG_ICONS.sales,
  SVG_ICONS.purchases,
  SVG_ICONS.statistics,
  SVG_ICONS.ai,
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Inject fonts
  useEffect(() => {
    if (!document.getElementById("ss-layout-font")) {
      const l = document.createElement("link");
      l.id = "ss-layout-font";
      l.rel = "stylesheet";
      l.href = FONT_URL;
      document.head.appendChild(l);
    }
    if (!document.getElementById("ss-layout-styles")) {
      const s = document.createElement("style");
      s.id = "ss-layout-styles";
      s.textContent = `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080e1a; }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:.4} }

        .ss-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          text-decoration: none; transition: all .2s; cursor: pointer;
          position: relative; overflow: hidden;
          border: 1px solid transparent;
        }
        .ss-nav-item.active {
          background: linear-gradient(135deg, rgba(22,163,74,.25), rgba(22,163,74,.08));
          border-color: rgba(22,163,74,.3);
          box-shadow: 0 0 20px rgba(22,163,74,.1), inset 0 1px 0 rgba(255,255,255,.05);
        }
        .ss-nav-item:not(.active):hover {
          background: rgba(255,255,255,.05);
          border-color: rgba(255,255,255,.08);
        }
        .ss-nav-label {
          font-size: .85rem; font-weight: 500; white-space: nowrap;
          overflow: hidden; transition: opacity .2s, max-width .3s;
          font-family: 'Outfit', sans-serif;
        }
        .ss-nav-item.active .ss-nav-label { color: #86efac; font-weight: 600; }
        .ss-nav-item:not(.active) .ss-nav-label { color: rgba(255,255,255,.5); }
        .ss-nav-item.active .ss-nav-icon { color: #22c55e; }
        .ss-nav-item:not(.active) .ss-nav-icon { color: rgba(255,255,255,.35); }
        .ss-nav-item:hover:not(.active) .ss-nav-label { color: rgba(255,255,255,.8); }
        .ss-nav-item:hover:not(.active) .ss-nav-icon  { color: rgba(255,255,255,.7); }

        .ss-notif-btn { position: relative; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(255,255,255,.6); transition: all .2s; }
        .ss-notif-btn:hover { background: rgba(255,255,255,.1); color: #fff; }

        .ss-content-area { animation: slideIn .3s ease; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);
  const currentPage = NAV.find((n) => isActive(n.path))?.label ?? "SmartStock";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#080e1a",
        fontFamily: "'Outfit',sans-serif",
      }}
    >
      {/* ════ SIDEBAR ════ */}
      <aside
        style={{
          width: collapsed ? 68 : 240,
          background: "linear-gradient(180deg, #0d1525 0%, #0a1020 100%)",
          borderRight: "1px solid rgba(255,255,255,.06)",
          display: "flex",
          flexDirection: "column",
          transition: "width .3s cubic-bezier(.4,0,.2,1)",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflow: "hidden",
          boxShadow: "4px 0 24px rgba(0,0,0,.4)",
        }}
      >
        {/* Logo zone */}
        <div
          style={{
            height: 68,
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0 14px" : "0 20px",
            borderBottom: "1px solid rgba(255,255,255,.06)",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {/* Logo in white pill — always visible */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              flexShrink: 0,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,.1), 0 4px 12px rgba(22,163,74,.3)",
              overflow: "hidden",
            }}
          >
            <img
              src="/logo.png"
              alt="SS"
              style={{ width: 34, height: 34, objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<span style="font-size:1.1rem;font-weight:900;color:#16a34a">S</span>';
              }}
            />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", animation: "slideIn .2s ease" }}>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                SmartStock
              </div>
              <div
                style={{
                  color: "#16a34a",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Insight
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: "16px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {NAV.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              className={`ss-nav-item${isActive(item.path) ? " active" : ""}`}
              title={collapsed ? item.label : undefined}
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              {/* Active indicator bar */}
              {isActive(item.path) && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: 3,
                    borderRadius: 4,
                    background: "#22c55e",
                    boxShadow: "0 0 8px #22c55e",
                  }}
                />
              )}
              <span
                className="ss-nav-icon"
                style={{ display: "flex", flexShrink: 0, width: 18 }}
              >
                {NAV_ICONS[i]}
              </span>
              {!collapsed && <span className="ss-nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User + collapse */}
        <div
          style={{
            padding: "12px 10px",
            borderTop: "1px solid rgba(255,255,255,.06)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* User info */}
          {!collapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                background: "rgba(255,255,255,.04)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.06)",
                animation: "slideIn .2s ease",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#15803d,#22c55e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,.35)",
                    fontSize: "0.65rem",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email}
                </div>
              </div>
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 8,
              padding: "8px 0",
              color: "rgba(255,255,255,.4)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              transition: "all .2s",
              fontSize: "0.75rem",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            <span
              style={{
                display: "flex",
                transform: collapsed ? "rotate(180deg)" : "none",
                transition: "transform .3s",
              }}
            >
              {SVG_ICONS.chevron}
            </span>
            {!collapsed && <span>Réduire</span>}
          </button>
        </div>
      </aside>

      {/* ════ MAIN AREA ════ */}
      <div
        style={{
          marginLeft: collapsed ? 68 : 240,
          flex: 1,
          transition: "margin-left .3s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* ── TOPBAR ── */}
        <header
          style={{
            height: 68,
            flexShrink: 0,
            background: "rgba(8,14,26,.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          {/* Page title */}
          <div>
            <h1
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.15rem",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {currentPage}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,.3)",
                fontSize: "0.72rem",
                marginTop: 3,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Notification bell */}
            <button
              className="ss-notif-btn"
              onClick={() => setNotifOpen((v) => !v)}
              style={{ position: "relative" }}
            >
              {SVG_ICONS.bell}
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "pulse-dot 2s infinite",
                  border: "1.5px solid #080e1a",
                }}
              />
            </button>

            {/* User chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 12,
                padding: "6px 14px 6px 6px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#15803d,#22c55e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    lineHeight: 1,
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,.35)",
                    fontSize: "0.65rem",
                    marginTop: 1,
                  }}
                >
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.25)",
                borderRadius: 10,
                padding: "9px 14px",
                color: "#f87171",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.8rem",
                fontWeight: 600,
                fontFamily: "'Outfit',sans-serif",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,.1)";
              }}
            >
              {SVG_ICONS.logout} Déconnexion
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main
          className="ss-content-area"
          style={{ flex: 1, padding: "24px", overflowY: "auto" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
