<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = !!$leBrouillon.ouvertureSysteme;

  $: emetEvenement('champModifie', {
    ouvertureSysteme: $leBrouillon.ouvertureSysteme,
  });
</script>

<label for="statut-deploiement" class="titre-question">
  Quelle est l'ouverture du système ?*

  <span class="indication">Sélectionnez une réponse</span>
  {#each Object.entries(questionsV2.ouvertureSysteme) as [idType, { nom, exemple }]}
    <Radio
      id={idType}
      {nom}
      {exemple}
      bind:valeur={$leBrouillon.ouvertureSysteme}
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
