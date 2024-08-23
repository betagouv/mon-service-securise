<script lang="ts">
  import {
    EtatEnregistrement,
    type IdCategorie,
    type IdMesureGenerale,
    type IdService,
  } from './tableauDesMesures.d';
  import LigneMesure from './ligne/LigneMesure.svelte';
  import {
    enregistreMesureGenerale,
    enregistreMesuresSpecifiques,
    recupereAutorisations,
    recupereContributeurs,
    recupereMesures,
  } from './tableauDesMesures.api';
  import { onMount } from 'svelte';
  import {
    Referentiel,
    type ReferentielPriorite,
    type ReferentielStatut,
  } from '../ui/types.d';
  import { nombreResultats } from './stores/nombreDeResultats.store';
  import MenuFiltres from './filtres/MenuFiltres.svelte';
  import {
    autorisationsVisiteGuidee,
    contributeursVisiteGuidee,
    mesuresVisiteGuidee,
  } from './modeVisiteGuidee/donneesVisiteGuidee';
  import Onglet from '../ui/Onglet.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import { resultatsDeRecherche } from './stores/resultatsDeRecherche.store';
  import { mesures } from './stores/mesures.store';
  import { rechercheParAvancement } from './stores/rechercheParAvancement.store';
  import AucunResultat from './aucunResultat/AucunResultat.svelte';
  import { volumetrieMesures } from './stores/volumetrieMesures.store';
  import { nouveautesPage } from '../ui/stores/nouveautesPage.store';
  import { storeNotifications } from '../ui/stores/notifications.store';
  import Avertissement from '../ui/Avertissement.svelte';
  import TagStatutMesure from '../ui/TagStatutMesure.svelte';
  import BandeauActions from './BandeauActions.svelte';
  import { afficheTiroirEditeMesure } from './actionsTiroir';
  import { featureFlags } from '../featureFlags';
  import { contributeurs } from './stores/contributeurs.store';
  import { storeAutorisations } from '../gestionContributeurs/stores/autorisations.store';
  import { rechercheParCategorie } from './stores/rechercheParCategorie.store';
  import { rechercheParReferentiel } from './stores/rechercheParReferentiel.store';
  import { rechercheParPriorite } from './stores/rechercheParPriorite.store';
  import { rechercheMesMesures } from './stores/rechercheMesMesures.store';

  const { Jamais, EnCours, Fait } = EtatEnregistrement;

  export let idService: IdService;
  export let categories: Record<IdCategorie, string>;
  export let statuts: ReferentielStatut;
  export let priorites: ReferentielPriorite;
  export let estLectureSeule: boolean;
  export let modeVisiteGuidee: boolean;

  const rafraichisMesures = async () => {
    mesures.reinitialise(
      modeVisiteGuidee ? mesuresVisiteGuidee : await recupereMesures(idService)
    );
  };

  const rafraichisContributeurs = async () => {
    contributeurs.reinitialise(
      modeVisiteGuidee
        ? contributeursVisiteGuidee
        : await recupereContributeurs(idService)
    );
  };

  const rafraichisAutorisations = async () => {
    storeAutorisations.charge(
      modeVisiteGuidee
        ? autorisationsVisiteGuidee
        : await recupereAutorisations(idService)
    );
  };

  onMount(async () => {
    await Promise.all([
      rafraichisMesures(),
      rafraichisContributeurs(),
      rafraichisAutorisations(),
    ]);
    if (!$nombreResultats.nombreParAvancement.statutADefinir)
      $rechercheParAvancement = 'enAction';
  });

  let etatEnregistrement: EtatEnregistrement = Jamais;

  const metsAJourMesuresSpecifiques = async (
    indexReel: number,
    affichetoast: boolean = false
  ) => {
    etatEnregistrement = EnCours;
    await enregistreMesuresSpecifiques(idService, $mesures.mesuresSpecifiques);
    etatEnregistrement = Fait;
    document.body.dispatchEvent(new CustomEvent('mesure-modifiee'));
    if (affichetoast) {
      toasterStore.afficheToastChangementStatutMesure(
        $mesures.mesuresSpecifiques[indexReel],
        statuts
      );
    }
  };

  const metsAJourMesureGenerale = async (
    idMesure: IdMesureGenerale,
    affichetoast: boolean = false
  ) => {
    etatEnregistrement = EnCours;
    await enregistreMesureGenerale(
      idService,
      idMesure,
      $mesures.mesuresGenerales[idMesure]
    );
    etatEnregistrement = Fait;
    document.body.dispatchEvent(new CustomEvent('mesure-modifiee'));

    if (affichetoast) {
      toasterStore.afficheToastChangementStatutMesure(
        $mesures.mesuresGenerales[idMesure],
        statuts
      );
    }
    if (
      $volumetrieMesures.totalSansStatut === 0 &&
      $rechercheParAvancement === 'statutADefinir'
    ) {
      $rechercheParAvancement = 'enAction';
    }
  };

  const marqueNouveauteLue = async () => {
    await storeNotifications.marqueLue('nouveaute', 'ongletStatutsMesures');
  };

  $: affichePlanAction =
    $rechercheParAvancement !== 'statutADefinir' && featureFlags.planAction();

  if (modeVisiteGuidee) {
    $rechercheParAvancement = 'enAction';
  }

  const supprimeFiltres = () => {
    $rechercheParCategorie = [];
    $rechercheParReferentiel = [];
    $rechercheParPriorite = [];
    $rechercheMesMesures = false;
  };
