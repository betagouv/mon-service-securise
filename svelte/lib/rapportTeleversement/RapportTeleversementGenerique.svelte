<script lang="ts">
  import Toast from '../ui/Toast.svelte';
  import { onMount } from 'svelte';
  import type { ResumeRapportTeleversement } from './rapportTeleversementGenerique.types';

  export let titreDuRapport: string;

  export let resume: undefined | ResumeRapportTeleversement;

  let elementModale: HTMLDialogElement;

  onMount(() => {
    elementModale.inert = true;
    elementModale.showModal();
    elementModale.inert = false;
  });
</script>

<dialog bind:this={elementModale}>
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
            contenu="Aucune erreur détéctée"
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
  </div>
</dialog>

<style lang="scss">
  dialog::backdrop {
    background: rgba(22, 22, 22, 0.64);
  }

  dialog {
    width: min(calc(100vw - 52px), 1868px);
    height: min(calc(100vh - 70px), 1010px);
    padding: 64px 32px 0 32px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
    box-sizing: border-box;
    position: relative;
  }

  .conteneur-modale {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }

  .entete-modale {
    flex-shrink: 0;
    position: sticky;
    z-index: 1;
    background: white;
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

  :global(table) {
    border-collapse: collapse;
  }

  :global(th) {
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

  :global(tr th:first-of-type) {
    border-left: 1px solid var(--systeme-design-etat-contour-champs);
  }

  :global(tr th:last-of-type, .bordure-droite) {
    border-right: 1px solid var(--systeme-design-etat-contour-champs);
  }

  :global(th[scope='colgroup']) {
    background: var(--fond-pale);
  }
</style>
