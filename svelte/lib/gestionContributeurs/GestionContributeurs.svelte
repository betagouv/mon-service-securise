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

  let autorisations: Record<string, ResumeNiveauDroit> = {};
  $: surServiceUnique = $store.services.length === 1;
  $: serviceUnique = $store.services[0];
  $: contributeurs = serviceUnique.contributeurs;

  onMount(async () => {
    if (surServiceUnique) {
      const reponse = await axios.get(
        `/api/service/${serviceUnique.id}/autorisations`
      );
      autorisations = reponse.data.reduce(
        (acc: Record<string, ResumeNiveauDroit>, v: Autorisation) => ({
          ...acc,
          [v.idUtilisateur]: v.resumeNiveauDroit,
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
        estSupprimable={false}
        utilisateur={serviceUnique.createur}
        resumeNiveauDroit={autorisations[serviceUnique.createur.id]}
      />
      {#each contributeurs as contributeur (contributeur.id)}
        <LigneContributeur
          estSupprimable={serviceUnique.permissions.suppressionContributeur}
          utilisateur={contributeur}
          resumeNiveauDroit={autorisations[contributeur.id]}
        />
      {/each}
    </ul>
  {/if}
{/if}
