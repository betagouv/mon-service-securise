const TYPES_REQUETES = {
  API: 'API',
  NAVIGATION: 'NAVIGATION',
  RESSOURCE: 'RESSOURCE',
};

const ENDPOINTS_SANS_CSRF = [
  // Les routes suivantes sont toutes publiques et ne nécessitent pas de protection CSRF.
  // Un attaquand pourrait requêter la page qui pose le token CSRF avant d'accéder à ces routes.
  // en conséquence, on ne protège pas ces routes publiques contre les attaques CSRF.
  // Cf. https://stackoverflow.com/a/60941601
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

export {
  TYPES_REQUETES,
  CACHE_CONTROL_FICHIERS_STATIQUES,
  ENDPOINTS_SANS_CSRF,
};
