<script lang="ts">
  import { onMount } from 'svelte';
  import type {
    ReponseApiServices,
    ReponseApiIndicesCyber,
    Service,
    IndiceCyber,
  } from './tableauDeBord.d';
  import ChargementEnCours from '../ui/ChargementEnCours.svelte';
  import TableauDesServices from './TableauDesServices.svelte';

  let enCoursChargement = false;

  let services: Service[] = [];
  let indicesCybers: IndiceCyber[] = [];
  const recupereServices = async () => {
    enCoursChargement = true;
    const reponse: ReponseApiServices = (await axios.get('/api/services')).data;
    services = reponse.services;
    enCoursChargement = false;
  };

  const recupereIndicesCybers = async () => {
    const reponse: ReponseApiIndicesCyber = (
      await axios.get('/api/services/indices-cyber')
    ).data;
    indicesCybers = reponse.services;
  };

  onMount(async () => {
    await recupereServices();
    await recupereIndicesCybers();
  });
</script>

<h1>Mon tableau de bord</h1>

{#if enCoursChargement}
  <div class="conteneur-loader">
    <ChargementEnCours />
  </div>
{:else}
  <TableauDesServices {services} {indicesCybers} />
{/if}

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
    margin: 0 0 32px;
  }
</style>
