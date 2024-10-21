<script lang="ts">
  import type {
    IdentifiantVraisemblance,
    ReferentielVraisemblances,
  } from './risques.d';

  export let niveauVraisemblance: IdentifiantVraisemblance;
  export let estLectureSeule;
  export let referentielVraisemblances: ReferentielVraisemblances;
  export let avecLibelleOption: boolean = false;
</script>

<div class="conteneur-vraisemblance">
  <select
    class="niveau-vraisemblance {niveauVraisemblance}"
    class:vide={!niveauVraisemblance}
    class:avecLibelleOption
    bind:value={niveauVraisemblance}
    disabled={estLectureSeule}
    on:change
  >
    <option
      label={avecLibelleOption ? 'Définir la vraisemblance initiale' : '+'}
      value=""
      disabled
    />
    {#each Object.entries(referentielVraisemblances) as [id, niveau] (id)}
      <option
        label={`${niveau.position.toString()} - ${niveau.libelle}`}
        value={id}
      />
    {/each}
  </select>
</div>

<style>
  select {
    flex-grow: 1;
  }

  .niveau-vraisemblance {
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

  .niveau-vraisemblance.vide {
    background: var(--fond-gris-pale);
    color: var(--texte-clair);
    padding: 0 3px 3px;
  }

  .niveau-vraisemblance.vide.avecLibelleOption {
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

  .conteneur-vraisemblance {
    position: relative;
  }

  .conteneur-vraisemblance:has(select.avecLibelleOption) {
    --couleur-option: white;
  }

  .conteneur-vraisemblance:has(select.avecLibelleOption.vide) {
    --couleur-option: var(--liseres-fonce);
  }

  .conteneur-vraisemblance::after {
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
