<script lang="ts">
  import FermetureSurClicEnDehors from './FermetureSurClicEnDehors.svelte';

  export let parDessusDeclencheur = false;

  let menuOuvert = false;
  let menuEl: HTMLDivElement;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="conteneur" on:click={() => (menuOuvert = true)} bind:this={menuEl}>
  <slot name="declencheur" />
  <div
    class="svelte-menu-flottant"
    class:invisible={!menuOuvert}
    class:parDessusDeclencheur
  >
    <slot />
  </div>
</div>

<FermetureSurClicEnDehors bind:doitEtreOuvert={menuOuvert} element={menuEl} />

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
</style>
