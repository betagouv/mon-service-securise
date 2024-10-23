<script lang="ts">
  import type {
    Risque,
    ReferentielRisques,
    ReferentielGravites,
    ReferentielCategories,
    ReferentielVraisemblances,
  } from './risques.d';
  import TiroirRisque, {
    type ModeAffichageTiroir,
  } from './TiroirRisque.svelte';
  import LigneRisque from './LigneRisque.svelte';
  import { enregistreRisque } from './risque.api';
  import Bouton from '../ui/Bouton.svelte';
  import TiroirLegendeGravite from './TiroirLegendeGravite.svelte';
  import TiroirLegendeVraisemblance from './TiroirLegendeVraisemblance.svelte';
  import Avertissement from '../ui/Avertissement.svelte';
  import { risqueAMettreAJour } from './risques';
  import MatriceRisques from './MatriceRisques.svelte';

  export let idService: string;
  export let estLectureSeule: boolean;
  export let risques: Risque[];
  export let categories: ReferentielCategories;
  export let niveauxGravite: ReferentielGravites;
  export let niveauxVraisemblance: ReferentielVraisemblances;
  export let referentielRisques: ReferentielRisques;
  let tiroirRisqueOuvert = false;
  let tiroirLegendeGraviteOuvert = false;
  let tiroirLegendeVraisemblanceOuvert = false;
  let modeAffichageTiroir: ModeAffichageTiroir = '';
  let risqueEnEdition: Risque | undefined;

  const metAJourRisque = (risque: Risque) => {
    enregistreRisque(idService, risque);
    rafraichisRisqueDansLeTableau(risque);
  };

  const rafraichisRisqueDansLeTableau = (risque: Risque) => {
    risques[risques.findIndex((r) => r.id === risque.id)] = risque;
  };

  const supprimeRisqueDansTableau = (risque: Risque) => {
    risques = risques.filter((r) => r.id !== risque.id);
  };

  const ajouteRisqueDansTableau = (risque: Risque) => {
    risques = [...risques, risque];
  };

  const ouvreRisque = (risque: Risque) => {
    tiroirRisqueOuvert = true;
    modeAffichageTiroir = 'EDITION';
    risqueEnEdition = { ...risque };
  };

  const ouvreAjoutRisque = () => {
    tiroirRisqueOuvert = true;
    modeAffichageTiroir = 'AJOUT';
    risqueEnEdition = {
      type: 'SPECIFIQUE',
      categories: [],
      intitule: '',
      niveauVraisemblance: '',
      niveauGravite: '',
      commentaire: '',
      id: '',
      identifiantNumerique: '',
      description: '',
    };
  };

  $: doitAfficherAvertissement = risques.some(risqueAMettreAJour);
</script>

<MatriceRisques {risques} {niveauxGravite} {niveauxVraisemblance} />

<div class="entete-tableau-risques">
  <h3>Risques</h3>
  <Bouton
    type="primaire"
    titre="Ajouter un risque"
    icone="ajout"
    boutonSoumission={false}
    on:click={ouvreAjoutRisque}
  />
</div>
{#if doitAfficherAvertissement}
  <Avertissement
    niveau="avertissement"
    classeSupplementaire="avertissement-risques-specifiques"
  >
    <strong>Risques spécifiques à mettre à jour.</strong>
    <span
      >Suite à l'ajout de l'échelle de vraisemblance et de la catégorie sur les
      risques, nous vous invitons à mettre à jour les risques spécifiques que
      vous avez ajoutés afin de compléter les informations manquantes</span
    >
  </Avertissement>
{/if}
<table>
  <thead>
    <tr>
      <th>Identifiant</th>
      <th>Intitulé du risque</th>
      <th>
        <div class="entete-gravite">
          Gravité potentielle
          <button
            type="button"
            class="bouton-info"
            on:click={() => {
              tiroirLegendeGraviteOuvert = true;
            }}
          ></button>
        </div>
      </th>
      <th>
        <div class="entete-vraisemblance">
          Vraisemblance initiale
          <button
            type="button"
            class="bouton-info"
            on:click={() => {
              tiroirLegendeVraisemblanceOuvert = true;
            }}
          ></button>
        </div>
      </th>
    </tr>
  </thead>
  <tbody>
    {#each risques as risque (risque.id)}
      <LigneRisque
        {risque}
        on:click={() => ouvreRisque(risque)}
        {categories}
        {niveauxGravite}
        {niveauxVraisemblance}
        {estLectureSeule}
        on:metAJourRisque={() => metAJourRisque(risque)}
      />
    {/each}
  </tbody>
</table>

<TiroirLegendeGravite
  bind:ouvert={tiroirLegendeGraviteOuvert}
  referentielGravites={niveauxGravite}
/>

<TiroirLegendeVraisemblance
  bind:ouvert={tiroirLegendeVraisemblanceOuvert}
  referentielVraisemblances={niveauxVraisemblance}
/>

<TiroirRisque
  bind:ouvert={tiroirRisqueOuvert}
  risque={risqueEnEdition}
  referentielCategories={categories}
  {referentielRisques}
  referentielGravites={niveauxGravite}
  referentielVraisemblances={niveauxVraisemblance}
  {estLectureSeule}
  on:risqueMisAJour={(e) => rafraichisRisqueDansLeTableau(e.detail)}
  on:risqueSupprime={(e) => supprimeRisqueDansTableau(e.detail)}
  on:risqueAjoute={(e) => ajouteRisqueDansTableau(e.detail)}
  {modeAffichageTiroir}
  {idService}
/>

<style>
  h3 {
    text-align: left;
    margin: 0;
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

  .entete-tableau-risques {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 19px;
  }

  :global(.avertissement-risques-specifiques) {
    margin-top: 0;
    margin-bottom: 19px !important;
  }

  .entete-gravite,
  .entete-vraisemblance {
    display: flex;
    align-items: center;
  }

  .bouton-info {
    display: flex;
    border: none;
    background-color: transparent;
  }

  .bouton-info:before {
    content: '';
    display: inline-block;
    width: 18px;
    height: 18px;
    background-repeat: no-repeat;
    background-size: contain;
    background-image: url('/statique/assets/images/icone_information.svg');
    cursor: pointer;
    filter: brightness(0) saturate(100%) invert(44%) sepia(44%) saturate(243%)
      hue-rotate(176deg) brightness(96%) contrast(92%);
  }

  .entete-tableau-risques h3 {
    font-size: 1.25rem;
  }
</style>
