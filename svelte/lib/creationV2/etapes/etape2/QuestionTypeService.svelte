<script lang="ts">
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from './CheckboxIllustree.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import type { TypeService } from '../../creationV2.types';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  // eslint-disable-next-line no-useless-assignment
  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  const illustrations: Record<TypeService, string> = {
    api: 'api.svg',
    portailInformation: 'portailInformation.svg',
    serviceEnLigne: 'serviceEnLigne.svg',
    applicationMobile: 'applicationMobile.svg',
    autreSystemeInformation: 'autreSystemeInformation.svg',
  };

  $effect(() => {
    estComplete = $leBrouillon.typeService.length > 0;
  });

  $effect(() => {
    onChampModifie({ typeService: $leBrouillon.typeService });
  });

  const typesDeService = Object.entries(questionsV2.typeDeService) as [
    TypeService,
    { nom: string; exemple: string },
  ][];
</script>

<div>
  <span class="titre-question">
    Quel est le type de service à sécuriser ?*
  </span>

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>
  <fieldset>
    <legend>Type de service</legend>
    {#each typesDeService as [idType, details] (idType)}
      {@const nomImage = illustrations[idType]}
      <CheckboxIllustree
        id={idType}
        nomGroupe="type-service"
        bind:valeurs={$leBrouillon.typeService}
        {details}
        illustration="/statique/assets/images/typesService/{nomImage}"
      />
    {/each}
  </fieldset>
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 586px;

    fieldset {
      border: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;

      legend {
        display: none;
      }
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
