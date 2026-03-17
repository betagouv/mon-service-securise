import { writable } from 'svelte/store';
import type { ComponentProps, Component } from 'svelte';

export type ConfigurationTiroir = {
  titre: string;
  sousTitre?: string;
  taille?: 'normal' | 'large';
  composantEntete?: Component;
};

type TiroirStoreProps<TComposant extends Component = Component> = {
  contenu?: {
    composant: TComposant;
    props: ComponentProps<TComposant>;
  };
  ouvert: boolean;
};

const { set, subscribe } = writable<TiroirStoreProps>({ ouvert: false });

export const tiroirStore = {
  subscribe,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afficheContenu: <TComposant extends Component<any, ConfigurationTiroir>>(
    composant: TComposant,
    props: ComponentProps<TComposant>
  ) => set({ contenu: { composant, props }, ouvert: true }),
  ferme: () => set({ ouvert: false }),
};
