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
  private readonly procedureSuppressionContributeurAdmin: ProcedureSuppressionContributeurAdmin;

  constructor({
    depotDonnees,
    adaptateurRechercheEntite,
    adaptateurUUID = fabriqueAdaptateurUUID(),
    adaptateurMail,
    busEvenements,
  }: {
    depotDonnees: DepotDonnees;
    adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
    adaptateurUUID: AdaptateurUUID;
    adaptateurMail: AdaptateurMail;
    busEvenements: BusEvenements;
  }) {
    this.depotDonnees = depotDonnees;
    this.adaptateurRechercheEntite = adaptateurRechercheEntite;
    this.adaptateurUUID = adaptateurUUID;
    this.adaptateurMail = adaptateurMail;
    this.busEvenements = busEvenements;
    this.procedureSuppressionContributeurAdmin =
      new ProcedureSuppressionContributeurAdmin({ depotDonnees });
  }

  async rattacheLesAdministrateursDe(service: Service) {
    const nouvellesAutorisations =
      await this.fabriqueAutorisationsAdminPourService(service);

    await this.sauvegardeAutorisations(nouvellesAutorisations);
    await this.supprimeAutorisationsAdminObsoletes(service);
  }

  private async supprimeAutorisationsAdminObsoletes(service: Service) {
    const adminsActuels = await this.depotDonnees.lisAdminsPour(
      service.siretDeOrganisation()
    );
    const idAdminsActuels = adminsActuels.map(
      (admin) => admin.donnees().idUtilisateur
    );

    const autorisationsDuService: Autorisation[] =
      await this.depotDonnees.autorisationsDuService(service.id);

    const autorisationsASupprimer = autorisationsDuService
      .filter((a) => a.estAdmin)
      .filter((a) => !idAdminsActuels.includes(a.idUtilisateur));

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

  async retireAdmin(idActeur: UUID, siret: string, idUtilisateur: UUID) {
    const admin = await this.depotDonnees.lisAdminOrganisations(idUtilisateur);
    if (!admin) return;

    await this.assignePerimetre(
      idActeur,
      idUtilisateur,
      admin
        .donnees()
        .entitesAdministrees.map((e) => e.siret)
        .filter((s) => s !== siret)
    );
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

  async nommeAdmin(idActeur: UUID, siret: string, idAdmin: UUID) {
    let admin = await this.depotDonnees.lisAdminOrganisations(idAdmin);
    if (!admin) admin = AdminOrganisations.nouveau(idAdmin);

    await this.assignePerimetre(idActeur, idAdmin, [
      ...admin.donnees().entitesAdministrees.map((e) => e.siret),
      siret,
    ]);
  }

  async entitesDe(
    idUtilisateur: UUID
  ): Promise<Array<DonneesEntiteSupervisee>> {
    const admin = await this.depotDonnees.lisAdminOrganisations(idUtilisateur);
    if (admin) {
      const toutesEntites = admin.donnees().entitesAdministrees;
      return Promise.all(
        toutesEntites.map((e) => this.enrichisEntiteSupervisee(e))
      );
    }

    const superviseur = await this.depotDonnees.lisSuperviseur(idUtilisateur);
    if (superviseur) {
      const toutesEntites = superviseur.donnees().entitesSupervisees;
      return Promise.all(
        toutesEntites.map((e) => this.enrichisEntiteSupervisee(e))
      );
    }

    return [];
  }

  private async enrichisEntiteSupervisee(
    uneEntite: DonneesEntite
  ): Promise<DonneesEntiteSupervisee> {
    const admins = await this.depotDonnees.lisAdminsPour(uneEntite.siret);
    const enUtilisateurs = await Promise.all(
      admins.map((a) =>
        this.depotDonnees.utilisateur(a.donnees().idUtilisateur)
      )
    );
    const services = await this.depotDonnees.tousLesServicesAvecSiret(
      uneEntite.siret
    );

    return {
      siret: uneEntite.siret,
      nom: uneEntite.nom,
      nombreServices: services.length,
      nombreUtilisateurs: new Set(
        services.flatMap((s) =>
          s.contributeurs.map((c: Contributeur) => c.idUtilisateur)
        )
      ).size,
      administrateurs: enUtilisateurs.map((u) => ({
        id: u!.id,
        prenomNom: u!.prenomNom(),
        initiales: u!.initiales(),
        postes: u!.posteDetaille(),
      })),
    };
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

    ServiceAdministrationOrganisations.verifieNeConcernePasAutorisationAdmin(
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

    ServiceAdministrationOrganisations.verifieNeConcernePasAutorisationAdmin(
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

  private static verifieNeConcernePasAutorisationAdmin(
    autorisationsConcernees: Autorisation[]
  ) {
    if (autorisationsConcernees.some((a) => a.estAdmin)) {
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

  async assignePerimetre(idActeur: UUID, idAdmin: UUID, sirets: string[]) {
    if (idActeur === idAdmin) throw new EchecAutorisation();

    let admin = await this.depotDonnees.lisAdminOrganisations(idAdmin);
    if (!admin) {
      admin = AdminOrganisations.nouveau(idAdmin);
    }

    const siretsAAjouter = sirets.filter(
      (siret) => !admin || !admin.estAdminDe(siret)
    );
    const siretsARetirer = admin!
      .donnees()
      .entitesAdministrees.filter((e) => !sirets.includes(e.siret))
      .map((e) => e.siret);

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
}
