<script lang="ts">
  import { store } from '../mesure.store';
  import { recupereActiviteMesure } from '../mesure.api';
  import { onMount } from 'svelte';
  import type { ActiviteMesure } from '../mesure.d';
  import { writable } from 'svelte/store';
  import Activite from './activites/Activite.svelte';
  import type { ReferentielPriorite, ReferentielStatut } from '../../ui/types';
  import type { IdService } from '../../tableauDesMesures/tableauDesMesures.d';
  import { activitesVisiteGuidee } from '../modeVisiteGuidee/donneesVisiteGuidee';

  export let visible: boolean;
  export let idService: IdService;
  export let priorites: ReferentielPriorite;
  export let statuts: ReferentielStatut;
  export let modeVisiteGuidee: boolean;

  const { subscribe, update } = writable<ActiviteMesure[]>([]);

  export const storeActivites = {
    subscribe,
    charge: (activites: ActiviteMesure[]) => {
      update(() => activites);
    },
  };

  onMount(async () => {
    const chargeActivites = async (idMesure: string | number) =>
      modeVisiteGuidee
        ? activitesVisiteGuidee
        : recupereActiviteMesure(idService, idMesure);

    let id;
    if ($store.mesureEditee.metadonnees.typeMesure === 'SPECIFIQUE')
      id = $store.mesureEditee.mesure.id;
    else id = $store.mesureEditee.metadonnees.idMesure;
    const activites = await chargeActivites(id);
    storeActivites.charge(activites);
  });
</script>

<div id="contenu-onglet-activite" class:visible>
  {#each $storeActivites as activite}
    <Activite {priorites} {statuts} {activite} />
  {:else}
    <div class="aucune-activite">
      <img src="/statique/assets/images/dossiers.png" alt="" />
      <div>
        <p>Il n’y a pas encore d’activité sur cette mesure.</p>
      </div>
    </div>
  {/each}
</div>

<style>
  #contenu-onglet-activite:not(.visible) {
    display: none;
  }

  #contenu-onglet-activite {
    display: flex;
    gap: 20px;
    flex-direction: column;
  }

  #contenu-onglet-activite .aucune-activite {
    margin: 70px 50px 0;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: column;
    text-align: center;
    color: var(--texte-clair);
  }

  .aucune-activite img {
    max-width: 128px;
  }

  .aucune-activite p {
    margin: 0;
  }
</style>
