import { UUID } from '../typesBasiques.js';
import Service from '../modeles/service.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
import {
  AdaptateurUUID,
  fabriqueAdaptateurUUID,
} from '../adaptateurs/adaptateurUUID.js';
import Entite, { DonneesEntite } from '../modeles/entite.js';
import Utilisateur from '../modeles/utilisateur.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdminOrganisations } from '../modeles/gestionOrganisations/adminOrganisations.js';
import { AdaptateurRechercheEntreprise } from '../adaptateurs/adaptateurRechercheEntreprise.interface.js';

export type DonneesEntiteSupervisee = DonneesEntite & {
  administrateurs: Array<{ prenomNom: string }>;
};

export class ServiceAdministrationOrganisations {
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
  private readonly adaptateurUUID: AdaptateurUUID;

  constructor({
    depotDonnees,
    adaptateurRechercheEntite,
    adaptateurUUID = fabriqueAdaptateurUUID(),
  }: {
    depotDonnees: DepotDonnees;
    adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
    adaptateurUUID: AdaptateurUUID;
  }) {
    this.depotDonnees = depotDonnees;
    this.adaptateurRechercheEntite = adaptateurRechercheEntite;
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

  async rattacheEntiteA(siret: string, idAdmin: UUID) {
    await this.ajouteSiretAAdmin(siret, idAdmin);

    const services = await this.depotDonnees.tousLesServicesAvecSiret(siret);

    const nouvellesAutorisations = this.fabriqueAutorisationsAdminPourServices(
      services,
      idAdmin
    );

    await this.sauvegardeAutorisations(
      await Promise.all(nouvellesAutorisations)
    );
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
  ): Promise<Array<DonneesEntite | DonneesEntiteSupervisee>> {
    const admin = await this.depotDonnees.lisAdminOrganisations(idUtilisateur);
    if (admin) return admin.donnees().entitesAdministrees;

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
    const administrateurs = await Promise.all(
      admins.map((a) =>
        this.depotDonnees.utilisateur(a.donnees().idUtilisateur)
      )
    );

    return {
      siret: uneEntite.siret,
      nom: uneEntite.nom,
      administrateurs: administrateurs.map((u) => ({
        prenomNom: u!.prenomNom(),
      })),
    };
  }

  async utilisateursDansLePerimetreDe(
    idUtilisateur: UUID
  ): Promise<Array<Utilisateur>> {
    const sousUnAdmin =
      await this.depotDonnees.utilisateursAdministresPar(idUtilisateur);
    if (sousUnAdmin.length > 0) return sousUnAdmin;

    return this.depotDonnees.utilisateursSupervisesPar(idUtilisateur);
  }
}
