import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
import {
  AdaptateurUUID,
  fabriqueAdaptateurUUID,
} from '../adaptateurs/adaptateurUUID.js';
import Entite from '../modeles/entite.js';
import Superviseur from '../modeles/superviseur.js';

export type DepotDonneesPourServiceAdmin = {
  autorisationsDuService: (id: UUID) => Promise<Array<Autorisation>>;
  lisAdminsPour: (siret: string) => Promise<Array<UUID>>;
  sauvegardeAutorisation: (autorisation: Autorisation) => Promise<void>;
  supprimeAutorisationsAdminPour: (id: UUID) => Promise<void>;
  ajouteSiretAAdmin: (idUtilisateur: UUID, siret: string) => Promise<void>;
  tousLesServicesAvecSiret: (siret: string) => Promise<Service[]>;
  entitesAdministreesPar: (idUtilisateur: UUID) => Promise<Array<Entite>>;
  superviseur: (id: UUID) => Promise<Superviseur | undefined>;
};

export class ServiceAdministrationOrganisations {
  private readonly depotDonnees: DepotDonneesPourServiceAdmin;
  private readonly adaptateurUUID: AdaptateurUUID;

  constructor({
    depotDonnees,
    adaptateurUUID = fabriqueAdaptateurUUID(),
  }: {
    depotDonnees: DepotDonneesPourServiceAdmin;
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

    return lesAdmins.map((idAdmin) => {
      const existante = autorisationsExistantes.find((a) =>
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

      const autorisationExistantePourAdmin = autorisationsExistantes.find((a) =>
        a.designeUtilisateur(idAdmin)
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

  async entitesDe(idUtilisateur: UUID) {
    const administreesPar =
      await this.depotDonnees.entitesAdministreesPar(idUtilisateur);
    if (administreesPar.length > 0) return administreesPar;

    const superviseur = await this.depotDonnees.superviseur(idUtilisateur);
    if (superviseur) return superviseur.entitesSupervisees;

    return [];
  }
}
