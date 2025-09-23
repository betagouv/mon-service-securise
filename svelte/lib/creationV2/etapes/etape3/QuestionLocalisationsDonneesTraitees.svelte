<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from '../etape2/CheckboxIllustree.svelte';
  import type {
    LocalisationDonneesTraitees,
    SpecificiteProjet,
  } from '../../creationV2.types';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = $leBrouillon.localisationsDonneesTraitees.length > 0;

  $: emetEvenement('champModifie', {
    localisationsDonneesTraitees: $leBrouillon.localisationsDonneesTraitees,
  });

  const illustrations: Record<LocalisationDonneesTraitees, string> = {
    UE: 'UE.svg',
    horsUE: 'horsUE.svg',
  };

  const localisationsDonneesTraitees = Object.entries(
    questionsV2.localisationDonneesTraitees
  ) as [LocalisationDonneesTraitees, { nom: string }][];
</script>

<label for="volumetrie-donnees" class="titre-question">
  Où sont localisées les données traitées ?*

  <span class="indication">Selectionnez une ou plusieurs réponses</span>
  {#each localisationsDonneesTraitees as [idType, details]}
    {@const illustration = `/statique/assets/images/localisationDonneesTraitees/${illustrations[idType]}`}
    <CheckboxIllustree
      id={idType}
      {illustration}
      {details}
      bind:valeurs={$leBrouillon.localisationsDonneesTraitees}
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
