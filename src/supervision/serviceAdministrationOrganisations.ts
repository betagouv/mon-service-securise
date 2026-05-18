import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
import {
  AdaptateurUUID,
  fabriqueAdaptateurUUID,
} from '../adaptateurs/adaptateurUUID.js';
import { DonneesEntite } from '../modeles/entite.js';
import Utilisateur from '../modeles/utilisateur.js';
import { DepotDonnees } from '../depotDonnees.interface.js';

export class ServiceAdministrationOrganisations {
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurUUID: AdaptateurUUID;

  constructor({
    depotDonnees,
    adaptateurUUID = fabriqueAdaptateurUUID(),
  }: {
    depotDonnees: DepotDonnees;
    adaptateurUUID: AdaptateurUUID;
  }) {
    this.depotDonnees = depotDonnees;
    this.adaptateurUUID = adaptateurUUID;
  }

  async rattacheLesAdministrateursDe(service: Service) {
    await this.depotDonnees.supprimeAutorisationsAdminPour(service.id);

    const nouvellesAutorisations =
      await this.fabriqueAutorisationsAdminPourService(service);

    await this.sauvegardeAutorisations(nouvellesAutorisations);
  }

  private async fabriqueAutorisationsAdminPourService(service: Service) {
    const lesAdmins = await this.depotDonnees.lisAdminsPour(
      service.siretDeOrganisation()
    );
    const autorisationsExistantes =
      await this.depotDonnees.autorisationsDuService(service.id);

    return lesAdmins.map((admin) => {
      const idAdmin = admin.donnees().idUtilisateur;
      const existante = autorisationsExistantes.find((a: Autorisation) =>
        a.designeUtilisateur(idAdmin)
      );

      return Autorisation.NouvelleAutorisationAdmin({
        id: existante ? existante.id : this.adaptateurUUID.genereUUID(),
        idService: service.id,
        idUtilisateur: idAdmin,
      });
    });
  }

  private async sauvegardeAutorisations(
    nouvellesAutorisations: Autorisation[]
  ) {
    await Promise.all(
      nouvellesAutorisations.map(this.depotDonnees.sauvegardeAutorisation)
    );
  }

  async rattacheEntiteA(siret: string, idAdmin: UUID) {
    await this.depotDonnees.ajouteSiretAAdmin(idAdmin, siret);

    const services = await this.depotDonnees.tousLesServicesAvecSiret(siret);

    const nouvellesAutorisations = this.fabriqueAutorisationsAdminPourServices(
      services,
      idAdmin
    );

    await this.sauvegardeAutorisations(
      await Promise.all(nouvellesAutorisations)
    );
  }

  private fabriqueAutorisationsAdminPourServices(
    services: Service[],
    idAdmin: UUID
  ) {
    return services.map(async (s) => {
      const autorisationsExistantes =
        await this.depotDonnees.autorisationsDuService(s.id);

      const autorisationExistantePourAdmin = autorisationsExistantes.find(
        (a: Autorisation) => a.designeUtilisateur(idAdmin)
      );

      return Autorisation.NouvelleAutorisationAdmin({
        id: autorisationExistantePourAdmin
          ? autorisationExistantePourAdmin.id
          : this.adaptateurUUID.genereUUID(),
        idService: s.id,
        idUtilisateur: idAdmin,
      });
    });
  }

  async entitesDe(idUtilisateur: UUID): Promise<Array<DonneesEntite>> {
    const admin = await this.depotDonnees.lisAdminOrganisations(idUtilisateur);
    if (admin) return admin.donnees().entitesAdministrees;

    const superviseur = await this.depotDonnees.superviseur(idUtilisateur);
    if (superviseur) return superviseur.entitesSupervisees;

    return [];
  }

  async utilisateursDansLePerimetreDe(
    idUtilisateur: UUID
  ): Promise<Array<Utilisateur>> {
    const sousUnAdmin =
      await this.depotDonnees.utilisateursAdministresPar(idUtilisateur);
    if (sousUnAdmin.length > 0) return sousUnAdmin;

    return this.depotDonnees.utilisateursSupervisesPar(idUtilisateur);
  }
}
