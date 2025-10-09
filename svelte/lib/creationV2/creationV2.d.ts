import type { Entite } from '../ui/types.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-creation-v2': CustomEvent;
  }
}

export type CreationV2Props = {
  entite: Entite | undefined;
};
