<script lang="ts">
  import { EtatEnregistrement, type IdCategorie } from './tableauDesMesures.d';
  import {
    afficheTiroirCreeMesure,
    afficheTiroirExportDesMesures,
  } from './actionsTiroir';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirAssociationModelesMesureSpecifiqueAuService from './mesuresSpecifiques/TiroirAssociationModelesMesureSpecifiqueAuService.svelte';

  const { EnCours } = EtatEnregistrement;

  export let etatEnregistrement: EtatEnregistrement;
  export let afficheModelesMesureSpecifique: boolean;
  export let categories: Record<IdCategorie, string>;

  const afficheTiroirAssociationModeles = () => {
    tiroirStore.afficheContenu(
      TiroirAssociationModelesMesureSpecifiqueAuService,
      { categories }
    );
  };
</script>

<tr>
  <th colspan="5">
    <div class="actions">
      {#if afficheModelesMesureSpecifique}
        <button
          class="bouton-action-mesure association-modeles"
          on:click={() => afficheTiroirAssociationModeles()}
          disabled={etatEnregistrement === EnCours}
        >
          <img src="/statique/assets/images/icone_ajout_liste.svg" alt="" />
          Ajouter des mesures depuis ma liste
        </button>
      {/if}
      <button
        class="bouton-action-mesure"
        on:click={() => afficheTiroirCreeMesure()}
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

<style>
  tr {
    border: 1px solid var(--liseres-fonce);
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

  tr th {
    padding: 0;
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

  .bouton-action-mesure.association-modeles img {
    filter: brightness(0) invert(7%) sepia(11%) saturate(0%) hue-rotate(275deg)
      brightness(89%) contrast(79%);
  }

  .bouton-action-mesure.association-modeles:hover img {
    filter: brightness(0) invert(19%) sepia(91%) saturate(862%)
      hue-rotate(175deg) brightness(89%) contrast(99%);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 18px 16px;
  }

  .actions p {
    margin: 0;
  }
</style>