</script>

<svelte:body
  on:mesure-modifiee={rafraichisMesures}
  on:collaboratif-service-modifie={() =>
    Promise.all([
      rafraichisContributeurs(), // Pour avoir une liste à jour dans la sélection des responsables
      rafraichisAutorisations(), // Pour avoir des pastilles de couleur à jour sur les droits
      rafraichisMesures(), // Pour avoir les responsables de mesures à jour
    ])}
/>
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
  <MenuFiltres {categories} {priorites} on:supprimeFiltres={supprimeFiltres} />
</div>
{#if $nouveautesPage.doitAfficherNouveautePourPage('ongletStatutsMesures') && !modeVisiteGuidee}
  <Avertissement
    id="nouveaute-onglet-statuts-mesures"
    niveau="info"
    avecBoutonFermeture
    on:fermeture={marqueNouveauteLue}
  >
    <div>
      <span>
        <b> Nous vous invitons à définir le statut de vos mesures. </b>
      </span>
      <br />
      <p>
        Les mesures
        <TagStatutMesure statut="aLancer" actif referentielStatuts={statuts} />
        et
        <TagStatutMesure statut="enCours" actif referentielStatuts={statuts} />
        sont désormais dans l’onglet <b>“En action”</b>
      </p>
      <p>
        Les mesures
        <TagStatutMesure statut="fait" actif referentielStatuts={statuts} />
        et
        <TagStatutMesure statut="nonFait" actif referentielStatuts={statuts} />
        sont dans l’onglet <b>“Traité”</b>
      </p>
    </div>
  </Avertissement>
{/if}
<table class="tableau-des-mesures">
  <thead>
    <tr class="ligne-onglet">
      <th colspan="5">
        <div class="conteneur-onglet">
          {#if $volumetrieMesures.totalSansStatut}
            <Onglet
              bind:ongletActif={$rechercheParAvancement}
              cetOnglet="statutADefinir"
              labelOnglet="Statut à définir"
              badge={$nombreResultats.nombreParAvancement.statutADefinir}
            />
          {/if}
          <Onglet
            bind:ongletActif={$rechercheParAvancement}
            cetOnglet="enAction"
            labelOnglet="En action"
            badge={$nombreResultats.nombreParAvancement.enAction}
          />
          <Onglet
            bind:ongletActif={$rechercheParAvancement}
            cetOnglet="traite"
            labelOnglet="Traité"
            badge={$nombreResultats.nombreParAvancement.traite}
          />
          <Onglet
            bind:ongletActif={$rechercheParAvancement}
            cetOnglet="toutes"
            labelOnglet="Toutes les mesures"
            badge={$nombreResultats.nombreParAvancement.toutes}
          />
        </div>
      </th>
    </tr>
    {#if !estLectureSeule}
      <BandeauActions {etatEnregistrement} />
    {/if}
    {#if !$nombreResultats.aucunResultat}
      <tr class="titres">
        <th>Mesure</th>
        {#if affichePlanAction}
          <th>Priorité</th>
          <th>Échéance</th>
          <th>Responsables</th>
        {/if}
        <th>Statut</th>
      </tr>
    {/if}
  </thead>
  <tbody>
    {#if $nombreResultats.aucunResultat}
      <AucunResultat
        referentielStatuts={statuts}
        on:supprimeFiltres={supprimeFiltres}
      />
    {:else}
      {#each Object.entries($resultatsDeRecherche.mesuresGenerales) as [id, mesure] (id)}
        <LigneMesure
          {id}
          referentiel={mesure.referentiel}
          indispensable={mesure.indispensable}
          nom={mesure.description}
          categorie={categories[mesure.categorie]}
          referentielStatuts={statuts}
          {priorites}
          bind:mesure={$mesures.mesuresGenerales[id]}
          on:modificationStatut={(e) => {
            mesures.metAJourStatutMesureGenerale(id, e.detail.statut);
            metsAJourMesureGenerale(id, true);
          }}
          on:modificationPriorite={(e) => {
            mesures.metAJourPrioriteMesureGenerale(id, e.detail.priorite);
            metsAJourMesureGenerale(id);
          }}
          on:modificationEcheance={(e) => {
            mesures.metAJourEcheanceMesureGenerale(id, e.detail.echeance);
            metsAJourMesureGenerale(id);
          }}
          on:modificationResponsables={(e) => {
            mesures.metAJourResponsablesMesureGenerale(
              id,
              e.detail.responsables
            );
            metsAJourMesureGenerale(id);
          }}
          on:click={() =>
            afficheTiroirEditeMesure({
              mesure: { ...mesure },
              metadonnees: { typeMesure: 'GENERALE', idMesure: id },
            })}
          estLectureSeule={estLectureSeule || etatEnregistrement === EnCours}
          {affichePlanAction}
        />
      {/each}
      {#each $resultatsDeRecherche.mesuresSpecifiques as mesure, index (index)}
        {@const indexReel = $mesures.mesuresSpecifiques.indexOf(mesure)}
        <LigneMesure
          id={`specifique-${index}`}
          referentiel={Referentiel.SPECIFIQUE}
          nom={mesure.description}
          categorie={categories[mesure.categorie]}
          referentielStatuts={statuts}
          {priorites}
          bind:mesure={$mesures.mesuresSpecifiques[indexReel]}
          on:modificationStatut={(e) => {
            mesures.metAJourStatutMesureSpecifique(indexReel, e.detail.statut);
            metsAJourMesuresSpecifiques(indexReel, true);
          }}
          on:modificationPriorite={(e) => {
            mesures.metAJourPrioriteMesureSpecifique(
              indexReel,
              e.detail.priorite
            );
            metsAJourMesuresSpecifiques(indexReel);
          }}
          on:modificationEcheance={(e) => {
            mesures.metAJourEcheanceMesureSpecifique(
              indexReel,
              e.detail.echeance
            );
            metsAJourMesuresSpecifiques(indexReel);
          }}
          on:modificationResponsables={(e) => {
            mesures.metAJourResponsablesMesureSpecifique(
              indexReel,
              e.detail.responsables
            );
            metsAJourMesuresSpecifiques(indexReel);
          }}
          on:click={() =>
            afficheTiroirEditeMesure({
              mesure: { ...mesure },
              metadonnees: { typeMesure: 'SPECIFIQUE', idMesure: indexReel },
            })}
          estLectureSeule={estLectureSeule || etatEnregistrement === EnCours}
          {affichePlanAction}
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

  .tableau-des-mesures {
    border-collapse: collapse;
  }

  thead tr th {
    padding: 0;
  }

  thead tr.titres {
    border: 1px solid var(--liseres-fonce);
  }

  thead tr.titres th {
    padding: 9px 0 9px 32px;
    font-size: 0.875rem;
    font-weight: normal;
    text-align: left;
    color: var(--texte-clair);
  }

  .ligne-onglet {
    transform: translateY(1px) translateX(-0.5px);
  }

  .conteneur-onglet {
    display: flex;
    gap: 8px;
    width: fit-content;
  }

  :global(#nouveaute-onglet-statuts-mesures p) {
    margin: 8px 0;
  }
</style>
