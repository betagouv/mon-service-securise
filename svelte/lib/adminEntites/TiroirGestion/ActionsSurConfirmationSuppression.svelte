<script lang="ts">
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';

  interface Props {
    onannuler: () => void;
    onvalider: () => void;
  }

  let { onannuler, onvalider }: Props = $props();
</script>

<ActionsTiroir>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button label="Annuler" onclick={onannuler} kind="tertiary-no-outline"
  ></dsfr-button>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button label="Confirmer" onclick={onvalider} kind="primary"
  ></dsfr-button>
</ActionsTiroir>
