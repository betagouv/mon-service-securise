const DUREE_SESSION = 60 * 60 * 1000;

const ENDPOINTS_SANS_CSRF = [
  // Inspiration : https://stackoverflow.com/a/60941601
  // L'obtention du token nécessite une action utilisateur (saisie Login + MDP) donc on la protège pas.
  { path: '/api/token', type: 'exact' },
  // Pareil pour l'inscription.
  { path: '/api/utilisateur', type: 'exact' },
  { path: '/api/reinitialisationMotDePasse', type: 'exact' },
  // Les événements Matomo partent vers l'infra beta : on ne fait que passe-plat donc on ne protège pas.
  { path: '/bibliotheques/evenementMatomo', type: 'exact' },
];

module.exports = { DUREE_SESSION, ENDPOINTS_SANS_CSRF };
