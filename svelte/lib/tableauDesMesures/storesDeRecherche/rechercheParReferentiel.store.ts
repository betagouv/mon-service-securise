import { writable } from 'svelte/store';

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
