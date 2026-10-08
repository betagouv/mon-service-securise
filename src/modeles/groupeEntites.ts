import { UUID } from '../typesBasiques.js';
import { ErreurLibelleGroupeEntitesInvalide } from '../erreurs.js';

export type DonneesGroupeEntites = {
  id: UUID;
  idUtilisateur: UUID;
  libelle: string;
  siretsAssocies: string[];
};

const libelleValide = (libelle: string) => {
  const libelleSansEspacesSuperflus = libelle.trim();
  if (!libelleSansEspacesSuperflus) {
    throw new ErreurLibelleGroupeEntitesInvalide();
  }
  return libelleSansEspacesSuperflus;
};

export class GroupeEntites {
  private constructor(private readonly donneesGroupe: DonneesGroupeEntites) {}

  static nouveau(idUtilisateur: UUID, libelle: string) {
    return new GroupeEntites({
      id: crypto.randomUUID(),
      idUtilisateur,
      libelle: libelleValide(libelle),
      siretsAssocies: [],
    });
  }

  static hydrate(donnees: DonneesGroupeEntites) {
    return new GroupeEntites(donnees);
  }

  renomme(libelle: string) {
    this.donneesGroupe.libelle = libelleValide(libelle);
  }

  donnees(): DonneesGroupeEntites {
    return this.donneesGroupe;
  }

  toJSON() {
    const { id, libelle, siretsAssocies } = this.donneesGroupe;
    return { id, libelle, siretsAssocies };
  }
}
