import { derived } from 'svelte/store';
import { mesures } from './mesures.store';

type VolumetrieMesures = {
  total: number;
};

export const volumetrieMesures = derived<typeof mesures, VolumetrieMesures>(
  mesures,
  ($mesures) => ({
    total:
      $mesures.mesuresSpecifiques.length +
      Object.keys($mesures.mesuresGenerales).length,
  })
);
