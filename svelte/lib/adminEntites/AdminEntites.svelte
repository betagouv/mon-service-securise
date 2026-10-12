<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './adminEntites.api';
  import type { EntiteSupervisee } from './adminEntites.types';
  import Toaster from '../ui/Toaster.svelte';
  import Tuiles from './Tuiles.svelte';
  import TableauDesEntites from './TableauDesEntites.svelte';
  import { chaineNormalisee } from '../outils/string';
  import ChampRecherche from '../ui/ChampRecherche.svelte';
  import AucunResultatRecherche from '../ui/AucunResultatRecherche.svelte';
  import Loader from '../ui/Loader.svelte';

  let mesEntites: Array<EntiteSupervisee> = $state([]);
  let recherche = $state('');
  let enCoursChargement = $state(false);

  onMount(async () => {
    await rafraichis();
  });

  const rafraichis = async () => {
    enCoursChargement = true;
    mesEntites = await api.entitesDansMonPerimetre();
    enCoursChargement = false;
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

<Tuiles {mesEntites} {enCoursChargement} />

{#if !enCoursChargement}
  <ChampRecherche bind:valeur={recherche} />
{/if}

{#if enCoursChargement}
  <div class="conteneur-loader">
    <Loader />
  </div>
{:else if recherche.length > 0 && mesEntitesFiltrees.length === 0}
  <AucunResultatRecherche onclick={() => (recherche = '')} />
{:else}
  <TableauDesEntites entites={mesEntitesFiltrees} />
{/if}

<style lang="scss">
  :global(#conteneur-admin-entites) {
    text-align: left;
    background: #fff;
    width: 100%;
    padding: 32px 20px;
    overflow: auto;
  }

  :global(main) {
    background: white;
  }

  .conteneur-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }
</style>
