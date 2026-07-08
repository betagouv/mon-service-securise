<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    IndiceCyberMoyen,
    ReponseApiIndicesCyber,
    ReponseApiServices,
  } from './tableauDeBord.d';
  import ChargementEnCours from '../ui/ChargementEnCours.svelte';
  import TableauDesServices from './TableauDesServices.svelte';
  import { donneesVisiteGuidee } from './tableauDeBord';
  import { services } from './stores/services.store';
  import BandeauFiltres from './BandeauFiltres.svelte';
  import BandeauBlog from './BandeauBlog.svelte';
  import { selectionIdsServices } from './stores/selectionService.store';
  import Toaster from '../ui/Toaster.svelte';
  import { brouillonsService } from './stores/brouillonsService.store';
  import Tuiles from './Tuiles.svelte';
  import TitreOngletDSFR from '../ui/TitreOngletDSFR.svelte';
  import {
    affichageParStatutHomologation,
    affichageParStatutHomologationSelectionne,
    type StatutHomologation,
  } from './stores/affichageParStatutHomologation';

  interface Props {
    estSuperviseur: boolean;
    estAdmin: boolean;
    avecGestionOrganisations: boolean;
    modeVisiteGuidee: boolean;
    profilUtilisateurComplet?: boolean;
  }

  let {
    estSuperviseur,
    estAdmin,
    avecGestionOrganisations,
    modeVisiteGuidee,
    profilUtilisateurComplet = true,
  }: Props = $props();

  let enCoursChargement = $state(true);

  let nombreServices: number | undefined = $state();
  let nombreServicesHomologues: number | undefined = $state();
  let nombreHomologationsExpirees: number | undefined = $state();
  let indiceCyberMoyen: IndiceCyberMoyen | undefined = $state();

  onMount(async () => {
    if (modeVisiteGuidee && profilUtilisateurComplet) {
      services.reinitialise(donneesVisiteGuidee.services);
      nombreServices = donneesVisiteGuidee.resume.nombreServices;
      nombreServicesHomologues =
        donneesVisiteGuidee.resume.nombreServicesHomologues;
      nombreHomologationsExpirees =
        donneesVisiteGuidee.resume.nombreHomologationsExpirees;
      services.ajouteIndicesCyber(donneesVisiteGuidee.indicesCyber);
      indiceCyberMoyen = donneesVisiteGuidee.indiceCyber;
      enCoursChargement = false;
    } else {
      await rafraichisServices();
    }
  });

  const recupereServices = async () => {
    const reponse: ReponseApiServices = (await axios.get('/api/services')).data;
    services.reinitialise(reponse.services);
    brouillonsService.reinitialise(reponse.brouillonsService);
    selectionIdsServices.vide();
    nombreServices = reponse.resume.nombreServices;
    nombreServicesHomologues = reponse.resume.nombreServicesHomologues;
    nombreHomologationsExpirees = reponse.resume.nombreHomologationsExpirees;
    enCoursChargement = false;
  };

  const recupereIndicesCybers = async () => {
    const reponse: ReponseApiIndicesCyber = (
      await axios.get('/api/services/indices-cyber')
    ).data;
    services.ajouteIndicesCyber(reponse.services);
    indiceCyberMoyen = reponse.resume.indiceCyberMoyen;
  };

  const rafraichisServices = async () => {
    await recupereServices();
    await recupereIndicesCybers();
    document.body.dispatchEvent(
      new CustomEvent('svelte-tableau-des-services-rafraichi')
    );
  };

  const configurationsTabs: { id: StatutHomologation; label: string }[] = [
    {
      id: 'tous',
      label: 'Tous les services',
    },
    {
      id: 'enCoursEdition',
      label: 'Homologation en cours',
    },
    {
      id: 'bientotExpiree',
      label: 'Homologation bientôt expirée',
    },
    {
      id: 'expiree',
      label: 'Homologation expirée',
    },
  ];

  let idTabActive: number = $state(0);

  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    idTabActive = e.detail.index;
    $affichageParStatutHomologationSelectionne =
      configurationsTabs[idTabActive].id;
  };
</script>

<svelte:body
  on:rafraichis-services={rafraichisServices}
  on:collaboratif-service-modifie={rafraichisServices}
/>
<Toaster />
<div class="tableau-de-bord">
  <span class="entete-tableau-de-bord">
    <h1>{estAdmin || estSuperviseur ? 'Services' : 'Mon tableau de bord'}</h1>
  </span>

  {#if enCoursChargement}
    <div class="conteneur-loader">
      <ChargementEnCours />
    </div>
  {:else}
    {#if nombreServices !== undefined && nombreServicesHomologues !== undefined && nombreHomologationsExpirees !== undefined}
      <Tuiles
        {nombreServices}
        {nombreServicesHomologues}
        {nombreHomologationsExpirees}
        {indiceCyberMoyen}
        {estSuperviseur}
        {avecGestionOrganisations}
      />
    {/if}
    <BandeauFiltres />

    <dsfr-tabs
      tabs={configurationsTabs}
      active-tab-index={idTabActive}
      ontabchanged={gereChangementTab}
    >
      {#each configurationsTabs as tab, index (index)}
        <div slot="tab-{index + 1}">
          <TitreOngletDSFR
            active={idTabActive === index}
            libelle={configurationsTabs[index].label}
            libellePastille={$affichageParStatutHomologation[
              tab.id
            ].length.toString()}
          />
        </div>
        <div slot="panel-{index + 1}">
          <TableauDesServices
            indicesCyberCharges={indiceCyberMoyen !== undefined}
          />
        </div>
      {/each}
    </dsfr-tabs>

    <BandeauBlog />
  {/if}
</div>

<style>
  :global(#tableau-de-bord) {
    width: 100%;
    padding: 32px 20px;
    text-align: left;
    background: white;
    overflow: auto;
  }

  .conteneur-loader {
    width: 100%;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }

  .tableau-de-bord {
    display: flex;
    flex-direction: column;
  }

  .entete-tableau-de-bord {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
