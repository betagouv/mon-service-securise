<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let afficherBoutonEnvoyer: boolean;
  const dispatch = createEventDispatcher<{
    annuler: null;
    envoyer: null;
  }>();
</script>

<div class="conteneur-actions">
  <button
    class="bouton bouton-secondaire fermeture-tiroir"
    type="button"
    on:click={() => dispatch('annuler')}
  >
    Annuler
  </button>

  {#if afficherBoutonEnvoyer}
    <button class="bouton" type="button" on:click={() => dispatch('envoyer')}>
      Envoyer une invitation
    </button>
  {/if}
</div>
