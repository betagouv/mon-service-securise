<script lang="ts">
  import { tick } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from '../etape2/CheckboxIllustree.svelte';
  import type { CategorieDonneesTraitees } from '../../creationV2.types';
  import ListeChampTexte from '../ListeChampTexte.svelte';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let { estComplete = $bindable(), onChampModifie }: Props = $props();

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

  $effect(() => {
    estComplete =
      $leBrouillon.categoriesDonneesTraiteesSupplementaires.length === 0 ||
      $leBrouillon.categoriesDonneesTraiteesSupplementaires.every(
        (c) => c.length <= 200
      );
  });

  const supprimeValeur = (index: number) => {
    $leBrouillon.categoriesDonneesTraiteesSupplementaires =
      $leBrouillon.categoriesDonneesTraiteesSupplementaires.filter(
        (_, i) => i !== index
      );
  };

  const ajouteValeur = () => {
    $leBrouillon.categoriesDonneesTraiteesSupplementaires = [
      ...$leBrouillon.categoriesDonneesTraiteesSupplementaires,
      '',
    ];
  };

  const enregistre = () => {
    onChampModifie({
      categoriesDonneesTraiteesSupplementaires:
        $leBrouillon.categoriesDonneesTraiteesSupplementaires.filter(
          (c) => c.trim().length > 0
        ),
    });
  };

  let valeurCategoriesDonneesTraitees: CategorieDonneesTraitees[] = $state(
    $leBrouillon.categoriesDonneesTraitees
  );

  $effect(() => {
    if (
      valeurCategoriesDonneesTraitees !== $leBrouillon.categoriesDonneesTraitees
    ) {
      $leBrouillon.categoriesDonneesTraitees = valeurCategoriesDonneesTraitees;
      onChampModifie({
        categoriesDonneesTraitees: $leBrouillon.categoriesDonneesTraitees,
      });
    }
  });

  const categorieDonneesTraitees = Object.entries(
    questionsV2.categorieDonneesTraitees
  ) as [CategorieDonneesTraitees, { nom: string; exemple: string }][];
</script>

<div>
  <span class="titre-question">Quelles données sont traitées ?</span>

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>
  <fieldset>
    <legend>Données traitées</legend>
    {#each categorieDonneesTraitees as [idType, details] (idType)}
      {@const nomImage = illustrations[idType]}
      <CheckboxIllustree
        id={idType}
        nomGroupe="categories-donnees-traitees"
        illustration="/statique/assets/images/categorieDonneesTraitees/{nomImage}"
        {details}
        bind:valeurs={valeurCategoriesDonneesTraitees}
      />
    {/each}
  </fieldset>
  <fieldset class="titre-liste-donnees-supplementaires">
    <legend
      class:visible={$leBrouillon.categoriesDonneesTraiteesSupplementaires
        ?.length > 0}>Nom de la donnée</legend
    >

    <ListeChampTexte
      nomGroupe="categoriesDonneesTraiteesSupplementaires"
      libelleAccessibilite="Données traitées supplémentaires"
      bind:valeurs={$leBrouillon.categoriesDonneesTraiteesSupplementaires}
      onAjout={ajouteValeur}
      titreSuppression="Supprimer la donnée"
      titreAjout="Ajouter des données"
      limiteTaille={200}
      onblur={() => enregistre()}
      onSuppression={async (index) => {
        supprimeValeur(index);
        await tick();
        if (estComplete) enregistre();
      }}
    />
  </fieldset>
</div>

<style lang="scss">
  .titre-liste-donnees-supplementaires {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
  }
  div {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 586px;

    .indication {
      font-size: 0.75rem;
      line-height: 1.15rem;
      color: #666;
      font-weight: normal;
      margin-top: 8px;
    }

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

      legend.visible {
        display: block;
        margin: 0 0 8px;
        padding: 0;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5rem;
      }
    }
  }
</style>
