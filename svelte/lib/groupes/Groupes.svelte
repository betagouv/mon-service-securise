<script lang="ts">
  import Toaster from '../ui/Toaster.svelte';
  import TitreOngletDSFR from '../ui/TitreOngletDSFR.svelte';
  import { api } from './groupes.api';
  import { apiGroupesEntites } from './groupesEntites.api';
  import type { Groupe, GroupeEntites, GroupesProps } from './groupes.d';
  import OngletGroupes from './OngletGroupes.svelte';
  import { singulierPluriel } from '../outils/string';
  import { services } from '../tableauDeBord/stores/services.store';
  import type { ReponseApiServices } from '../tableauDeBord/tableauDeBord.d';

  let { avecGroupesServices, avecGroupesEntites }: GroupesProps = $props();

  const configurationsTabs = [
    { id: 'services', label: 'Groupes de services' },
    { id: 'entites', label: 'Groupes d’entités' },
  ];
  let idTabActive = $state(0);

  const elementsAOrganiser = $derived(
    [avecGroupesServices && 'vos services', avecGroupesEntites && 'vos entités']
      .filter(Boolean)
      .join(' et ')
  );

  const chargeServices = async () => {
    const reponse = await axios.get<ReponseApiServices>('/api/services');
    services.reinitialise(reponse.data.services);
  };

  const lienServicesDuGroupe = (groupe: Groupe) => {
    const nombreServices = groupe.idServicesAssocies.filter((id) =>
      $services.some((s) => s.id === id)
    ).length;
    return {
      label: `${nombreServices} ${singulierPluriel('service', 'services', nombreServices)}`,
      title: `Voir les services du groupe ${groupe.libelle} sur le tableau de bord`,
      href: `/tableauDeBord?idGroupe=${groupe.id}`,
    };
  };

  const lienEntitesDuGroupe = (groupe: GroupeEntites) => {
    const nombreEntites = groupe.siretsAssocies.length;
    return {
      label: `${nombreEntites} ${singulierPluriel('entité', 'entités', nombreEntites)}`,
      title: `Voir les entités du groupe ${groupe.libelle}`,
      href: `/admin/entites?idGroupe=${groupe.id}`,
    };
  };
</script>

<h1>Mes groupes</h1>

<p class="introduction">
  Organisez {elementsAOrganiser} en groupes pour faciliter leur classement et leur
  gestion.
</p>

{#snippet ongletServices()}
  <OngletGroupes
    identifiant="services"
    {api}
    textes={{
      exempleLibelle: 'exemple : Enfance et famille',
      aucunGroupe:
        'Saisissez un nom ci-dessus puis cliquez sur « Créer le groupe ». Vous pourrez ensuite y classer vos services depuis le tableau de bord.',
      explicationListe:
        'Un service peut appartenir à plusieurs groupes : la somme des colonnes « Services » peut donc dépasser le nombre total de services enregistrés. Pour classer un service dans un groupe, rendez-vous sur le tableau de bord.',
      colonneElements: 'Services',
    }}
    chargeElements={chargeServices}
    lienElements={lienServicesDuGroupe}
  />
{/snippet}

{#snippet ongletEntites()}
  <OngletGroupes
    identifiant="entites"
    api={apiGroupesEntites}
    textes={{
      exempleLibelle: 'exemple : Région Nord',
      aucunGroupe:
        'Saisissez un nom ci-dessus puis cliquez sur « Créer le groupe ». Vous pourrez ensuite y classer vos entités depuis la page Entités.',
      explicationListe:
        'Une entité peut appartenir à plusieurs groupes : la somme des colonnes « Entités » peut donc dépasser le nombre total d’entités de votre périmètre. Pour classer une entité dans un groupe, rendez-vous sur la page Entités.',
      colonneElements: 'Entités',
    }}
    lienElements={lienEntitesDuGroupe}
  />
{/snippet}

{#if avecGroupesServices && avecGroupesEntites}
  <dsfr-tabs
    tabs={configurationsTabs}
    activeTabIndex={idTabActive}
    ontabchanged={(e: CustomEvent<{ index: number }>) =>
      (idTabActive = e.detail.index)}
  >
    {#each configurationsTabs as tab, index (tab.id)}
      <div slot="tab-{index + 1}">
        <TitreOngletDSFR active={idTabActive === index} libelle={tab.label} />
      </div>
    {/each}
    <div slot="panel-1">
      {@render ongletServices()}
    </div>
    <div slot="panel-2">
      {@render ongletEntites()}
    </div>
  </dsfr-tabs>
{:else if avecGroupesServices}
  {@render ongletServices()}
{:else}
  {@render ongletEntites()}
{/if}

<Toaster />

<style lang="scss">
  :global(main:has(#conteneur-groupes)) {
    background: white;
    text-align: left;
    padding: 56px 0;
  }

  :global(#conteneur-groupes) {
    width: 792px;
  }

  h1 {
    color: #161616;
    font-size: 2rem;
    line-height: 2.5rem;
    margin: 0;
  }

  .introduction {
    color: #3a3a3a;
    font-size: 1.25rem;
    line-height: 2rem;
    margin: 16px 0;
    text-align: left;
  }

  dsfr-tabs {
    margin: 56px 0;
  }
</style>
