<script lang="ts">
  let menuOuvert = false;
  let menuEl: any;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="conteneur"
  on:click={() => (menuOuvert = !menuOuvert)}
  bind:this={menuEl}
>
  <slot name="declencheur" />
  <div class="svelte-menu-flottant" class:invisible={!menuOuvert}>
    <slot />
  </div>
</div>

<svelte:body
  on:click={(e) => {
    const clicSurMenu = e.target === menuEl || menuEl?.contains(e.target);
    if (!clicSurMenu) menuOuvert = false;
  }}
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

  .invisible {
    display: none;
  }
</style>
