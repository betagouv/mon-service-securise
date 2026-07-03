<script lang="ts">
  import { composantVisiteGuidee } from './visiteGuidee.store';
  document.body.style.overflow = 'hidden';

  const SvelteComponent = $derived($composantVisiteGuidee);
</script>

<SvelteComponent />

<style>
  :global(body[data-visite-guidee-en-cours]) {
    pointer-events: none;
  }

  :global(body[data-visite-guidee-en-cours] #visite-guidee-rideau) {
    pointer-events: auto;
  }
  :global(body[data-visite-guidee-en-cours] #visite-guidee) {
    pointer-events: auto;
  }
  :global(body[data-visite-guidee-en-cours] #visite-guidee-menu-navigation) {
    pointer-events: auto;
  }
</style>
