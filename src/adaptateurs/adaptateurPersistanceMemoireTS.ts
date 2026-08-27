import { UUID } from '../typesBasiques.js';
import { DonneesAdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { DonneesSuperviseur } from '../modeles/superviseur.js';
import { PersistanceTS } from './persistanceTS.interface.js';
import { DonneesNotificationTransactionnelle } from '../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

type DonneesPersistanceMemoire = {
  adminsOrganisations: DonneesAdminOrganisations[];
  superviseurs: DonneesSuperviseur[];
  notificationsTransactionnelles: DonneesNotificationTransactionnelle[];
};

export class AdaptateurPersistanceMemoireTS implements PersistanceTS {
  private readonly donnees: DonneesPersistanceMemoire = {
    adminsOrganisations: [],
    superviseurs: [],
    notificationsTransactionnelles: [],
  };

  constructor(donnees?: Partial<DonneesPersistanceMemoire>) {
    if (donnees)
      this.donnees = {
        adminsOrganisations: donnees.adminsOrganisations ?? [],
        superviseurs: donnees.superviseurs ?? [],
        notificationsTransactionnelles:
          donnees.notificationsTransactionnelles ?? [],
      };
  }

  async lisAdminOrganisations(
    idUtilisateur: UUID
  ): Promise<DonneesAdminOrganisations | undefined> {
    return this.donnees.adminsOrganisations.find(
      (a) => a.idUtilisateur === idUtilisateur
    );
  }

  async lisAdminsOrganisation(
    siret: string
  ): Promise<Array<DonneesAdminOrganisations>> {
    return this.donnees.adminsOrganisations.filter((a) =>
      a.entitesAdministrees.map((e) => e.siret).includes(siret)
    );
  }

  async sauvegardeAdminOrganisations(
    donnees: DonneesAdminOrganisations
  ): Promise<void> {
    this.donnees.adminsOrganisations = this.donnees.adminsOrganisations.filter(
      (d) => d.idUtilisateur !== donnees.idUtilisateur
    );
    this.donnees.adminsOrganisations.push(donnees);
  }

  async lisSuperviseur(
    idUtilisateur: UUID
  ): Promise<DonneesSuperviseur | undefined> {
    return this.donnees.superviseurs.find(
      (s) => s.idUtilisateur === idUtilisateur
    );
  }

  async sauvegardeSuperviseur(donnees: DonneesSuperviseur): Promise<void> {
    this.donnees.superviseurs = this.donnees.superviseurs.filter(
      (s) => s.idUtilisateur !== donnees.idUtilisateur
    );
    this.donnees.superviseurs.push(donnees);
  }

  async lisSuperviseursOrganisation(
    siret: string
  ): Promise<Array<DonneesSuperviseur>> {
    return this.donnees.superviseurs.filter((s) =>
      s.entitesSupervisees.map((e) => e.siret).includes(siret)
    );
  }

  async supprimeSuperviseur(idUtilisateur: UUID): Promise<void> {
    this.donnees.superviseurs = this.donnees.superviseurs.filter(
      (s) => s.idUtilisateur !== idUtilisateur
    );
  }

  async lisNotificationsDe(
    idDestinataire: UUID
  ): Promise<DonneesNotificationTransactionnelle[]> {
    return this.donnees.notificationsTransactionnelles.filter(
      (n) => n.idDestinataire === idDestinataire
    );
  }

  async lisNotificationDe(
    idNotification: UUID,
    idDestinataire: UUID
  ): Promise<DonneesNotificationTransactionnelle | undefined> {
    return this.donnees.notificationsTransactionnelles.find(
      (n) => n.idDestinataire === idDestinataire && n.id === idNotification
    );
  }

  async sauvegardeNotificationTransactionnelle(
    donnees: DonneesNotificationTransactionnelle
  ) {
    const indiceExistant =
      this.donnees.notificationsTransactionnelles.findIndex(
        (n) => n.id === donnees.id
      );

    if (indiceExistant !== -1)
      this.donnees.notificationsTransactionnelles[indiceExistant] = donnees;
    else this.donnees.notificationsTransactionnelles.push(donnees);
  }
}
