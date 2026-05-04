import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
import {
  AdaptateurUUID,
  fabriqueAdaptateurUUID,
} from '../adaptateurs/adaptateurUUID.js';

type DepotDonneesPourServiceAdmin = {
  lisAdminsPour: (siret: string) => Promise<Array<UUID>>;
  sauvegardeAutorisation: (autorisation: Autorisation) => Promise<void>;
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
    const lesAdmins = await this.depotDonnees.lisAdminsPour(
      service.siretDeOrganisation()
    );

    const nouvellesAutorisations = lesAdmins.map((idAdmin) =>
      Autorisation.NouvelleAutorisationAdmin({
        id: this.adaptateurUUID.genereUUID(),
        idService: service.id,
        idUtilisateur: idAdmin,
      })
    );

    await Promise.all(
      nouvellesAutorisations.map(this.depotDonnees.sauvegardeAutorisation)
    );
  }
}
