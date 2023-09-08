<script lang="ts">
  let menuOuvert = false;
  let menuEl;
</script>

<button
  class="declencheur-menu-flottant"
  on:click={() => (menuOuvert = !menuOuvert)}
  bind:this={menuEl}
>
  <div class="svelte-menu-flottant" class:invisible={!menuOuvert}>
    <slot />
  </div>
</button>

<svelte:body
  on:click={(e) => {
    const clicSurMenu = e.target === menuEl || menuEl?.contains(e.target);
    if (!clicSurMenu) menuOuvert = false;
  }}
/>
