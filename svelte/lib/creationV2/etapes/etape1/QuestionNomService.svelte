<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{
    champModifie: MiseAJour;
  }>();

  let elementHtml: HTMLElement & { errorMessage: string; status: string };

  $: estComplete =
    $leBrouillon.nomService.trim().length > 0 &&
    $leBrouillon.nomService.length <= 200;
  $: estInvalide =
    $leBrouillon.nomService && $leBrouillon.nomService.length > 200;
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
  on:valuechanged={(e) => {
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
  }}
  on:blur={async () => {
    emetEvenement('champModifie', { nomService: $leBrouillon.nomService });
  }}
/>
