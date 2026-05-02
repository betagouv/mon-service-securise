import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurSupervision } from '../adaptateurs/adaptateurSupervision.interface.js';
import { UUID } from '../typesBasiques.js';
import { FiltresSupervision } from '../adaptateurs/adaptateurSupervisionMetabase.js';
import Service from '../modeles/service.js';

class ServiceSupervision {
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurSupervision: AdaptateurSupervision;

  constructor({
    depotDonnees,
    adaptateurSupervision,
  }: {
    depotDonnees: DepotDonnees;
    adaptateurSupervision: AdaptateurSupervision;
  }) {
    if (!depotDonnees || !adaptateurSupervision) {
      throw new Error(
        "Impossible d'instancier le service de supervision sans ses dépendances"
      );
    }
    this.depotDonnees = depotDonnees;
    this.adaptateurSupervision = adaptateurSupervision;
  }

  async delieServiceEtSuperviseurs(idService: UUID) {
    await this.adaptateurSupervision.delieServiceDesSuperviseurs(idService);
  }

  genereURLSupervision(idSuperviseur: UUID, filtres: FiltresSupervision) {
    return this.adaptateurSupervision.genereURLSupervision(
      idSuperviseur,
      filtres
    );
  }

  async relieServiceEtSuperviseurs(service: Service) {
    const superviseurs = await this.depotDonnees.lisSuperviseurs(
      service.siretDeOrganisation()
    );

    if (!superviseurs.length) return;

    await this.adaptateurSupervision.relieSuperviseursAService(
      service,
      superviseurs
    );
  }

  async modifieLienServiceEtSuperviseurs(service: Service) {
    await this.delieServiceEtSuperviseurs(service.id);
    await this.relieServiceEtSuperviseurs(service);
  }

  async revoqueSuperviseur(idUtilisateur: UUID) {
    await this.adaptateurSupervision.revoqueSuperviseur(idUtilisateur);
    await this.depotDonnees.revoqueSuperviseur(idUtilisateur);
  }
}

export default ServiceSupervision;
