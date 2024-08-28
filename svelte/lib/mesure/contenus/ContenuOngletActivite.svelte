<script lang="ts">
  import { store } from '../mesure.store';
  import { recupereActiviteMesure } from '../mesure.api';
  import { onMount } from 'svelte';
  import type { ActiviteMesure } from '../mesure.d';
  import { writable } from 'svelte/store';

  const { subscribe, update } = writable<ActiviteMesure[]>([]);

  export const storeActivites = {
    subscribe,
    charge: (activites: ActiviteMesure[]) => {
      update(() => activites);
    },
  };

  onMount(async () => {
    const activites = await recupereActiviteMesure(
      $store.mesureEditee.metadonnees.idMesure
    );
    storeActivites.charge(activites);
  });
</script>

{#each $storeActivites as activite}
  <h2>{activite.type}</h2>
{/each}
