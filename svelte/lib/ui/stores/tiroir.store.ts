import { writable } from 'svelte/store';
import type { ComponentProps, ComponentType, SvelteComponent } from 'svelte';

export type ConfigurationTiroir = SvelteComponent & {
  titre: string;
  sousTitre: string;
  taille?: 'normal' | 'large';
};

type TiroirStoreProps = {
  contenu?: {
    composant: ComponentType<ConfigurationTiroir>;
    props: ComponentProps<ConfigurationTiroir>;
  };
  ouvert: boolean;
};

const { set, subscribe } = writable<TiroirStoreProps>({ ouvert: false });

export const tiroirStore = {
  subscribe,
  afficheContenu: <T extends ConfigurationTiroir>(
    composant: ComponentType<T>,
    props: ComponentProps<T>
  ) => set({ contenu: { composant, props }, ouvert: true }),
  ferme: () => set({ ouvert: false }),
};
