const DUREE_SESSION = 60 * 60 * 1000;

const TYPES_REQUETES = {
  API: 'API',
  NAVIGATION: 'NAVIGATION',
  RESSOURCE: 'RESSOURCE',
};

const ENDPOINTS_SANS_CSRF = [
  // Inspiration : https://stackoverflow.com/a/60941601
  // L'obtention du token nécessite une action utilisateur (saisie Login + MDP) donc on la protège pas.
  { path: '/api/token', type: 'exact' },
  // Pareil pour l'inscription.
  { path: '/api/utilisateur', type: 'exact' },
  { path: '/api/reinitialisationMotDePasse', type: 'exact' },
  // La désinscription est appelée par un webhook coté Brevo
  { path: '/api/desinscriptionInfolettre', type: 'exact' },
  // Les événements Matomo partent vers l'infra beta : on ne fait que passe-plat donc on ne protège pas.
  { path: '/bibliotheques/evenementMatomo', type: 'exact' },
];

const { CACHE_CONTROL_FICHIERS_STATIQUES } = process.env;

module.exports = {
  TYPES_REQUETES,
  CACHE_CONTROL_FICHIERS_STATIQUES,
  DUREE_SESSION,
  ENDPOINTS_SANS_CSRF,
};
