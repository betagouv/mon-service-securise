<script lang="ts">
  import { EtatEnregistrement } from './tableauDesMesures.d';
  import {
    afficheTiroirCreeMesure,
    afficheTiroirExportDesMesures,
  } from './actionsTiroir';

  const { EnCours } = EtatEnregistrement;

  export let etatEnregistrement: EtatEnregistrement;
</script>

<tr>
  <th colspan="5">
    <div class="actions">
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
</style>
