<script lang="ts">
  import FermetureSurClicEnDehors from './FermetureSurClicEnDehors.svelte';

  export let parDessusDeclencheur = false;
  export let fermeMenuSiClicInterne = false;

  let menuOuvert = false;
  let declencheurEl: HTMLButtonElement;
  let contenuEl: HTMLDivElement;
</script>

<div class="conteneur">
  <button
    class="declencheur"
    on:click={() => (menuOuvert = true)}
    bind:this={declencheurEl}
  >
    <slot name="declencheur" />
  </button>
  <div
    class="svelte-menu-flottant"
    bind:this={contenuEl}
    class:invisible={!menuOuvert}
    class:parDessusDeclencheur
  >
    <slot />
  </div>
</div>

<FermetureSurClicEnDehors
  bind:doitEtreOuvert={menuOuvert}
  elements={[declencheurEl, ...(fermeMenuSiClicInterne ? [] : [contenuEl])]}
/>

<style>
  .conteneur {
    display: flex;
    position: relative;
    cursor: pointer;
  }

  .svelte-menu-flottant {
    position: absolute;
    left: -2px;
    transform: translateX(-100%);
    z-index: 100;
  }

  .svelte-menu-flottant.parDessusDeclencheur {
    transform: translate(0, -1px);
  }

  .invisible {
    display: none;
  }

  button {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }
</style>
