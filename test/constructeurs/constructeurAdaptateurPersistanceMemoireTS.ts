import { AdaptateurPersistanceMemoireTS } from '../../src/adaptateurs/adaptateurPersistanceMemoireTS.js';
import { DonneesAdminOrganisations } from '../../src/modeles/gestionOrganisations/adminOrganisations.js';
import { DonneesSuperviseur } from '../../src/modeles/superviseur.js';
import { UUID } from '../../src/typesBasiques.js';
import { DonneesEntite } from '../../src/modeles/entite.js';
import { DonneesNotificationTransactionnelle } from '../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';

class ConstructeurAdaptateurPersistanceMemoireTS {
  private readonly adminsOrganisations: DonneesAdminOrganisations[];
  private readonly superviseurs: DonneesSuperviseur[];
  private readonly notificationsTransactionnelles: DonneesNotificationTransactionnelle[];

  constructor() {
    this.adminsOrganisations = [];
    this.superviseurs = [];
    this.notificationsTransactionnelles = [];
  }

  ajouteAdminSurPerimetre(idAdmin: UUID, entitesDuPerimetre: DonneesEntite[]) {
    this.adminsOrganisations.push({
      idUtilisateur: idAdmin,
      entitesAdministrees: entitesDuPerimetre,
    });

    return this;
  }

  ajouteSuperviseurSurPerimetre(
    idSuperviseur: UUID,
    entitesSupervisees: DonneesEntite[]
  ) {
    this.superviseurs.push({
      idUtilisateur: idSuperviseur,
      entitesSupervisees,
    });

    return this;
  }

  ajouteNotificationTransactionnelle(
    notification: DonneesNotificationTransactionnelle
  ) {
    this.notificationsTransactionnelles.push(notification);

    return this;
  }

  construis() {
    return new AdaptateurPersistanceMemoireTS({
      adminsOrganisations: this.adminsOrganisations,
      superviseurs: this.superviseurs,
      notificationsTransactionnelles: this.notificationsTransactionnelles,
    });
  }
}

export const unePersistanceMemoireTS = () =>
  new ConstructeurAdaptateurPersistanceMemoireTS();
