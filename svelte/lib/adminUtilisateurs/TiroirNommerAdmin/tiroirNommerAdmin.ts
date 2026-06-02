import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';

export const siretsOuIlEstAdmin = (
  idUtilisateur: string,
  entites: EntiteSupervisee[]
) => {
  return entites
    .filter((e) => e.administrateurs.find((a) => a.id === idUtilisateur))
    .map((e) => e.siret);
};
