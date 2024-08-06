<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EcheanceMesure } from '../../ui/types';

  export let echeance: string | undefined;
  export let estLectureSeule = false;
  export let avecLabel = false;

  let elementDate: HTMLInputElement;

  const afficheSelectionDate = () => {
    elementDate.showPicker();
  };

  const formatteur = new Intl.DateTimeFormat('fr-FR');
  let dateFormatte: string | undefined = undefined;
  $: {
    try {
      if (echeance) dateFormatte = formatteur.format(new Date(echeance));
      else dateFormatte = undefined;
    } catch (e) {
      dateFormatte = undefined;
    }
  }

  const dispatch = createEventDispatcher<{
    modificationEcheance: { echeance: EcheanceMesure };
  }>();
  const modifieEcheance = () => {
    if (echeance) dispatch('modificationEcheance', { echeance });
  };

  const labelVide = avecLabel ? 'Définir l’échéance' : 'Échéance';
</script>

<div class="conteneur-date">
  {#if avecLabel}
    <p class="label" class:estLectureSeule>Échéance</p>
  {/if}
  <button
    type="button"
    on:click|stopPropagation={afficheSelectionDate}
    class:vide={!dateFormatte}
    disabled={estLectureSeule}
    class:avecLabel
  >
    {dateFormatte ?? labelVide}
  </button>
  <input
    type="date"
    bind:value={echeance}
    bind:this={elementDate}
    on:change={modifieEcheance}
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
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
    text-align: center;
    color: var(--texte-clair);
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
    justify-content: start;
    padding: 8px 16px;
    border-radius: 6px;
  }

  button:not(.avecLabel):hover {
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

  button.vide:hover:not(.avecLabel)::before {
    filter: brightness(0) invert(17%) sepia(32%) saturate(3822%)
      hue-rotate(185deg) brightness(95%) contrast(94%);
  }

  button.avecLabel {
    border: 1px solid var(--liseres-fonce);
    gap: 24px;
    font-size: 12px;
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
