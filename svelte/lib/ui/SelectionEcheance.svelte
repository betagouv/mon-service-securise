<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EcheanceMesure } from './types';

  export let echeance: string | undefined;
  export let estLectureSeule = false;
  export let avecLabel = false;

  const dispatch = createEventDispatcher<{
    modificationEcheance: { echeance: EcheanceMesure };
  }>();

  let elementDate: HTMLInputElement;

  let dateFormattee: string | undefined = undefined;
  $: {
    const formatFR = new Intl.DateTimeFormat('fr-FR');
    try {
      if (echeance) dateFormattee = formatFR.format(new Date(echeance));
      else dateFormattee = undefined;
    } catch (e) {
      dateFormattee = undefined;
    }
  }

  const modifieEcheance = (e: any) => {
    const nouvelleEcheance = e.target.value;
    echeance = nouvelleEcheance;
    dispatch('modificationEcheance', { echeance: nouvelleEcheance });
  };

  let dateEcheance: string;

  if (echeance) {
    dateEcheance = new Date(Date.parse(echeance))
      .toISOString()
      .substring(0, 10);
  }

  const labelVide = avecLabel ? 'Définir l’échéance' : 'Échéance';
</script>

<div class="conteneur-date">
  {#if avecLabel}
    <p class="label" class:estLectureSeule>Échéance</p>
  {/if}
  <button
    type="button"
    on:click|stopPropagation={() => elementDate.showPicker()}
    class:vide={!dateFormattee}
    disabled={estLectureSeule}
    class:avecLabel
  >
    {dateFormattee ?? labelVide}
  </button>
  <!-- Sans passer par `bind:value` car ça casse le fonctionnement du bouton « Effacer » du date-picker -->
  <input
    type="date"
    bind:this={elementDate}
    on:input={modifieEcheance}
    value={dateEcheance}
  />
</div>

<style>
  .conteneur-date {
    position: relative;
  }

  input[type='date'] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    visibility: hidden;
  }

  button {
    white-space: nowrap;
    font-size: 0.9rem;
    line-height: 24px;
    text-align: center;
    color: var(--texte-clair);
    background: none;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
    justify-content: start;
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid var(--liseres);
  }

  button:not(.avecLabel):not([disabled]):hover {
    background: var(--fond-gris-pale);
    color: var(--bleu-anssi);
  }

  button.vide:not(.avecLabel)::before {
    content: '';
    width: 24px;
    height: 24px;
    display: flex;
    background: url('/statique/assets/images/icone_calendrier.svg');
  }

  button.vide:hover:not(.avecLabel):not([disabled])::before {
    filter: brightness(0) invert(17%) sepia(32%) saturate(3822%)
      hue-rotate(185deg) brightness(95%) contrast(94%);
  }

  button.vide:not(.avecLabel)[disabled]::before {
    filter: brightness(0) invert(93%) sepia(5%) saturate(618%)
      hue-rotate(178deg) brightness(93%) contrast(89%);
  }

  button.avecLabel {
    border: 1px solid var(--liseres-fonce);
    gap: 24px;
  }

  button.avecLabel::after {
    content: '';
    width: 24px;
    height: 24px;
    display: flex;
    background: url('/statique/assets/images/icone_calendrier.svg');
  }

  button[disabled] {
    color: var(--liseres-fonce);
    background: var(--fond-gris-pale);
    border: none;
    cursor: not-allowed;
  }

  button[disabled].avecLabel::after {
    filter: brightness(0) invert(89%) sepia(2%) saturate(3151%)
      hue-rotate(190deg) brightness(105%) contrast(76%);
  }

  .label {
    font-weight: 500;
    line-height: 22px;
    text-align: left;
    color: var(--texte-clair);
    margin: 0 0 8px;
  }

  .label.estLectureSeule {
    color: var(--liseres-fonce);
  }
</style>
