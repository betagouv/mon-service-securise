import type { UUID } from '../typesBasiquesSvelte';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-simulation-v2': CustomEvent;
  }
}

export type SimulationV2Props = {
  idService: UUID;
};
