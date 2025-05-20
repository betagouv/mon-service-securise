<script lang="ts">
  import { onMount } from 'svelte';
  import type { RapportDetaille } from './rapportTeleversement.d';
  import { recuperRapportDetaille } from './rapportTeleversement.api';
  import LigneService from './composants/LigneService.svelte';

  let elementModale: HTMLDialogElement;

  let rapportDetaille: RapportDetaille;
  onMount(async () => {
    const resultat = await recuperRapportDetaille();
    if (!resultat) return;
    rapportDetaille = resultat;

    elementModale.inert = true;
    elementModale.showModal();
    elementModale.inert = false;
  });
</script>

<dialog bind:this={elementModale}>
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
              <LigneService {service} numeroLigne={idx + 1} />
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
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0 0 24px;
    text-align: left;
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
