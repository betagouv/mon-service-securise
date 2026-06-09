import Utilisateur from '../utilisateur.js';
import Service from '../service.js';
import Entite from '../entite.js';

export type TraceAudit = {
  acteur: Utilisateur;
  utilisateurCible: Utilisateur;
  entiteCible: Entite;
  serviceCible?: Service;
  typeAction: 'ATTRIBUTION_ROLE' | 'RETRAIT_ACCES';
};
