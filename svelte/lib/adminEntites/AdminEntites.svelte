<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './adminEntites.api';
  import type { EntiteSupervisee } from './adminEntites.types';

  let mesEntites: Array<EntiteSupervisee> = $state([]);

  onMount(async () => {
    mesEntites = await api.entitesDansMonPerimetre();
  });
</script>

<h1>Entités</h1>

<dsfr-table
  columns={[
    { key: 'nom', label: 'Entité' },
    { key: 'admins', label: 'Admin(s)' },
    { key: 'nombreServices', label: 'Nombre de services' },
  ]}
  rows={mesEntites}
  rich
  multiline
>
  {#each mesEntites as entite, i (entite.siret)}
    <div slot="cell:nombreServices:{i}">
      <span>
        {#if entite.nombreServices === 0}
          Aucun service
        {:else}
          {entite.nombreServices} service{entite.nombreServices > 1
            ? 's'
            : ''}{/if}
      </span>
    </div>
    <div slot="cell:admins:{i}" class="conteneur-admins">
      {#each entite.administrateurs as administrateur, j (j)}
        <dsfr-badge
          label={administrateur.prenomNom}
          type="accent"
          accent="blue-ecume"
          size="sm"
        ></dsfr-badge>
      {/each}
    </div>
  {/each}
</dsfr-table>

<style lang="scss">
  :global(#conteneur-admin-entites) {
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

  .conteneur-admins {
    display: flex;
    gap: 8px;
  }
</style>
