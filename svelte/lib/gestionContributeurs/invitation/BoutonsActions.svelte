<script lang="ts">
  interface Props {
    afficherBoutonEnvoyer: boolean;
    onAnnuler?: () => void;
    onEnvoyer?: () => void;
  }

  let { afficherBoutonEnvoyer, onAnnuler, onEnvoyer }: Props = $props();
</script>

<div class="conteneur-actions">
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button kind="secondary" onclick={onAnnuler} label="Annuler">
  </dsfr-button>

  {#if afficherBoutonEnvoyer}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button onclick={onEnvoyer} label="Envoyer une invitation">
    </dsfr-button>
  {/if}
</div>

<style>
  .conteneur-actions {
    justify-content: flex-end;
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }
</style>
