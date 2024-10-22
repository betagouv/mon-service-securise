<script lang="ts">
  import type { ReferentielGravites } from './risques.d';
  import TiroirLegende from './TiroirLegende.svelte';

  export let ouvert: boolean;
  export let referentielGravites: ReferentielGravites;
</script>

<TiroirLegende
  bind:ouvert
  titre="Comprendre les 5 niveaux de gravité"
  sousTitre="Découvrez les 5 niveaux définis par l'ANSSI."
>
  {#each Array(5) as _, index (index)}
    {@const [id, niveauGravite] = Object.entries(referentielGravites).filter(
      ([_, niveau]) => niveau.position === 4 - index
    )[0]}
    <div>
      <h4>
        <span class={`badge-niveau niveau-gravite ${id}`}
          >{niveauGravite.position}</span
        >
        {niveauGravite.description}
      </h4>
      <span>
        {niveauGravite.descriptionLongue}
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

  .niveau-gravite.nonConcerne {
    background: var(--liseres-fonce);
  }

  .niveau-gravite.minime {
    background: var(--bleu-mise-en-avant);
  }

  .niveau-gravite.significatif {
    background: var(--bleu-survol);
  }

  .niveau-gravite.grave {
    background: var(--bleu-anssi);
  }

  .niveau-gravite.critique {
    background: black;
  }

  h4 {
    margin: 0 0 8px;
  }
</style>
