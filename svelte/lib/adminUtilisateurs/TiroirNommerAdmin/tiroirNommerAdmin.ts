import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
import { singulierPluriel } from '../../outils/string';
import type { UtilisateurAdministre } from '../adminUtilisateurs.types';

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

export const resumeDesModifications = (
  siretsDepart: string[],
  siretsArrivee: string[]
) => {
  const depart = new Set(siretsDepart);
  const arrivee = new Set(siretsArrivee);

  const nouvelles = [...arrivee.values().filter((s) => !depart.has(s))];
  const retirees = [...depart.values().filter((s) => !arrivee.has(s))];
  const conservees = [...depart.values().filter((s) => arrivee.has(s))];

  return { nouvelles, retirees, conservees };
};

export const messageRecapitulatif = (
  recapitulatif: ReturnType<typeof resumeDesModifications>,
  utilisateur: UtilisateurAdministre
) => {
  let message = 'Vous êtes sur le point ';
  if (recapitulatif.nouvelles.length > 0) {
    message += `d'attribuer le rôle administrateur à ${utilisateur.prenomNom} sur ${
      recapitulatif.nouvelles.length
    } ${singulierPluriel('entité', 'entités', recapitulatif.nouvelles.length)}`;
    if (recapitulatif.retirees.length > 0) {
      message += ` et de retirer son droit d'admin sur ${
        recapitulatif.retirees.length
      } ${singulierPluriel(
        'entité',
        'entités',
        recapitulatif.retirees.length
      )}`;
    }
  } else {
    message += `de retirer le rôle administrateur à ${utilisateur.prenomNom} sur ${
      recapitulatif.retirees.length
    } ${singulierPluriel('entité', 'entités', recapitulatif.retirees.length)}`;
  }

  return message;
};

export const messageSucces = (
  recapitulatif: ReturnType<typeof resumeDesModifications>,
  utilisateur: UtilisateurAdministre
) => {
  let message = `${utilisateur.prenomNom} a été `;
  if (recapitulatif.nouvelles.length > 0) {
    message += `ajouté sur ${recapitulatif.nouvelles.length} ${singulierPluriel('entité', 'entités', recapitulatif.nouvelles.length)}`;
  }
  if (recapitulatif.nouvelles.length > 0 && recapitulatif.retirees.length > 0) {
    message += ' et ';
  }
  if (recapitulatif.retirees.length > 0) {
    message += `supprimé sur ${recapitulatif.retirees.length} ${singulierPluriel('entité', 'entités', recapitulatif.retirees.length)}`;
  }
  return message;
};
