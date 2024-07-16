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
  import {
    mesures,
    mesuresFiltrees,
    nombreResultats,
    rechercheTextuelle,
  } from './tableauDesMesures.store';
  import MenuFiltres from './filtres/MenuFiltres.svelte';
  import { mesuresVisiteGuidee } from './modeVisiteGuidee/donneesVisiteGuidee';

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

  const rafraichisMesures = async () =>
    mesures.reinitialise(
      modeVisiteGuidee ? mesuresVisiteGuidee : await recupereMesures(idService)
    );
  onMount(rafraichisMesures);

  let etatEnregistrement: EtatEnregistrement = Jamais;

  const metsAJourMesuresSpecifiques = async () => {
    etatEnregistrement = EnCours;
    await enregistreMesuresSpecifiques(idService, $mesures.mesuresSpecifiques);
    etatEnregistrement = Fait;
    document.body.dispatchEvent(new CustomEvent('mesure-modifiee'));
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
</script>

<svelte:body on:mesure-modifiee={rafraichisMesures} />
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
      placeholder="Rechercher par intitulé, description"
    />
  </div>
  <MenuFiltres {categories} {statuts} />
</div>
{#if !estLectureSeule}
  <div class="barre-actions">
    <button
      class="bouton"
      on:click={() => afficheTiroirDeMesure()}
      disabled={etatEnregistrement === EnCours}
    >
      Ajouter une mesure
    </button>
    <button
      class="bouton bouton-avec-icone bouton-tertiaire bouton-export-mesures"
      on:click={afficheTiroirExportDesMesures}
    >
      Exporter la liste des mesures
    </button>
    {#if etatEnregistrement === EnCours}
      <p class="enregistrement-en-cours">Enregistrement en cours ...</p>
    {/if}
    {#if etatEnregistrement === Fait}
      <p class="enregistrement-termine">Enregistré</p>
    {/if}
  </div>
{/if}
<table class="tableau-des-mesures">
  <colgroup>
    <col class="infos-mesures" />
    <col class="statut-mesure" />
  </colgroup>
  <tbody>
    {#if $nombreResultats.aucunResultat}
      <tr class="aucun-resultat">
        <td>Aucune mesure ne correspond à la recherche.</td>
      </tr>
    {:else}
      {#each Object.entries($mesuresFiltrees.mesuresGenerales) as [id, mesure] (id)}
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
      {#each $mesuresFiltrees.mesuresSpecifiques as mesure, index (index)}
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
            metsAJourMesuresSpecifiques();
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

  .barre-actions {
    display: flex;
    align-items: center;
    gap: 8px;
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

  .bouton-export-mesures:before {
    background-image: url('/statique/assets/images/icone_telechargement_fichier.svg');
  }

  .aucun-resultat {
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    padding: 9px 0;
  }

  .tableau-des-mesures {
    border-radius: 8px;
    border-collapse: collapse;
  }

  colgroup .infos-mesures {
    width: 80%;
  }

  colgroup .statut-mesure {
    width: 20%;
  }
</style>
