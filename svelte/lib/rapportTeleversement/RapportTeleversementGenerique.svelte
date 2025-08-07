<script lang="ts">
  import Toast from '../ui/Toast.svelte';
  import { onMount } from 'svelte';
  import type { ResumeRapportTeleversement } from './rapportTeleversementGenerique.types';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    confirmeTeleversement: null;
    retenteTeleversement: null;
    annule: null;
  }>();

  export let titreDuRapport: string;
  export let resume: undefined | ResumeRapportTeleversement;

  let elementModale: HTMLDialogElement;

  onMount(() => {
    elementModale.inert = true;
    elementModale.showModal();
    elementModale.inert = false;
  });
</script>

<dialog
  bind:this={elementModale}
  class="dialog-rapport-televersement-generique"
>
  <div class="conteneur-fermeture">
    <button on:click={() => dispatch('annule')}>Fermer</button>
  </div>
  <div class="conteneur-modale">
    <div class="entete-modale">
      <h2>{titreDuRapport}</h2>
      <div class="conteneur-toasts">
        {#if resume?.elementsErreur}
          <Toast
            niveau="erreur"
            titre={resume.elementsErreur.label}
            contenu="Corriger le fichier XLSX et réimportez-le"
            avecOmbre={false}
            avecAnimation={false}
          />
        {/if}
        {#if resume?.elementsValide}
          <Toast
            niveau="succes"
            titre={resume.elementsValide.label}
            contenu="Aucune erreur détectée"
            avecOmbre={false}
            avecAnimation={false}
          />
        {/if}
      </div>
    </div>
    <div class="contenu-modale">
      <h2>Rapport détaillé</h2>
      <div class="conteneur-rapport-detaille">
        <slot name="tableau-du-rapport" />
      </div>
    </div>
    <div class="pied-modale">
      <div class="conteneur-actions">
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <lab-anssi-bouton
          titre="Annuler"
          variante="tertiaire-sans-bordure"
          taille="md"
          positionIcone="sans"
          on:click={() => dispatch('annule')}
        />

        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <lab-anssi-bouton
          titre={resume?.statut === 'VALIDE'
            ? resume.labelValiderTeleversement
            : 'Réimporter le fichier XLSX corrigé'}
          variante="primaire"
          taille="md"
          icone={resume?.statut === 'VALIDE' ? 'check-line' : 'refresh-line'}
          positionIcone="gauche"
          on:click={() =>
            dispatch(
              resume?.statut === 'VALIDE'
                ? 'confirmeTeleversement'
                : 'retenteTeleversement'
            )}
        />
      </div>
    </div>
  </div>
</dialog>

<style lang="scss">
  dialog {
    width: min(calc(100vw - 52px), 1868px);
    height: min(calc(100vh - 70px), 1010px);
    padding: 64px 32px 0 32px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
    box-sizing: border-box;
    position: relative;

    &::backdrop {
      background: rgba(22, 22, 22, 0.64);
    }
  }

  .conteneur-fermeture {
    position: absolute;
    top: 16px;
    right: 35px;

    button {
      border: none;
      background: none;
      padding: 4px 8px 4px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--bleu-mise-en-avant);
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.5rem;
      border-radius: 4px;

      &:hover {
        background: #f5f5f5;
      }

      &:after {
        content: '';
        background-image: url(/statique/assets/images/icone_fermeture_modale.svg);
        width: 16px;
        height: 16px;
        background-size: contain;
        background-repeat: no-repeat;
        display: inline-block;
        filter: brightness(0) invert(28%) sepia(70%) saturate(1723%)
          hue-rotate(184deg) brightness(107%) contrast(101%);
        transform: translateY(2px);
      }
    }
  }

  .conteneur-modale {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }

  .entete-modale,
  .pied-modale {
    flex-shrink: 0;
    position: sticky;
    z-index: 1;
    background: white;
  }

  .contenu-modale {
    flex-grow: 1;
    margin-top: 24px;
    overflow-y: auto;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0 0 24px;
    text-align: left;
  }

  .conteneur-toasts {
    display: flex;
    flex-direction: row;
    gap: 24px;
    margin-bottom: 48px;
  }

  .conteneur-rapport-detaille {
    overflow-x: scroll;
  }

  .pied-modale {
    .conteneur-actions {
      border-top: 1px solid var(--systeme-design-etat-contour-champs);
      width: 100%;
      background: white;
      display: flex;
      margin-left: -32px;
      padding: 32px;
      flex-direction: row;
      gap: 16px;
      justify-content: end;
    }
  }

  :global(.dialog-rapport-televersement-generique table) {
    border-collapse: collapse;
  }

  :global(.dialog-rapport-televersement-generique th) {
    white-space: nowrap;
    padding: 8px 16px;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.5rem;
    font-weight: 700;
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    border-bottom: 1px solid var(--systeme-design-etat-contour-champs);
    color: #3a3a3a;
  }

  :global(.dialog-rapport-televersement-generique tr th:first-of-type) {
    border-left: 1px solid var(--systeme-design-etat-contour-champs);
  }

  :global(
      .dialog-rapport-televersement-generique tr th:last-of-type,
      .dialog-rapport-televersement-generique .bordure-droite
    ) {
    border-right: 1px solid var(--systeme-design-etat-contour-champs);
  }

  :global(.dialog-rapport-televersement-generique th[scope='colgroup']) {
    background: var(--fond-pale);
  }
</style>
