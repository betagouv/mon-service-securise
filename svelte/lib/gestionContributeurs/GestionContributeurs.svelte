<script lang="ts">
  import { store } from './gestionContributeurs.store';
  import InvitationContributeur from './InvitationContributeur.svelte';
  import LigneContributeur from './LigneContributeur.svelte';
  import SuppressionContributeur from './SuppressionContributeur.svelte';
  import { onMount } from 'svelte';

  $: surServiceUnique = $store.services.length === 1;
  $: serviceUnique = $store.services[0];
  $: contributeurs = serviceUnique.contributeurs;

  onMount(async () => {
    if (surServiceUnique) {
      const reponse = await axios.get(
        `/api/service/${serviceUnique.id}/autorisations`
      );
      store.autorisations.charge(reponse.data);
    }
  });
</script>

{#if $store.etapeCourante === 'SuppressionContributeur'}
  <SuppressionContributeur />
{:else}
  {#if $store.services.every((s) => s.estCreateur)}
    <InvitationContributeur />
  {/if}
  {#if $store.etapeCourante !== 'InvitationContributeurs' && surServiceUnique}
    <h3 class="titre-liste">Liste des contributeurs au service</h3>
    <ul class="liste-contributeurs contributeurs-actifs">
      <LigneContributeur
        droitsModifiables={false}
        utilisateur={serviceUnique.createur}
      />
      {#each contributeurs as contributeur (contributeur.id)}
        <LigneContributeur
          droitsModifiables={serviceUnique.permissions.gestionContributeurs}
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
  }
</style>
