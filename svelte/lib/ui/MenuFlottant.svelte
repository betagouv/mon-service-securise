<script lang="ts">
  import FermetureSurClicEnDehors from './FermetureSurClicEnDehors.svelte';

  let menuOuvert = false;
  let menuEl: HTMLDivElement;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="conteneur" on:click={() => (menuOuvert = true)} bind:this={menuEl}>
  <slot name="declencheur" />
  <div class="svelte-menu-flottant" class:invisible={!menuOuvert}>
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

  .invisible {
    display: none;
  }
</style>
