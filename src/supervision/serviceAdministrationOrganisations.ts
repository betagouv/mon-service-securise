import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
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

export type DonneesEntiteSupervisee = DonneesEntite & {
  administrateurs: Array<{ id: UUID; prenomNom: string }>;
  nombreServices: number;
  nombreUtilisateurs: number;
};

export class ServiceAdministrationOrganisations {
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
  private readonly adaptateurUUID: AdaptateurUUID;
  private readonly adaptateurMail: AdaptateurMail;

  constructor({
    depotDonnees,
    adaptateurRechercheEntite,
    adaptateurUUID = fabriqueAdaptateurUUID(),
    adaptateurMail,
  }: {
    depotDonnees: DepotDonnees;
    adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
    adaptateurUUID: AdaptateurUUID;
    adaptateurMail: AdaptateurMail;
  }) {
    this.depotDonnees = depotDonnees;
    this.adaptateurRechercheEntite = adaptateurRechercheEntite;
    this.adaptateurUUID = adaptateurUUID;
    this.adaptateurMail = adaptateurMail;
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

  async retireAdmin(siret: string, idUtilisateur: UUID) {
    const admin = await this.depotDonnees.lisAdminOrganisations(idUtilisateur);

    if (!admin) return;

    admin?.cesseDAdministrer(new Entite({ siret }));
    await this.depotDonnees.sauvegardeAdminOrganisations(admin!);

    const services = await this.depotDonnees.tousLesServicesAvecSiret(siret);
    await Promise.all(
      services.map((service) => this.rattacheLesAdministrateursDe(service))
    );
  }

  async nommeAdmin(siret: string, idAdmin: UUID, emailAdmin: string) {
    await this.ajouteSiretAAdmin(siret, idAdmin);

    const services = await this.depotDonnees.tousLesServicesAvecSiret(siret);
    const nouvellesAutorisations = this.fabriqueAutorisationsAdminPourServices(
      services,
      idAdmin
    );
    await this.sauvegardeAutorisations(
      await Promise.all(nouvellesAutorisations)
    );
    await this.adaptateurMail.envoieMessageNominationAdmin(emailAdmin);
  }

  private async ajouteSiretAAdmin(siret: string, idAdmin: UUID) {
    let admin = await this.depotDonnees.lisAdminOrganisations(idAdmin);
    if (!admin) {
      admin = AdminOrganisations.nouveau(idAdmin);
    }

    const donneesEntite = await Entite.completeDonnees(
      { siret },
      this.adaptateurRechercheEntite
    );

    admin.administre(new Entite(donneesEntite));

    await this.depotDonnees.sauvegardeAdminOrganisations(admin);
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
    return this.depotDonnees.utilisateursAdministresPar(idUtilisateur);
  }
}
