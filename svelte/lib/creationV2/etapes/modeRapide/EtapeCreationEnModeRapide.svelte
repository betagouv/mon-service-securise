<script lang="ts">
  import BrouillonDeServiceEditable from '../BrouillonDeServiceEditable.svelte';
  import { brouillonEstCompletStore } from '../brouillonEstComplet.store';
  import { metsAJourBrouillonService } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;
  $: estComplete = $brouillonEstCompletStore;
</script>

<BrouillonDeServiceEditable
  on:champModifie={async (e) => {
    await metsAJourBrouillonService($leBrouillon.id, e.detail);
  }}
/>
