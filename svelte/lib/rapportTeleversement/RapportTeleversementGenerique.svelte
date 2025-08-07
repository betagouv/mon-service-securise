<script lang="ts">
  import Toast from '../ui/Toast.svelte';
  import { onMount } from 'svelte';

  export let titreDuRapport: string;
  export let resume: { elementsValide: { label: string } } | undefined;

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
</style>
