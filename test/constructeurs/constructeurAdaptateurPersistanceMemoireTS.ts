import { AdaptateurPersistanceMemoireTS } from '../../src/adaptateurs/adaptateurPersistanceMemoireTS.js';
import { DonneesAdminOrganisations } from '../../src/modeles/gestionOrganisations/adminOrganisations.js';
import { UUID } from '../../src/typesBasiques.js';
import { DonneesEntite } from '../../src/modeles/entite.js';

class ConstructeurAdaptateurPersistanceMemoireTS {
  private readonly adminsOrganisations: DonneesAdminOrganisations[];

  constructor() {
    this.adminsOrganisations = [];
  }

  ajouteAdminSurPerimetre(idAdmin: UUID, entitesDuPerimetre: DonneesEntite[]) {
    this.adminsOrganisations.push({
      idUtilisateur: idAdmin,
      entitesAdministrees: entitesDuPerimetre,
    });

    return this;
  }

  construis() {
    return new AdaptateurPersistanceMemoireTS({
      adminsOrganisations: this.adminsOrganisations,
    });
  }
}

export const unePersistanceMemoireTS = () =>
  new ConstructeurAdaptateurPersistanceMemoireTS();
