import { writable } from 'svelte/store';
import type { MesureReferentiel } from '../ui/types';
import type { ReferentielMesures } from './listeMesures.d';

const { subscribe, set } = writable<Record<string, MesureReferentiel>>({});

axios
  .get<ReferentielMesures>('/api/referentiel/mesures')
  .then(({ data: mesures }) => {
    set(mesures);
  });

export const mesuresReferentiel = {
  subscribe,
};
