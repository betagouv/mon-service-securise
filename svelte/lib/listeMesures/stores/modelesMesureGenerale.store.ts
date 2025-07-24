import { writable } from 'svelte/store';
import type { ModeleMesureGenerale } from '../../ui/types';

type IdModeleMesureGenerale = string;

type ModelesMesureGeneraleAPI = Record<
  IdModeleMesureGenerale,
  Omit<ModeleMesureGenerale, 'id'>
>;

const { subscribe, set } = writable<
  Record<IdModeleMesureGenerale, ModeleMesureGenerale>
>({});

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

export const modelesMesureGenerale = {
  subscribe,
};
