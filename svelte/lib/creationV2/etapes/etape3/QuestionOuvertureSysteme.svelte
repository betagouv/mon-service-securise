<script lang="ts">
  import { run } from 'svelte/legacy';

  import { createEventDispatcher } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';

  interface Props {
    estComplete: boolean;
  }

  let { estComplete = $bindable() }: Props = $props();

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  run(() => {
    estComplete = !!$leBrouillon.ouvertureSysteme;
  });

  run(() => {
    emetEvenement('champModifie', {
      ouvertureSysteme: $leBrouillon.ouvertureSysteme,
    });
  });
</script>

<label for="statut-deploiement" class="titre-question">
  Quelle est l'ouverture du système ?*

  <span class="indication">Sélectionnez une réponse</span>
  {#each Object.entries(questionsV2.ouvertureSysteme) as [idType, { nom, exemple }] (idType)}
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
