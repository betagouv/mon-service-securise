<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{
    champModifie: MiseAJour;
  }>();

  let elementHtml: HTMLElement & { errorMessage: string; status: string };

  $: estComplete = $leBrouillon.nomService.trim().length > 0;
</script>

<dsfr-input
  label="Nom du service à sécuriser*"
  bind:this={elementHtml}
  type="text"
  id="nom-service"
  nom="nom-service"
  value={$leBrouillon.nomService}
  errorMessage="Le nom du service est obligatoire."
  on:valuechanged={(e) => {
    $leBrouillon.nomService = e.detail;
    elementHtml.errorMessage = 'Le nom du service est obligatoire.';
    elementHtml.status =
      $leBrouillon.nomService.length < 1 ? 'error' : 'default';
  }}
  on:blur={async () => {
    emetEvenement('champModifie', { nomService: $leBrouillon.nomService });
  }}
/>
