import { UUID } from '../typesBasiques.js';
import { PersistanceTS } from '../adaptateurs/persistanceTS.interface.js';
import { GroupeServices } from '../modeles/groupeServices.js';
import {
  ErreurGroupeServicesDejaExistant,
  ErreurGroupeServicesInexistant,
} from '../erreurs.js';

export class DepotDonneesGroupesServices {
  private readonly persistance: PersistanceTS;

  constructor({ persistance }: { persistance: PersistanceTS }) {
    this.persistance = persistance;
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

  async metsAJourAssociationsAuxServices(
    idUtilisateur: UUID,
    idGroupesAssocies: UUID[],
    idsServices: UUID[]
  ) {
    const tousGroupes = await this.lisGroupesDe(idUtilisateur);

    await Promise.all(
      tousGroupes
        .filter((g) => !idGroupesAssocies.includes(g.donnees().id))
        .map((g) => this.supprimeAssociationServicesAuGroupe(g, idsServices))
    );

    await Promise.all(
      tousGroupes
        .filter((g) => idGroupesAssocies.includes(g.donnees().id))
        .map((g) => this.associeServicesAuGroupe(g, idsServices))
    );
  }

  private async associeServicesAuGroupe(
    groupe: GroupeServices,
    idsServices: UUID[]
  ) {
    return this.persistance.associeServicesAuGroupe(
      groupe.donnees().id,
      idsServices
    );
  }

  private async supprimeAssociationServicesAuGroupe(
    groupe: GroupeServices,
    idsServices: UUID[]
  ) {
    return this.persistance.supprimeAssociationServicesAuGroupe(
      groupe.donnees().id,
      idsServices
    );
  }
}
