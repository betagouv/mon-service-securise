<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let formulaire: HTMLFormElement;

  const dispatch = createEventDispatcher();
  const surValidation = () => {
    formulaire.reportValidity();
    if (formulaire.checkValidity()) dispatch('validation');
  };
</script>

<form bind:this={formulaire} on:submit|preventDefault={surValidation}>
  <slot />
</form>
