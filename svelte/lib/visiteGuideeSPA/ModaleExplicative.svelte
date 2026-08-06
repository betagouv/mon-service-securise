<script lang="ts">
  import type {
    DonneesEtapeVisiteGuidee,
    EtapeVisiteGuidee,
  } from './visiteGuideeSPA.d';
  import { donneesEtapesVisiteGuidee } from './visiteGuideeSPA.d';

  interface Props {
    etape: EtapeVisiteGuidee;
  }

  let { etape = $bindable() }: Props = $props();

  let donneesEtape: DonneesEtapeVisiteGuidee = $derived(
    donneesEtapesVisiteGuidee[etape]
  );
</script>

<dialog
  id="modale-visite-guidee"
  class="fr-modal fr-modal--opened"
  aria-labelledby="modale-visite-guidee-title"
  aria-modal="true"
  open
>
  <div class="fr-container fr-container--fluid fr-container-md">
    <div class="fr-grid-row fr-grid-row--center">
      <div class="fr-col-12 fr-col-md-6 fr-col-lg-4">
        <div class="modal_body">
          <div class="modal_header">
            <dsfr-button
              preset="close"
              aria-controls="modale-visite-guidee"
              title="Fermer la visite guidée"
              >Fermer
            </dsfr-button>
          </div>
          <div class="modal_content">
            <h2 class="modal_title" id="modale-visite-guidee-title">
              {donneesEtape.titre}
            </h2>
            <div class="conteneur-modale">
              <div class="etapier">
                Étape {etape} sur {Object.keys(donneesEtapesVisiteGuidee)
                  .length}
              </div>
              <div>{donneesEtape.description}</div>
            </div>
          </div>
          <div class="modal_footer">
            <dsfr-button kind="secondary" size="md" onclick={() => (etape -= 1)}
              >Précédent</dsfr-button
            >
            <dsfr-button kind="primary" size="md" onclick={() => (etape += 1)}
              >Suivant</dsfr-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</dialog>

<style lang="scss">
  dialog {
    z-index: 10000;
    background: none;
  }

  .fr-modal {
    width: 384px;
    border: none;
    color: inherit;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    visibility: inherit;
    opacity: 1;
    transition:
      opacity 0.3s,
      visibility 0.3s;
  }

  .modal_body {
    flex: 1 1 auto;
    background-color: var(--background-lifted-grey);
    max-height: 80vh;
  }

  .modal_header {
    display: flex;
    justify-content: end;
    padding: 1rem 2rem;
  }

  .modal_content {
    padding-left: 2rem;
    padding-right: 2rem;
    margin-bottom: 4rem;
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .conteneur-modale {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .etapier {
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.5rem;
      text-transform: uppercase;
      color: #09416a;
    }
  }

  .modal_footer {
    display: flex;
    gap: 16px;
    justify-content: end;
    background-color: var(--background-lifted-grey);
    padding: 2rem;
    margin-top: -3rem;
  }

  h2 {
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--text-title-grey);
    font-size: 1.5rem;
    line-height: 2rem;
  }

  @media (-ms-high-contrast: active), (forced-colors: active) {
    .modal_body {
      border: 1px solid;
    }

    .modal_footer {
      border-top: 1px solid;
    }
  }
</style>
