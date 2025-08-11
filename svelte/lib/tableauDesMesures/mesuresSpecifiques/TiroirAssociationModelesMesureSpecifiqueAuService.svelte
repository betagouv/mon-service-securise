<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import Toast from '../../ui/Toast.svelte';
  import Tableau from '../../ui/Tableau.svelte';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import CartoucheCategorieMesure from '../../ui/CartoucheCategorieMesure.svelte';
  import type { IdCategorie } from '../tableauDesMesures.d';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import SeparateurHorizontal from '../../ui/SeparateurHorizontal.svelte';

  export const titre: string = 'Ajouter des mesures depuis ma liste';
  export const sousTitre: string =
    'Sélectionnez des mesures que vous souhaitez ajouter à ce service.';
  export const taille = 'large';

  export let categories: Record<IdCategorie, string>;

  let etapeCourante: 1 | 2 = 1;
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
  {#if etapeCourante === 1}
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
  {:else}
    {@const pluralise = idsModelesSelectionnes.length > 1 ? 's' : ''}
    <div class="largeur-contrainte">
      <Toast
        avecOmbre={false}
        avecAnimation={false}
        titre="Cette action peut avoir un impact significatif."
        niveau="info"
        contenu="Vous vous apprêtez à associer <b>{idsModelesSelectionnes.length} mesure{pluralise}</b> à ce service. Cela aura un impact sur son indice cyber personnalisé."
      />
    </div>
    <SeparateurHorizontal />
    <h4>
      {idsModelesSelectionnes.length} mesure{pluralise} concernée{pluralise} par
      cette modification
    </h4>
    <Tableau
      colonnes={[
        { cle: 'description', libelle: 'Intitulé de la mesure' },
        { cle: 'descriptionLongue', libelle: 'Description' },
        { cle: 'categorie', libelle: 'Catégorie' },
      ]}
      donnees={$modelesMesureSpecifique.filter((m) =>
        idsModelesSelectionnes.includes(m.id)
      )}
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
  {/if}
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    on:click={() => tiroirStore.ferme()}
  />
  {#if etapeCourante === 1}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      variante="primaire"
      taille="md"
      titre={`Ajouter ${
        idsModelesSelectionnes.length > 1 ? 'ces mesures' : 'cette mesure'
      } à mon service`}
      icone="add-line"
      position-icone="gauche"
      on:click={() => (etapeCourante = 2)}
      actif={idsModelesSelectionnes.length > 0}
    />
  {/if}
</ActionsTiroir>

<style lang="scss">
  .largeur-contrainte {
    max-width: 600px;
  }

  :global(.texte-tiroir) {
    display: inherit !important;
  }

  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.75rem;
    margin: 0;
    max-width: 550px;
  }
</style>
