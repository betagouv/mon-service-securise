<script lang="ts">
  import type { ReferentielStatut } from './types';

  export let statut: string | undefined;
  export let actif: boolean = false;
  export let referentielStatuts: ReferentielStatut;
</script>

{#if statut}
  <span class={statut} class:actif>{referentielStatuts[statut]}</span>
{:else}
  <span class="aDefinir" class:actif>Statut à définir</span>
{/if}

<style>
  span {
    margin: 0;
    --couleur-fond: transparent;
    --couleur-texte: transparent;
    border: none;
    background: var(--couleur-fond);
    color: var(--couleur-texte);
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    width: fit-content;
  }

  span.actif {
    color: white;
    background: var(--couleur-texte);
  }

  span.fait {
    --couleur-fond: #d4f4db;
    --couleur-texte: #0c8626;
  }

  span.enCours {
    --couleur-fond: #dbeeff;
    --couleur-texte: #0079d0;
  }

  span.nonFait {
    --couleur-fond: #fff2de;
    --couleur-texte: #faa72c;
  }

  span.aLancer {
    --couleur-fond: #e9ddff;
    --couleur-texte: #7025da;
  }

  span.aDefinir {
    --couleur-fond: #f1f5f9;
    --couleur-texte: #667892;
  }
</style>
