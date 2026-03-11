<script lang="ts">
  import { brouillonEstCompletStore } from '../../creationV2/etapes/brouillonEstComplet.store';
  import BrouillonDeServiceEditable from '../../creationV2/etapes/BrouillonDeServiceEditable.svelte';
  import { leBrouillon } from '../../creationV2/etapes/brouillon.store';
  import { metsAJourSimulation } from '../simulationv2.api';
  import type { MiseAJour } from '../../creationV2/creationV2.api';

  interface Props {
    estComplete: boolean;
  }

  let { estComplete = $bindable() }: Props = $props();
  $effect(() => {
    estComplete = $brouillonEstCompletStore;
  });

  const metsAJour = async (miseAJour: MiseAJour) => {
    await metsAJourSimulation($leBrouillon.id!, miseAJour);
  };
</script>

<BrouillonDeServiceEditable
  bind:donnees={$leBrouillon}
  seulementNomServiceEditable={false}
  onChampModifie={metsAJour}
/>
