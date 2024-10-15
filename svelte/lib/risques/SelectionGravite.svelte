<script lang="ts">
  import type { IdentifiantGravite, ReferentielGravites } from './risques.d';

  export let niveauGravite: IdentifiantGravite;
  export let referentielGravites: ReferentielGravites;
  export let estLectureSeule;
</script>

<select
  class="niveau-gravite {niveauGravite}"
  class:vide={!niveauGravite}
  bind:value={niveauGravite}
  disabled={estLectureSeule}
  on:change
>
  <option label="+" value="" disabled />
  {#each Object.entries(referentielGravites) as [id, niveau] (id)}
    <option label={niveau.position.toString()} value={id} />
  {/each}
</select>

<style>
  .niveau-gravite {
    display: flex;
    width: 23px;
    padding: 0 4px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    font-weight: 700;
    line-height: 24px;
    box-sizing: border-box;
    margin: 0;
    text-align: center;
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

  .niveau-gravite.vide {
    background: var(--fond-gris-pale);
    color: var(--texte-clair);
  }
</style>
