<script lang="ts">
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  // eslint-disable-next-line no-useless-assignment
  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  $effect(() => {
    estComplete = ($leBrouillon.presentation?.length || 0) <= 2000;
  });
  let estInvalide = $derived(
    $leBrouillon.presentation && $leBrouillon.presentation.length > 2000
  );

  const metAJourPresentation = (e: CustomEvent<string>) => {
    $leBrouillon.presentation = e.detail;
  };
</script>

<span class="titre-question" aria-hidden="true">
  Présentez votre service en quelques lignes
</span>
<dsfr-textarea
  id="presentationService"
  rows={5}
  label="Présentez votre service en quelques lignes"
  hideLabel
  value={$leBrouillon.presentation}
  status={estInvalide ? 'error' : 'info'}
  infoMessage={estInvalide ? '' : '2000 caractères maximum'}
  errorMessage={estInvalide
    ? 'La présentation ne doit pas dépasser 2000 caractères'
    : ''}
  onvaluechanged={metAJourPresentation}
  onblur={() =>
    onChampModifie({
      presentation: $leBrouillon.presentation,
    })}
></dsfr-textarea>

<style lang="scss">
  dsfr-textarea {
    max-width: 586px;
  }
</style>
