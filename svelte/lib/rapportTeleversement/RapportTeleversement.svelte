<script lang="ts">
  import { onMount } from 'svelte';
  import type { RapportDetaille } from './rapportTeleversement.d';
  import {
    recupereRapportDetaille,
    supprimeTeleversement,
  } from './rapportTeleversement.api';
  import LigneService from './composants/LigneService.svelte';

  let elementModale: HTMLDialogElement;

  let rapportDetaille: RapportDetaille;
  onMount(async () => {
    const resultat = await recupereRapportDetaille();
    if (!resultat) return;
    rapportDetaille = resultat;

    elementModale.inert = true;
    elementModale.showModal();
    elementModale.inert = false;
  });

  const fermeRapport = async () => {
    await supprimeTeleversement();
    const url = new URL(window.location.href);
    url.searchParams.delete('rapportTeleversement');
    window.history.replaceState({}, '', url);
    elementModale.close();
  };
</script>

<dialog bind:this={elementModale}>
  <div class="conteneur-fermeture">
    <button on:click={() => fermeRapport()}>Fermer</button>
  </div>
  <h2>Rapport détaillé</h2>
  <div class="conteneur-rapport-detaille">
    {#if rapportDetaille}
      <table>
        <thead>
          <tr>
            <th scope="colgroup">État</th>
            <th scope="colgroup" class="bordure-droite">Raison de l'erreur</th>
            <th>Ligne</th>
            <th>Nom du service numérique</th>
            <th>SIRET de l'organisation</th>
            <th>Type</th>
            <th>Provenance</th>
            <th>Statut</th>
            <th>Localisation des données</th>
            <th>Durée maximale de dysfonctionnement</th>
            <th>Date d'homologation</th>
            <th>Durée d'homologation</th>
            <th>Autorité</th>
            <th>Fonction de l'autorité</th>
          </tr>
        </thead>
        <tbody>
          {#if rapportDetaille.statut === 'INVALIDE'}
            {#each rapportDetaille.services as service, idx (idx)}
              {#if service.erreurs.length > 0}
                <LigneService {service} numeroLigne={idx + 1} />
              {/if}
            {/each}
            {#each rapportDetaille.services as service, idx (idx)}
              {#if service.erreurs.length === 0}
                <LigneService {service} numeroLigne={idx + 1} />
              {/if}
            {/each}
          {/if}
        </tbody>
      </table>
    {/if}
  </div>
</dialog>

<style lang="scss">
  dialog::backdrop {
    background: rgba(22, 22, 22, 0.64);
  }

  dialog {
    max-width: 1868px;
    max-height: 1010px;
    width: calc(100vw - 52px);
    height: calc(100vh - 70px);
    padding: 64px 32px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
    box-sizing: border-box;
    position: relative;
  }

  .conteneur-fermeture {
    position: absolute;
    top: 16px;
    right: 16px;

    button {
      border: none;
      background: none;
      padding: 4px 8px 4px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--bleu-mise-en-avant);
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.5rem;
      border-radius: 4px;

      &:hover {
        background: #f5f5f5;
      }

      &:after {
        content: '';
        background-image: url(/statique/assets/images/icone_fermeture_modale.svg);
        width: 16px;
        height: 16px;
        background-size: contain;
        background-repeat: no-repeat;
        display: inline-block;
        filter: brightness(0) invert(28%) sepia(70%) saturate(1723%)
          hue-rotate(184deg) brightness(107%) contrast(101%);
        transform: translateY(2px);
      }
    }
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0 0 24px;
    text-align: left;
  }

  .conteneur-rapport-detaille {
    overflow-x: scroll;
  }

  table {
    border-collapse: collapse;
  }

  th {
    white-space: nowrap;
    padding: 8px 16px;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.5rem;
    font-weight: 700;
    border-top: 1px solid #dddddd;
    border-bottom: 1px solid #dddddd;
  }

  tr th:first-of-type {
    border-left: 1px solid #dddddd;
  }

  tr th:last-of-type,
  .bordure-droite {
    border-right: 1px solid #dddddd;
  }

  th[scope='colgroup'] {
    background: var(--fond-pale);
  }
</style>
