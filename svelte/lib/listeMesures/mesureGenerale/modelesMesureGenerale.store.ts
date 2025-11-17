import { writable } from 'svelte/store';
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
const { subscribe: subscribeMesures, set: setMesures } =
  writable<DictionnaireDesMesures>({});

type StoreVersionsDeService = {
  plusieursVersionsDeService: boolean;
  versionSelectionnee: VersionService;
};
const { subscribe: subscribeVersions, set: setVersions } =
  writable<StoreVersionsDeService>({
    plusieursVersionsDeService: false,
    versionSelectionnee: 'v1' as VersionService,
  });

export const modelesMesureGenerale = { subscribe: subscribeMesures };
export const storeVersionsDeService = {
  subscribe: subscribeVersions,
  set: setVersions,
};

axios
  .get<ModelesMesureGeneraleAPI>('/api/referentiel/mesures')
  .then(({ data: mesures }) => {
    setMesures(
      Object.fromEntries(
        Object.entries(mesures).map(([idMesure, donneesMesure]) => [
          idMesure,
          { ...donneesMesure, id: idMesure },
        ])
      )
    );

    const versions = Object.values(mesures).map((m) => m.versionReferentiel);
    setVersions({
      plusieursVersionsDeService: new Set(versions).size > 1,
      versionSelectionnee: versions.includes('v1' as VersionService)
        ? ('v1' as VersionService)
        : ('v2' as VersionService),
    });
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
