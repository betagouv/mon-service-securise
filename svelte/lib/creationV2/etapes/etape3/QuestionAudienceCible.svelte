<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = !!$leBrouillon.audienceCible;

  $: emetEvenement('champModifie', {
    audienceCible: $leBrouillon.audienceCible,
  });
</script>

<label for="statut-deploiement" class="titre-question">
  Quelle est l'audience cible du service ?*

  <span class="sous-titre-question">
    *En cas de socle technique (ex. système d'hébergement d'autres systèmes),
    l'audience doit être identifiée en prenant en compte l'audience de
    l'ensemble des systèmes utilisant ce socle.
  </span>

  <span class="indication">Sélectionnez une réponse</span>
  {#each Object.entries(questionsV2.audienceCible) as [idType, { nom, description }]}
    <Radio
      id={idType}
      {nom}
      exemple={description}
      bind:valeur={$leBrouillon.audienceCible}
    />
  {/each}
</label>

<style lang="scss">
  label {
    .sous-titre-question {
      margin-top: -8px;
      font-size: 0.75rem;
      line-height: 1.25rem;
      color: #666;
      font-weight: 400;
    }

    .indication {
      font-size: 0.75rem;
      line-height: 1.15rem;
      color: #666;
      font-weight: normal;
      margin-top: 8px;
    }
  }
</style>
