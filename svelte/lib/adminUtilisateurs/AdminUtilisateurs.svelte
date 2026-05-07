<script lang="ts">
  import { onMount } from 'svelte';
  import type { Utilisateur } from '../ui/types';
  import { api } from './adminUtilisateurs.api';

  let mesUtilisateurs: Utilisateur[] = $state([]);

  onMount(async () => {
    mesUtilisateurs = await api.utilisateursDansMonPerimetre();
  });
</script>

<h1>Utilisateurs</h1>

<dsfr-table
  columns={[
    { key: 'nom', label: 'Nom' },
    { key: 'entite', label: 'Entité' },
    { key: 'postes', label: 'Rôle' },
    { key: 'actions', label: 'Actions' },
  ]}
  rows={mesUtilisateurs}
></dsfr-table>

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
</style>
