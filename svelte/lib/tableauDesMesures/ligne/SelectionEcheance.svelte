<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EcheanceMesure } from '../../ui/types';

  export let echeance: string | undefined;
  export let estLectureSeule = false;

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
</script>

<div class="conteneur-date">
  <button
    type="button"
    on:click|stopPropagation={afficheSelectionDate}
    class:vide={!dateFormatte}
    disabled={estLectureSeule}
  >
    {dateFormatte ?? 'Échéance'}
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
  }

  button.vide::before {
    content: '';
    width: 24px;
    height: 24px;
    display: flex;
    background: url('/statique/assets/images/icone_calendrier.svg');
  }
</style>
