import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import { Autorisation, Role } from '../modeles/autorisations/autorisation.js';
import {
  AdaptateurUUID,
  fabriqueAdaptateurUUID,
} from '../adaptateurs/adaptateurUUID.js';
import Entite, { DonneesEntite } from '../modeles/entite.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';
import { Contributeur } from '../modeles/contributeur.js';
import { AdaptateurMail } from '../adaptateurs/adaptateurMail.interface.js';
import { UtilisateurAdministre } from '../modeles/gestionOrganisations/utilisateurAdministre.js';
import {
  EchecAutorisation,
  ErreurEntiteNonAdministre,
  ErreurServiceNonAdministre,
  ErreurSuppressionImpossible,
  ErreurUtilisateurNonAdministre,
} from '../erreurs.js';
import {
  DroitsAvecEstProprietaire,
  tousDroitsEnEcriture,
  tousDroitsEnLecture,
} from '../modeles/autorisations/gestionDroits.js';
import BusEvenements from '../bus/busEvenements.js';
import { EvenementRoleUtilisateurAdministreAttribue } from '../bus/evenementRoleUtilisateurAdministreAttribue.js';
import { EvenementAccesUtilisateurAdministreRetires } from '../bus/evenementAccesUtilisateurAdministreRetires.js';
import { ProcedureSuppressionContributeur } from '../modeles/autorisations/procedureSuppressionContributeur.js';
import { fabrique } from '../modeles/autorisations/fabriqueAutorisation.js';
import { ProcedureSuppressionContributeurAdmin } from '../modeles/autorisations/procedureSuppressionContributeurAdmin.js';
import { EvenementAdminNommeSurOrganisation } from '../bus/evenementAdminNommeSurOrganisation.js';
import { EvenementAdminRetireDeOrganisation } from '../bus/evenementAdminRetireDeOrganisation.js';
import { AdaptateurEnvironnement } from '../adaptateurs/adaptateurEnvironnement.interface.js';
import ServiceSupervision from './serviceSupervision.js';

export type DonneesEntiteSupervisee = DonneesEntite & {
  administrateurs: Array<{
    id: UUID;
    prenomNom: string;
    initiales: string;
    postes: string;
  }>;
  nombreServices: number;
  nombreUtilisateurs: number;
};

export class ServiceAdministrationOrganisations {
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
  private readonly adaptateurUUID: AdaptateurUUID;
  private readonly adaptateurMail: AdaptateurMail;
  private readonly busEvenements: BusEvenements;
  private readonly adaptateurEnvironnement: AdaptateurEnvironnement;
  private readonly serviceSupervision: ServiceSupervision;
  private readonly procedureSuppressionContributeurAdmin: ProcedureSuppressionContributeurAdmin;

  constructor({
    depotDonnees,
    adaptateurRechercheEntite,
    adaptateurUUID = fabriqueAdaptateurUUID(),
    adaptateurMail,
    busEvenements,
    adaptateurEnvironnement,
    serviceSupervision,
  }: {
    depotDonnees: DepotDonnees;
    adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
    adaptateurUUID: AdaptateurUUID;
    adaptateurMail: AdaptateurMail;
    busEvenements: BusEvenements;
    adaptateurEnvironnement: AdaptateurEnvironnement;
    serviceSupervision: ServiceSupervision;
  }) {
    this.depotDonnees = depotDonnees;
    this.adaptateurRechercheEntite = adaptateurRechercheEntite;
    this.adaptateurUUID = adaptateurUUID;
    this.adaptateurMail = adaptateurMail;
    this.busEvenements = busEvenements;
    this.adaptateurEnvironnement = adaptateurEnvironnement;
    this.serviceSupervision = serviceSupervision;
    this.procedureSuppressionContributeurAdmin =
      new ProcedureSuppressionContributeurAdmin({ depotDonnees });
  }

  async rattacheLesAdministrateursDe(service: Service) {
    const nouvellesAutorisations =
      await this.fabriqueAutorisationsAdminPourService(service);

    await this.sauvegardeAutorisations(nouvellesAutorisations);
    await this.supprimeAutorisationsAdminObsoletes(service);
  }

  async ajouteEntitesAuSuperviseur(idSuperviseur: UUID, sirets: string[]) {
    await this.serviceSupervision.rattacheEntitesAuSuperviseur(
      sirets,
      idSuperviseur
    );

    await this.rattacheLesServicesDesEntites(sirets);
  }

