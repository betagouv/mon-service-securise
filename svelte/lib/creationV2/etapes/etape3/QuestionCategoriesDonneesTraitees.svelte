<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from '../etape2/CheckboxIllustree.svelte';
  import type {
    CategorieDonneesTraitees,
    SpecificiteProjet,
  } from '../../creationV2.types';

  export let estComplete: boolean;

  const illustrations: Record<CategorieDonneesTraitees, string> = {
    documentsIdentifiants: 'documentsIdentifiants.svg',
    donneesAdministrativesEtFinancieres:
      'donneesAdministrativesEtFinancieres.svg',
    donneesCaracterePersonnelPersonneARisque:
      'donneesCaracterePersonnelPersonneARisque.svg',
    donneesDIdentite: 'donneesDIdentite.svg',
    donneesSituationFamilialeEconomiqueFinanciere:
      'donneesSituationFamilialeEconomiqueFinanciere.svg',
    donneesTechniques: 'donneesTechniques.svg',
    secretsDEntreprise: 'secretsDEntreprise.svg',
    documentsRHSensibles: 'documentsRHSensibles.svg',
    donneesSensibles: 'donneesSensibles.svg',
  };

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  estComplete = true;

  $: emetEvenement('champModifie', {
    categoriesDonneesTraitees: $leBrouillon.categoriesDonneesTraitees,
  });

  const categorieDonneesTraitees = Object.entries(
    questionsV2.categorieDonneesTraitees
  ) as [CategorieDonneesTraitees, { nom: string; exemple: string }][];
</script>

<label for="duree-dysfonctionnement-acceptable" class="titre-question">
  Quelles données sont traitées ?

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>

  {#each categorieDonneesTraitees as [idType, details]}
    {@const nomImage = illustrations[idType]}
    <CheckboxIllustree
      illustration="/statique/assets/images/categorieDonneesTraitees/{nomImage}"
      id={idType}
      {details}
      bind:valeurs={$leBrouillon.categoriesDonneesTraitees}
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
