import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurSupervision } from '../adaptateurs/adaptateurSupervision.interface.js';
import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import Entite from '../modeles/entite.js';
import Superviseur from '../modeles/superviseur.js';
import { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';

class ServiceSupervision {
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurSupervision: AdaptateurSupervision;
  private readonly adaptateurRechercheEntite: AdaptateurRechercheEntreprise;

  constructor({
    depotDonnees,
    adaptateurSupervision,
    adaptateurRechercheEntite,
  }: {
    depotDonnees: DepotDonnees;
    adaptateurSupervision: AdaptateurSupervision;
    adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
  }) {
    if (!depotDonnees || !adaptateurSupervision) {
      throw new Error(
        "Impossible d'instancier le service de supervision sans ses dépendances"
      );
    }
    this.depotDonnees = depotDonnees;
    this.adaptateurSupervision = adaptateurSupervision;
    this.adaptateurRechercheEntite = adaptateurRechercheEntite;
  }

  async delieServiceEtSuperviseurs(idService: UUID) {
    await this.adaptateurSupervision.delieServiceDesSuperviseurs(idService);
  }

  async relieServiceEtSuperviseurs(service: Service) {
    const superviseurs = await this.depotDonnees.lisSuperviseursPour(
      service.siretDeOrganisation()
    );

    if (!superviseurs.length) return;

    await this.adaptateurSupervision.relieSuperviseursAService(
      service,
      superviseurs.map((s) => s.donnees().idUtilisateur)
    );
  }

  async modifieLienServiceEtSuperviseurs(service: Service) {
    await this.delieServiceEtSuperviseurs(service.id);
    await this.relieServiceEtSuperviseurs(service);
  }

  async rattacheEntitesAuSuperviseur(sirets: string[], idSuperviseur: UUID) {
    await this.ajouteSiretsAuSuperviseur(sirets, idSuperviseur);

    const servicesParSiret =
      await this.depotDonnees.tousLesServicesAvecSirets(sirets);
    const services = [...servicesParSiret.values()].flat();

    await Promise.all(
      services.map((service: Service) =>
        this.relieServiceEtSuperviseurs(service)
      )
    );
  }

  private async ajouteSiretsAuSuperviseur(
    sirets: string[],
    idSuperviseur: UUID
  ) {
    const superviseur =
      (await this.depotDonnees.lisSuperviseur(idSuperviseur)) ??
      Superviseur.nouveau(idSuperviseur);

    const donneesEntites = await Promise.all(
      sirets.map((siret) =>
        Entite.completeDonnees({ siret }, this.adaptateurRechercheEntite)
      )
    );
    donneesEntites.forEach((donnees) =>
      superviseur.supervise(new Entite(donnees))
    );

    await this.depotDonnees.sauvegardeSuperviseur(superviseur);
  }

  async revoqueSuperviseur(idUtilisateur: UUID) {
    await this.adaptateurSupervision.revoqueSuperviseur(idUtilisateur);
    await this.depotDonnees.supprimeSuperviseur(idUtilisateur);
  }
}

export default ServiceSupervision;
