<script lang="ts">
  import type {
    Risque,
    ReferentielRisques,
    ReferentielGravites,
    ReferentielCategories,
    ReferentielVraisemblances,
    ReferentielNiveauxRisque,
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
  import LegendeMatriceRisques from './LegendeMatriceRisques.svelte';

  export let idService: string;
  export let estLectureSeule: boolean;
  export let risques: Risque[];
  export let categories: ReferentielCategories;
  export let niveauxGravite: ReferentielGravites;
  export let niveauxVraisemblance: ReferentielVraisemblances;
  export let referentielRisques: ReferentielRisques;
  export let niveauxRisque: ReferentielNiveauxRisque;
  let tiroirRisqueOuvert = false;
  let tiroirLegendeGraviteOuvert = false;
  let tiroirLegendeVraisemblanceOuvert = false;
  let modeAffichageTiroir: ModeAffichageTiroir = '';
  let risqueEnEdition: Risque | undefined;
  let triParGravite: Tri = 'aucun';

  type Tri = 'aucun' | 'ascendant' | 'descendant';

  const metAJourRisque = async (risque: Risque) => {
    const risqueMisAJour = await enregistreRisque(idService, risque);
    rafraichisRisqueDansLeTableau(risqueMisAJour);
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
      niveauRisque: '',
    };
  };

  const triSuivant = (triActuel: Tri): Tri => {
    switch (triActuel) {
      case 'aucun':
        return 'descendant';
      case 'descendant':
        return 'ascendant';
      case 'ascendant':
        return 'aucun';
    }
  };

  const triGravite = () => {
    triParGravite = triSuivant(triParGravite);
  };

  $: doitAfficherAvertissement = risques.some(risqueAMettreAJour);

  function comparateur(r1: Risque, r2: Risque): number {
    const n1 = r1.niveauGravite
      ? niveauxGravite[r1.niveauGravite].position
      : -1;
    const n2 = r2.niveauGravite
      ? niveauxGravite[r2.niveauGravite].position
      : -1;
    if (triParGravite === 'ascendant') {
      return n1 - n2;
    }
    if (triParGravite === 'descendant') {
      return n2 - n1;
    }
    return 0;
  }

  let risquesTries: Risque[];
  $: triParGravite, (risquesTries = [...risques].sort(comparateur));
</script>

<div class="au-dessus-tableau">
  <div class="section cartographie">
    <h2>Cartographie des risques</h2>
    <div class="contenu-section">
      <h3>Évalué au départ</h3>
      <div>
        <MatriceRisques
          {risques}
          {niveauxGravite}
          {niveauxVraisemblance}
          {niveauxRisque}
        />
      </div>
      <LegendeMatriceRisques />
    </div>
  </div>
</div>

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
          <button
            type="button"
            class={`bouton-tri tri-${triParGravite}`}
            on:click={triGravite}
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
    {#each risquesTries as risque (risque.id)}
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

  .bouton-tri:before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    background-repeat: no-repeat;
    background-size: contain;
    cursor: pointer;
    filter: brightness(0) saturate(100%) invert(44%) sepia(44%) saturate(243%)
      hue-rotate(176deg) brightness(96%) contrast(92%);
  }

  .bouton-tri {
    display: flex;
    border: none;
    background-color: transparent;
  }

  .bouton-tri.tri-aucun:before {
    background-image: url('/statique/assets/images/icone_tri_aucun.svg');
    filter: invert(49%) sepia(5%) saturate(2221%) hue-rotate(176deg)
      brightness(92%) contrast(84%);
  }

  .bouton-tri.tri-ascendant:before {
    background-image: url('/statique/assets/images/icone_tri_croissant.svg');
    filter: none;
  }

  .bouton-tri.tri-descendant:before {
    background-image: url('/statique/assets/images/icone_tri_decroissant.svg');
    filter: none;
  }

  .entete-tableau-risques h3 {
    font-size: 1.25rem;
  }

  .au-dessus-tableau {
    display: flex;
    text-align: left;
    margin-bottom: 35px;
  }

  .au-dessus-tableau .section {
    display: flex;
    flex-direction: column;
    gap: 23px;
  }

  .au-dessus-tableau h2 {
    font-weight: bold;
    font-size: 1.25rem;
    line-height: 1.75rem;
    margin: 0;
  }

  .au-dessus-tableau h3 {
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
    font-weight: 500;
  }

  .au-dessus-tableau .contenu-section {
    border: 1px solid var(--liseres-fonce);
    border-radius: 8px;
    padding: 35px 19px;
  }

  .cartographie .contenu-section div {
    padding: 16px 28px 20px 46px;
  }
</style>
