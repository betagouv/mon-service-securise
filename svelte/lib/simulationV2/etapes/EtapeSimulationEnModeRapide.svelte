<script lang="ts">
  import { brouillonEstCompletStore } from '../../creationV2/etapes/brouillonEstComplet.store';
  import BrouillonDeServiceEditable from '../../creationV2/etapes/BrouillonDeServiceEditable.svelte';
  import { leBrouillon } from '../../creationV2/etapes/brouillon.store';

  export let estComplete: boolean;
  $: estComplete = $brouillonEstCompletStore;
</script>

<BrouillonDeServiceEditable
  bind:donnees={$leBrouillon}
  seulementNomServiceEditable={false}
  on:champModifie={async (e) => {}}
/>
