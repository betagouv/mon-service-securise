<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    modifier: null;
    enregistrer: null;
  }>();

  type ModeAffichage = 'Résumé' | 'Édition';
  export let mode: ModeAffichage;
</script>

<div class="barre-actions">
  <div class="les-boutons">
    {#if mode === 'Résumé'}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Modifier le service"
        variante="tertiaire"
        taille="md"
        icone="edit-line"
        positionIcone="droite"
        on:click={() => dispatch('modifier')}
      />
    {:else if mode === 'Édition'}
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Enregistrer les modifications"
        variante="primaire"
        taille="md"
        icone="save-line"
        positionIcone="gauche"
        on:click={() => dispatch('enregistrer')}
      />
    {/if}
  </div>
</div>

<style lang="scss">
  .barre-actions {
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1px solid #ddd;
    padding: 24px 0;

    .les-boutons {
      max-width: 1000px;
      padding: 0 54px;
      margin: 0 auto;
    }
  }
</style>
