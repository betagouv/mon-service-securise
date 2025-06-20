<script lang="ts">
  import { CategorieMesure, Referentiel } from '../ui/types.d';
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';
  import ListeDeroulanteRiche from '../ui/ListeDeroulanteRiche.svelte';
  import AucunResultat from './AucunResultat.svelte';
  import LigneMesure from './LigneMesure.svelte';
  import { filtrageMesures } from './filtrageMesures.store';
  import { mesuresReferentielFiltrees } from './mesuresReferentielFiltrees.store';
  import { rechercheMesures } from './rechercheMesures.store';

  const effaceRechercheEtFiltres = () => {
    rechercheMesures.reinitialise();
    filtrageMesures.reinitialise();
  };

  const entetes = ['Intitulé de la mesure'];

  let itemsFiltre: { libelle: string; valeur: string; idCategorie: string }[] =
    [
      {
        libelle: 'ANSSI',
        valeur: Referentiel.ANSSI,
        idCategorie: 'referentiel',
      },
      {
        libelle: 'CNIL',
        valeur: Referentiel.CNIL,
        idCategorie: 'referentiel',
      },
      {
        libelle: 'Défense',
        valeur: CategorieMesure.DEFENSE,
        idCategorie: 'categories',
      },
      {
        libelle: 'Gouvernance',
        valeur: CategorieMesure.GOUVERNANCE,
        idCategorie: 'categories',
      },
      {
        libelle: 'Protection',
        valeur: CategorieMesure.PROTECTION,
        idCategorie: 'categories',
      },
      {
        libelle: 'Résilience',
        valeur: CategorieMesure.RESILIENCE,
        idCategorie: 'categories',
      },
    ];
</script>

<div class="filtres">
  <BarreDeRecherche bind:recherche={$rechercheMesures} />
  <ListeDeroulanteRiche
    bind:valeursSelectionnees={$filtrageMesures}
    id="filtres"
    libelle="Filtrer"
    options={{
      categories: [
        { id: 'referentiel', libelle: 'Référentiel' },
        { id: 'categories', libelle: 'Catégories' },
      ],
      items: itemsFiltre,
    }}
  />
</div>

<table>
  <thead>
    <tr>
      {#each entetes as entete}
        <th>{entete}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each Object.values($mesuresReferentielFiltrees) as mesure}
      <LigneMesure {mesure} />
    {/each}
    {#if Object.keys($mesuresReferentielFiltrees).length === 0}
      <tr>
        <td colspan={entetes.length}>
          <AucunResultat on:click={effaceRechercheEtFiltres} />
        </td>
      </tr>
    {/if}
  </tbody>
</table>

<style lang="scss">
  :global(#liste-mesures) {
    text-align: left;
    width: 100%;
    max-width: 1200px;
    margin: 32px 0;
  }

  .filtres {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 24px;

    thead {
      border: 1px solid #dddddd;

      th {
        padding: 8px 16px;
        color: #666666;
        font-size: 0.875rem;
        font-weight: bold;
        line-height: 1.5rem;
      }
    }
  }
</style>
