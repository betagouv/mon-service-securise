import { get, writable } from 'svelte/store';
import type { ModeleMesureGenerale } from '../../../ui/types.d';

type ModaleRapportStoreProps = {
  idServicesModifies?: string[];
  modeleMesureGenerale?: ModeleMesureGenerale;
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
  metEnAvantMesureApresModification: (id: string | null = null) => {
    if (!id) {
      const props = get(modaleRapportStore);
      if (props.modeleMesureGenerale) {
        id = props.modeleMesureGenerale.id;
      }
    }
    if (!id) return;
    const cible = document.querySelector(`#ligne-${id}`);
    cible?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'start',
    });
    cible?.classList.add('met-en-avant');
    cible?.addEventListener('animationend', () => {
      cible?.classList.remove('met-en-avant');
    });
  },
  ferme: () =>
    update((props) => {
      modaleRapportStore.metEnAvantMesureApresModification();
      return { ...props, ouvert: false };
    }),
};
