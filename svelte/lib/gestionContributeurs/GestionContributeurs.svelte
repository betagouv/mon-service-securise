<script lang="ts">
  import { store } from './gestionContributeurs.store';
  import InvitationContributeur from './invitation/InvitationContributeur.svelte';
  import LigneContributeur from './kit/LigneContributeur.svelte';
  import SuppressionContributeur from './suppression/SuppressionContributeur.svelte';
  import { onMount } from 'svelte';
  import PersonnalisationContributeur from './personnalisation/PersonnalisationContributeur.svelte';
  import { autorisationsVisiteGuidee } from './modeVisiteGuidee/donneesVisiteGuidee';
  import { storeAutorisations } from './stores/autorisations.store';

  export let modeVisiteGuidee: boolean;

  $: surServiceUnique = $store.services.length === 1;
  $: serviceUnique = $store.services[0];
  $: contributeurs = serviceUnique.contributeurs;

  onMount(async () => {
    if (modeVisiteGuidee) storeAutorisations.charge(autorisationsVisiteGuidee);
    else if (surServiceUnique) {
      const reponse = await axios.get(
        `/api/service/${serviceUnique.id}/autorisations`
      );
      storeAutorisations.charge(reponse.data);
    }
  });
</script>

{#if $store.etapeCourante === 'SuppressionContributeur'}
  <SuppressionContributeur />
{:else if $store.etapeCourante === 'PersonnalisationContributeur'}
  <PersonnalisationContributeur />
{:else}
  {#if $store.services.every((s) => s.estProprietaire)}
    <InvitationContributeur {modeVisiteGuidee} />
  {/if}
  {#if $store.etapeCourante !== 'InvitationContributeurs' && surServiceUnique}
    <h3 class="titre-liste">Liste des contributeurs au service</h3>
    <ul class="liste-contributeurs contributeurs-actifs">
      {#each contributeurs as contributeur (contributeur.id)}
        <LigneContributeur
          droitsModifiables={!contributeur.estUtilisateurCourant &&
            serviceUnique.permissions.gestionContributeurs}
          utilisateur={contributeur}
        />
      {/each}
    </ul>
  {/if}
{/if}

<style>
  .liste-contributeurs {
    list-style: none;
    padding-left: 0;
  }

  .liste-contributeurs :global(li) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 1em;
    margin-bottom: 0.5em;
    column-gap: 16px;
  }
</style>
