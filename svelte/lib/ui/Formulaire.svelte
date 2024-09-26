<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id: string = '';
  export let classe: string = '';

  let formulaire: HTMLFormElement;

  const dispatch = createEventDispatcher<{
    formulaireValide: null;
    formulaireInvalide: null;
  }>();

  const verifieValidite = () => {
    dispatch(
      formulaire.checkValidity() ? 'formulaireValide' : 'formulaireInvalide'
    );
  };
</script>

<form
  bind:this={formulaire}
  on:submit|preventDefault={verifieValidite}
  {id}
  novalidate
  class={classe}
>
  <slot />
</form>
