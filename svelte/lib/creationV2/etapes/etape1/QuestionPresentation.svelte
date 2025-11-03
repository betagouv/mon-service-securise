<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChampDeSaisie from '../../../ui/ChampDeSaisie.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = true;
</script>

<label for="presentation" class="titre-question">
  Présentez votre service en quelques lignes
  <dsfr-textarea
    rows={5}
    value={$leBrouillon.presentation}
    on:valuechanged={(e) => {
      $leBrouillon.presentation = e.detail;
    }}
    on:blur={() =>
      emetEvenement('champModifie', {
        presentation: $leBrouillon.presentation,
      })}
  />
</label>
