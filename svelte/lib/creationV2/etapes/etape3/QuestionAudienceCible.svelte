<script lang="ts">
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { AudienceCible } from '../../creationV2.types';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  $effect(() => {
    estComplete = !!$leBrouillon.audienceCible;
  });

  const metsAJour: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChampModifie({
      audienceCible: e.currentTarget.value as AudienceCible,
    });
  };
</script>

<label for="statut-deploiement" class="titre-question">
  Quelle est l'audience cible du service ?*

  <span class="sous-titre-question">
    *En cas de socle technique (ex. système d'hébergement d'autres systèmes),
    l'audience doit être identifiée en prenant en compte l'audience de
    l'ensemble des systèmes utilisant ce socle.
  </span>

  <span class="indication">Sélectionnez une réponse</span>
  {#each Object.entries(questionsV2.audienceCible) as [idType, { nom, description }] (idType)}
    <Radio
      id={idType}
      {nom}
      exemple={description}
      bind:valeur={$leBrouillon.audienceCible}
      onchange={metsAJour}
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
