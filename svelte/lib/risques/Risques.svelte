<script lang="ts">
  import {
    type Risque,
    type ReferentielRisques,
    type ReferentielGravites,
    type ReferentielCategories,
    type ReferentielVraisemblances,
    type MatriceNiveauxRisque,
    type ReferentielNiveauxRisque,
    IdentifiantNiveauRisque,
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
  import BoutonIcone from '../ui/BoutonIcone.svelte';

  export let idService: string;
  export let estLectureSeule: boolean;
  export let risques: Risque[];
  export let categories: ReferentielCategories;
  export let niveauxGravite: ReferentielGravites;
  export let niveauxVraisemblance: ReferentielVraisemblances;
  export let referentielRisques: ReferentielRisques;
  export let matriceNiveauxRisque: MatriceNiveauxRisque;
  export let niveauxRisque: ReferentielNiveauxRisque;
  let tiroirRisqueOuvert = false;
  let tiroirLegendeGraviteOuvert = false;
  let tiroirLegendeVraisemblanceOuvert = false;
  let modeAffichageTiroir: ModeAffichageTiroir = '';
  let risqueEnEdition: Risque | undefined;
  let triParGravite: Tri = 'aucun';
  let triParVraisemblance: Tri = 'aucun';

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
    tiroirLegendeGraviteOuvert = false;
    tiroirLegendeVraisemblanceOuvert = false;
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
      niveauRisque: IdentifiantNiveauRisque.Indeterminable,
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

  const triVraisemblance = () => {
    triParVraisemblance = triSuivant(triParVraisemblance);
  };

  $: doitAfficherAvertissement = risques.some(risqueAMettreAJour);

  const compare = (risque1: Risque, risque2: Risque): number => {
    const positionGraviteRisque1 = risque1.niveauGravite
      ? niveauxGravite[risque1.niveauGravite].position
      : -1;
    const positionGraviteRisque2 = risque2.niveauGravite
      ? niveauxGravite[risque2.niveauGravite].position
      : -1;
    const positionVraisemblanceRisque1 = risque1.niveauVraisemblance
      ? niveauxVraisemblance[risque1.niveauVraisemblance].position
      : -1;
    const positionVraisemblanceRisque2 = risque2.niveauVraisemblance
      ? niveauxVraisemblance[risque2.niveauVraisemblance].position
      : -1;

    const laGraviteNaPasDimpactSurLeTri =
      triParGravite === 'aucun' ||
      positionGraviteRisque1 === positionGraviteRisque2;

    if (laGraviteNaPasDimpactSurLeTri && triParVraisemblance === 'ascendant') {
      return positionVraisemblanceRisque1 - positionVraisemblanceRisque2;
    }
    if (laGraviteNaPasDimpactSurLeTri && triParVraisemblance === 'descendant') {
      return positionVraisemblanceRisque2 - positionVraisemblanceRisque1;
    }
    if (triParGravite === 'ascendant') {
      return positionGraviteRisque1 - positionGraviteRisque2;
    }
    if (triParGravite === 'descendant') {
      return positionGraviteRisque2 - positionGraviteRisque1;
    }
    return 0;
  };

  let risquesTries: Risque[];
  $: triParGravite,
    triParVraisemblance,
    (risquesTries = [...risques].sort(compare));
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
          {matriceNiveauxRisque}
        />
      </div>
      <LegendeMatriceRisques {niveauxRisque} />
    </div>
  </div>
  <div class="section article">
    <h2>Besoin de comprendre ?</h2>
    <a
      target="_blank"
      rel="noopener"
      class="lien-article"
      href="/articles/realiser-une-analyse-de-risques-de-la-securite-du-service"
    >
      <div class="contenu-section">
        <p class="etiquette-section">Mise en œuvre des mesures de sécurité</p>
        <h6>Réaliser une analyse de risques de la sécurité du service</h6>
        <p>
          L'analyse de risques d'un service numérique ou un système
          d'information est une démarche essentielle de &hellip;
        </p>
        <span class="fleche-navigation"></span>
      </div>
    </a>
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
          <BoutonIcone
            icone="information"
            on:click={() => {
              tiroirLegendeGraviteOuvert = true;
              tiroirLegendeVraisemblanceOuvert = false;
              tiroirRisqueOuvert = false;
            }}
          />
          <BoutonIcone icone={`tri-${triParGravite}`} on:click={triGravite} />
        </div>
      </th>
      <th>
        <div class="entete-vraisemblance">
          Vraisemblance initiale
          <BoutonIcone
            icone="information"
            on:click={() => {
              tiroirLegendeVraisemblanceOuvert = true;
              tiroirLegendeGraviteOuvert = false;
              tiroirRisqueOuvert = false;
            }}
          />
          <BoutonIcone
            icone={`tri-${triParVraisemblance}`}
            on:click={triVraisemblance}
          />
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

  .entete-tableau-risques h3 {
    font-size: 1.25rem;
  }

  .au-dessus-tableau {
    display: flex;
    text-align: left;
    margin-bottom: 35px;
    gap: 24px;
  }

  .au-dessus-tableau .section {
    display: flex;
    flex-direction: column;
    gap: 23px;
  }

  .section.cartographie {
    flex: 1;
  }

  .fleche-navigation {
    content: '';
    background: url(/statique/assets/images/fleche_gauche_bleue.svg);
    width: 16px;
    height: 16px;
    transform: rotate(180deg);
    filter: brightness(0) saturate(100%) invert(12%) sepia(63%) saturate(4499%)
      hue-rotate(239deg) brightness(87%) contrast(141%);
    background-size: contain;
    position: absolute;
    bottom: 24px;
    right: 24px;
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

  a.lien-article {
    color: black;
    text-decoration: none;
    height: 100%;
    display: flex;
  }

  a.lien-article:hover {
    box-shadow: 0px 16px 32px 0px #0000001f;
  }

  h6 {
    color: var(--bleu-anssi);
    font-weight: bold;
    line-height: 1.75rem;
    font-size: 1.25rem;
    margin: 0;
    padding: 0;
  }

  p {
    margin: 0;
    padding: 0;
  }

  .etiquette-section {
    color: var(--violet-indice-cyber);
    background: #e9ddff;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    line-height: 20px;
    font-weight: 700;
    width: fit-content;
    margin: 0;
  }

  .section.article {
    width: 309px;
  }

  .section.article .contenu-section {
    display: flex;
    gap: 8px;
    flex-direction: column;
    position: relative;
  }
</style>
