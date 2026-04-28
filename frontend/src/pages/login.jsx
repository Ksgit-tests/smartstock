import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─── STYLES GLOBAUX (injectés une seule fois) ─── */
const injectStyles = () => {
  if (document.getElementById("ss-global")) return;
  const s = document.createElement("style");
  s.id = "ss-global";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeLeft { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
    @keyframes float    { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-12px) rotate(1deg);} }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity:.6; }
      100% { transform: scale(1.6); opacity:0;  }
    }

    .ss-font { font-family: 'Inter', system-ui, sans-serif; }

    .ss-input {
      width: 100%; background: #f9fafb;
      border: 1.5px solid #e5e7eb; border-radius: 10px;
      padding: 13px 14px 13px 42px;
      font-size: 0.9rem; font-family: 'Inter', sans-serif;
      color: #111827; outline: none;
      transition: border-color .2s, box-shadow .2s, background .2s;
    }
    .ss-input::placeholder { color: #9ca3af; }
    .ss-input:focus {
      border-color: #16a34a; background: #fff;
      box-shadow: 0 0 0 3px rgba(22,163,74,.1);
    }
    .ss-input-err { border-color: #ef4444 !important; }
    .ss-input-ok  { border-color: #16a34a !important; }

    .ss-btn {
      width: 100%; border: none; border-radius: 10px;
      padding: 13px; font-size: 0.95rem; font-weight: 600;
      font-family: 'Inter', sans-serif; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: transform .15s, box-shadow .2s, opacity .2s;
    }
    .ss-btn:hover:not(:disabled) { transform: translateY(-2px); }
    .ss-btn:active:not(:disabled){ transform: translateY(0); }
    .ss-btn:disabled { opacity: .65; cursor: not-allowed; }

    .ss-btn-green {
      background: linear-gradient(135deg, #15803d, #16a34a, #22c55e);
      background-size: 200% auto; color: #fff;
      box-shadow: 0 4px 14px rgba(22,163,74,.35);
    }
    .ss-btn-green:hover:not(:disabled) {
      background-position: right center;
      box-shadow: 0 6px 20px rgba(22,163,74,.45);
    }

    .ss-toggle {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: #9ca3af; display: flex; padding: 4px;
      transition: color .2s;
    }
    .ss-toggle:hover { color: #6b7280; }

    .ss-link { color: #16a34a; font-weight: 600; text-decoration: none; }
    .ss-link:hover { text-decoration: underline; }

    @media (max-width: 768px) { .ss-panel-left { display: none !important; } }
  `;
  document.head.appendChild(s);
};

/* ─── ICÔNES SVG ─── */
const Ico = {
  email: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  lock: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  eye: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  arrow: (
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
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

/* ─── ILLUSTRATION DASHBOARD ─── */
const DashIllustration = () => (
  <svg
    viewBox="0 0 320 200"
    style={{
      width: "100%",
      maxWidth: 320,
      animation: "float 5s ease-in-out infinite",
    }}
  >
    {/* Fond carte */}
    <rect
      x="10"
      y="10"
      width="300"
      height="180"
      rx="14"
      fill="rgba(255,255,255,0.06)"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="1"
    />

    {/* Header */}
    <rect
      x="24"
      y="24"
      width="120"
      height="7"
      rx="3"
      fill="rgba(255,255,255,0.22)"
    />
    <rect
      x="258"
      y="22"
      width="40"
      height="12"
      rx="6"
      fill="rgba(34,197,94,0.7)"
    />

    {/* 3 stat-cards */}
    {[
      {
        x: 24,
        color: "rgba(34,197,94,0.35)",
        val: "12 450",
        lbl: "CA Mensuel",
        trend: "↑ 8%",
      },
      {
        x: 122,
        color: "rgba(239,68,68,0.25)",
        val: "4 200",
        lbl: "Dépenses",
        trend: "↓ 3%",
      },
      {
        x: 220,
        color: "rgba(37,99,235,0.3)",
        val: "8 250",
        lbl: "Bénéfice",
        trend: "↑ 14%",
      },
    ].map((c, i) => (
      <g key={i}>
        <rect x={c.x} y="46" width="90" height="52" rx="8" fill={c.color} />
        <text
          x={c.x + 8}
          y="62"
          fill="rgba(255,255,255,0.5)"
          fontSize="7"
          fontFamily="Inter,sans-serif"
        >
          {c.lbl}
        </text>
        <text
          x={c.x + 8}
          y="77"
          fill="rgba(255,255,255,0.95)"
          fontSize="11"
          fontWeight="700"
          fontFamily="Inter,sans-serif"
        >
          {c.val}
        </text>
        <text
          x={c.x + 8}
          y="91"
          fill="rgba(134,239,172,0.9)"
          fontSize="7.5"
          fontFamily="Inter,sans-serif"
        >
          {c.trend}
        </text>
      </g>
    ))}

    {/* Bar chart */}
    {[18, 30, 22, 38, 28, 44, 34].map((h, i) => (
      <rect
        key={i}
        x={24 + i * 18}
        y={168 - h}
        width="12"
        height={h}
        rx="3"
        fill={i === 5 ? "rgba(34,197,94,0.85)" : "rgba(37,99,235,0.45)"}
      />
    ))}

    {/* Line chart */}
    <polyline
      points="170,165 190,152 212,157 232,142 252,136 272,141 292,130"
      fill="none"
      stroke="rgba(251,191,36,0.8)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="292" cy="130" r="4" fill="#fbbf24" />
  </svg>
);

/* ─── COMPOSANT LOGIN ─── */
export default function Login() {
  injectStyles();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ss-font"
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f3f4f6",
      }}
    >
      {/* ══ PANNEAU GAUCHE ══ */}
      <div
        className="ss-panel-left"
        style={{
          flex: "0 0 44%",
          background:
            "linear-gradient(155deg, #052e16 0%, #14532d 40%, #15803d 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "2rem 2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cercles déco */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,.15) 0%, transparent 70%)",
            bottom: -100,
            right: -100,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,.04) 0%, transparent 70%)",
            top: 60,
            left: -40,
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "fadeLeft .5s ease",
          }}
        >
          {/* Logo avec filtre pour fond sombre */}
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "6px 8px",
              backdropFilter: "blur(4px)",
            }}
          >
            <img
              src="/logo.png"
              alt="SmartStock"
              style={{ height: 32, width: "auto", display: "block" }}
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "-0.02em",
              }}
            >
              SmartStock
            </div>
            <div
              style={{
                color: "rgba(255,255,255,.4)",
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Insight
            </div>
          </div>
        </div>

        {/* Texte central */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              color: "#fff",
              fontSize: "clamp(1.6rem,2.8vw,2.2rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: "0.9rem",
              animation: "fadeUp .6s .1s ease both",
            }}
          >
            Bienvenue chez{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#86efac,#34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SmartStock
            </span>
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.55)",
              fontSize: "0.9rem",
              lineHeight: 1.65,
              marginBottom: "2rem",
              animation: "fadeUp .6s .2s ease both",
              maxWidth: 300,
            }}
          >
            Gérez vos produits, ventes, achats et finances depuis une interface
            intuitive et professionnelle.
          </p>

          {/* Illustration */}
          <div
            style={{
              animation: "fadeUp .6s .3s ease both",
              marginBottom: "2rem",
            }}
          >
            <DashIllustration />
          </div>

          {/* Features */}
          {[
            ["📦", "Gestion des stocks en temps réel"],
            ["💰", "Suivi des ventes et achats"],
            ["🤖", "Assistant IA intégré"],
          ].map(([icon, txt], i) => (
            <div
              key={txt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: i < 2 ? 10 : 0,
                animation: "fadeLeft .5s ease both",
                animationDelay: `${0.4 + i * 0.1}s`,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(255,255,255,.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <span
                style={{
                  color: "rgba(255,255,255,.7)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                {txt}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            color: "rgba(255,255,255,.18)",
            fontSize: "0.7rem",
            marginTop: "1.5rem",
          }}
        >
          © {new Date().getFullYear()} SmartStock Insight
        </p>
      </div>

      {/* ══ PANNEAU DROIT ══ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            animation: "fadeUp .5s ease both",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#111827",
              marginBottom: 6,
              letterSpacing: "-0.03em",
            }}
          >
            Connexion
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.875rem",
              marginBottom: "1.75rem",
            }}
          >
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          {/* Erreur */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "11px 14px",
                color: "#dc2626",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.83rem",
                  marginBottom: 6,
                }}
              >
                Adresse email
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                    display: "flex",
                  }}
                >
                  {Ico.email}
                </span>
                <input
                  className="ss-input"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.83rem",
                  }}
                >
                  Mot de passe
                </label>
                <a
                  href="#"
                  style={{
                    color: "#16a34a",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                    display: "flex",
                  }}
                >
                  {Ico.lock}
                </span>
                <input
                  className="ss-input"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="ss-toggle"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? Ico.eyeOff : Ico.eye}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              className="ss-btn ss-btn-green"
              disabled={loading}
              style={{ marginTop: 4 }}
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
                Ico.arrow
              )}
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              color: "#6b7280",
              fontSize: "0.85rem",
            }}
          >
            Pas encore de compte ?{" "}
            <Link to="/register" className="ss-link">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
