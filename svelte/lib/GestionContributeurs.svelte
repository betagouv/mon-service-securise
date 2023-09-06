<script lang="ts">
  import type { Service, Utilisateur } from './gestionContributeurs.d';

  import { gestionContributeursStore } from './gestionContributeurs.store';
  import LigneContributeur from './LigneContributeur.svelte';
  import SuppressionContributeur from './SuppressionContributeur.svelte';

  export let services: Service[];
  $: service = services[0];
  $: contributeurs = service.contributeurs;

  const supprimeContributeur = (evenement: CustomEvent<Utilisateur>) => {
    contributeurs = contributeurs.filter((c) => c.id != evenement.detail.id);
    document.body.dispatchEvent(new CustomEvent('jquery-recharge-services'));
  };
</script>

{#if $gestionContributeursStore.etapeCourante === 'SuppressionContributeur'}
  <SuppressionContributeur
    utilisateur={$gestionContributeursStore.utilisateurEnCoursDeSuppression}
    {service}
    on:suppressionEffectuee={supprimeContributeur}
  />
{:else}
  <h3 class="titre-liste titre-contributeurs-actifs">Ajouté(s) au service</h3>
  <ul class="liste-contributeurs contributeurs-actifs">
    <LigneContributeur
      estProprietaire={true}
      estSupprimable={false}
      utilisateur={service.createur}
    />
    {#each contributeurs as contributeur (contributeur.id)}
      <LigneContributeur
        estProprietaire={false}
        estSupprimable={service.permissions.suppressionContributeur}
        utilisateur={contributeur}
      />
    {/each}
  </ul>
{/if}
