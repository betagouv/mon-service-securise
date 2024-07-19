import { writable } from 'svelte/store';
import type { MesureGenerale, MesureSpecifique } from '../tableauDesMesures.d';
import { Referentiel } from '../../ui/types';

export enum IdReferentiel {
  ANSSIRecommandee,
  ANSSIIndispensable,
  CNIL,
  MesureAjoutee,
}

const selectionDeReferentiels = writable<IdReferentiel[]>([]);

export const rechercheParReferentiel = {
  subscribe: selectionDeReferentiels.subscribe,
  set: selectionDeReferentiels.set,
  ajouteLesReferentielsANSSI: () =>
    selectionDeReferentiels.update((etatActuel) => [
      ...new Set([
        ...etatActuel,
        IdReferentiel.ANSSIRecommandee,
        IdReferentiel.ANSSIIndispensable,
      ]),
    ]),
  supprimeLesReferentielsANSSI: () =>
    selectionDeReferentiels.update((etatActuel) =>
      etatActuel.filter(
        (f) =>
          f !== IdReferentiel.ANSSIIndispensable &&
          f !== IdReferentiel.ANSSIRecommandee
      )
    ),
};

const estMesureGenerale = (
  mesure: MesureSpecifique | MesureGenerale
): mesure is MesureGenerale =>
  // On utilise ici un typeguard, et on se base sur une propriété qui est uniquement présente dans les mesures générales
  'descriptionLongue' in mesure && mesure.descriptionLongue !== undefined;

export const appliqueRechercheParReferentiel = (
  mesure: MesureSpecifique | MesureGenerale,
  selection: IdReferentiel[]
) => {
  return (
    (selection.includes(IdReferentiel.MesureAjoutee) &&
      !estMesureGenerale(mesure)) ||
    (selection.includes(IdReferentiel.ANSSIIndispensable) &&
      estMesureGenerale(mesure) &&
      mesure.indispensable &&
      mesure.referentiel === Referentiel.ANSSI) ||
    (selection.includes(IdReferentiel.CNIL) &&
      estMesureGenerale(mesure) &&
      mesure.referentiel === Referentiel.CNIL) ||
    (selection.includes(IdReferentiel.ANSSIRecommandee) &&
      estMesureGenerale(mesure) &&
      !mesure.indispensable &&
      mesure.referentiel === Referentiel.ANSSI)
  );
};
