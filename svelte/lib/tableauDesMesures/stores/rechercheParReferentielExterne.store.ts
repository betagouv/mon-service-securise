import { writable } from 'svelte/store';
import type { MesureGenerale, MesureSpecifique } from '../tableauDesMesures.d';
import type { ReferentielExterne } from '../../referentielsExternesDeMesures/referentielsExternes';

export const rechercheParReferentielExterne = writable<ReferentielExterne[]>(
  []
);

export const appliqueFiltreParReferentielExterne = (
  mesure: MesureSpecifique | MesureGenerale,
  selection: ReferentielExterne[]
): boolean => {
  const mesuresRecyf =
    (mesure as MesureGenerale)?.mesuresReferentielsExternes?.ReCyf ?? [];
  const mesuresISO =
    (mesure as MesureGenerale)?.mesuresReferentielsExternes?.ISO2700X ?? [];
  const mesuresAE =
    (mesure as MesureGenerale)?.mesuresReferentielsExternes?.AE2690 ?? [];
  return (
    (mesuresRecyf.length > 0 && selection.includes('ReCyf')) ||
    (mesuresISO.length > 0 && selection.includes('ISO2700X')) ||
    (mesuresAE.length > 0 && selection.includes('AE2690'))
  );
};
