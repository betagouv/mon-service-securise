import { DonneesAdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { DonneesSuperviseur } from '../modeles/superviseur.js';
import { UUID } from '../typesBasiques.js';
import { DonneesNotificationTransactionnelle } from '../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

export interface PersistanceTS {
  lisAdminOrganisations: (
    idUtilisateur: UUID
  ) => Promise<DonneesAdminOrganisations | undefined>;
  lisAdminsOrganisation: (
    siret: string
  ) => Promise<Array<DonneesAdminOrganisations>>;
  lisAdminsOrganisations: (
    sirets: string[]
  ) => Promise<Map<string, Array<DonneesAdminOrganisations>>>;
  sauvegardeAdminOrganisations: (
    donnees: DonneesAdminOrganisations
  ) => Promise<void>;
  lisSuperviseur: (
    idUtilisateur: UUID
  ) => Promise<DonneesSuperviseur | undefined>;
  sauvegardeSuperviseur: (donnees: DonneesSuperviseur) => Promise<void>;
  lisSuperviseursOrganisation: (
    siret: string
  ) => Promise<Array<DonneesSuperviseur>>;
  supprimeSuperviseur: (idUtilisateur: UUID) => Promise<void>;
  lisNotificationDe: (
    idNotification: UUID,
    idDestinataire: UUID
  ) => Promise<DonneesNotificationTransactionnelle | undefined>;
  lisNotificationsDe: (
    idDestinataire: UUID
  ) => Promise<DonneesNotificationTransactionnelle[]>;
  sauvegardeNotificationTransactionnelle: (
    donnees: DonneesNotificationTransactionnelle
  ) => Promise<void>;
  supprimeNotificationTransactionnelle: (idNotification: UUID) => Promise<void>;
}
