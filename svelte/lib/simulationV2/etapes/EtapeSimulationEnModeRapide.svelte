<script lang="ts">
  import { brouillonEstCompletStore } from '../../creationV2/etapes/brouillonEstComplet.store';
  import BrouillonDeServiceEditable from '../../creationV2/etapes/BrouillonDeServiceEditable.svelte';
  import { leBrouillon } from '../../creationV2/etapes/brouillon.store';
  import { metsAJourSimulation } from '../simulationv2.api';
  import type { MiseAJour } from '../../creationV2/creationV2.api';

  export let estComplete: boolean;
  $: estComplete = $brouillonEstCompletStore;

  const metsAJour = async (e: CustomEvent<MiseAJour>) => {
    await metsAJourSimulation($leBrouillon.id!, e.detail);
  };
</script>

<BrouillonDeServiceEditable
  bind:donnees={$leBrouillon}
  seulementNomServiceEditable={false}
  on:champModifie={metsAJour}
/>
