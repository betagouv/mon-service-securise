<script lang="ts">
  import type { ReferentielVraisemblances } from './risques.d';
  import TiroirLegende from './TiroirLegende.svelte';

  export let ouvert: boolean;
  export let referentielVraisemblances: ReferentielVraisemblances;
</script>

<TiroirLegende
  bind:ouvert
  titre="Comprendre les 5 niveaux de vraisemblance"
  sousTitre="Découvrez les 5 niveaux définis par EBIOS Risk manager."
>
  {#each Array(5) as _, index (index)}
    {@const [id, niveauVraisemblance] = Object.entries(
      referentielVraisemblances
    ).filter(([_, niveau]) => niveau.position === 4 - index)[0]}
    <div>
      <h4>
        <span class={`badge-niveau niveau-vraisemblance ${id}`}
          >{niveauVraisemblance.position}</span
        >
        {niveauVraisemblance.libelle}
      </h4>
      <span>
        {niveauVraisemblance.description}
      </span>
    </div>
  {/each}
</TiroirLegende>

<style>
  .badge-niveau {
    margin-right: 8px;
    display: inline-block;
    color: white;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .niveau-vraisemblance.invraisemblable {
    background: var(--liseres-fonce);
  }

  .niveau-vraisemblance.peuVraisemblable {
    background: var(--bleu-mise-en-avant);
  }

  .niveau-vraisemblance.vraisemblable {
    background: var(--bleu-survol);
  }

  .niveau-vraisemblance.tresVraisemblable {
    background: var(--bleu-anssi);
  }

  .niveau-vraisemblance.quasiCertain {
    background: black;
  }

  h4 {
    margin: 0 0 8px;
  }
</style>
