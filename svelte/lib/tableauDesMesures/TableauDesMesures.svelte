<script lang="ts">
  import type {
    IdCategorie,
    IdService,
    IdStatut,
    MesureGenerale,
    Mesures,
    MesureSpecifique,
  } from './tableauDesMesures.d';
  import LigneMesure from './ligne/LigneMesure.svelte';
  import {
    recupereMesures,
    enregistreMesures,
    metEnFormeMesures,
  } from './tableauDesMesures.api';
  import { onMount } from 'svelte';

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

  let mesures: Mesures;
  onMount(async () => {
    mesures = await recupereMesures(idService);
  });

  let etatEnregistrement: EtatEnregistrement = Jamais;
  const metAJourMesures = async () => {
    etatEnregistrement = EnCours;
    await enregistreMesures(idService, mesures);
    etatEnregistrement = Fait;
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
          mesuresExistantes: metEnFormeMesures(mesures),
          titreTiroir:
            mesureAEditer && mesureAEditer.metadonnees.typeMesure === 'GENERALE'
              ? mesureAEditer.mesure.description
              : '',
          ...(mesureAEditer && { mesureAEditer }),
        },
      })
    );
  };
</script>

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
  {#if mesures}
    {#each Object.entries(mesures.mesuresGenerales) as [id, mesure] (id)}
      {@const labelReferentiel = mesure.indispensable
        ? 'Indispensable'
        : 'Recommandé'}
      <LigneMesure
        {id}
        referentiel={{
          label: labelReferentiel,
          classe: 'mss',
          indispensable: mesure.indispensable,
        }}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        referentielStatuts={statuts}
        bind:mesure
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
    {#each mesures.mesuresSpecifiques as mesure, index (index)}
      <LigneMesure
        id={`specifique-${index}`}
        referentiel={{ label: 'Nouvelle', classe: 'specifique' }}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        referentielStatuts={statuts}
        bind:mesure
        on:modificationStatut={metAJourMesures}
        on:click={() =>
          afficheTiroirDeMesure({
            mesure,
            metadonnees: {
              typeMesure: 'SPECIFIQUE',
              idMesure: index,
            },
          })}
        {estLectureSeule}
      />
    {/each}
  {/if}
</div>

<style>
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
    padding: 0.5em 2em;
  }
</style>
