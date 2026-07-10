<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import ContenuTiroir from './ContenuTiroir.svelte';
  import GestionContributeurs from '../../gestionContributeurs/GestionContributeurs.svelte';
  import { store } from '../../gestionContributeurs/gestionContributeurs.store';
  import {
    autorisationsVisiteGuidee,
    donneesServiceVisiteGuidee,
  } from '../../gestionContributeurs/modeVisiteGuidee/donneesVisiteGuidee';
  import type { DonneesServicePourTiroirContributeurs } from '../../gestionContributeurs/gestionContributeurs.d';
  import { storeAutorisations } from '../../gestionContributeurs/stores/autorisations.store';

  interface Props {
    services: DonneesServicePourTiroirContributeurs[];
    modeVisiteGuidee?: boolean;
  }

  let { services, modeVisiteGuidee = false }: Props = $props();

  export const titre: string = 'Gérer les contributeurs';
  export const sousTitre: string = untrack(() =>
    services.length > 1
      ? 'Gérer la liste des personnes invitées à contribuer aux services.'
      : 'Gérer la liste des personnes invitées à contribuer au service.'
  );

  let chargementTermine = $state(false);

  onMount(async () => {
    store.reinitialise(
      modeVisiteGuidee ? [donneesServiceVisiteGuidee] : services
    );

    if (modeVisiteGuidee) storeAutorisations.charge(autorisationsVisiteGuidee);
    else {
      const surServiceUnique = services.length === 1;
      if (surServiceUnique) {
        const reponse = await axios.get(
          `/api/service/${services.at(0)!.id}/autorisations`
        );
        storeAutorisations.charge(reponse.data);
      }
    }

    chargementTermine = true;
  });
</script>

<ContenuTiroir>
  <div id="contenu-contributeurs">
    {#if chargementTermine}
      <GestionContributeurs {modeVisiteGuidee} />
    {/if}
  </div>
</ContenuTiroir>
