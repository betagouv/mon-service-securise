<script lang="ts">
  import type { MenuNavigationServiceProps } from './menuNavigationService.d';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirTelechargementDocumentsService, {
    type DonneesServicePourTelechargementDocuments,
  } from '../ui/tiroirs/TiroirTelechargementDocumentsService.svelte';
  import { onMount } from 'svelte';

  let { visible, etapeActive, idService }: MenuNavigationServiceProps =
    $props();

  let service: DonneesServicePourTelechargementDocuments;
  onMount(async () => {
    const reponse = await axios.get<DonneesServicePourTelechargementDocuments>(
      `/api/service/${idService}`
    );
    service = reponse.data;
  });
</script>

<div class="menu-navigation-service">
  <ul>
    {#if visible.mesures}
      <li>
        <a
          class:actif={etapeActive === 'mesures'}
          class="lien-navigation"
          href="/service/{idService}/mesures"
        >
          <lab-anssi-icone nom="list-unordered" taille="sm"></lab-anssi-icone>
          Sécuriser
        </a>
      </li>
    {/if}
    {#if visible.dossiers}
      <li>
        <a
          class:actif={etapeActive === 'dossiers'}
          class="lien-navigation"
          href="/service/{idService}/dossiers"
        >
          <lab-anssi-icone nom="award-line" taille="sm"></lab-anssi-icone>
          Homologuer
        </a>
      </li>
    {/if}
    {#if visible.risques}
      <li>
        <a
          class:actif={etapeActive === 'risques'}
          class="lien-navigation"
          href="/service/{idService}/risques"
        >
          <lab-anssi-icone nom="warning-line" taille="sm"></lab-anssi-icone>
          Risques
        </a>
      </li>
    {/if}
    {#if visible.contactsUtiles}
      <li>
        <a
          class:actif={etapeActive === 'contactsUtiles'}
          class="lien-navigation"
          href="/service/{idService}/rolesResponsabilites"
        >
          <lab-anssi-icone nom="mail-line" taille="sm"></lab-anssi-icone>
          Contacts utiles
        </a>
      </li>
    {/if}
    <li>
      <button
        class="lien-navigation"
        onclick={() =>
          tiroirStore.afficheContenu(TiroirTelechargementDocumentsService, {
            service,
          })}
      >
        <lab-anssi-icone nom="file-download-line" taille="sm"></lab-anssi-icone>
        Documents
      </button>
    </li>
    {#if visible.descriptionService}
      <li>
        <a
          class:actif={etapeActive === 'descriptionService'}
          class="lien-navigation"
          href="/service/{idService}/descriptionService"
        >
          <lab-anssi-icone nom="survey-line" taille="sm"></lab-anssi-icone>
          Récapitulatif</a
        >
      </li>
    {/if}
  </ul>
</div>

<style lang="scss">
  .menu-navigation-service {
    width: 235px;
    padding: 24px 32px 24px 24px;
    box-sizing: border-box;
    background: #fff;
    box-shadow: -1px 0 0 0 #ddd inset;
    height: 100%;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      position: sticky;
      top: 0;

      li {
        display: flex;
      }

      .lien-navigation {
        font-size: 1rem;
        font-weight: bold;
        line-height: 1.5rem;
        color: #161616;
        text-decoration: none;
        border: none;
        background: none;
        cursor: pointer;
        margin: 0;
        padding: 12px 8px 12px 0;
        width: 100%;
        text-align: left;
        display: flex;
        flex-direction: row;
        gap: 8px;

        &:hover {
          background: #f6f6f6;
        }

        &:active {
          background: #ededed;
        }

        lab-anssi-icone {
          border-left: 2px solid transparent;
          padding-left: 8px;
        }

        &.actif {
          color: var(--bleu-mise-en-avant);

          lab-anssi-icone {
            border-left-color: var(--bleu-mise-en-avant);
          }
        }
      }
    }
  }
</style>
