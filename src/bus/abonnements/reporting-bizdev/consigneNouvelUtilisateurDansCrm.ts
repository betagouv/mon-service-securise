import EvenementUtilisateurInscrit from '../../evenementUtilisateurInscrit.js';

/* eslint-disable no-console */

export function consigneNouvelUtilisateurDansCrm() {
  return async (e: EvenementUtilisateurInscrit) => {
    console.log('[CRM] Nouvel utilisateur inscrit', e.utilisateur.email);
  };
}
