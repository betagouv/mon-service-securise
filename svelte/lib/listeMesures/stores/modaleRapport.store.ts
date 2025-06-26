import { writable } from 'svelte/store';
import type { MesureReferentiel } from '../../ui/types';

type ModaleRapportStoreProps = {
  idServicesModifies?: string[];
  mesure?: MesureReferentiel;
  champsModifies?: ('statut' | 'modalites')[];
  ouvert: boolean;
};

const { set, subscribe, update } = writable<ModaleRapportStoreProps>({
  ouvert: false,
});

export const modaleRapportStore = {
  subscribe,
  affiche: (props: Omit<ModaleRapportStoreProps, 'ouvert'>) =>
    set({ ...props, ouvert: true }),
  ferme: () => update((props) => ({ ...props, ouvert: false })),
};
