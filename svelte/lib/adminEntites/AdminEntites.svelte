<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './adminEntites.api';
  import type { EntiteSupervisee } from './adminEntites.types';
  import TiroirInvitationAdmins from './TiroirInvitationAdmins.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import Toaster from '../ui/Toaster.svelte';

  let mesEntites: Array<EntiteSupervisee> = $state([]);

  onMount(async () => {
    await rafraichis();
  });

  const rafraichis = async () => {
    mesEntites = await api.entitesDansMonPerimetre();
  };
</script>

<Toaster />
<svelte:document on:admins-entites-modifiees={rafraichis} />
<h1>Entités</h1>
<dsfr-table
  columns={[
    { key: 'nom', label: 'Entité' },
    { key: 'admins', label: 'Admin(s)' },
    { key: 'nombreServices', label: 'Nombre de services' },
    { key: 'nombreUtilisateurs', label: "Nombre d'utilisateurs" },
    { key: 'actions', label: 'Actions' },
  ]}
  rows={mesEntites}
  rich
  multiline
>
  {#each mesEntites as entite, i (entite.siret)}
    <div slot="cell:nom:{i}">
      <span><b>{entite.nom}</b></span>
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
    <div slot="cell:nombreServices:{i}">
      <span>
        {#if entite.nombreServices === 0}
          Aucun service
        {:else}
          {entite.nombreServices} service{entite.nombreServices > 1 ? 's' : ''}
        {/if}
      </span>
    </div>
    <div slot="cell:nombreUtilisateurs:{i}">
      <span>
        {#if entite.nombreUtilisateurs === 0}
          Aucun utilisateur
        {:else}
          {entite.nombreUtilisateurs} utilisateur{entite.nombreUtilisateurs > 1
            ? 's'
            : ''}
        {/if}
      </span>
    </div>
    <div slot="cell:actions:{i}">
      {#if entite.administrateurs.length === 0}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          kind="primary"
          label="Nommer un admin"
          size="sm"
          hasIcon
          icon="add-line"
          onclick={() => {
            tiroirStore.afficheContenu(TiroirInvitationAdmins, { entite });
          }}
        ></dsfr-button>
      {:else}
        <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
        <dsfr-button
          kind="secondary"
          label="Gérer les admins"
          size="sm"
          onclick={() => {
            tiroirStore.afficheContenu(TiroirInvitationAdmins, { entite });
          }}
        ></dsfr-button>
      {/if}
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

  :global(main) {
    background: white;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }

  .conteneur-admins {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  dsfr-button {
    white-space: nowrap;
  }
</style>
