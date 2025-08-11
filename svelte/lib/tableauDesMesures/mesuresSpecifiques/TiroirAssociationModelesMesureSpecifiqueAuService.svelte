<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import Toast from '../../ui/Toast.svelte';
  import Tableau from '../../ui/Tableau.svelte';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import CartoucheCategorieMesure from '../../ui/CartoucheCategorieMesure.svelte';
  import type { IdCategorie } from '../tableauDesMesures.d';
  import { tiroirStore } from '../../ui/stores/tiroir.store';

  export const titre: string = 'Ajouter des mesures depuis ma liste';
  export const sousTitre: string =
    'Sélectionnez des mesures que vous souhaitez ajouter à ce service.';
  export const taille = 'large';

  export let categories: Record<IdCategorie, string>;

  let idsModelesSelectionnes: string[] = [];

  const itemsFiltrageCategories = Object.entries(categories).map(
    ([id, label]) => ({
      libelle: label,
      valeur: id,
      idCategorie: 'categorie',
    })
  );
</script>

<ContenuTiroir>
  <div class="largeur-contrainte">
    <Toast
      avecOmbre={false}
      avecAnimation={false}
      titre="Une mesure ajoutée reçoit automatiquement le statut «&nbsp;À lancer&nbsp;»."
      niveau="info"
      contenu="Ce statut est obligatoire : il n’est pas possible d’ajouter une mesure sans statut."
    />
  </div>
  <Tableau
    colonnes={[
      { cle: 'description', libelle: 'Intitulé de la mesure' },
      { cle: 'descriptionLongue', libelle: 'Description' },
      { cle: 'categorie', libelle: 'Catégorie' },
    ]}
    donnees={$modelesMesureSpecifique}
    configurationRecherche={{
      champsRecherche: ['description', 'descriptionLongue'],
    }}
    configurationFiltrage={{
      options: {
        categories: [{ id: 'categorie', libelle: 'Catégories' }],
        items: itemsFiltrageCategories,
      },
    }}
    configurationSelection={{
      texteIndicatif: {
        vide: 'Aucune mesure sélectionnée',
        unique: 'mesure sélectionnée',
        multiple: 'mesures sélectionnées',
      },
      champSelection: 'id',
    }}
    bind:selection={idsModelesSelectionnes}
  >
    <svelte:fragment slot="cellule" let:donnee let:colonne>
      {@const { description, descriptionLongue, categorie } = donnee}
      {#if colonne.cle === 'description'}
        <b>{description}</b>
      {:else if colonne.cle === 'descriptionLongue'}
        {descriptionLongue}
      {:else if colonne.cle === 'categorie'}
        <CartoucheCategorieMesure {categorie} />
      {/if}
    </svelte:fragment>
  </Tableau>
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    on:click={() => tiroirStore.ferme()}
  />
</ActionsTiroir>

<style lang="scss">
  .largeur-contrainte {
    max-width: 600px;
  }

  :global(.texte-tiroir) {
    display: inherit !important;
  }
</style>
