<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = !!$leBrouillon.dureeDysfonctionnementAcceptable;

  $: emetEvenement('champModifie', {
    dureeDysfonctionnementAcceptable:
      $leBrouillon.dureeDysfonctionnementAcceptable,
  });
</script>

<label for="duree-dysfonctionnement-acceptable" class="titre-question">
  Quelle serait la durée maximale acceptable de dysfonctionnement du système ?*

  <span class="indication">Sélectionnez une réponse</span>
  {#each Object.entries(questionsV2.dureeDysfonctionnementAcceptable) as [idType, { nom }]}
    <Radio
      id={idType}
      {nom}
      bind:valeur={$leBrouillon.dureeDysfonctionnementAcceptable}
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
