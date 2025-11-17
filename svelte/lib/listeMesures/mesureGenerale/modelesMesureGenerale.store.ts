import { derived, writable } from 'svelte/store';
import type { ModeleMesureGenerale } from '../../ui/types';
import type { VersionService } from '../../../../src/modeles/versionService';
import type { ModeleDeMesure } from '../listeMesures.d';

type IdModeleMesureGenerale = string;

type ModelesMesureGeneraleAPI = Record<
  IdModeleMesureGenerale,
  Omit<ModeleMesureGenerale, 'id'>
>;

type DictionnaireDesMesures = Record<
  IdModeleMesureGenerale,
  ModeleMesureGenerale
>;

const { subscribe, set } = writable<DictionnaireDesMesures>({});

axios
  .get<ModelesMesureGeneraleAPI>('/api/referentiel/mesures')
  .then(({ data: mesures }) => {
    set(
      Object.fromEntries(
        Object.entries(mesures).map(([idMesure, donneesMesure]) => [
          idMesure,
          { ...donneesMesure, id: idMesure },
        ])
      )
    );
  });

export const seulementCellesDeLaVersion = (
  mesures: ModeleDeMesure[],
  version: VersionService
) =>
  mesures.filter(
    (m) =>
      // Une mesure spécifique n'a pas de version : on la garde
      m.type === 'specifique' ||
      (m.type === 'generale' && m.versionReferentiel === version)
  );

export const modelesMesureGenerale = { subscribe };

type StoreVersionsDeService = { plusieursVersionsDeService: boolean };

export const lesVersionsDeService = derived<
  [typeof modelesMesureGenerale],
  StoreVersionsDeService
>([modelesMesureGenerale], ([store]) => {
  const toutes = Object.values(store).map((m) => m.versionReferentiel);

  return {
    plusieursVersionsDeService: new Set(toutes).size > 1,
  };
});
