<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    titre?: string;
    children: Snippet;
    onsupprimer?: () => void;
  }

  let { children, titre, onsupprimer }: Props = $props();
</script>

<div class="conteneur-avec-cadre">
  {#if titre}
    <h5>{titre}</h5>
  {/if}

  {@render children()}

  {#if onsupprimer}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Supprimer"
      kind="tertiary-no-outline"
      size="md"
      has-icon
      icon="delete-line"
      icon-place="left"
      type="button"
      onclick={onsupprimer}
    ></dsfr-button>
  {/if}
</div>

<style lang="scss">
  .conteneur-avec-cadre {
    border: 1px solid #ddd;
    max-width: 894px;
    padding: 24px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    h5 {
      margin: 0;
      padding: 0;
      font-weight: 700;
      font-size: 1.375rem;
      line-height: 1.75;
    }
  }
</style>
