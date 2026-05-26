<script lang="ts">
  import type { EntiteSupervisee } from '../adminEntites.types';
  import TiroirGestionAdmins from '../TiroirGestion/TiroirGestionAdmins.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';

  interface Props {
    entite: EntiteSupervisee;
  }

  let { entite }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<dsfr-button
  kind="primary"
  label="Nommer un admin"
  size="sm"
  hasIcon
  icon="add-line"
  onclick={() => {
    tiroirStore.afficheContenu(TiroirGestionAdmins, { entite });
  }}
></dsfr-button>

<style>
  dsfr-button {
    white-space: nowrap;
  }
</style>
