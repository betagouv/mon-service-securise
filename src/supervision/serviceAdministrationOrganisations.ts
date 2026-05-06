import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
import {
  AdaptateurUUID,
  fabriqueAdaptateurUUID,
} from '../adaptateurs/adaptateurUUID.js';

type DepotDonneesPourServiceAdmin = {
  autorisationsDuService: (id: UUID) => Promise<Array<Autorisation>>;
  lisAdminsPour: (siret: string) => Promise<Array<UUID>>;
  sauvegardeAutorisation: (autorisation: Autorisation) => Promise<void>;
  supprimeAutorisationsAdminPour: (id: UUID) => Promise<void>;
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

    const lesAdmins = await this.depotDonnees.lisAdminsPour(
      service.siretDeOrganisation()
    );
    const autorisationsExistantes =
      await this.depotDonnees.autorisationsDuService(service.id);
    const nouvellesAutorisations = lesAdmins.map((idAdmin) => {
      const existante = autorisationsExistantes.find((a) =>
        a.designeUtilisateur(idAdmin)
      );

      return Autorisation.NouvelleAutorisationAdmin({
        id: existante ? existante.id : this.adaptateurUUID.genereUUID(),
        idService: service.id,
        idUtilisateur: idAdmin,
      });
    });
    await Promise.all(
      nouvellesAutorisations.map(this.depotDonnees.sauvegardeAutorisation)
    );
  }
}
