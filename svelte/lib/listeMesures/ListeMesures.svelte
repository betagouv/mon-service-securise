<script lang="ts">
  import { onMount } from 'svelte';
  import type { MesureReferentiel } from '../ui/types.d';
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';

  let mesuresReferentiel: Record<string, MesureReferentiel> = {};

  onMount(async () => {
    const reponse = await axios.get<Record<string, MesureReferentiel>>(
      '/api/referentiel/mesures'
    );
    mesuresReferentiel = reponse.data;
  });
</script>

<table>
  <thead>
    <tr>
      <th>Intitulé de la mesure</th>
    </tr>
  </thead>
  <tbody>
    {#each Object.values(mesuresReferentiel) as mesure}
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
  }

  table {
    border-collapse: collapse;
    margin: 32px 0;
    width: 100%;

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
