<script lang="ts">
  import { onMount } from 'svelte';
  import { decode } from 'html-entities';
  import type {
    ReponseApiServices,
    ReponseApiIndicesCyber,
    Service,
    IndiceCyber,
  } from './tableauDeBord.d';
  import ChargementEnCours from '../ui/ChargementEnCours.svelte';
  import EtiquetteProprietaire from './elementsDeService/EtiquetteProprietaire.svelte';
  import EtiquetteContributeurs from './elementsDeService/EtiquetteContributeurs.svelte';
  import EtiquetteIndiceCyber from './elementsDeService/EtiquetteIndiceCyber.svelte';
  import IconeChargementEnCours from '../ui/IconeChargementEnCours.svelte';
  import EtiquetteHomologation from './elementsDeService/EtiquetteHomologation.svelte';

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
  <table>
    <thead>
      <tr>
        <th>Nom du service</th>
        <th>Contributeurs</th>
        <th>Indice cyber</th>
        <th>Homologation</th>
      </tr>
    </thead>
    <tbody>
      {#each services as service (service.id)}
        {@const idService = service.id}
        {@const indiceCyberDuService = indicesCybers.find(
          (i) => i.id === idService
        )?.indiceCyber}
        <tr>
          <td>
            <a class="lien-service" href="/service/{idService}">
              {#if service.estProprietaire}
                <EtiquetteProprietaire />
              {/if}
              <span class="nom-service">{decode(service.nomService)}</span>
            </a>
          </td>
          <td>
            <EtiquetteContributeurs
              nombreContributeurs={service.nombreContributeurs}
            />
          </td>
          <td>
            {#if indiceCyberDuService !== undefined}
              <EtiquetteIndiceCyber score={indiceCyberDuService} {idService} />
            {:else}
              <IconeChargementEnCours />
            {/if}
          </td>
          <td>
            <EtiquetteHomologation
              statutHomologation={service.statutHomologation.id}
              label={service.statutHomologation.libelle}
              {idService}
            />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
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

  table {
    border-collapse: collapse;
    border: 1px solid #ddd;
    width: 100%;
  }

  table tr {
    border: 1px solid #ddd;
  }

  table td,
  table th {
    padding: 8px 16px;
  }

  table th {
    font-size: 14px;
    font-weight: 700;
    line-height: 24px;
  }

  .lien-service {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    line-height: 24px;
    color: var(--texte-fonce);
  }

  .lien-service:hover .nom-service {
    color: var(--bleu-mise-en-avant);
  }
</style>
