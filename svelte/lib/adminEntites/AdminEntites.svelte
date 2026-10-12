<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { enleveParametreDeUrl } from '../outils/url';
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
  import { chaineNormalisee, singulierPluriel } from '../outils/string';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirAssociationGroupesEntites from './TiroirAssociationGroupesEntites.svelte';
  import ChampRecherche from '../ui/ChampRecherche.svelte';
  import AucunResultatRecherche from '../ui/AucunResultatRecherche.svelte';
  import Loader from '../ui/Loader.svelte';

  let { avecGroupesEntites }: AdminEntitesProps = $props();

  let mesEntites: Array<EntiteSupervisee> = $state([]);
  let groupes: GroupeEntites[] = $state([]);
  let recherche = $state('');
  let enCoursChargement = $state(false);
  let siretsSelectionnes: string[] = $state([]);

  const changeRecherche = (nouvelleRecherche: string) => {
    recherche = nouvelleRecherche;
    siretsSelectionnes = [];
  };

  const changeSelection = (sirets: string[]) => {
    siretsSelectionnes = sirets;
  };

  const rafraichisGroupes = async () => {
    groupes = await apiGroupesEntites.lisGroupes();
  };

  const rafraichisApresRetrait = async () => {
    siretsSelectionnes = [];
    await rafraichisGroupes();
  };

  const ouvreTiroirAssociation = () =>
    tiroirStore.afficheContenu(TiroirAssociationGroupesEntites, {
      sirets: siretsSelectionnes,
      groupes,
      onGroupesModifies: rafraichisGroupes,
      onEntitesClassees: () => (siretsSelectionnes = []),
    });

  let idGroupeOuvert: string | undefined = $state();
  let elementsAccordeon: Record<string, AccordeonDesEntites> = $state({});
  let hauteurBarreActions = $state(0);

  const lisGroupeAOuvrir = () => {
    const requete = new URLSearchParams(window.location.search);
    idGroupeOuvert = requete.get('idGroupe') || undefined;
    if (idGroupeOuvert) enleveParametreDeUrl('idGroupe');
  };

  const focaliseGroupeOuvert = async () => {
    if (!idGroupeOuvert) return;
    await tick();
    elementsAccordeon[idGroupeOuvert]?.focus();
  };

  onMount(async () => {
    lisGroupeAOuvrir();
    await rafraichis();
    await focaliseGroupeOuvert();
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

  let siretsDansDesGroupes = $derived(
    new Set(groupes.flatMap((g) => g.siretsAssocies))
  );

  let avecEntitesSansGroupe = $derived(
    mesEntites.some((e) => !siretsDansDesGroupes.has(e.siret))
  );

  let entitesSansGroupe = $derived(
    mesEntitesFiltrees.filter((e) => !siretsDansDesGroupes.has(e.siret))
  );
</script>

<Toaster />

<svelte:document on:admins-entites-modifiees={rafraichis} />

<h1>Entités</h1>

<Tuiles {mesEntites} {enCoursChargement} />

{#if !enCoursChargement}
  <ChampRecherche bind:valeur={() => recherche, changeRecherche} />
{/if}

{#if avecGroupesEntites && !enCoursChargement}
  <div class="barre-actions" bind:offsetHeight={hauteurBarreActions}>
    <span class="sous-texte">
      {#if siretsSelectionnes.length > 0}
        {siretsSelectionnes.length}
        {singulierPluriel(
          'entité sélectionnée',
          'entités sélectionnées',
          siretsSelectionnes.length
        )}
      {/if}
    </span>
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <dsfr-button
      label="Classer dans des groupes"
      icon="folder-2-line"
      kind="tertiary-no-outline"
      has-icon
      disabled={siretsSelectionnes.length === 0}
      onclick={ouvreTiroirAssociation}
    ></dsfr-button>
  </div>
{/if}

{#if enCoursChargement}
  <div class="conteneur-loader">
    <Loader />
  </div>
{:else if recherche.length > 0 && mesEntitesFiltrees.length === 0}
  <AucunResultatRecherche onclick={() => changeRecherche('')} />
{:else if groupesTries.length > 0}
  <div
    class="contenu-groupes"
    style:--hauteur-barre-actions="{hauteurBarreActions}px"
  >
    {#each groupesTries as groupe (groupe.id)}
      <AccordeonDesEntites
        bind:this={elementsAccordeon[groupe.id]}
        {groupe}
        entites={entitesDuGroupe(groupe)}
        {recherche}
        ouvertParDefaut={groupe.id === idGroupeOuvert}
        selectionnable={avecGroupesEntites}
        {siretsSelectionnes}
        onSelectionChange={changeSelection}
        onEntitesRetirees={rafraichisApresRetrait}
      />
    {/each}
    {#if avecEntitesSansGroupe}
      <AccordeonDesEntites
        entites={entitesSansGroupe}
        {recherche}
        ouvertParDefaut={!idGroupeOuvert}
        selectionnable={avecGroupesEntites}
        {siretsSelectionnes}
        onSelectionChange={changeSelection}
      />
    {/if}
  </div>
{:else}
  <TableauDesEntites
    entites={mesEntitesFiltrees}
    selectionnable={avecGroupesEntites}
    {siretsSelectionnes}
    onSelectionChange={changeSelection}
  />
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

  .barre-actions {
    position: sticky;
    top: 0;
    z-index: 3;
    background: white;
    padding: 12px 0;
    margin: 12px 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sous-texte {
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: #666666;
    white-space: nowrap;
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
