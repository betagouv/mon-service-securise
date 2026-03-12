<script lang="ts">
  import { onMount } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { entiteDeUtilisateur, leBrouillon } from '../brouillon.store';
  import ChampOrganisation from '../../../ui/ChampOrganisation.svelte';
  import { brouillonAEteCreeStore } from '../../brouillonAEteCree.store';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  let doitForcerEvenement = false;

  onMount(() => {
    brouillonAEteCreeStore.subscribe((existe) => {
      if (!$leBrouillon.siret && $entiteDeUtilisateur) {
        doitForcerEvenement = true;
        $leBrouillon.siret = $entiteDeUtilisateur.siret;
      }
      if (existe && doitForcerEvenement && estComplete) {
        onChampModifie({ siret: $leBrouillon.siret });
      }
    });
  });

  $effect(() => {
    estComplete = !!$leBrouillon.id && /^\d{14}$/.test($leBrouillon.siret);
  });

  $effect(() => {
    if (estComplete) onChampModifie({ siret: $leBrouillon.siret });
  });
</script>

<label for="siret" class="titre-question">
  Quel est le nom ou siret de l’organisation ?*
</label>

{#key $leBrouillon.siret}
  <ChampOrganisation bind:siret={$leBrouillon.siret} />
{/key}
