<script lang="ts">
  import type { Service, Utilisateur } from './gestionContributeurs.d';

  import LigneContributeur from './LigneContributeur.svelte';
  import SuppressionContributeur from './SuppressionContributeur.svelte';

  export let services: Service[];
  $: service = services[0];
  $: contributeurs = service.contributeurs;

  let idMenuOuvert: string;
  let utilisateurEnCoursDeSuppression: Utilisateur;

  const ouvrirMenu = (idContributeur: string) => {
    idMenuOuvert = idContributeur;
  };

  const retirerContributeur = (utilisateur: Utilisateur) => {
    utilisateurEnCoursDeSuppression = utilisateur;
    idMenuOuvert = null;
  };

  const supprimeContributeur = (evenement: CustomEvent<Utilisateur>) => {
    utilisateurEnCoursDeSuppression = null;
    contributeurs = contributeurs.filter((c) => c.id != evenement.detail.id);
    document.body.dispatchEvent(new CustomEvent('jquery-recharge-services'));
  };
</script>

{#if utilisateurEnCoursDeSuppression}
  <SuppressionContributeur
    utilisateur={utilisateurEnCoursDeSuppression}
    {service}
    on:annuler={() => (utilisateurEnCoursDeSuppression = null)}
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
        menuEstOuvert={contributeur.id === idMenuOuvert}
        onMenuClick={ouvrirMenu}
        onRetirerContributeur={retirerContributeur}
      />
    {/each}
  </ul>
{/if}
