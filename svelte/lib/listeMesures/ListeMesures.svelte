<script lang="ts">
  import { onMount } from 'svelte';
  import {
    CategorieMesure,
    type MesureReferentiel,
    Referentiel,
  } from '../ui/types.d';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';
  import ListeDeroulanteRiche from '../ui/ListeDeroulanteRiche.svelte';
  import AucunResultat from './AucunResultat.svelte';

  let mesuresReferentiel: Record<string, MesureReferentiel> = {};
  let recherche = '';
  let mesuresVisibles: Record<string, MesureReferentiel> = {};
  let filtrageMesures: Record<string, string[]> = {};

  onMount(async () => {
    const reponse = await axios.get<Record<string, MesureReferentiel>>(
      '/api/referentiel/mesures'
    );
    mesuresReferentiel = reponse.data;
  });

  const effaceRechercheEtFiltres = () => {
    recherche = '';
    filtrageMesures = {};
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

  $: {
    mesuresVisibles = Object.fromEntries(
      Object.entries(mesuresReferentiel).filter(
        ([_, mesure]) =>
          mesure.description.toLowerCase().includes(recherche.toLowerCase()) ||
          mesure.identifiantNumerique.includes(recherche)
      )
    );
    if (filtrageMesures.categories?.length > 0) {
      mesuresVisibles = Object.fromEntries(
        Object.entries(mesuresVisibles).filter(([_, mesure]) =>
          filtrageMesures.categories.includes(mesure.categorie)
        )
      );
    }
    if (filtrageMesures.referentiel?.length > 0) {
      mesuresVisibles = Object.fromEntries(
        Object.entries(mesuresVisibles).filter(([_, mesure]) =>
          filtrageMesures.referentiel.includes(mesure.referentiel)
        )
      );
    }
  }
</script>

<div class="filtres">
  <BarreDeRecherche bind:recherche />
  <ListeDeroulanteRiche
    bind:valeursSelectionnees={filtrageMesures}
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
    {#each Object.values(mesuresVisibles) as mesure}
      <tr>
        <td>
          <div>
            <span>{mesure.description}</span>
            <div>
              <CartoucheReferentiel referentiel={mesure.referentiel} />
              <CartoucheCategorieMesure categorie={mesure.categorie} />
              <CartoucheIdentifiantMesure
                identifiant={mesure.identifiantNumerique}
              />
            </div>
          </div>
        </td>
      </tr>
    {/each}
    {#if Object.keys(mesuresVisibles).length === 0}
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

    tbody {
      td {
        padding: 8px 16px;
        border: 1px solid #dddddd;

        & > div {
          display: flex;
          flex-direction: column;
          gap: 8px;

          span {
            font-size: 0.875rem;
            font-weight: bold;
            line-height: 1.5rem;
          }

          div {
            display: flex;
            flex-direction: row;
            gap: 8px;
          }
        }
      }
    }
  }
</style>
