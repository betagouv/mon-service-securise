<script lang="ts">
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  let elementHtml:
    | (HTMLElement & { errorMessage: string; status: string })
    | undefined = $state();

  $effect(() => {
    estComplete =
      $leBrouillon.nomService.trim().length > 0 &&
      $leBrouillon.nomService.length <= 200;
  });

  let estInvalide = $derived(
    $leBrouillon.nomService && $leBrouillon.nomService.length > 200
  );

  const metAJourNomService = (e: CustomEvent<string>) => {
    if (!elementHtml) return;

    $leBrouillon.nomService = e.detail;
    if (
      $leBrouillon.nomService.length === 0 ||
      $leBrouillon.nomService.length > 200
    ) {
      elementHtml.errorMessage =
        'Le nom du service est obligatoire et ne doit pas dépasser 200 caractères';
      elementHtml.status = 'error';
    } else {
      elementHtml.errorMessage = '';
      elementHtml.status = 'info';
    }
  };
</script>

<label for="nom-service" class="titre-question">
  Nom du service à sécuriser*
</label>
<dsfr-input
  bind:this={elementHtml}
  type="text"
  id="nom-service"
  nom="nom-service"
  value={$leBrouillon.nomService}
  status={estInvalide ? 'error' : 'info'}
  infoMessage={estInvalide ? '' : '200 caractères maximum'}
  errorMessage={estInvalide
    ? 'Le nom du service est obligatoire et ne doit pas dépasser 200 caractères'
    : ''}
  onvaluechanged={metAJourNomService}
  onblur={async () => {
    onChampModifie({ nomService: $leBrouillon.nomService });
  }}
></dsfr-input>
