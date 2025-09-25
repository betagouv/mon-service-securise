<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = !!$leBrouillon.statutDeploiement;

  $: emetEvenement('champModifie', {
    statutDeploiement: $leBrouillon.statutDeploiement,
  });
</script>

<label for="statut-deploiement" class="titre-question">
  Quel est le statut de votre service ?*

  <span class="indication">Sélectionnez une réponse</span>
  {#each Object.entries(questionsV2.statutDeploiement) as [id, { description }]}
    <Radio
      {id}
      nom={description}
      bind:valeur={$leBrouillon.statutDeploiement}
    />
  {/each}
</label>

<style lang="scss">
  label {
    .indication {
      font-size: 0.75rem;
      line-height: 1.15rem;
      color: #666;
      font-weight: normal;
      margin-top: 8px;
    }
  }
</style>
