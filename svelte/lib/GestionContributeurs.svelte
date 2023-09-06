<script lang="ts">
  import type { Service, Utilisateur } from './gestionContributeurs.d';

  import { gestionContributeursStore } from './gestionContributeurs.store';
  import InvitationContributeur from './InvitationContributeur.svelte';
  import LigneContributeur from './LigneContributeur.svelte';
  import SuppressionContributeur from './SuppressionContributeur.svelte';

  export let services: Service[];
  $: serviceUnique = services[0];
  $: contributeurs = serviceUnique.contributeurs;

  const supprimeContributeur = (evenement: CustomEvent<Utilisateur>) => {
    contributeurs = contributeurs.filter((c) => c.id != evenement.detail.id);
    document.body.dispatchEvent(new CustomEvent('jquery-recharge-services'));
  };
</script>

{#if $gestionContributeursStore.etapeCourante === 'SuppressionContributeur'}
  <SuppressionContributeur service={serviceUnique} on:suppressionEffectuee={supprimeContributeur} />
{:else}
  <InvitationContributeur {services} />
  {#if $gestionContributeursStore.etapeCourante !== 'InvitationContributeurs' && services.length === 1}
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
