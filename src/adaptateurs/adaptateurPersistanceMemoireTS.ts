import { UUID } from '../typesBasiques.js';
import { DonneesAdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { DonneesSuperviseur } from '../modeles/superviseur.js';
import { PersistanceTS } from './persistanceTS.interface.js';

type DonneesPersistanceMemoire = {
  adminsOrganisations: DonneesAdminOrganisations[];
  superviseurs: DonneesSuperviseur[];
};

export class AdaptateurPersistanceMemoireTS implements PersistanceTS {
  private readonly donnees: DonneesPersistanceMemoire = {
    adminsOrganisations: [],
    superviseurs: [],
  };

  constructor(donnees?: Partial<DonneesPersistanceMemoire>) {
    if (donnees)
      this.donnees = {
        adminsOrganisations: donnees.adminsOrganisations ?? [],
        superviseurs: donnees.superviseurs ?? [],
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
}
