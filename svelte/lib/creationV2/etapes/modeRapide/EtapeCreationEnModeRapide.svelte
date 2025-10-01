<script lang="ts">
  import BrouillonDeServiceEditable from '../BrouillonDeServiceEditable.svelte';
  import { brouillonEstCompletStore } from '../brouillonEstComplet.store';

  export let estComplete: boolean;
  $: estComplete = $brouillonEstCompletStore;
</script>

<BrouillonDeServiceEditable />
