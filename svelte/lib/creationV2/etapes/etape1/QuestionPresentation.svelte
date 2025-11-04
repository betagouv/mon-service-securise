<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChampDeSaisie from '../../../ui/ChampDeSaisie.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = ($leBrouillon.presentation?.length || 0) <= 2000;
  $: estInvalide =
    $leBrouillon.presentation && $leBrouillon.presentation.length > 2000;
</script>

<label for="presentation" class="titre-question">
  Présentez votre service en quelques lignes
</label>
<dsfr-textarea
  rows={5}
  value={$leBrouillon.presentation}
  status={estInvalide ? 'error' : 'info'}
  infoMessage={estInvalide ? '' : '2000 caractères maximum'}
  errorMessage={estInvalide
    ? 'La présentation ne doit pas dépasser 2000 caractères'
    : ''}
  on:valuechanged={(e) => {
    $leBrouillon.presentation = e.detail;
  }}
  on:blur={() =>
    emetEvenement('champModifie', {
      presentation: $leBrouillon.presentation,
    })}
/>

<style lang="scss">
  dsfr-textarea {
    max-width: 586px;
  }
</style>
