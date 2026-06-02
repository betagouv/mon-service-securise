<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './adminUtilisateurs.api';
  import { api as apiEntites } from '../adminEntites/adminEntites.api';
  import Tuiles from './Tuiles.svelte';
  import type { EntiteSupervisee } from '../adminEntites/adminEntites.types';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirGestionUtilisateurAdministre from './TiroirGestionUtilisateurAdministre/TiroirGestionUtilisateurAdministre.svelte';
  import BadgeAdmin from './BadgeAdmin.svelte';
  import type { UtilisateurAdministre } from './adminUtilisateurs.types';
  import Toaster from '../ui/Toaster.svelte';

  let mesUtilisateurs: UtilisateurAdministre[] = $state([]);
  let mesEntites: Array<EntiteSupervisee> = $state([]);

  onMount(async () => {
    await rafraichis();
  });

  const rafraichis = async () => {
    mesUtilisateurs = await api.utilisateursDansMonPerimetre();
    mesEntites = await apiEntites.entitesDansMonPerimetre();
  };
</script>

<Toaster />
<h1>Utilisateurs</h1>

<Tuiles nombreUtilisateurs={mesUtilisateurs.length} {mesEntites} />

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
        <BadgeAdmin />
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
        {#if utilisateur.autorisations.length === 0}
          Aucun service
        {:else}
          {utilisateur.autorisations.length} service{utilisateur.autorisations
            .length > 1
            ? 's'
            : ''}
        {/if}
      </span>
    </div>
    <div slot="cell:actions:{i}">
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        kind="secondary"
        label="Gérer les accès aux services"
        size="sm"
        onclick={() => {
          tiroirStore.afficheContenu(TiroirGestionUtilisateurAdministre, {
            utilisateur,
            toutesEntites: mesEntites,
          });
        }}
      ></dsfr-button>
    </div>
  {/each}
</dsfr-table>

<style lang="scss">
  :global(main) {
    background: white;
  }

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
