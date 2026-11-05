<script lang="ts">
  import { toasterStore } from './stores/toaster.store';
  import Toast from './Toast.svelte';

  const afficheAuPremierPlan =
    (nombreToasts: number) => (element: HTMLElement) => {
      if (nombreToasts > 0) element.showPopover();
      return () => element.hidePopover();
    };
</script>

{#if $toasterStore.queue.length}
  <aside
    id="conteneur-toasts"
    popover="manual"
    {@attach afficheAuPremierPlan($toasterStore.queue.length)}
  >
    {#each $toasterStore.queue as { niveau, contenu, titre, id, timeout, avecInterpolationHTMLDangereuse = false, boutonAction } (id)}
      <Toast
        {niveau}
        {titre}
        {contenu}
        {timeout}
        {avecInterpolationHTMLDangereuse}
        avecBoutonAction={boutonAction}
        avecFermeture
        onClose={() => toasterStore.fermeToast(id)}
      />
    {/each}
  </aside>
{/if}

<style lang="scss">
  aside {
    position: fixed;
    inset: 0 36px auto auto;
    margin: 0;
    padding: 2em 0 0;
    border: none;
    background: transparent;
    overflow: visible;
    width: 540px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1em;
    z-index: 1002;
  }
</style>
