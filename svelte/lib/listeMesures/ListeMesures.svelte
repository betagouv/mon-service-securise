<script lang="ts">
  import AucunResultat from './AucunResultat.svelte';
  import { mesuresReferentielFiltrees } from './mesuresReferentielFiltrees.store';
  import LigneMesure from './LigneMesure.svelte';
  import { filtrageMesures } from './filtrageMesures.store';
  import { rechercheMesures } from './rechercheMesures.store';
  import BarreFiltres from './BarreFiltres.svelte';

  const effaceRechercheEtFiltres = () => {
    rechercheMesures.reinitialise();
    filtrageMesures.reinitialise();
  };

  const entetes = ['Intitulé de la mesure'];
</script>

<BarreFiltres />

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
