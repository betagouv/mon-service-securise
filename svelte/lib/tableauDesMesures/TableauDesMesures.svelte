<script lang="ts">
  import type {
    IdCategorie,
    IdMesureGenerale,
    IdService,
    IdStatut,
    MesureGenerale,
    MesureSpecifique,
  } from './tableauDesMesures.d';
  import LigneMesure from './ligne/LigneMesure.svelte';
  import {
    enregistreMesureGenerale,
    enregistreMesuresSpecifiques,
    metEnFormeMesures,
    recupereMesures,
  } from './tableauDesMesures.api';
  import { onMount } from 'svelte';
  import { Referentiel } from '../ui/types.d';
  import { nombreResultats } from './tableauDesMesures.store';
  import MenuFiltres from './filtres/MenuFiltres.svelte';
  import { mesuresVisiteGuidee } from './modeVisiteGuidee/donneesVisiteGuidee';
  import Onglet from '../ui/Onglet.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { rechercheParReferentiel } from './storesDeRecherche/rechercheParReferentiel.store';
  import { rechercheTextuelle } from './storesDeRecherche/rechercheTextuelle.store';
  import { rechercheParCategorie } from './storesDeRecherche/rechercheParCategorie.store';
  import { resultatsDeRecherche } from './storesDeRecherche/resultatsDeRecherche';
  import { mesures } from './mesures.store';

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
  export let modeVisiteGuidee: boolean;

  const rafraichisMesures = async () => {
    mesures.reinitialise(
      modeVisiteGuidee ? mesuresVisiteGuidee : await recupereMesures(idService)
    );
  };
  onMount(rafraichisMesures);

  let etatEnregistrement: EtatEnregistrement = Jamais;

  const metsAJourMesuresSpecifiques = async (indexReel: number) => {
    etatEnregistrement = EnCours;
    await enregistreMesuresSpecifiques(idService, $mesures.mesuresSpecifiques);
    etatEnregistrement = Fait;
    document.body.dispatchEvent(new CustomEvent('mesure-modifiee'));
    toasterStore.afficheToastChangementStatutMesure(
      $mesures.mesuresSpecifiques[indexReel],
      statuts
    );
  };

  const metsAJourMesureGenerale = async (idMesure: IdMesureGenerale) => {
    etatEnregistrement = EnCours;
    await enregistreMesureGenerale(
      idService,
      idMesure,
      $mesures.mesuresGenerales[idMesure]
    );
    etatEnregistrement = Fait;
    document.body.dispatchEvent(new CustomEvent('mesure-modifiee'));
    toasterStore.afficheToastChangementStatutMesure(
      $mesures.mesuresGenerales[idMesure],
      statuts
    );
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

  const afficheTiroirExportDesMesures = () => {
    document.body.dispatchEvent(
      new CustomEvent('svelte-affiche-tiroir-export-mesures')
    );
  };

  type TypeOnglet = 'statutADefinir' | 'enAction' | 'traite' | 'toutes';
  type mesuresToutType = {
    mesuresGenerales: Record<string, MesureGenerale>;
    mesuresSpecifiques: MesureSpecifique[];
  };
  const mesuresToutTypeParDefaut = {
    mesuresGenerales: {},
    mesuresSpecifiques: [],
  };
  let ongletActif: TypeOnglet = 'statutADefinir';
  let mesuresParOnglet: Record<TypeOnglet, mesuresToutType> = {
    statutADefinir: mesuresToutTypeParDefaut,
    enAction: mesuresToutTypeParDefaut,
    traite: mesuresToutTypeParDefaut,
    toutes: mesuresToutTypeParDefaut,
  };

  const filtreMesures = (
    predicatFiltre: (m: MesureGenerale | MesureSpecifique) => boolean
  ) => ({
    mesuresGenerales: Object.entries($resultatsDeRecherche.mesuresGenerales)
      .filter(([_, m]) => predicatFiltre(m))
      .reduce((acc, [cle, donnees]) => ({ ...acc, [cle]: donnees }), {}),
    mesuresSpecifiques: $resultatsDeRecherche.mesuresSpecifiques.filter((m) =>
      predicatFiltre(m)
    ),
  });
  $: {
    mesuresParOnglet = {
      statutADefinir: filtreMesures((m) => !m.statut),
      enAction: filtreMesures(
        (m) => m.statut === 'aLancer' || m.statut === 'enCours'
      ),
      traite: filtreMesures(
        (m) => m.statut === 'fait' || m.statut === 'nonFait'
      ),
      toutes: $resultatsDeRecherche,
    };
  }
  const calculNbPourOnglet = (mesuresParOnglet: mesuresToutType) =>
    Object.keys(mesuresParOnglet.mesuresGenerales).length +
    mesuresParOnglet.mesuresSpecifiques.length;

  const supprimeRechercheEtFiltres = () => {
    $rechercheTextuelle = '';
    $rechercheParCategorie = [];
    $rechercheParReferentiel = [];
  };
</script>

<svelte:body on:mesure-modifiee={rafraichisMesures} />
<Toaster />
<div class="barre-filtres">
  <div class="conteneur-recherche">
    <img
      src="/statique/assets/images/icone_recherche.svg"
      alt="Icône de recherche"
    />
    <input
      type="search"
      id="recherche"
      bind:value={$rechercheTextuelle}
      placeholder="Rechercher par intitulé, description, ID"
    />
  </div>
  <MenuFiltres {categories} />
</div>
<table class="tableau-des-mesures">
  <colgroup>
    <col class="infos-mesures" />
    <col class="statut-mesure" />
  </colgroup>
  <thead>
    <tr class="ligne-onglet">
      <th colspan="2">
        <div class="conteneur-onglet">
          <Onglet
            bind:ongletActif
            cetOnglet="statutADefinir"
            labelOnglet="Statut à définir"
            nbNonLue={calculNbPourOnglet(mesuresParOnglet.statutADefinir)}
          />
          <Onglet
            bind:ongletActif
            cetOnglet="enAction"
            labelOnglet="En action"
            nbNonLue={calculNbPourOnglet(mesuresParOnglet.enAction)}
          />
          <Onglet
            bind:ongletActif
            cetOnglet="traite"
            labelOnglet="Traité"
            nbNonLue={calculNbPourOnglet(mesuresParOnglet.traite)}
          />
          <Onglet
            bind:ongletActif
            cetOnglet="toutes"
            labelOnglet="Toutes les mesures"
            nbNonLue={calculNbPourOnglet(mesuresParOnglet.toutes)}
          />
        </div>
      </th>
    </tr>
    {#if !estLectureSeule}
      <tr>
        <th colspan="2">
          <div class="actions">
            <button
              class="bouton-action-mesure"
              on:click={() => afficheTiroirDeMesure()}
              disabled={etatEnregistrement === EnCours}
            >
              <img src="/statique/assets/images/icone_plus_gris.svg" alt="" />
              Ajouter une mesure
            </button>
            <button
              class="bouton-action-mesure"
              on:click={afficheTiroirExportDesMesures}
            >
              <img src="/statique/assets/images/icone_export_gris.svg" alt="" />
              Exporter la liste des mesures
            </button>
            {#if etatEnregistrement === EnCours}
              <p class="enregistrement-en-cours">Enregistrement en cours ...</p>
            {/if}
          </div>
        </th>
      </tr>
    {/if}
  </thead>
  <tbody>
    {#if !calculNbPourOnglet(mesuresParOnglet[ongletActif])}
      {#if $nombreResultats.aDesFiltresAppliques || $rechercheTextuelle}
        <tr class="ligne-aucun-resultat">
          <td colspan="2">
            <div class="aucun-resultat">
              <img
                src="/statique/assets/images/illustration_recherche_vide.svg"
                alt=""
              />
              Aucune mesure ne correspond à la recherche.
              <button
                class="bouton bouton-secondaire"
                on:click={supprimeRechercheEtFiltres}
              >
                Effacer la recherche
              </button>
            </div>
          </td>
        </tr>
      {/if}
    {:else}
      {#each Object.entries(mesuresParOnglet[ongletActif].mesuresGenerales) as [id, mesure] (id)}
        <LigneMesure
          {id}
          referentiel={mesure.referentiel}
          indispensable={mesure.indispensable}
          nom={mesure.description}
          categorie={categories[mesure.categorie]}
          referentielStatuts={statuts}
          bind:mesure={$mesures.mesuresGenerales[id]}
          on:modificationStatut={(e) => {
            mesures.metAJourStatutMesureGenerale(id, e.detail.statut);
            metsAJourMesureGenerale(id);
          }}
          on:click={() =>
            afficheTiroirDeMesure({
              mesure,
              metadonnees: {
                typeMesure: 'GENERALE',
                idMesure: id,
              },
            })}
          estLectureSeule={estLectureSeule || etatEnregistrement === EnCours}
        />
      {/each}
      {#each mesuresParOnglet[ongletActif].mesuresSpecifiques as mesure, index (index)}
        {@const indexReel = $mesures.mesuresSpecifiques.indexOf(mesure)}
        <LigneMesure
          id={`specifique-${index}`}
          referentiel={Referentiel.SPECIFIQUE}
          nom={mesure.description}
          categorie={categories[mesure.categorie]}
          referentielStatuts={statuts}
          bind:mesure={$mesures.mesuresSpecifiques[indexReel]}
          on:modificationStatut={(e) => {
            mesures.metAJourStatutMesureSpecifique(indexReel, e.detail.statut);
            metsAJourMesuresSpecifiques(indexReel);
          }}
          on:click={() =>
            afficheTiroirDeMesure({
              mesure,
              metadonnees: { typeMesure: 'SPECIFIQUE', idMesure: indexReel },
            })}
          estLectureSeule={estLectureSeule || etatEnregistrement === EnCours}
        />
      {/each}
    {/if}
  </tbody>
</table>

<style>
  .barre-filtres {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-items: flex-start;
  }

  .conteneur-recherche {
    border: 1px solid var(--liseres-fonce);
    display: flex;
    gap: 6px;
    border-radius: 4px;
    color: var(--texte-clair);
    width: 410px;
    padding: 6px;
  }

  #recherche {
    border: none;
    flex: 1;
    font-family: 'Marianne';
    padding: 0;
  }

  .enregistrement-en-cours {
    font-size: 1.1em;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0c5c98;
  }

  .enregistrement-en-cours:before {
    content: '';
    display: flex;
    width: 24px;
    height: 24px;
    background-size: contain;
    background-repeat: no-repeat;
    background-image: url('/statique/assets/images/icone_enregistrement_en_cours.svg');
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    100% {
      transform: rotate(360deg);
    }
  }

  .bouton-action-mesure {
    padding: 6px 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    color: var(--gris-fonce);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
  }

  .bouton-action-mesure:hover {
    background: var(--fond-gris-pale);
    color: var(--bleu-anssi);
  }

  .bouton-action-mesure:hover img {
    filter: brightness(0) invert(21%) sepia(87%) saturate(646%)
      hue-rotate(168deg) brightness(89%) contrast(103%);
  }

  .ligne-aucun-resultat {
    border: 1px solid var(--liseres-fonce);
  }

  .aucun-resultat {
    padding: 64px 0;
    display: flex;
    gap: 16px;
    flex-direction: column;
    align-items: center;
  }

  .aucun-resultat img {
    max-width: 128px;
  }

  .aucun-resultat button {
    margin: 0;
    padding: 8px 16px;
  }

  .tableau-des-mesures {
    border-collapse: collapse;
  }

  colgroup .infos-mesures {
    width: 80%;
  }

  colgroup .statut-mesure {
    width: 20%;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 18px 16px;
    border: 1px solid var(--liseres-fonce);
    border-radius: 0 4px 0 0;
    transform: translateY(1px);
    margin-left: -0.5px;
    margin-right: -0.5px;
  }

  .actions p {
    margin: 0;
  }

  thead tr th {
    padding: 0;
  }

  .ligne-onglet {
    transform: translateY(2px) translateX(-0.5px);
    position: relative;
    z-index: 1;
  }

  .conteneur-onglet {
    display: flex;
    gap: 8px;
  }
</style>
