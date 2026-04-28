import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

// Crée le contexte — c'est une "boîte" accessible partout dans l'app
const AuthContext = createContext(null);

// Fournit le contexte aux composants enfants
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Stocke les infos de l'utilisateur connecté
  const [loading, setLoading] = useState(true); // Indique si on vérifie encore le token au démarrage

  // Au démarrage : vérifie si un token existe déjà
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/me");
          setUser(res.data.data); // Si le token est valide, on récupère les infos de l'utilisateur
        } catch {
          localStorage.removeItem("token"); // Si le token est invalide, on le supprime
        }
      }
      setLoading(false); // On arrête le chargement
    };
    checkToken();
  }, []);

  // Fonction pour se connecter : envoie les identifiants, stocke le token et les infos utilisateur
  const login = async (email, password) => {
    const res = await api.post("/login", { email, password }); // Envoie les identifiants à l'API
    localStorage.setItem("token", res.data.data.token);
    setUser(res.data.data.user);
  };

  const logout = async () => {
    await api.post("/logout");
    localStorage.removeItem("token");
    setUser(null); // On remet l'utilisateur à null pour indiquer qu'on est déconnecté
  };

  // On fournit le contexte avec les infos utilisateur, l'état de chargement
  //  et les fonctions de connexion/déconnexion

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour accéder facilement au contexte dans les composants
export function useAuth() {
  return useContext(AuthContext);
}
