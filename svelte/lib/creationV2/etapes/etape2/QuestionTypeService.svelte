<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from './CheckboxIllustree.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import type { TypeService } from '../../creationV2.types';

  interface Props {
    estComplete: boolean;
  }

  let { estComplete = $bindable() }: Props = $props();

  const illustrations: Record<TypeService, string> = {
    api: 'api.svg',
    portailInformation: 'portailInformation.svg',
    serviceEnLigne: 'serviceEnLigne.svg',
    applicationMobile: 'applicationMobile.svg',
    autreSystemeInformation: 'autreSystemeInformation.svg',
  };

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $effect(() => {
    estComplete = $leBrouillon.typeService.length > 0;
  });

  $effect(() => {
    emetEvenement('champModifie', { typeService: $leBrouillon.typeService });
  });

  const typesDeService = Object.entries(questionsV2.typeDeService) as [
    TypeService,
    { nom: string; exemple: string },
  ][];
</script>

<label for="type-service" class="titre-question">
  Quel est le type de service à sécuriser ?*

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>
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
