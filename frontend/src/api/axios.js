import axios from "axios";

const api = axios.create({
  baseURL: "http://smartstock-api.test/api",
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
// sans ça, on aurait une erreur 401 Unauthorized sur toutes les requêtes protégées
// ou je devrais ajouter manuellement le token dans chaque composant, ce qui serait fastidieux et source d'erreurs

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config; // N'oublie pas de retourner la config modifiée
});

// Intercepteur pour gérer les erreurs globalement
// sans ça, je devrais gérer les erreurs dans chaque composant, ce qui serait répétitif

api.interceptors.response.use(
  (response) => response, // Si la réponse est réussie, on la retourne telle quelle
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token invalide ou expiré → on déconnecte l'utilisateur
        localStorage.removeItem("token");
        alert("Session expirée, veuillez vous reconnecter");
        window.location.href = "/login";
        return Promise.reject(error); // On arrête là, pas besoin de rejeter l'erreur
      }

      // Erreur côté serveur (4xx ou 5xx)
      console.error("API Error:", error.response.data);
      alert(
        `Erreur API: ${error.response.data.message || "Une erreur est survenue"}`,
      );
    } else if (error.request) {
      // Erreur de réseau ou pas de réponse du serveur
      console.error("Network Error:", error.request);
      alert("Erreur de réseau: impossible de contacter le serveur");
    } else {
      // Autre erreur (configuration, etc.)
      console.error("Error:", error.message);
      alert(`Erreur: ${error.message}`);
    }
    return Promise.reject(error); // On rejette l'erreur pour que les composants puissent aussi la gérer si besoin
  },
);

export default api;
