import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurSupervision } from '../adaptateurs/adaptateurSupervision.interface.js';
import { UUID } from '../typesBasiques.js';
import { FiltresSupervision } from '../adaptateurs/adaptateurSupervisionMetabase.js';
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

  genereURLSupervision(idSuperviseur: UUID, filtres: FiltresSupervision) {
    return this.adaptateurSupervision.genereURLSupervision(
      idSuperviseur,
      filtres
    );
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

  async rattacheEntiteAuSuperviseur(siret: string, idSuperviseur: UUID) {
    await this.ajouteSiretAuSuperviseur(siret, idSuperviseur);

    const services = await this.depotDonnees.tousLesServicesAvecSiret(siret);

    await Promise.all(
      services.map((service: Service) =>
        this.relieServiceEtSuperviseurs(service)
      )
    );
  }

  private async ajouteSiretAuSuperviseur(siret: string, idSuperviseur: UUID) {
    let superviseur = await this.depotDonnees.lisSuperviseur(idSuperviseur);
    if (!superviseur) {
      superviseur = Superviseur.nouveau(idSuperviseur);
    }

    const donneesEntite = await Entite.completeDonnees(
      { siret },
      this.adaptateurRechercheEntite
    );

    superviseur.supervise(new Entite(donneesEntite));

    await this.depotDonnees.sauvegardeSuperviseur(superviseur);
  }

  async revoqueSuperviseur(idUtilisateur: UUID) {
    await this.adaptateurSupervision.revoqueSuperviseur(idUtilisateur);
    await this.depotDonnees.revoqueSuperviseur(idUtilisateur);
  }
}

export default ServiceSupervision;
