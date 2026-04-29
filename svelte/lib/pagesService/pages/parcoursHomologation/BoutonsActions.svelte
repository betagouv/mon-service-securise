<script lang="ts">
  interface Props {
    onannuler: () => void;
    onprecedent: () => void;
    onenregistrer: () => void;
    estPremiereEtape: boolean;
    estDerniereEtape: boolean;
    peutHomologuer: boolean;
  }

  let props: Props = $props();
</script>

<div class="bandeau-actions">
  {#if props.estPremiereEtape}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button label="Annuler" kind="tertiary" onclick={props.onannuler}
    ></dsfr-button>
  {:else}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button label="Précédent" kind="tertiary" onclick={props.onprecedent}
    ></dsfr-button>
  {/if}

  {#if props.estDerniereEtape}
    {#if props.peutHomologuer}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Enregistrer la décision"
        kind="primary"
        icon="save-line"
        icon-place="right"
        onclick={props.onenregistrer}
      ></dsfr-button>
    {/if}
  {:else}
    <dsfr-button
      label="Suivant"
      kind="primary"
      has-icon
      icon="arrow-right-line"
      icon-place="right"
      type="submit"
    ></dsfr-button>
  {/if}
</div>

<style lang="scss">
  .bandeau-actions {
    display: flex;
    gap: 0.75rem;
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1px solid #ddd;
    padding: 24px 0 24px 72px;
    margin: auto -24px -24px -72px;
  }
</style>