  async servicesSupervisesPar(idSuperviseur: UUID): Promise<Service[]> {
    return this.servicesDesEntites(
      await this.siretsSupervisesPar(idSuperviseur)
    );
  }

  private async siretsSupervisesPar(idSuperviseur: UUID): Promise<string[]> {
    const superviseur = await this.depotDonnees.lisSuperviseur(idSuperviseur);
    return superviseur?.donnees().entitesSupervisees.map((e) => e.siret) ?? [];
  }

  async revoqueSuperviseur(idSuperviseur: UUID) {
    const servicesSupervises = await this.servicesSupervisesPar(idSuperviseur);
    ServiceAdministrationOrganisations.verifieNEstPasSeulProprietaireDesServices(
      servicesSupervises,
      idSuperviseur
    );

    await this.serviceSupervision.revoqueSuperviseur(idSuperviseur);

    await this.rattacheLesSuperviseursEtLesAdministrateursDesServices(
      servicesSupervises
    );
  }

  private async servicesDesEntites(sirets: string[]): Promise<Service[]> {
    const servicesParSiret =
      await this.depotDonnees.tousLesServicesAvecSirets(sirets);
    return [...servicesParSiret.values()].flat();
  }

  private async rattacheLesServicesDesEntites(sirets: string[]) {
    const services = await this.servicesDesEntites(sirets);

    await this.rattacheLesSuperviseursEtLesAdministrateursDesServices(services);
  }

  private async rattacheLesSuperviseursEtLesAdministrateursDesServices(
    services: Service[]
  ) {
    await Promise.all(
      services.map((service) =>
        this.rattacheLesSuperviseursEtLesAdministrateursDe(service)
      )
    );
  }

  async rattacheLesSuperviseursEtLesAdministrateursDe(service: Service) {
    await this.rattacheLesSuperviseursDe(service);
    await this.rattacheLesAdministrateursDe(service);
  }

  async rattacheLesSuperviseursDe(service: Service) {
    const lesSuperviseurs = await this.depotDonnees.lisSuperviseursPour(
      service.siretDeOrganisation()
    );
    const autorisationsExistantes: Autorisation[] =
      await this.depotDonnees.autorisationsDuService(service.id);

    const nouvellesAutorisations = lesSuperviseurs.map((superviseur) => {
      const idSuperviseur = superviseur.donnees().idUtilisateur;
      const existante = autorisationsExistantes.find((a) =>
        a.designeUtilisateur(idSuperviseur)
      );

      return Autorisation.NouvelleAutorisationSuperviseur({
        id: existante ? existante.id : this.adaptateurUUID.genereUUID(),
        idService: service.id,
        idUtilisateur: idSuperviseur,
      });
    });

    await this.sauvegardeAutorisations(nouvellesAutorisations);
    await this.supprimeAutorisationsSuperviseurObsoletes(
      service,
      lesSuperviseurs.map((s) => s.donnees().idUtilisateur)
    );
  }

  private async supprimeAutorisationsAdminObsoletes(service: Service) {
    const adminsActuels = await this.depotDonnees.lisAdminsPour(
      service.siretDeOrganisation()
    );

    await this.supprimeAutorisationsObsoletes(
      service,
      (a) => a.estUnAdmin(),
      adminsActuels.map((admin) => admin.donnees().idUtilisateur)
    );
  }

  private async supprimeAutorisationsSuperviseurObsoletes(
    service: Service,
    idSuperviseursActuels: UUID[]
  ) {
    await this.supprimeAutorisationsObsoletes(
      service,
      (a) => a.estUnSuperviseur(),
      idSuperviseursActuels
    );
  }

  private async supprimeAutorisationsObsoletes(
    service: Service,
    estDuRoleConcerne: (autorisation: Autorisation) => boolean,
    idUtilisateursActuels: UUID[]
  ) {
    const autorisationsDuService: Autorisation[] =
      await this.depotDonnees.autorisationsDuService(service.id);

    const autorisationsASupprimer = autorisationsDuService
      .filter(estDuRoleConcerne)
      .filter((a) => !idUtilisateursActuels.includes(a.idUtilisateur));

    await Promise.all(
      autorisationsASupprimer.map((a) =>
        this.procedureSuppressionContributeurAdmin.execute(
          a.idUtilisateur,
          a.idService
        )
      )
    );
  }

