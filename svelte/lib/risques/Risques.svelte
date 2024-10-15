<script lang="ts">
  import type {
    Risque,
    ReferentielRisques,
    ReferentielGravites,
  } from './risques.d';
  import TiroirRisque from './TiroirRisque.svelte';
  import LigneRisque from './LigneRisque.svelte';

  export let idService: string;
  export let estLectureSeule: boolean;
  export let risques: Risque[];
  export let categories: Record<string, string>;
  export let niveauxGravite: ReferentielGravites;
  export let referentielRisques: ReferentielRisques;
  let tiroirOuvert = false;
  let risqueEnEdition: Risque | undefined;

  const metAJourRisque = async (risque: Risque) => {
    if (risque.type === 'GENERAL')
      await axios.put(`/api/service/${idService}/risques/${risque.id}`, {
        niveauGravite: risque.niveauGravite,
        commentaire: risque.commentaire,
      });
    else
      await axios.put(
        `/api/service/${idService}/risquesSpecifiques/${risque.id}`,
        {
          niveauGravite: risque.niveauGravite,
          commentaire: risque.commentaire,
          intitule: risque.intitule,
          categories: risque.categories,
        }
      );
  };

  const ouvreRisque = (risque: Risque) => {
    if (risque.type === 'GENERAL') {
      tiroirOuvert = true;
      risqueEnEdition = risque;
    }
  };
</script>

<h3>Risques</h3>
<table>
  <thead>
    <tr>
      <th>Identifiant</th>
      <th>Intitulé du risque</th>
      <th>Gravité potentielle</th>
    </tr>
  </thead>
  <tbody>
    {#each risques as risque (risque.id)}
      <LigneRisque
        {risque}
        on:click={() => ouvreRisque(risque)}
        {categories}
        {niveauxGravite}
        {estLectureSeule}
        on:metAJourRisque={() => metAJourRisque(risque)}
      />
    {/each}
  </tbody>
</table>

<TiroirRisque
  bind:ouvert={tiroirOuvert}
  risque={risqueEnEdition}
  referentielCategories={categories}
  {referentielRisques}
  referentielGravites={niveauxGravite}
  {estLectureSeule}
  on:metsAJourRisque={(e) => metAJourRisque(e.detail)}
/>

<style>
  h3 {
    text-align: left;
  }

  table {
    border-collapse: collapse;
    border: 1px solid #cbd5e1;
    text-align: left;
  }

  th {
    color: var(--texte-clair);
    font-size: 13px;
    font-weight: 500;
  }

  thead th {
    padding: 14px 24px;
    white-space: nowrap;
  }

  thead tr th:first-of-type {
    padding-left: 24px;
  }

  thead tr th:last-of-type {
    padding-right: 24px;
  }

  tr {
    border: 1px solid #cbd5e1;
  }
</style>
