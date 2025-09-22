<script lang="ts">
  import ChampTexte from '../../../ui/ChampTexte.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{
    champModifie: MiseAJour;
  }>();

  $: estComplete = $leBrouillon.nomService.trim().length > 0;
</script>

<label for="nom-service" class="titre-question">
  Quel est le nom du service à sécuriser ?
  <ChampTexte
    id="nom-service"
    nom="nom-service"
    bind:valeur={$leBrouillon.nomService}
    on:blur={() =>
      emetEvenement('champModifie', { nomService: $leBrouillon.nomService })}
  />
</label>
