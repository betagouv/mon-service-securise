import { AdaptateurPersistanceMemoireTS } from '../../src/adaptateurs/adaptateurPersistanceMemoireTS.js';
import { DonneesAdminOrganisations } from '../../src/modeles/gestionOrganisations/adminOrganisations.js';
import { DonneesSuperviseur } from '../../src/modeles/superviseur.js';
import { UUID } from '../../src/typesBasiques.js';
import { DonneesEntite } from '../../src/modeles/entite.js';

class ConstructeurAdaptateurPersistanceMemoireTS {
  private readonly adminsOrganisations: DonneesAdminOrganisations[];
  private readonly superviseurs: DonneesSuperviseur[];

  constructor() {
    this.adminsOrganisations = [];
    this.superviseurs = [];
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

  construis() {
    return new AdaptateurPersistanceMemoireTS({
      adminsOrganisations: this.adminsOrganisations,
      superviseurs: this.superviseurs,
    });
  }
}

export const unePersistanceMemoireTS = () =>
  new ConstructeurAdaptateurPersistanceMemoireTS();
