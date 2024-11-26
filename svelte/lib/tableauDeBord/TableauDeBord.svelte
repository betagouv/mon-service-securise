<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    ReponseApiServices,
    ReponseApiIndicesCyber,
    Service,
    IndiceCyber,
    IndiceCyberMoyen,
  } from './tableauDeBord.d';
  import ChargementEnCours from '../ui/ChargementEnCours.svelte';
  import TableauDesServices from './TableauDesServices.svelte';
  import BandeauInfo from './BandeauInfo.svelte';

  export let estSuperviseur: boolean;

  let enCoursChargement = false;

  let services: Service[] = [];
  let indicesCybers: IndiceCyber[] = [];
  let nombreServices: number;
  let nombreServicesHomologues: number;
  let indiceCyberMoyen: IndiceCyberMoyen;

  const recupereServices = async () => {
    enCoursChargement = true;
    const reponse: ReponseApiServices = (await axios.get('/api/services')).data;
    services = reponse.services;
    nombreServices = reponse.resume.nombreServices;
    nombreServicesHomologues = reponse.resume.nombreServicesHomologues;
    enCoursChargement = false;
  };

  const recupereIndicesCybers = async () => {
    const reponse: ReponseApiIndicesCyber = (
      await axios.get('/api/services/indices-cyber')
    ).data;
    indicesCybers = reponse.services;
    indiceCyberMoyen = reponse.resume.indiceCyberMoyen;
  };

  onMount(async () => {
    await recupereServices();
    await recupereIndicesCybers();
  });
</script>

<div class="tableau-de-bord">
  <span class="entete-tableau-de-bord">
    <h1>Mon tableau de bord</h1>
    {#if estSuperviseur}
      <span class="lien-supervision"
        ><a href="/supervision">Voir les statistiques</a></span
      >
    {/if}
  </span>

  {#if enCoursChargement}
    <div class="conteneur-loader">
      <ChargementEnCours />
    </div>
  {:else}
    <BandeauInfo
      {nombreServices}
      {nombreServicesHomologues}
      {indiceCyberMoyen}
    />
    <TableauDesServices {services} {indicesCybers} />
  {/if}
</div>

<style>
  :global(#tableau-de-bord) {
    width: 100%;
    padding: 32px 48px;
  }

  .conteneur-loader {
    width: 100%;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h1 {
    margin: 0;
  }

  .tableau-de-bord {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .entete-tableau-de-bord {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .lien-supervision a {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .lien-supervision a::before {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    background-size: contain;
    background: url('/statique/assets/images/tableauDeBord/icone_graphique.svg')
      no-repeat center;
  }
</style>
