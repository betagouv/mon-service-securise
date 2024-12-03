import { writable } from 'svelte/store';
import type { ComponentProps, ComponentType, SvelteComponent } from 'svelte';

type ConfigurationTiroir = {
  titre: string;
  sousTitre: string;
};

type TiroirStoreProps = {
  contenu?: {
    composant: ComponentType;
    props: any;
    configuration: ConfigurationTiroir;
  };
  ouvert: boolean;
};

const { set, subscribe } = writable<TiroirStoreProps>({ ouvert: false });

export const tiroirStore = {
  subscribe,
  afficheContenu: <T extends SvelteComponent>(
    composant: ComponentType<T>,
    props: ComponentProps<T>,
    configuration: ConfigurationTiroir
  ) => set({ contenu: { composant, props, configuration }, ouvert: true }),
  ferme: () => set({ ouvert: false }),
};
