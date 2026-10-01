import { UUID } from '../typesBasiques.js';
import { ErreurLibelleGroupeServicesInvalide } from '../erreurs.js';

export type DonneesGroupeServices = {
  id: UUID;
  idUtilisateur: UUID;
  libelle: string;
};

const libelleValide = (libelle: string) => {
  const libelleSansEspacesSuperflus = libelle.trim();
  if (!libelleSansEspacesSuperflus) {
    throw new ErreurLibelleGroupeServicesInvalide();
  }
  return libelleSansEspacesSuperflus;
};

export class GroupeServices {
  private constructor(private readonly donneesGroupe: DonneesGroupeServices) {}

  static nouveau(idUtilisateur: UUID, libelle: string) {
    return new GroupeServices({
      id: crypto.randomUUID(),
      idUtilisateur,
      libelle: libelleValide(libelle),
    });
  }

  static hydrate(donnees: DonneesGroupeServices) {
    return new GroupeServices(donnees);
  }

  renomme(libelle: string) {
    this.donneesGroupe.libelle = libelleValide(libelle);
  }

  donnees(): DonneesGroupeServices {
    return this.donneesGroupe;
  }

  toJSON() {
    const { id, libelle } = this.donneesGroupe;
    return { id, libelle };
  }
}
