<script lang="ts">
  import type {
    Autorisation,
    ResumeNiveauDroit,
  } from './gestionContributeurs.d';
  import { store } from './gestionContributeurs.store';
  import InvitationContributeur from './InvitationContributeur.svelte';
  import LigneContributeur from './LigneContributeur.svelte';
  import SuppressionContributeur from './SuppressionContributeur.svelte';
  import { onMount } from 'svelte';

  let autorisations: Record<string, Autorisation> = {};
  $: surServiceUnique = $store.services.length === 1;
  $: serviceUnique = $store.services[0];
  $: contributeurs = serviceUnique.contributeurs;

  onMount(async () => {
    if (surServiceUnique) {
      const reponse = await axios.get(
        `/api/service/${serviceUnique.id}/autorisations`
      );
      autorisations = reponse.data.reduce(
        (acc: Record<string, Autorisation>, a: Autorisation) => ({
          ...acc,
          [a.idUtilisateur]: a,
        }),
        {}
      );
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
        autorisation={autorisations[serviceUnique.createur.id]}
      />
      {#each contributeurs as contributeur (contributeur.id)}
        <LigneContributeur
          droitsModifiables={serviceUnique.permissions.gestionContributeurs}
          utilisateur={contributeur}
          autorisation={autorisations[contributeur.id]}
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
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 1em;
    margin-bottom: 0.5em;
  }
</style>
