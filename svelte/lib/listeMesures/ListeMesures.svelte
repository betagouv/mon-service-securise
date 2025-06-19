<script lang="ts">
  import { onMount } from 'svelte';
  import type { MesureReferentiel } from '../ui/types.d';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';
  import BarreDeRecherche from '../ui/BarreDeRecherche.svelte';

  let mesuresReferentiel: Record<string, MesureReferentiel> = {};
  let recherche = '';
  let mesuresVisibles: Record<string, MesureReferentiel> = {};

  onMount(async () => {
    const reponse = await axios.get<Record<string, MesureReferentiel>>(
      '/api/referentiel/mesures'
    );
    mesuresReferentiel = reponse.data;
  });

  $: {
    mesuresVisibles = Object.fromEntries(
      Object.entries(mesuresReferentiel).filter(
        ([_, mesure]) =>
          mesure.description.toLowerCase().includes(recherche.toLowerCase()) ||
          mesure.identifiantNumerique.includes(recherche)
      )
    );
  }
</script>

<div class="filtres">
  <BarreDeRecherche bind:recherche />
</div>

<table>
  <thead>
    <tr>
      <th>Intitulé de la mesure</th>
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
  </tbody>
</table>

<style lang="scss">
  :global(#liste-mesures) {
    text-align: left;
    width: 100%;
    max-width: 1200px;
    margin: 32px 0;
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
