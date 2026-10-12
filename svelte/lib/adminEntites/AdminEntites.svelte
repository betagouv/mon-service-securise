<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from './adminEntites.api';
  import type {
    AdminEntitesProps,
    EntiteSupervisee,
  } from './adminEntites.types';
  import type { GroupeEntites } from '../groupes/groupes.d';
  import { apiGroupesEntites } from '../groupes/groupesEntites.api';
  import AccordeonDesEntites from './AccordeonDesEntites.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import Tuiles from './Tuiles.svelte';
  import TableauDesEntites from './TableauDesEntites.svelte';
  import { chaineNormalisee } from '../outils/string';
  import ChampRecherche from '../ui/ChampRecherche.svelte';
  import AucunResultatRecherche from '../ui/AucunResultatRecherche.svelte';
  import Loader from '../ui/Loader.svelte';

  let { avecGroupesEntites }: AdminEntitesProps = $props();

  let mesEntites: Array<EntiteSupervisee> = $state([]);
  let groupes: GroupeEntites[] = $state([]);
  let recherche = $state('');
  let enCoursChargement = $state(false);

  onMount(async () => {
    await rafraichis();
  });

  const rafraichis = async () => {
    enCoursChargement = true;
    const [entitesLues, groupesLus] = await Promise.all([
      api.entitesDansMonPerimetre(),
      avecGroupesEntites ? apiGroupesEntites.lisGroupes() : [],
    ]);
    mesEntites = entitesLues;
    groupes = groupesLus;
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

  let groupesTries = $derived(
    [...groupes].sort((a, b) => a.libelle.localeCompare(b.libelle))
  );

  const entitesDuGroupe = (groupe: GroupeEntites) =>
    mesEntitesFiltrees.filter((e) => groupe.siretsAssocies.includes(e.siret));

  let entitesSansGroupe = $derived.by(() => {
    const siretsDansDesGroupes = new Set(
      groupes.flatMap((g) => g.siretsAssocies)
    );
    return mesEntitesFiltrees.filter((e) => !siretsDansDesGroupes.has(e.siret));
  });
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
{:else if groupesTries.length > 0}
  <div class="contenu-groupes">
    {#each groupesTries as groupe (groupe.id)}
      <AccordeonDesEntites {groupe} entites={entitesDuGroupe(groupe)} />
    {/each}
    <AccordeonDesEntites entites={entitesSansGroupe} ouvertParDefaut />
  </div>
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

  .contenu-groupes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }
</style>
