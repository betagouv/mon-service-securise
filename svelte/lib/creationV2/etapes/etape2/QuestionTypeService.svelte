<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from './CheckboxIllustree.svelte';

  export let estComplete: boolean;
  export let valeur: string[] = [];

  const illustrations: Record<keyof typeof questionsV2.typeDeService, string> =
    {
      api: 'api.svg',
      portailInformation: 'portailInformation.svg',
      serviceEnLigne: 'serviceEnLigne.svg',
      applicationMobile: 'applicationMobile.svg',
      autreSystemeInformation: 'autreSystemeInformation.svg',
    };

  const dispatch = createEventDispatcher<{ champModifie: string[] }>();

  $: if (valeur) dispatch('champModifie', valeur);

  $: estComplete = valeur.length > 0;

  const typesDeService = Object.entries(questionsV2.typeDeService) as [
    keyof typeof questionsV2.typeDeService,
    { nom: string; exemple: string },
  ][];
</script>

<label for="type-service">
  Quel est le type de service à sécuriser ?*

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>
  {#each typesDeService as [idType, details]}
    {@const nomImage = illustrations[idType]}
    <CheckboxIllustree
      id={idType}
      bind:valeurs={valeur}
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
