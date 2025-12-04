import { UUID } from '../typesBasiquesSvelte';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-bandeau-referentiel-v2': CustomEvent;
  }
}

export type BandeauReferentielV2Props = {
  idService: UUID;
};
