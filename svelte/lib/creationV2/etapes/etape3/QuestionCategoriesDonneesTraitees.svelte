<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from '../etape2/CheckboxIllustree.svelte';
  import type {
    CategorieDonneesTraitees,
    SpecificiteProjet,
  } from '../../creationV2.types';
  import ListeChampTexte from '../ListeChampTexte.svelte';

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

  // Pas de condition sur categoriesDonneesTraitees car ce n'est pas obligatoire d'en sélectionner.
  // N'avoir aucun categoriesDonneesTraiteesSupplémentaires est valide, donc on peut utiliser `every` qui renvoie `true` sur tableau vide.
  $: estComplete = $leBrouillon.categoriesDonneesTraiteesSupplementaires.every(
    (v) => (v ? v.trim().length > 0 : false)
  );

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
    emetEvenement('champModifie', {
      categoriesDonneesTraiteesSupplementaires:
        $leBrouillon.categoriesDonneesTraiteesSupplementaires,
    });
  };

  let valeurCategoriesDonneesTraitees: CategorieDonneesTraitees[] =
    $leBrouillon.categoriesDonneesTraitees;

  $: {
    if (
      valeurCategoriesDonneesTraitees !== $leBrouillon.categoriesDonneesTraitees
    ) {
      $leBrouillon.categoriesDonneesTraitees = valeurCategoriesDonneesTraitees;
      emetEvenement('champModifie', {
        categoriesDonneesTraitees: $leBrouillon.categoriesDonneesTraitees,
      });
    }
  }

  const categorieDonneesTraitees = Object.entries(
    questionsV2.categorieDonneesTraitees
  ) as [CategorieDonneesTraitees, { nom: string; exemple: string }][];
</script>

<label for="categories-donnees-traitees" class="titre-question">
  Quelles données sont traitées ?

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>

  {#each categorieDonneesTraitees as [idType, details]}
    {@const nomImage = illustrations[idType]}
    <CheckboxIllustree
      id={idType}
      nomGroupe="categories-donnees-traitees"
      illustration="/statique/assets/images/categorieDonneesTraitees/{nomImage}"
      {details}
      bind:valeurs={valeurCategoriesDonneesTraitees}
    />
  {/each}
  <label
    for="categoriesDonneesTraiteesSupplementaires"
    class="titre-liste-donnees-supplementaires"
  >
    <span>Nom de la donnée</span>

    <ListeChampTexte
      nomGroupe="categoriesDonneesTraiteesSupplementaires"
      bind:valeurs={$leBrouillon.categoriesDonneesTraiteesSupplementaires}
      on:ajout={ajouteValeur}
      titreSuppression="Supprimer la donnée"
      titreAjout="Ajouter des données"
      on:blur={() => enregistre()}
      on:suppression={async (e) => {
        supprimeValeur(e.detail);
        await tick();
        if (estComplete) enregistre();
      }}
    />
  </label>
</label>

<style lang="scss">
  .titre-liste-donnees-supplementaires {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;

    span {
      margin-bottom: -8px;
    }
  }
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
