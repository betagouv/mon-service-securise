<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  let touche = false;

  const emetEvenement = createEventDispatcher<{
    champModifie: MiseAJour;
  }>();

  $: estComplete = $leBrouillon.nomService.trim().length > 0;
</script>

<dsfr-input
  label="Nom du service à sécuriser*"
  type="text"
  id="nom-service"
  nom="nom-service"
  value={$leBrouillon.nomService}
  status={touche && $leBrouillon.nomService.length < 1 ? 'error' : 'default'}
  errorMessage="Le nom du service est obligatoire."
  on:valuechanged={(e) => {
    $leBrouillon.nomService = e.detail;
    touche = true;
  }}
  on:blur={async () => {
    emetEvenement('champModifie', { nomService: $leBrouillon.nomService });
  }}
/>