  private async fabriqueAutorisationsAdminPourService(service: Service) {
    const siret = service.siretDeOrganisation();
    const [lesAdmins, lesSuperviseurs] = await Promise.all([
      this.depotDonnees.lisAdminsPour(siret),
      this.depotDonnees.lisSuperviseursPour(siret),
    ]);
    const idSuperviseurs = lesSuperviseurs.map(
      (s) => s.donnees().idUtilisateur
    );
    const lesAdminsNonSuperviseurs = lesAdmins.filter(
      (admin) => !idSuperviseurs.includes(admin.donnees().idUtilisateur)
    );
    const autorisationsExistantes =
      await this.depotDonnees.autorisationsDuService(service.id);

    return lesAdminsNonSuperviseurs.map((admin) => {
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

  async retireAdmin(idActeur: UUID, siret: string, idUtilisateur: UUID) {
    const admin = await this.depotDonnees.lisAdminOrganisations(idUtilisateur);
    if (!admin) return;

    await this.assignePerimetre(idActeur, idUtilisateur, [], [siret]);
  }

  private static verifieNEstPasSeulProprietaireDesServices(
    services: Service[],
    idUtilisateur: UUID
  ) {
    const seulProprietaireSurUnDesServices = services.some((s) => {
      const autresContributeurs = s.contributeurs.filter(
        (c: Contributeur) => c.idUtilisateur !== idUtilisateur
      );
      const autresProprietaires = autresContributeurs.filter(
        (c: Contributeur) => c.estProprietaire
      );
      return autresProprietaires.length === 0;
    });

    if (seulProprietaireSurUnDesServices)
      throw new ErreurSuppressionImpossible();
  }

  async nommeAdmin(idActeur: UUID, sirets: string[], idAdmin: UUID) {
    await this.assignePerimetre(idActeur, idAdmin, sirets, []);
  }

  async entitesDe(
    idUtilisateur: UUID
  ): Promise<Array<DonneesEntiteSupervisee>> {
    const admin = await this.depotDonnees.lisAdminOrganisations(idUtilisateur);
    if (admin) {
      return this.enrichisEntitesSupervisees(
        admin.donnees().entitesAdministrees
      );
    }

    const superviseur = await this.depotDonnees.lisSuperviseur(idUtilisateur);
    if (superviseur) {
      return this.enrichisEntitesSupervisees(
        superviseur.donnees().entitesSupervisees
      );
    }

    return [];
  }

  private async enrichisEntitesSupervisees(
    entites: DonneesEntite[]
  ): Promise<Array<DonneesEntiteSupervisee>> {
    const sirets = entites.map((e) => e.siret);

    const [adminsParSiret, denombrementsParSiret] = await Promise.all([
      this.depotDonnees.lisAdminsPourSirets(sirets),
      this.depotDonnees.denombreServicesEtUtilisateursParSiret(sirets),
    ]);

    const idsDesAdmins = [
      ...new Set(
        [...adminsParSiret.values()]
          .flat()
          .map((a) => a.donnees().idUtilisateur)
      ),
    ];
    const lesAdmins = await this.depotDonnees.utilisateurs(idsDesAdmins);
    const adminParId = new Map(lesAdmins.map((u) => [u.id, u]));

    return entites.map((uneEntite) => {
      const { nombreServices, nombreUtilisateurs } = denombrementsParSiret.get(
        uneEntite.siret
      )!;
      const admins = adminsParSiret.get(uneEntite.siret) ?? [];

      return {
        siret: uneEntite.siret,
        nom: uneEntite.nom,
        departement: uneEntite.departement,
        nombreServices,
        nombreUtilisateurs,
        administrateurs: admins.map((a) => {
          const u = adminParId.get(a.donnees().idUtilisateur)!;
          return {
            id: u.id,
            prenomNom: u.prenomNom(),
            initiales: u.initiales(),
            postes: u.posteDetaille(),
          };
        }),
      };
    });
  }

  async utilisateursDansLePerimetreDe(
    idUtilisateur: UUID
  ): Promise<Array<UtilisateurAdministre>> {
    const utilisateursAdministres =
      await this.depotDonnees.utilisateursAdministresPar(idUtilisateur);
    const utilisateursSupervises =
      await this.depotDonnees.utilisateursSupervisesPar(idUtilisateur);
    return [...utilisateursAdministres, ...utilisateursSupervises];
  }

  async attribueRoleAUtilisateurAdministre(
    idAdmin: UUID,
    idUtilisateurAdministre: UUID,
    role: Role,
    idsServices: UUID[]
  ) {
    await this.verifieUtilisateurEstAdministre(
      idAdmin,
      idUtilisateurAdministre
    );
    await this.verifieServicesSontAdministres(idAdmin, idsServices);

    const autorisationsExistantes = await this.autorisationsPour(
      idUtilisateurAdministre,
      idsServices
    );

    ServiceAdministrationOrganisations.verifieNeConcernePasUneAutorisationDePerimetre(
      autorisationsExistantes
    );

    await this.appliqueRole(autorisationsExistantes, role);

    const autorisationsACreer = idsServices
      .filter(
        (id) => !autorisationsExistantes.map((a) => a.idService).includes(id)
      )
      .map((idService) => {
        const { estProprietaire, ...droits } =
          ServiceAdministrationOrganisations.roleEnDroits(role);
        return fabrique({
          id: this.adaptateurUUID.genereUUID(),
          idService,
          idUtilisateur: idUtilisateurAdministre,
          estProprietaire: !!estProprietaire,
          droits,
        });
      });
    await Promise.all(
      autorisationsACreer.map(this.depotDonnees.sauvegardeAutorisation)
    );

    await this.busEvenements.publie(
      new EvenementRoleUtilisateurAdministreAttribue({
        idAdmin,
        idUtilisateurAdministre,
        role,
        idsServices,
      })
    );
  }

  private static roleEnDroits(r: Role): DroitsAvecEstProprietaire {
    return {
      ...(r === Autorisation.RESUME_NIVEAU_DROIT.LECTURE
        ? tousDroitsEnLecture()
        : tousDroitsEnEcriture()),
      estProprietaire: r === Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
    };
  }

  async retireAccesUtilisateurAdministre(
    idAdmin: UUID,
    idUtilisateurAdministre: UUID,
    idsServices: UUID[]
  ) {
    await this.verifieUtilisateurEstAdministre(
      idAdmin,
      idUtilisateurAdministre
    );

    await this.verifieServicesSontAdministres(idAdmin, idsServices);

    const autorisationsConcernees = await this.autorisationsPour(
      idUtilisateurAdministre,
      idsServices
    );

    ServiceAdministrationOrganisations.verifieNeConcernePasUneAutorisationDePerimetre(
      autorisationsConcernees
    );

    const procedureSuppressionContributeur =
      new ProcedureSuppressionContributeur({ depotDonnees: this.depotDonnees });

    await Promise.all(
      autorisationsConcernees.map((a) =>
        procedureSuppressionContributeur.execute(
          idUtilisateurAdministre,
          a.idService,
          idAdmin
        )
      )
    );

    await this.busEvenements.publie(
      new EvenementAccesUtilisateurAdministreRetires({
        idAdmin,
        idUtilisateurAdministre,
        idsServices,
      })
    );
  }

  private async autorisationsPour(
    idUtilisateurAdministre: UUID,
    idsServices: UUID[]
  ) {
    const autorisationsDeUtilisateurAdministre: Autorisation[] =
      await this.depotDonnees.autorisations(idUtilisateurAdministre);
    return autorisationsDeUtilisateurAdministre.filter((a) =>
      idsServices.includes(a.idService)
    );
  }

  private async appliqueRole(
    autorisationsConcernees: Autorisation[],
    role: Role
  ) {
    autorisationsConcernees.forEach((a) =>
      a.appliqueDroits(ServiceAdministrationOrganisations.roleEnDroits(role))
    );
    await Promise.all(
      autorisationsConcernees.map(this.depotDonnees.sauvegardeAutorisation)
    );
  }

  private static verifieNeConcernePasUneAutorisationDePerimetre(
    autorisationsConcernees: Autorisation[]
  ) {
    if (autorisationsConcernees.some((a) => a.decouleDUnPerimetre())) {
      throw new EchecAutorisation();
    }
  }

  private async verifieServicesSontAdministres(
    idAdmin: UUID,
    idsServices: UUID[]
  ) {
    const autorisationsDeLadmin: Autorisation[] =
      await this.depotDonnees.autorisations(idAdmin);
    const idServicesAdministres = autorisationsDeLadmin
      .filter((a) => a.estAdmin)
      .map((a) => a.idService);

    if (!new Set(idsServices).isSubsetOf(new Set(idServicesAdministres))) {
      throw new ErreurServiceNonAdministre();
    }
  }

  private async verifieEntitesAdministrees(idActeur: UUID, sirets: string[]) {
    if (
      this.adaptateurEnvironnement.consoleAdmin().idConsoleAdmin() === idActeur
    )
      return;

    const acteurAdmin = await this.depotDonnees.lisAdminOrganisations(idActeur);
    const acteurSuperviseur = await this.depotDonnees.lisSuperviseur(idActeur);

    if (
      (!acteurAdmin && !acteurSuperviseur) ||
      !(
        (acteurAdmin && acteurAdmin.estAdminDuPerimetre(sirets)) ||
        (acteurSuperviseur &&
          acteurSuperviseur.estSuperviseurDuPerimetre(sirets))
      )
    ) {
      throw new ErreurEntiteNonAdministre();
    }
  }

  private async verifieUtilisateurEstAdministre(
    idAdmin: UUID,
    idUtilisateurAdministre: UUID
  ) {
    const utilisateursAdministres =
      await this.utilisateursDansLePerimetreDe(idAdmin);
    if (
      !utilisateursAdministres.find((u) => u.id === idUtilisateurAdministre)
    ) {
      throw new ErreurUtilisateurNonAdministre();
    }
  }

  private async completeEntite(siret: string) {
    const donneesEntite = await Entite.completeDonnees(
      { siret },
      this.adaptateurRechercheEntite
    );

    return new Entite(donneesEntite);
  }

  async assignePerimetre(
    idActeur: UUID,
    idAdmin: UUID,
    siretsAAjouter: string[],
    siretsARetirer: string[]
  ) {
    if (idActeur === idAdmin) throw new EchecAutorisation();

    let admin = await this.depotDonnees.lisAdminOrganisations(idAdmin);
    if (!admin) {
      admin = AdminOrganisations.nouveau(idAdmin);
    }

    const siretsModifies = [...siretsARetirer, ...siretsAAjouter];
    await this.verifieEntitesAdministrees(idActeur, siretsModifies);

    const tableauDeTableauDeServicesARetirer = await Promise.all(
      siretsARetirer.map(this.depotDonnees.tousLesServicesAvecSiret)
    );
    const servicesARetirer = tableauDeTableauDeServicesARetirer.flatMap(
      (v) => v
    );
    ServiceAdministrationOrganisations.verifieNEstPasSeulProprietaireDesServices(
      servicesARetirer,
      idAdmin
    );

    const entitesAAjouter = await Promise.all(
      siretsAAjouter.map((siret) => this.completeEntite(siret))
    );
    const entitesARetirer = await Promise.all(
      siretsARetirer.map((siret) => this.completeEntite(siret))
    );
    entitesAAjouter.forEach((e) => {
      admin?.administre(e);
    });
    entitesARetirer.forEach((e) => {
      admin?.cesseDAdministrer(e);
    });
    await this.depotDonnees.sauvegardeAdminOrganisations(admin);

    const tableauDeTableauDeServicesARafraichir = await Promise.all(
      siretsModifies.map(this.depotDonnees.tousLesServicesAvecSiret)
    );
    const servicesARafraichir = tableauDeTableauDeServicesARafraichir.flatMap(
      (v) => v
    );
    await Promise.all(
      servicesARafraichir.map((service) =>
        this.rattacheLesAdministrateursDe(service)
      )
    );

    await Promise.all(
      siretsARetirer.map((siret) =>
        this.busEvenements.publie(
          new EvenementAdminRetireDeOrganisation({
            idActeur,
            idCible: idAdmin,
            siret,
          })
        )
      )
    );

    await Promise.all(
      siretsAAjouter.map((siret) =>
        this.busEvenements.publie(
          new EvenementAdminNommeSurOrganisation({
            idActeur,
            idCible: idAdmin,
            siret,
          })
        )
      )
    );

    if (siretsAAjouter.length > 0) {
      const nouvelAdmin = await this.depotDonnees.utilisateur(idAdmin);
      await this.adaptateurMail.envoieMessageNominationAdmin(
        nouvelAdmin!.email
      );
    }
  }

  async servicesDe(idUtilisateur: UUID): Promise<Array<Service>> {
    if (await this.depotDonnees.estAdmin(idUtilisateur)) {
      return this.depotDonnees.services(idUtilisateur);
    }
    const superviseur = await this.depotDonnees.lisSuperviseur(idUtilisateur);
    if (!superviseur) return [];

    const siretsSupervises = superviseur
      ?.donnees()
      .entitesSupervisees.map((e) => e.siret);

    const servicesParSiret =
      await this.depotDonnees.tousLesServicesAvecSirets(siretsSupervises);

    return [...servicesParSiret.values()].flat();
  }
}
