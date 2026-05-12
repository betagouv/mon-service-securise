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
    { key: 'entite', label: 'Entité' },
    { key: 'actions', label: 'Actions' },
  ]}
  rows={mesUtilisateurs}
  rich
  multiline
>
  {#each mesUtilisateurs as utilisateur, i (utilisateur.id)}
    <div slot="cell:prenomNom:{i}">
      <span>{utilisateur.prenomNom} ({utilisateur.email})</span>
    </div>
    <div slot="cell:entite:{i}">
      <span>{utilisateur.entite.nom ?? '-'}</span>
    </div>
    <div slot="cell:postes:{i}">
      <span
        >{utilisateur.postes.length > 0
          ? utilisateur.postes.join(', ')
          : '-'}</span
      >
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
</style>
