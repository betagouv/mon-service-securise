import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
import { AdaptateurUUID } from '../adaptateurs/adaptateurUUID.js';

type DepotDonneesPourServiceAdmin = {
  lisAdminsPour: (siret: string) => Promise<Array<UUID>>;
  sauvegardeAutorisation: (autorisation: Autorisation) => Promise<void>;
};

export class ServiceAdminOrganisations {
  private readonly depotDonnees: DepotDonneesPourServiceAdmin;
  private readonly adaptateurUUID: AdaptateurUUID;
  constructor({
    depotDonnees,
    adaptateurUUID,
  }: {
    depotDonnees: DepotDonneesPourServiceAdmin;
    adaptateurUUID: AdaptateurUUID;
  }) {
    this.depotDonnees = depotDonnees;
    this.adaptateurUUID = adaptateurUUID;
  }

  async rattacheService(service: Service) {
    await this.depotDonnees.sauvegardeAutorisation(
      Autorisation.NouvelleAutorisationAdmin({
        id: this.adaptateurUUID.genereUUID(),
        idService: service.id,
        idUtilisateur: this.adaptateurUUID.genereUUID(),
      })
    );
  }
}
