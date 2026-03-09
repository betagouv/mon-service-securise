<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  interface Props {
    afficherBoutonEnvoyer: boolean;
  }

  let { afficherBoutonEnvoyer }: Props = $props();
  const dispatch = createEventDispatcher<{
    annuler: null;
    envoyer: null;
  }>();
</script>

<div class="conteneur-actions">
  <button
    class="bouton bouton-secondaire fermeture-tiroir"
    type="button"
    onclick={() => dispatch('annuler')}
  >
    Annuler
  </button>

  {#if afficherBoutonEnvoyer}
    <button class="bouton" type="button" onclick={() => dispatch('envoyer')}>
      Envoyer une invitation
    </button>
  {/if}
</div>
