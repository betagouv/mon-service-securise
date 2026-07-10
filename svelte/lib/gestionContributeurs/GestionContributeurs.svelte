<script lang="ts">
  import { derived } from 'svelte/store';
  import { store } from './gestionContributeurs.store';
  import InvitationContributeur from './invitation/InvitationContributeur.svelte';
  import LigneContributeur from './kit/LigneContributeur.svelte';
  import SuppressionContributeur from './suppression/SuppressionContributeur.svelte';
  import PersonnalisationContributeur from './personnalisation/PersonnalisationContributeur.svelte';

  interface Props {
    modeVisiteGuidee: boolean;
  }

  let { modeVisiteGuidee }: Props = $props();

  let surServiceUnique = derived(store, ($s) => $s.services.length === 1);
  let serviceUnique = derived(store, ($s) => $s.services[0]);
</script>

{#if $store.etapeCourante === 'SuppressionContributeur'}
  <SuppressionContributeur />
{:else if $store.etapeCourante === 'PersonnalisationContributeur'}
  <PersonnalisationContributeur />
{:else}
  {#if $store.services.every((s) => s.estProprietaire)}
    <InvitationContributeur {modeVisiteGuidee} />
  {/if}
  {#if $store.etapeCourante !== 'InvitationContributeurs' && $surServiceUnique}
    <h3 class="titre-liste">Liste des contributeurs au service</h3>
    <ul class="liste-contributeurs contributeurs-actifs">
      {#if $serviceUnique}
        {#each $serviceUnique.contributeurs as contributeur (contributeur.id)}
          {@const contributeurPasSoiMeme = !contributeur.estUtilisateurCourant}
          {@const utilisateurPeutGererLesContributeurs =
            $serviceUnique.permissions.gestionContributeurs}
          {@const contributeurPasUnAdmin = !contributeur.estAdmin}
          <LigneContributeur
            droitsModifiables={contributeurPasSoiMeme &&
              utilisateurPeutGererLesContributeurs &&
              contributeurPasUnAdmin}
            utilisateur={contributeur}
          />
        {/each}
      {/if}
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
