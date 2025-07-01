import { get, writable } from 'svelte/store';
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
  metEnAvantMesureApresModification: () => {
    const props = get(modaleRapportStore);
    if (props.mesure) {
      const cible = document.querySelector(`#ligne-${props.mesure.id}`);
      cible?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'start',
      });
      cible?.classList.add('met-en-avant');
      cible?.addEventListener('animationend', () => {
        cible?.classList.remove('met-en-avant');
      });
    }
  },
  ferme: () =>
    update((props) => {
      modaleRapportStore.metEnAvantMesureApresModification();
      return { ...props, ouvert: false };
    }),
};
