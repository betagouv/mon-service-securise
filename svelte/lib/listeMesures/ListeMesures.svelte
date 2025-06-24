<script lang="ts">
  import AucunResultat from './kit/AucunResultat.svelte';
  import { mesuresReferentielFiltrees } from './stores/mesuresReferentielFiltrees.store';
  import LigneMesure from './kit/LigneMesure.svelte';
  import { filtrageMesures } from './stores/filtrageMesures.store';
  import { rechercheMesures } from './stores/rechercheMesures.store';
  import BarreFiltres from './kit/BarreFiltres.svelte';
  import { servicesAvecMesuresAssociees } from './stores/servicesAvecMesuresAssociees.store';
  import { onMount } from 'svelte';
  import DetailsMesure from './kit/DetailsMesure.svelte';
  import type { MesureReferentiel, ReferentielStatut } from '../ui/types';

  export let statuts: ReferentielStatut;

  const effaceRechercheEtFiltres = () => {
    rechercheMesures.reinitialise();
    filtrageMesures.reinitialise();
  };

  onMount(() => {
    servicesAvecMesuresAssociees.rafraichis();
  });

  const entetes = ['Intitulé de la mesure', 'Services associés', 'Action'];

  let modaleDetailsMesure: DetailsMesure;

  const afficheModaleDetailsMesure = (mesure: MesureReferentiel) => {
    modaleDetailsMesure.affiche(mesure);
  };
</script>

<DetailsMesure bind:this={modaleDetailsMesure} referentielStatuts={statuts} />

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
      <LigneMesure
        {mesure}
        on:servicesCliques={() => afficheModaleDetailsMesure(mesure)}
        {statuts}
      />
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

    tbody {
      border: 1px solid #dddddd;
    }
  }
</style>
