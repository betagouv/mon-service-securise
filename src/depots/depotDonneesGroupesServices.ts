import { UUID } from '../typesBasiques.js';
import { PersistanceTS } from '../adaptateurs/persistanceTS.interface.js';
import { GroupeServices } from '../modeles/groupeServices.js';
import {
  ErreurGroupeServicesDejaExistant,
  ErreurGroupeServicesInexistant,
  ErreurServiceInexistant,
} from '../erreurs.js';
import { DepotDonneesAutorisation } from './depotDonneesAutorisations.interface.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';

export class DepotDonneesGroupesServices {
  private readonly persistance: PersistanceTS;
  private readonly depotAutorisations: DepotDonneesAutorisation;

  constructor({
    persistance,
    depotAutorisations,
  }: {
    persistance: PersistanceTS;
    depotAutorisations: DepotDonneesAutorisation;
  }) {
    this.persistance = persistance;
    this.depotAutorisations = depotAutorisations;
  }

  async nouveauGroupe(idUtilisateur: UUID, libelle: string) {
    const groupe = GroupeServices.nouveau(idUtilisateur, libelle);

    await this.verifieLibelleDisponible(groupe);
    await this.persistance.sauvegardeGroupeServices(groupe.donnees());

    return groupe;
  }

  async lisGroupesDe(idUtilisateur: UUID) {
    const donnees = await this.persistance.lisGroupesServicesDe(idUtilisateur);
    return donnees.map((d) => GroupeServices.hydrate(d));
  }

  async renommeGroupe(idGroupe: UUID, idUtilisateur: UUID, libelle: string) {
    const groupe = await this.lisGroupeDe(idUtilisateur, idGroupe);
    groupe.renomme(libelle);

    await this.verifieLibelleDisponible(groupe);
    await this.persistance.sauvegardeGroupeServices(groupe.donnees());
  }

  async supprimeGroupe(idGroupe: UUID, idUtilisateur: UUID) {
    await this.lisGroupeDe(idUtilisateur, idGroupe);

    await this.persistance.supprimeGroupeServices(idGroupe);
  }

  private async lisGroupeDe(idUtilisateur: UUID, idGroupe: UUID) {
    const groupes = await this.lisGroupesDe(idUtilisateur);
    const groupe = groupes.find((c) => c.donnees().id === idGroupe);
    if (!groupe) throw new ErreurGroupeServicesInexistant();

    return groupe;
  }

  private async verifieLibelleDisponible(groupe: GroupeServices) {
    const { id, idUtilisateur, libelle } = groupe.donnees();
    const groupes = await this.lisGroupesDe(idUtilisateur);
    const libelleDejaUtilise = groupes.some(
      (autre) =>
        autre.donnees().id !== id && autre.donnees().libelle === libelle
    );
    if (libelleDejaUtilise) throw new ErreurGroupeServicesDejaExistant();
  }

  async associeServicesAuxGroupes(
    idUtilisateur: UUID,
    idsGroupes: UUID[],
    idsServices: UUID[]
  ) {
    const idServicesAutorises = (
      await this.depotAutorisations.autorisations(idUtilisateur)
    ).map((a: Autorisation) => a.idService);

    if (idsServices.some((id) => !idServicesAutorises.includes(id)))
      throw new ErreurServiceInexistant();

    const tousGroupes = await this.lisGroupesDe(idUtilisateur);
    const idGroupesExistants = tousGroupes.map((g) => g.donnees().id);

    if (idsGroupes.some((id) => !idGroupesExistants.includes(id)))
      throw new ErreurGroupeServicesInexistant();

    await Promise.all(
      idsGroupes.map((idGroupe) =>
        this.persistance.associeServicesAuGroupe(idGroupe, idsServices)
      )
    );
  }

  async supprimeAssociationServicesAuGroupe(
    idUtilisateur: UUID,
    idGroupe: UUID,
    idsServices: UUID[]
  ) {
    const idServicesAutorises = (
      await this.depotAutorisations.autorisations(idUtilisateur)
    ).map((a: Autorisation) => a.idService);

    if (idsServices.some((id) => !idServicesAutorises.includes(id)))
      throw new ErreurServiceInexistant();

    await this.lisGroupeDe(idUtilisateur, idGroupe);

    return this.persistance.supprimeAssociationServicesAuGroupe(
      idGroupe,
      idsServices
    );
  }
}
