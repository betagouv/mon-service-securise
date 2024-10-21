<script lang="ts">
  import type { IdentifiantGravite, ReferentielGravites } from './risques.d';

  export let niveauGravite: IdentifiantGravite;
  export let referentielGravites: ReferentielGravites;
  export let estLectureSeule;
  export let avecLibelleOption: boolean = false;
</script>

<div class="conteneur-gravite">
  <select
    class="niveau-gravite {niveauGravite}"
    class:vide={!niveauGravite}
    class:avecLibelleOption
    bind:value={niveauGravite}
    disabled={estLectureSeule}
    on:change
  >
    <option
      label={avecLibelleOption ? 'Définir la gravité' : '+'}
      value=""
      disabled
    />
    {#each Object.entries(referentielGravites) as [id, niveau] (id)}
      <option
        label={`${niveau.position.toString()} - ${niveau.description}`}
        value={id}
      />
    {/each}
  </select>
</div>

<style>
  select {
    flex-grow: 1;
  }

  .niveau-gravite {
    display: flex;
    width: 23px;
    padding: 0 6px 2px 7px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    font-weight: 700;
    line-height: 22px;
    box-sizing: border-box;
    margin: 0;
    text-align: center;
    border: none;
  }

  .conteneur-gravite:has(select.avecLibelleOption) {
    --couleur-option: white;
  }

  .conteneur-gravite:has(select.avecLibelleOption.vide) {
    --couleur-option: var(--liseres-fonce);
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
    padding: 0 3px 3px;
  }

  .niveau-gravite.vide.avecLibelleOption {
    padding: 8px;
  }

  select.avecLibelleOption {
    width: 100%;
    appearance: none;
    text-align: left;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid transparent;
  }

  .conteneur-gravite {
    position: relative;
  }

  .conteneur-gravite::after {
    content: '';
    display: inline-block;

    width: 0.4rem;
    height: 0.4rem;

    border: 2px var(--couleur-option) solid;
    border-left: 0;
    border-bottom: 0;

    transform: rotate(135deg);
    right: 16px;
    position: absolute;
    top: 14px;
  }
</style>
