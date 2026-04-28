import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

/* Les styles globaux sont injectés par Login.jsx
   Si Register est accédé en premier, on les injecte ici */
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
    .ss-font { font-family: 'Inter', system-ui, sans-serif; }
    .ss-input { width:100%; background:#f9fafb; border:1.5px solid #e5e7eb; border-radius:10px; padding:13px 14px 13px 42px; font-size:0.9rem; font-family:'Inter',sans-serif; color:#111827; outline:none; transition:border-color .2s,box-shadow .2s,background .2s; }
    .ss-input::placeholder { color:#9ca3af; }
    .ss-input:focus { border-color:#16a34a; background:#fff; box-shadow:0 0 0 3px rgba(22,163,74,.1); }
    .ss-input-err { border-color:#ef4444 !important; }
    .ss-input-ok  { border-color:#16a34a !important; }
    .ss-btn { width:100%; border:none; border-radius:10px; padding:13px; font-size:0.95rem; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform .15s,box-shadow .2s,opacity .2s; }
    .ss-btn:hover:not(:disabled) { transform:translateY(-2px); }
    .ss-btn:disabled { opacity:.65; cursor:not-allowed; }
    .ss-btn-green { background:linear-gradient(135deg,#15803d,#16a34a,#22c55e); background-size:200% auto; color:#fff; box-shadow:0 4px 14px rgba(22,163,74,.35); }
    .ss-btn-green:hover:not(:disabled) { background-position:right center; box-shadow:0 6px 20px rgba(22,163,74,.45); }
    .ss-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9ca3af; display:flex; padding:4px; transition:color .2s; }
    .ss-toggle:hover { color:#6b7280; }
    .ss-link { color:#16a34a; font-weight:600; text-decoration:none; }
    .ss-link:hover { text-decoration:underline; }
    @media (max-width:768px) { .ss-panel-left { display:none !important; } }
  `;
  document.head.appendChild(s);
};

const Ico = {
  user: (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
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
  userPlus: (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
};

/* Force du mot de passe */
const pwStrength = (pw) => {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [
    null,
    { label: "Faible", color: "#ef4444" },
    { label: "Moyen", color: "#f59e0b" },
    { label: "Bon", color: "#3b82f6" },
    { label: "Excellent", color: "#16a34a" },
  ][s];
};

/* Illustration stocks */
const StockIllustration = () => (
  <svg
    viewBox="0 0 320 190"
    style={{
      width: "100%",
      maxWidth: 320,
      animation: "float 5s ease-in-out infinite",
    }}
  >
    <rect
      x="10"
      y="10"
      width="300"
      height="170"
      rx="14"
      fill="rgba(255,255,255,0.05)"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="1"
    />
    <rect
      x="24"
      y="24"
      width="100"
      height="7"
      rx="3"
      fill="rgba(255,255,255,0.2)"
    />
    <rect
      x="264"
      y="22"
      width="34"
      height="12"
      rx="6"
      fill="rgba(34,197,94,0.75)"
    />
    {/* Lignes de stock */}
    {[
      {
        y: 50,
        pct: 80,
        color: "rgba(34,197,94,0.65)",
        label: "Coca-Cola 33cl",
        val: "105",
      },
      {
        y: 75,
        pct: 30,
        color: "rgba(239,68,68,0.65)",
        label: "Lait UHT 1L",
        val: "12",
      },
      {
        y: 100,
        pct: 65,
        color: "rgba(37,99,235,0.65)",
        label: "Eau minérale",
        val: "68",
      },
      {
        y: 125,
        pct: 90,
        color: "rgba(34,197,94,0.65)",
        label: "Jus orange 1L",
        val: "200",
      },
    ].map((r, i) => (
      <g key={i}>
        <text
          x="24"
          y={r.y - 4}
          fill="rgba(255,255,255,0.45)"
          fontSize="7"
          fontFamily="Inter,sans-serif"
        >
          {r.label}
        </text>
        <rect
          x="24"
          y={r.y}
          width="220"
          height="8"
          rx="4"
          fill="rgba(255,255,255,0.08)"
        />
        <rect
          x="24"
          y={r.y}
          width={(220 * r.pct) / 100}
          height="8"
          rx="4"
          fill={r.color}
        />
        <text
          x="254"
          y={r.y + 7}
          fill="rgba(255,255,255,0.75)"
          fontSize="8"
          fontWeight="600"
          fontFamily="Inter,sans-serif"
        >
          {r.val}
        </text>
      </g>
    ))}
    {/* Stats bas */}
    {[
      { x: 24, bg: "rgba(34,197,94,0.25)", v: "24", l: "Ventes" },
      { x: 114, bg: "rgba(37,99,235,0.25)", v: "8", l: "Achats" },
      { x: 204, bg: "rgba(251,191,36,0.25)", v: "3", l: "Alertes" },
    ].map((c, i) => (
      <g key={i}>
        <rect x={c.x} y="148" width="82" height="30" rx="7" fill={c.bg} />
        <text
          x={c.x + 8}
          y="159"
          fill="rgba(255,255,255,0.45)"
          fontSize="7"
          fontFamily="Inter,sans-serif"
        >
          {c.l}
        </text>
        <text
          x={c.x + 8}
          y="172"
          fill="rgba(255,255,255,0.9)"
          fontSize="11"
          fontWeight="700"
          fontFamily="Inter,sans-serif"
        >
          {c.v}
        </text>
      </g>
    ))}
  </svg>
);

export default function Register() {
  injectStyles();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPw, setSP] = useState(false);
  const [showPw2, setSP2] = useState(false);
  const [error, setErr] = useState("");
  const [fieldErr, setFE] = useState({});
  const [loading, setLd] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const strength = pwStrength(form.password);
  const pwMatch =
    form.password_confirmation && form.password === form.password_confirmation;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setFE({});
    if (!pwMatch) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    setLd(true);
    try {
      await api.post("/register", form);
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 422) {
        setFE(err.response.data.errors ?? {});
        setErr("Veuillez corriger les erreurs ci-dessous.");
      } else {
        setErr("Une erreur est survenue. Réessayez.");
      }
    } finally {
      setLd(false);
    }
  };

  return (
    <div
      className="ss-font"
      style={{ minHeight: "100vh", display: "flex", background: "#f3f4f6" }}
    >
      {/* ══ PANNEAU GAUCHE ══ */}
      <div
        className="ss-panel-left"
        style={{
          flex: "0 0 44%",
          background:
            "linear-gradient(155deg,#052e16 0%,#14532d 40%,#15803d 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "2rem 2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(34,197,94,.12) 0%,transparent 70%)",
            bottom: -100,
            right: -100,
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
            Créez votre compte{" "}
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
            Rejoignez SmartStock et simplifiez la gestion de votre stock, vos
            ventes et vos achats.
          </p>

          <div
            style={{
              animation: "fadeUp .6s .3s ease both",
              marginBottom: "2rem",
            }}
          >
            <StockIllustration />
          </div>

          {[
            ["📦", "Gestion des stocks"],
            ["💰", "Ventes & Achats"],
            ["🤖", "Assistant IA"],
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
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            animation: "fadeUp .5s ease both",
            padding: "1rem 0",
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
            Créer un compte
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            Remplissez les informations pour commencer.
          </p>

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
            style={{ display: "flex", flexDirection: "column", gap: "0.95rem" }}
          >
            {/* Nom */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.83rem",
                  marginBottom: 5,
                }}
              >
                Nom complet
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    display: "flex",
                    pointerEvents: "none",
                  }}
                >
                  {Ico.user}
                </span>
                <input
                  className={`ss-input${fieldErr.name ? " ss-input-err" : ""}`}
                  type="text"
                  placeholder="Votre nom complet"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
              {fieldErr.name && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: 4,
                  }}
                >
                  {fieldErr.name[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.83rem",
                  marginBottom: 5,
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
                    display: "flex",
                    pointerEvents: "none",
                  }}
                >
                  {Ico.email}
                </span>
                <input
                  className={`ss-input${fieldErr.email ? " ss-input-err" : ""}`}
                  type="email"
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>
              {fieldErr.email && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: 4,
                  }}
                >
                  {fieldErr.email[0]}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.83rem",
                  marginBottom: 5,
                }}
              >
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    display: "flex",
                    pointerEvents: "none",
                  }}
                >
                  {Ico.lock}
                </span>
                <input
                  className="ss-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Minimum 8 caractères"
                  value={form.password}
                  onChange={set("password")}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="ss-toggle"
                  onClick={() => setSP((v) => !v)}
                >
                  {showPw ? Ico.eyeOff : Ico.eye}
                </button>
              </div>
              {/* Indicateur de force */}
              {form.password && strength && (
                <div style={{ marginTop: 7 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 3,
                          transition: "background .3s",
                          background:
                            i <=
                            [
                              null,
                              "Faible",
                              "Moyen",
                              "Bon",
                              "Excellent",
                            ].indexOf(strength.label)
                              ? strength.color
                              : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: strength.color,
                      fontWeight: 600,
                    }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
              {fieldErr.password && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: 4,
                  }}
                >
                  {fieldErr.password[0]}
                </p>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#374151",
                  fontSize: "0.83rem",
                  marginBottom: 5,
                }}
              >
                Confirmer le mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    display: "flex",
                    pointerEvents: "none",
                  }}
                >
                  {Ico.lock}
                </span>
                <input
                  className={`ss-input${form.password_confirmation && !pwMatch ? " ss-input-err" : pwMatch ? " ss-input-ok" : ""}`}
                  type={showPw2 ? "text" : "password"}
                  placeholder="Répétez le mot de passe"
                  value={form.password_confirmation}
                  onChange={set("password_confirmation")}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="ss-toggle"
                  onClick={() => setSP2((v) => !v)}
                >
                  {showPw2 ? Ico.eyeOff : Ico.eye}
                </button>
              </div>
              {form.password_confirmation && !pwMatch && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: 4,
                  }}
                >
                  Les mots de passe ne correspondent pas.
                </p>
              )}
              {pwMatch && (
                <p
                  style={{
                    color: "#16a34a",
                    fontSize: "0.75rem",
                    marginTop: 4,
                    fontWeight: 500,
                  }}
                >
                  ✓ Les mots de passe correspondent.
                </p>
              )}
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
                Ico.userPlus
              )}
              {loading ? "Création..." : "Créer mon compte"}
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
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="ss-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
