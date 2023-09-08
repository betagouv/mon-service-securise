<script lang="ts">
  import { gestionContributeursStore } from './gestionContributeurs.store';
  import InvitationContributeur from './InvitationContributeur.svelte';
  import LigneContributeur from './LigneContributeur.svelte';
  import SuppressionContributeur from './SuppressionContributeur.svelte';

  $: surServiceUnique = $gestionContributeursStore.services.length === 1;
  $: serviceUnique = $gestionContributeursStore.services[0];
  $: contributeurs = serviceUnique.contributeurs;
</script>

{#if $gestionContributeursStore.etapeCourante === 'SuppressionContributeur'}
  <SuppressionContributeur />
{:else}
  <InvitationContributeur />
  {#if $gestionContributeursStore.etapeCourante !== 'InvitationContributeurs' && surServiceUnique}
    <h3 class="titre-liste titre-contributeurs-actifs">Ajouté(s) au service</h3>
    <ul class="liste-contributeurs contributeurs-actifs">
      <LigneContributeur
        estProprietaire={true}
        estSupprimable={false}
        utilisateur={serviceUnique.createur}
      />
      {#each contributeurs as contributeur (contributeur.id)}
        <LigneContributeur
          estProprietaire={false}
          estSupprimable={serviceUnique.permissions.suppressionContributeur}
          utilisateur={contributeur}
        />
      {/each}
    </ul>
  {/if}
{/if}
