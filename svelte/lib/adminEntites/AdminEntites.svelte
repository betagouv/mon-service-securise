<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './adminEntites.api';
  import type { EntiteSupervisee } from './adminEntites.types';
  import Toaster from '../ui/Toaster.svelte';
  import Tuiles from './Tuiles.svelte';
  import BadgeAdministrateur from './LignesDuTableau/BadgeAdministrateur.svelte';
  import NombreServices from './LignesDuTableau/NombreServices.svelte';
  import NombreUtilisateurs from './LignesDuTableau/NombreUtilisateurs.svelte';
  import NommerUnAdmin from './LignesDuTableau/NommerUnAdmin.svelte';
  import GererLesAdmins from './LignesDuTableau/GererLesAdmins.svelte';
  import { chaineNormalisee } from '../outils/string';
  import ChampRecherche from '../ui/ChampRecherche.svelte';
  import AucunResultatRecherche from '../ui/AucunResultatRecherche.svelte';

  let mesEntites: Array<EntiteSupervisee> = $state([]);
  let recherche = $state('');

  onMount(async () => {
    await rafraichis();
  });

  const rafraichis = async () => {
    mesEntites = await api.entitesDansMonPerimetre();
  };

  let rechercheNormalisee = $derived(chaineNormalisee(recherche));

  const mesEntitesFiltrees = $derived(
    mesEntites.filter(
      (e) =>
        (e.nom && chaineNormalisee(e.nom).includes(rechercheNormalisee)) ||
        e.siret.includes(rechercheNormalisee)
    )
  );
</script>

<Toaster />

<svelte:document on:admins-entites-modifiees={rafraichis} />

<h1>Entités</h1>

<Tuiles {mesEntites} />

<ChampRecherche bind:valeur={recherche} />

{#if recherche.length > 0 && mesEntitesFiltrees.length === 0}
  <AucunResultatRecherche onclick={() => (recherche = '')} />
{:else}
  <dsfr-table
    columns={[
      { key: 'nom', label: 'Entité' },
      { key: 'admins', label: 'Admin(s)' },
      { key: 'nombreServices', label: 'Nombre de services' },
      { key: 'nombreUtilisateurs', label: "Nombre d'utilisateurs" },
      { key: 'actions', label: 'Actions' },
    ]}
    rows={mesEntitesFiltrees}
    rich
    multiline
  >
    {#each mesEntitesFiltrees as entite, i (entite.siret)}
      <div slot="cell:nom:{i}">
        <span><b>{entite.nom}</b></span>
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
{/if}

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
</style>
