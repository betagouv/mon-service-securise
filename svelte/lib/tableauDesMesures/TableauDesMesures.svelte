<script lang="ts">
  import type {
    IdCategorie,
    IdService,
    IdStatut,
    MesureGenerale,
    MesureSpecifique,
  } from './tableauDesMesures.d';
  import LigneMesure from './ligne/LigneMesure.svelte';
  import {
    recupereMesures,
    enregistreMesures,
    metEnFormeMesures,
  } from './tableauDesMesures.api';
  import { onMount } from 'svelte';
  import { Referentiel } from '../ui/types.d';
  import {
    mesures,
    rechercheTextuelle,
    mesuresFiltrees,
    nombreResultats,
    rechercheCategorie,
    rechercheStatut,
  } from './tableauDesMesures.store';
  import MenuFlottant from '../ui/MenuFlottant.svelte';

  enum EtatEnregistrement {
    Jamais,
    EnCours,
    Fait,
  }

  const { Jamais, EnCours, Fait } = EtatEnregistrement;

  export let idService: IdService;
  export let categories: Record<IdCategorie, string>;
  export let statuts: Record<IdStatut, string>;
  export let estLectureSeule: boolean;

  const rafraichisMesures = async () =>
    mesures.reinitialise(await recupereMesures(idService));
  onMount(rafraichisMesures);

  let etatEnregistrement: EtatEnregistrement = Jamais;
  const metAJourMesures = async () => {
    etatEnregistrement = EnCours;
    await enregistreMesures(idService, $mesures);
    etatEnregistrement = Fait;
    document.body.dispatchEvent(new CustomEvent('mesure-modifiee'));
  };

  type MesureAEditer = {
    mesure: MesureSpecifique | MesureGenerale;
    metadonnees: {
      typeMesure: 'GENERALE' | 'SPECIFIQUE';
      idMesure: string | number;
    };
  };
  const afficheTiroirDeMesure = (mesureAEditer?: MesureAEditer) => {
    document.body.dispatchEvent(
      new CustomEvent('svelte-affiche-tiroir-ajout-mesure-specifique', {
        detail: {
          mesuresExistantes: metEnFormeMesures($mesures),
          titreTiroir:
            mesureAEditer && mesureAEditer.metadonnees.typeMesure === 'GENERALE'
              ? mesureAEditer.mesure.description
              : '',
          ...(mesureAEditer && { mesureAEditer }),
        },
      })
    );
  };

  const effaceFiltres = () => {
    rechercheCategorie.set([]);
    rechercheStatut.set([]);
  };
</script>

