<script lang="ts">
  import { decode } from 'html-entities';
  import EtiquetteIndiceCyber from './elementsDeService/EtiquetteIndiceCyber.svelte';
  import EtiquetteHomologation from './elementsDeService/EtiquetteHomologation.svelte';
  import EtiquetteContributeurs from './elementsDeService/EtiquetteContributeurs.svelte';
  import IconeChargementEnCours from '../ui/IconeChargementEnCours.svelte';
  import EtiquetteProprietaire from './elementsDeService/EtiquetteProprietaire.svelte';
  import type { IndiceCyber, Service } from './tableauDeBord.d';

  export let services: Service[] = [];
  export let indicesCybers: IndiceCyber[] = [];
</script>

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

<style>
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
