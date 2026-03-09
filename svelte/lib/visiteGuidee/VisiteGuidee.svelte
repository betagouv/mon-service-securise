<script lang="ts">
  import { composantVisiteGuidee } from './visiteGuidee.store';
  document.body.style.overflow = 'hidden';

  const SvelteComponent = $derived($composantVisiteGuidee);
</script>

<SvelteComponent />
