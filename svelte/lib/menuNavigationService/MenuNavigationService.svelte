<script lang="ts">
  import type { MenuNavigationServiceProps } from './menuNavigationService.d';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirTelechargementDocumentsService, {
    type DonneesServicePourTelechargementDocuments,
  } from '../ui/tiroirs/TiroirTelechargementDocumentsService.svelte';
  import { onMount } from 'svelte';
  import TiroirGestionContributeurs from '../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import type { DonneesServicePourTiroirContributeurs } from '../gestionContributeurs/gestionContributeurs.d';
  import { donneesServiceVisiteGuidee } from '../gestionContributeurs/modeVisiteGuidee/donneesVisiteGuidee';

  let {
    visible,
    etapeActive,
    idService,
    modeVisiteGuidee,
  }: MenuNavigationServiceProps = $props();

  type ServicePourMenuNavigation = DonneesServicePourTelechargementDocuments &
    DonneesServicePourTiroirContributeurs;

  let service: ServicePourMenuNavigation | undefined = $state();
  onMount(async () => {
    if (modeVisiteGuidee) {
      service = donneesServiceVisiteGuidee;
      return;
    }
    const reponse = await axios.get<ServicePourMenuNavigation>(
      `/api/service/${idService}`
    );
    service = reponse.data;
  });
</script>

{#if service}
  <div class="menu-navigation-service">
    <div class="conteneur-menu-navigation-service">
      <ul>
        {#if visible.mesures || visible.indiceCyber || visible.risques}
          {@const destination = visible.mesures
            ? 'mesures'
            : visible.risques
              ? 'risques'
              : 'indiceCyber'}
          <li>
            <a
              class:actif={etapeActive === 'mesures' ||
                etapeActive === 'indiceCyber' ||
                etapeActive === 'risques'}
              class="lien-navigation"
              href="/service/{idService}/{destination}"
            >
              <lab-anssi-icone nom="list-unordered" taille="sm"
              ></lab-anssi-icone>
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
        {#if visible.rolesResponsabilites}
          <li>
            <a
              class:actif={etapeActive === 'rolesResponsabilites'}
              class="lien-navigation"
              href="/service/{idService}/rolesResponsabilites"
            >
              <lab-anssi-icone nom="mail-line" taille="sm"></lab-anssi-icone>
              Contacts utiles
            </a>
          </li>
        {/if}
        {#if service.documentsPdfDisponibles?.length > 0}
          <li>
            <button
              id="voir-telechargement"
              class="lien-navigation"
              onclick={() => {
                if (service)
                  tiroirStore.afficheContenu(
                    TiroirTelechargementDocumentsService,
                    {
                      service,
                    }
                  );
              }}
            >
              <lab-anssi-icone nom="file-download-line" taille="sm"
              ></lab-anssi-icone>
              Documents
            </button>
          </li>
        {/if}
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
      <div id="gerer-contributeurs">
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          label="Gérer les contributeurs"
          kind="tertiary"
          size="sm"
          icon="group-line"
          icon-place="left"
          markup="button"
          type="button"
          has-icon
          onclick={() => {
            if (service)
              tiroirStore.afficheContenu(TiroirGestionContributeurs, {
                services: [service],
              });
          }}
        ></dsfr-button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .menu-navigation-service {
    padding: 24px 0 24px 24px;
    box-sizing: border-box;
    background: #fff;
    box-shadow: -1px 0 0 0 #ddd inset;
    height: 100%;
    width: 235px;
    min-width: 235px;

    .conteneur-menu-navigation-service {
      position: sticky;
      top: 0;

      ul {
        padding: 0 32px 0 0;
        list-style: none;
        margin: 0;

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

      #gerer-contributeurs {
        margin-top: 60px;
        width: fit-content;

        dsfr-button {
          white-space: nowrap;
        }
      }
    }
  }
</style>