<svelte:body on:mesure-modifiee={rafraichisMesures} />
<div class="barre-filtres">
  <label for="recherche">
    Rechercher
    <input
      type="search"
      id="recherche"
      bind:value={$rechercheTextuelle}
      placeholder="ex : chiffrer, sauvegarde, données..."
    />
  </label>
  <MenuFlottant>
    <div slot="declencheur">
      <button class="bouton bouton-secondaire bouton-filtre">
        <img src="/statique/assets/images/icone_filtre.svg" />
        Filtres
      </button>
    </div>

    <div class="filtres-disponibles">
      <div class="titre-filtres">
        <img src="/statique/assets/images/icone_filtre.svg" />
        Filtres
      </div>
      <fieldset>
        <legend>Catégories de cybersécurité</legend>
        {#each Object.entries(categories) as [id, categorie]}
          <div>
            <input
              type="checkbox"
              {id}
              name={id}
              bind:group={$rechercheCategorie}
              value={id}
            />
            <label for={id}>{categorie}</label>
          </div>
        {/each}
      </fieldset>
      <fieldset>
        <legend>Statut</legend>
        {#each Object.entries( { ...statuts, nonRenseignee: 'Non renseignée' } ) as [id, statut]}
          <div>
            <input
              type="checkbox"
              {id}
              name={id}
              bind:group={$rechercheStatut}
              value={id}
            />
            <label for={id}>{statut}</label>
          </div>
        {/each}
      </fieldset>
      <button
        class="bouton bouton-secondaire bouton-effacer-filtre"
        on:click={effaceFiltres}
      >
        Effacer les filtres
      </button>
    </div>
  </MenuFlottant>
</div>
{#if !estLectureSeule}
  <div class="barre-actions">
    <button class="bouton" on:click={() => afficheTiroirDeMesure()}>
      Ajouter une mesure
    </button>
    {#if etatEnregistrement === EnCours}
      <p class="enregistrement-en-cours">Enregistrement en cours ...</p>
    {/if}
    {#if etatEnregistrement === Fait}
      <p class="enregistrement-termine">Enregistré</p>
    {/if}
  </div>
{/if}
<div class="tableau-des-mesures">
  {#if $nombreResultats.aucunResultat}
    <div class="aucun-resultat">
      Aucune mesure ne correspond à la recherche.
    </div>
  {:else}
    {#each Object.entries($mesuresFiltrees.mesuresGenerales) as [id, mesure] (id)}
      <LigneMesure
        {id}
        referentiel={Referentiel.ANSSI}
        indispensable={mesure.indispensable}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        referentielStatuts={statuts}
        bind:mesure={$mesures.mesuresGenerales[id]}
        on:modificationStatut={metAJourMesures}
        on:click={() =>
          afficheTiroirDeMesure({
            mesure,
            metadonnees: {
              typeMesure: 'GENERALE',
              idMesure: id,
            },
          })}
        {estLectureSeule}
      />
    {/each}
    {#each $mesuresFiltrees.mesuresSpecifiques as mesure, index (index)}
      {@const indexReel = $mesures.mesuresSpecifiques.indexOf(mesure)}
      <LigneMesure
        id={`specifique-${index}`}
        referentiel={Referentiel.SPECIFIQUE}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        referentielStatuts={statuts}
        bind:mesure={$mesures.mesuresSpecifiques[indexReel]}
        on:modificationStatut={metAJourMesures}
        on:click={() =>
          afficheTiroirDeMesure({
            mesure,
            metadonnees: { typeMesure: 'SPECIFIQUE', idMesure: indexReel },
          })}
        {estLectureSeule}
      />
    {/each}
  {/if}
</div>

<style>
  .barre-filtres {
    display: flex;
    flex-direction: row;
    margin-bottom: 1em;
    gap: 16px;
  }

  label[for='recherche'] {
    font-weight: bold;
  }

  #recherche {
    margin-left: 16px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    color: #667892;
    padding: 8px 16px;
    min-width: 300px;
  }

  .barre-actions {
    display: flex;
    align-items: center;
    gap: 1em;
    padding: 1em 0;
  }

  .barre-actions p {
    margin: 0;
  }

  .enregistrement-en-cours,
  .enregistrement-termine {
    font-size: 1.1em;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .enregistrement-en-cours:before,
  .enregistrement-termine:before {
    content: '';
    display: flex;
    width: 24px;
    height: 24px;
    background-size: contain;
    background-repeat: no-repeat;
  }

  .enregistrement-en-cours {
    color: #0c5c98;
  }

  .enregistrement-termine {
    color: #0e972b;
  }

  .enregistrement-en-cours:before {
    background-image: url('/statique/assets/images/icone_enregistrement_en_cours.svg');
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    100% {
      transform: rotate(360deg);
    }
  }

  .enregistrement-termine:before {
    background-image: url('/statique/assets/images/icone_enregistrement_termine.svg');
  }

  .bouton {
    margin: 0;
    padding: 0.5em 1em;
    font-weight: 500;
  }

  .aucun-resultat {
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 9px 0;
  }

  .bouton-filtre {
    display: flex;
    gap: 8px;
  }

  .titre-filtres {
    display: flex;
    gap: 8px;
    padding: calc(0.5em + 1px) calc(1em - 16px + 1px);
    font-weight: 500;
    color: #08416a;
    margin-bottom: 8px;
  }

  .titre-filtres img {
    filter: brightness(0) invert(16%) sepia(87%) saturate(1447%)
      hue-rotate(183deg) brightness(91%) contrast(94%);
  }

  .filtres-disponibles {
    width: 260px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: white;
    padding: 0 16px 24px 16px;
  }

  .filtres-disponibles fieldset {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    margin: 0 0 24px;
  }

  :global(.svelte-menu-flottant) {
    transform: translate(0, -1px) !important;
  }

  .bouton-effacer-filtre {
    margin-top: 8px;
  }
</style>
