import Utilisateur from '../utilisateur.js';
import Service from '../service.js';
import Entite from '../entite.js';
import { Role } from '../autorisations/autorisation.js';

export type TypeActionAudit =
  | 'ATTRIBUTION_ROLE'
  | 'RETRAIT_ACCES'
  | 'NOMINATION_ADMIN';

interface DonneesAuditMap extends Record<TypeActionAudit, unknown> {
  ATTRIBUTION_ROLE: { role: Role };
  RETRAIT_ACCES: undefined;
  NOMINATION_ADMIN: undefined;
}

export type DonneesAudit<T extends TypeActionAudit> = DonneesAuditMap[T];

export type TraceAudit<T extends TypeActionAudit> = {
  acteur: Utilisateur;
  utilisateurCible: Utilisateur;
  entiteCible: Entite;
  serviceCible?: Service;
  typeAction: T;
  donneesSupplementaires: DonneesAudit<T>;
};
