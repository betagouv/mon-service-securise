<script lang="ts">
  import type {
    DonneesEtapeVisiteGuidee,
    EtapeVisiteGuidee,
    EtapeVisiteGuideeAdditionnelle,
    RectCible,
  } from './visiteGuideeSPA.d';
  import { donneesEtapesVisiteGuidee } from './visiteGuideeSPA.donnees';
  import { termineVisiteGuidee } from './visiteGuidee.api';
  import { calculePositionModale } from './visiteGuidee.utils';

  interface Props {
    etape: EtapeVisiteGuidee | EtapeVisiteGuideeAdditionnelle;
    donneesEtape: DonneesEtapeVisiteGuidee;
    rectCible: RectCible | undefined;
    modeAdditionnel: boolean;
    elementModale?: HTMLElement;
  }

  let {
    etape = $bindable(),
    donneesEtape,
    rectCible,
    modeAdditionnel,
    elementModale = $bindable(),
  }: Props = $props();

  let decalageModale: number = $derived(donneesEtape.decalageModale || 0);

  $effect(() => {
    if (!rectCible || !elementModale) return;

    const { top, left } = calculePositionModale(
      rectCible,
      elementModale.getBoundingClientRect(),
      donneesEtape.positionModale,
      decalageModale
    );

    elementModale.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  });

  const ferme = async () => {
    await termineVisiteGuidee();
    window.location.href = '/tableauDeBord';
  };

  const afficheEtapeSuivante = async () => {
    if (etape === Object.keys(donneesEtapesVisiteGuidee).length) {
      await termineVisiteGuidee();
      window.location.href = '/tableauDeBord?avecModaleFinVisiteGuidee=true';
    } else {
      etape = (etape as number) + 1;
    }
  };
</script>

<dialog
  bind:this={elementModale}
  id="modale-visite-guidee"
  class="fr-modal fr-modal--opened"
  aria-labelledby="modale-visite-guidee-title"
  aria-modal="true"
  open
>
  <div class="modal_body">
    <div class="modal_header">
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        preset="close"
        aria-controls="modale-visite-guidee"
        title="Fermer la visite guidée"
        onclick={async () => await ferme()}
      >
        Fermer
      </dsfr-button>
    </div>
    <div class="modal_content">
      <h2 class="modal_title" id="modale-visite-guidee-title">
        {donneesEtape.titre}
      </h2>
      <div class="conteneur-modale">
        {#if !modeAdditionnel}
          <div class="etapier">
            Étape {etape} sur {Object.keys(donneesEtapesVisiteGuidee).length}
          </div>
        {/if}
        <p>{donneesEtape.description}</p>
        {#if donneesEtape.descriptionAdditionnelle}
          <p class="description-additionnelle">
            {donneesEtape.descriptionAdditionnelle}
          </p>
        {/if}
      </div>
    </div>
    <div class="modal_footer">
      {#if modeAdditionnel}
        <dsfr-button
          size="md"
          label="Revenir à la liste des fonctionnalités"
          markup="a"
          href="/tableauDeBord?avecModaleVisiteGuideeAvancee=true"
        ></dsfr-button>
      {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          kind="secondary"
          size="md"
          onclick={() => (etape = (etape as number) - 1)}
          disabled={etape === 1}
          label="Précédent"
        >
        </dsfr-button>

        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          kind="primary"
          size="md"
          onclick={async () => await afficheEtapeSuivante()}
          label="Suivant"
        >
        </dsfr-button>
      {/if}
    </div>
  </div>
</dialog>

<style lang="scss">
  dialog {
    z-index: 10000;
    background: none;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 18, 0.16);
  }

  .fr-modal {
    width: 384px;
    border: none;
    color: inherit;
    padding: 0;
    margin: 0;
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(calc(50vw - 50%), calc(50vh - 50%));
    will-change: transform;
    visibility: inherit;
    opacity: 1;
    transition:
      opacity 0.3s,
      visibility 0.3s,
      transform 0.3s ease-in-out;
  }

  .modal_body {
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

    .conteneur-modale {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .etapier {
        font-size: 0.875rem;
        font-weight: 700;
        line-height: 1.5rem;
        text-transform: uppercase;
        color: #09416a;
        margin-bottom: 12px;
      }

      p {
        padding: 0;
        margin: 0;

        &.description-additionnelle {
          font-size: 0.75rem;
          line-height: 1.25rem;
        }
      }
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
