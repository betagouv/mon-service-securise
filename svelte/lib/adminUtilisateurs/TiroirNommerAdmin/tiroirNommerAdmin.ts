import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';

export const siretsOuIlEstAdmin = (
  idUtilisateur: string,
  entites: EntiteSupervisee[]
): string[] => {
  return entites
    .filter((e) => e.administrateurs.find((a) => a.id === idUtilisateur))
    .map((e) => e.siret);
};

type Stats = { nombreServices: number; nombreUtilisateurs: number };

export const statsDesEntites = (
  entites: EntiteSupervisee[],
  siretsCibles: string[]
): Stats => {
  const cibles = entites.filter((e) => siretsCibles.includes(e.siret));

  return {
    nombreServices: cibles.reduce((total, e) => total + e.nombreServices, 0),
    nombreUtilisateurs: cibles.reduce(
      (total, e) => total + e.nombreUtilisateurs,
      0
    ),
  };
};
