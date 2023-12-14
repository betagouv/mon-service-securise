<script lang="ts">
  import type { Mesures } from './tableauDesMesures.d';
  import LigneMesure from './ligne/LigneMesure.svelte';
  import { enregistreMesures, recupereMesures } from './tableauDesMesures.api';
  import { onMount } from 'svelte';

  enum EtatEnregistrement {
    Jamais,
    EnCours,
    Fait,
  }
  const { Jamais, EnCours, Fait } = EtatEnregistrement;

  export let idService: string;
  export let categories: Record<string, string>;
  export let statuts: Record<string, string>;

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
</script>

<div class="barre-actions">
  {#if etatEnregistrement === EnCours}
    <p class="enregistrement-en-cours">Enregistrement en cours ...</p>
  {/if}
  {#if etatEnregistrement === Fait}
    <p class="enregistrement-termine">Enregistré</p>
  {/if}
</div>
<div class="tableau-des-mesures">
  {#if mesures}
    {#each Object.entries(mesures.mesuresGenerales) as [id, mesure] (id)}
      {@const labelReferentiel = mesure.indispensable
        ? 'Indispensable'
        : 'Recommandé'}
      <LigneMesure
        referentiel={{ label: labelReferentiel, classe: 'mss' }}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        referentielStatuts={statuts}
        bind:mesure
        on:modificationStatut={metAJourMesures}
      />
    {/each}
    {#each mesures.mesuresSpecifiques as mesure, index (index)}
      <LigneMesure
        referentiel={{ label: 'Nouvelle' }}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        referentielStatuts={statuts}
        bind:mesure
        on:modificationStatut={metAJourMesures}
      />
    {/each}
  {/if}
</div>

<style>
  .barre-actions {
    display: flex;
    align-items: flex-start;
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
</style>
