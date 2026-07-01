import { writable } from 'svelte/store';
import type {
  IdUtilisateur,
  MesureGenerale,
  MesureSpecifique,
} from '../tableauDesMesures.d';

export const rechercheTextuelle = writable<string>('');

const contientEnMinuscule = (champ: string | undefined, recherche: string) =>
  champ ? champ.toLowerCase().includes(recherche.toLowerCase()) : false;

export const responsablesCorrespondent = (
  mesure: MesureSpecifique | MesureGenerale,
  valeur: string,
  tousLesContributeurs: Record<IdUtilisateur, string> = {}
) =>
  (mesure.responsables ?? []).some((id) =>
    contientEnMinuscule(tousLesContributeurs[id], valeur)
  );

export const appliqueFiltreTextuel = (
  mesure: MesureSpecifique | MesureGenerale,
  valeur: string,
  nomsDesResponsables: Record<IdUtilisateur, string> = {}
) =>
  contientEnMinuscule(mesure.description, valeur) ||
  contientEnMinuscule((mesure as MesureGenerale).descriptionLongue, valeur) ||
  contientEnMinuscule(mesure.identifiantNumerique, valeur) ||
  contientEnMinuscule(mesure.modalites, valeur) ||
  responsablesCorrespondent(mesure, valeur, nomsDesResponsables);
