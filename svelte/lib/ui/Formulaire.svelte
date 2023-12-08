<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let formulaire: HTMLFormElement;

  const dispatch = createEventDispatcher<{ formulaireValide: null }>();

  const verifieValidite = () => {
    formulaire.reportValidity();
    if (formulaire.checkValidity()) dispatch('formulaireValide');
  };
</script>

<form bind:this={formulaire} on:submit|preventDefault={verifieValidite}>
  <slot />
</form>
