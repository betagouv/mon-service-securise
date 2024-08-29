<script lang="ts">
  import type { PrioriteMesure, ReferentielPriorite } from './types';

  export let priorite: PrioriteMesure;
  export let actif: boolean = false;
  export let priorites: ReferentielPriorite;
</script>

<span class={priorite} class:actif>{priorites[priorite].libelleCourt}</span>

<style>
  span {
    margin: 0;
    --couleur-fond: transparent;
    --couleur-texte: transparent;
    border: none;
    background: var(--couleur-fond-normal);
    color: var(--couleur-texte-normal);
    padding: 4px 6px 5px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    width: fit-content;
    --couleur-texte-normal: var(--couleur-fond-survol);
    --couleur-fond-normal: var(--couleur-texte-survol);
  }

  span.actif {
    color: white;
    background: var(--couleur-texte);
  }

  span.p1 {
    --couleur-texte-survol: #ffe9e6;
    --couleur-fond-survol: #ff6584;
  }

  span.p2 {
    --couleur-texte-survol: #fff2de;
    --couleur-fond-survol: #faa72c;
  }

  span.p3 {
    --couleur-texte-survol: #d4f4db;
    --couleur-fond-survol: #0c8626;
  }
</style>
