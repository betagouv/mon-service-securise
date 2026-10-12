<script lang="ts">
  import type { EntiteSupervisee } from './adminEntites.types';
  import BadgeAdministrateur from './LignesDuTableau/BadgeAdministrateur.svelte';
  import NombreServices from './LignesDuTableau/NombreServices.svelte';
  import NombreUtilisateurs from './LignesDuTableau/NombreUtilisateurs.svelte';
  import NommerUnAdmin from './LignesDuTableau/NommerUnAdmin.svelte';
  import GererLesAdmins from './LignesDuTableau/GererLesAdmins.svelte';
  import NomEntite from '../ui/NomEntite.svelte';

  interface Props {
    entites: EntiteSupervisee[];
  }

  let { entites }: Props = $props();
</script>

<dsfr-table
  columns={[
    { key: 'nom', label: 'Entité' },
    { key: 'admins', label: 'Admin(s)' },
    { key: 'nombreServices', label: 'Nombre de services' },
    { key: 'nombreUtilisateurs', label: "Nombre d'utilisateurs" },
    { key: 'actions', label: 'Actions' },
  ]}
  rows={entites}
  rich
  multiline
>
  {#each entites as entite, i (entite.siret)}
    <div slot="cell:nom:{i}">
      <span><b><NomEntite {entite} /></b></span>
    </div>
    <div slot="cell:admins:{i}" class="conteneur-admins">
      {#each entite.administrateurs as { prenomNom }, j (j)}
        <BadgeAdministrateur {prenomNom} />
      {/each}
    </div>
    <div slot="cell:nombreServices:{i}">
      <NombreServices nombreServices={entite.nombreServices} />
    </div>
    <div slot="cell:nombreUtilisateurs:{i}">
      <NombreUtilisateurs nombreUtilisateurs={entite.nombreUtilisateurs} />
    </div>
    <div slot="cell:actions:{i}">
      {#if entite.administrateurs.length === 0}
        <NommerUnAdmin {entite} />
      {:else}
        <GererLesAdmins {entite} />
      {/if}
    </div>
  {/each}
</dsfr-table>

<style lang="scss">
  .conteneur-admins {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
