import { writable } from 'svelte/store';
import type { MesureReferentiel } from '../ui/types';
import type { ReferentielMesures } from './listeMesures.d';

const { subscribe, set } = writable<Record<string, MesureReferentiel>>({});

axios
  .get<ReferentielMesures>('/api/referentiel/mesures')
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

export const mesuresReferentiel = {
  subscribe,
};
