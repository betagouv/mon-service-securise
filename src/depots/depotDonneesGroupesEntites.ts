import { UUID } from '../typesBasiques.js';
import { PersistanceTS } from '../adaptateurs/persistanceTS.interface.js';
import { GroupeEntites } from '../modeles/groupeEntites.js';
import { DepotDonneesAdminsOrganisations } from './depotDonneesAdminsOrganisations.js';
import { DepotDonneesSuperviseurs } from './depotDonneesSuperviseurs.js';
import {
  ErreurEntiteNonAdministre,
  ErreurGroupeEntitesDejaExistant,
  ErreurGroupeEntitesInexistant,
} from '../erreurs.js';

export class DepotDonneesGroupesEntites {
  private readonly persistance: PersistanceTS;
  private readonly depotAdminsOrganisations: DepotDonneesAdminsOrganisations;
  private readonly depotSuperviseurs: DepotDonneesSuperviseurs;

  constructor({
    persistance,
    depotAdminsOrganisations,
    depotSuperviseurs,
  }: {
    persistance: PersistanceTS;
    depotAdminsOrganisations: DepotDonneesAdminsOrganisations;
    depotSuperviseurs: DepotDonneesSuperviseurs;
  }) {
    this.persistance = persistance;
    this.depotAdminsOrganisations = depotAdminsOrganisations;
    this.depotSuperviseurs = depotSuperviseurs;
  }

  async nouveauGroupeEntites(idUtilisateur: UUID, libelle: string) {
    const groupe = GroupeEntites.nouveau(idUtilisateur, libelle);

    await this.verifieLibelleDisponible(groupe);
    await this.persistance.sauvegardeGroupeEntites(groupe.donnees());

    return groupe;
  }

  async lisGroupesEntitesDe(idUtilisateur: UUID) {
    const donnees = await this.persistance.lisGroupesEntitesDe(
      idUtilisateur,
      await this.siretsDuPerimetreDe(idUtilisateur)
    );
    return donnees.map((d) => GroupeEntites.hydrate(d));
  }

  async renommeGroupeEntites(
    idGroupe: UUID,
    idUtilisateur: UUID,
    libelle: string
  ) {
    const groupe = await this.lisGroupeEntitesDe(idUtilisateur, idGroupe);
    groupe.renomme(libelle);

    await this.verifieLibelleDisponible(groupe);
    await this.persistance.sauvegardeGroupeEntites(groupe.donnees());
  }

  async supprimeGroupeEntites(idGroupe: UUID, idUtilisateur: UUID) {
    await this.lisGroupeEntitesDe(idUtilisateur, idGroupe);

    await this.persistance.supprimeGroupeEntites(idGroupe);
  }

  async associeEntitesAuxGroupes(
    idUtilisateur: UUID,
    idsGroupes: UUID[],
    sirets: string[]
  ) {
    await this.verifieEntitesDansLePerimetre(idUtilisateur, sirets);
    await this.verifieGroupesAppartiennentA(idUtilisateur, idsGroupes);

    await Promise.all(
      idsGroupes.map((idGroupe) =>
        this.persistance.associeEntitesAuGroupe(idGroupe, sirets)
      )
    );
  }

  async supprimeAssociationEntitesAuGroupe(
    idUtilisateur: UUID,
    idGroupe: UUID,
    sirets: string[]
  ) {
    await this.verifieEntitesDansLePerimetre(idUtilisateur, sirets);
    await this.lisGroupeEntitesDe(idUtilisateur, idGroupe);

    await this.persistance.supprimeAssociationEntitesAuGroupe(idGroupe, sirets);
  }

  private async verifieEntitesDansLePerimetre(
    idUtilisateur: UUID,
    sirets: string[]
  ) {
    const siretsDuPerimetre = await this.siretsDuPerimetreDe(idUtilisateur);
    if (!new Set(sirets).isSubsetOf(new Set(siretsDuPerimetre)))
      throw new ErreurEntiteNonAdministre();
  }

  private async verifieGroupesAppartiennentA(
    idUtilisateur: UUID,
    idsGroupes: UUID[]
  ) {
    const sesGroupes = await this.lisGroupesEntitesDe(idUtilisateur);
    const idsDeSesGroupes = sesGroupes.map((g) => g.donnees().id);
    if (!new Set(idsGroupes).isSubsetOf(new Set(idsDeSesGroupes)))
      throw new ErreurGroupeEntitesInexistant();
  }

  private async lisGroupeEntitesDe(idUtilisateur: UUID, idGroupe: UUID) {
    const groupes = await this.lisGroupesEntitesDe(idUtilisateur);
    const groupe = groupes.find((g) => g.donnees().id === idGroupe);
    if (!groupe) throw new ErreurGroupeEntitesInexistant();

    return groupe;
  }

  private async siretsDuPerimetreDe(idUtilisateur: UUID) {
    const admin =
      await this.depotAdminsOrganisations.lisAdminOrganisations(idUtilisateur);
    if (admin) return admin.donnees().entitesAdministrees.map((e) => e.siret);

    const superviseur =
      await this.depotSuperviseurs.lisSuperviseur(idUtilisateur);
    if (superviseur)
      return superviseur.donnees().entitesSupervisees.map((e) => e.siret);

    return [];
  }

  private async verifieLibelleDisponible(groupe: GroupeEntites) {
    const { id, idUtilisateur, libelle } = groupe.donnees();
    const groupes = await this.lisGroupesEntitesDe(idUtilisateur);
    const libelleDejaUtilise = groupes.some(
      (autre) =>
        autre.donnees().id !== id && autre.donnees().libelle === libelle
    );
    if (libelleDejaUtilise) throw new ErreurGroupeEntitesDejaExistant();
  }
}
