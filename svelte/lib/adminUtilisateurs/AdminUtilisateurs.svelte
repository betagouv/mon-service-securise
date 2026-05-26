<script lang="ts">
  import { onMount } from 'svelte';
  import { api, type UtilisateurAdministre } from './adminUtilisateurs.api';

  let mesUtilisateurs: UtilisateurAdministre[] = $state([]);

  onMount(async () => {
    mesUtilisateurs = await api.utilisateursDansMonPerimetre();
  });
</script>

<h1>Utilisateurs</h1>

<dsfr-table
  columns={[
    { key: 'prenomNom', label: 'Nom' },
    { key: 'postes', label: 'Rôle' },
    { key: 'nombreEntites', label: 'Entité(s) associée(s)' },
    { key: 'nombreServices', label: 'Service(s) associé(s)' },
    { key: 'actions', label: 'Actions' },
  ]}
  rows={mesUtilisateurs}
  rich
  multiline
>
  {#each mesUtilisateurs as utilisateur, i (utilisateur.id)}
    <div slot="cell:prenomNom:{i}" class="conteneur-nom">
      {#if utilisateur.estAdmin}
        <dsfr-badge label="Admin" type="accent" accent="blue-cumulus" size="sm"
        ></dsfr-badge>
      {/if}
      <span><b>{utilisateur.prenomNom}</b></span>
      {#if utilisateur.email !== utilisateur.prenomNom}
        <span>{utilisateur.email}</span>
      {/if}
    </div>
    <div slot="cell:nombreEntites:{i}">
      <span>
        {#if utilisateur.nombreEntites === 0}
          Aucune entité
        {:else}
          {utilisateur.nombreEntites} entité{utilisateur.nombreEntites > 1
            ? 's'
            : ''}
        {/if}
      </span>
    </div>
    <div slot="cell:nombreServices:{i}">
      <span>
        {#if utilisateur.nombreServices === 0}
          Aucun service
        {:else}
          {utilisateur.nombreServices} service{utilisateur.nombreServices > 1
            ? 's'
            : ''}
        {/if}
      </span>
    </div>
  {/each}
</dsfr-table>

<style lang="scss">
  :global(#conteneur-admin-utilisateurs) {
    text-align: left;
    background: #fff;
    width: 100%;
    padding: 32px 48px;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }

  .conteneur-nom {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }
</style>
