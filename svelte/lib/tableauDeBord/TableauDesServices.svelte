<script lang="ts">
  import { decode } from 'html-entities';
  import EtiquetteIndiceCyber from './elementsDeService/EtiquetteIndiceCyber.svelte';
  import EtiquetteHomologation from './elementsDeService/EtiquetteHomologation.svelte';
  import EtiquetteContributeurs from './elementsDeService/EtiquetteContributeurs.svelte';
  import IconeChargementEnCours from '../ui/IconeChargementEnCours.svelte';
  import EtiquetteProprietaire from './elementsDeService/EtiquetteProprietaire.svelte';
  import ActionRecommandee from './elementsDeService/ActionRecommandee.svelte';
  import type { IndiceCyber } from './tableauDeBord.d';
  import { resultatsDeRecherche } from './stores/resultatDeRecherche.store';

  export let indicesCybers: IndiceCyber[] = [];

  let selection: string[] = [];

  $: toutEstCoche = selection.length === $resultatsDeRecherche.length;
  const basculeSelectionTousServices = () => {
    if (toutEstCoche) selection = [];
    else selection = $resultatsDeRecherche.map((s) => s.id);
  };

  $: $resultatsDeRecherche, supprimeSelection();
  const supprimeSelection = () => {
    selection = [];
  };
</script>

<table>
  <thead>
    <tr>
      <td colspan="6" class="case-conteneur-action">
        <div class="conteneur-actions">
          {#if selection.length}
            {@const pluriel = selection.length > 1 ? 's' : ''}
            <span class="nombre-selection">
              {selection.length}
              ligne{pluriel}
              sélectionnée{pluriel}
            </span>
          {/if}
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <input
          type="checkbox"
          on:change={basculeSelectionTousServices}
          checked={toutEstCoche}
          indeterminate={!toutEstCoche && selection.length > 0}
          title="Sélection de tous les services"
        />
      </td>
      <th>Nom du service</th>
      <th>Contributeurs</th>
      <th>Indice cyber</th>
      <th>Homologation</th>
      <th>Actions recommandées</th>
    </tr>
  </thead>
  <tbody>
    {#each $resultatsDeRecherche as service (service.id)}
      {@const idService = service.id}
      {@const indiceCyberDuService = indicesCybers.find(
        (i) => i.id === idService
      )?.indiceCyber}
      <tr>
        <td>
          <input
            type="checkbox"
            bind:group={selection}
            value={idService}
            title="Sélection du service {service.nomService}"
          />
        </td>
        <td>
          <a class="lien-service" href="/service/{idService}">
            {#if service.estProprietaire}
              <EtiquetteProprietaire />
            {/if}
            <span class="nom-service">{decode(service.nomService)}</span>
            <span class="nom-organisation"
              >{decode(service.organisationResponsable)}</span
            >
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
        <td>
          <ActionRecommandee action={service.actionRecommandee} {idService} />
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

  table td:first-of-type {
    border-right: 1px solid #ddd;
  }

  .lien-service {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    font-weight: 700;
    line-height: 24px;
    color: var(--texte-fonce);
  }

  .nom-organisation {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
  }

  .lien-service:hover .nom-service {
    color: var(--bleu-mise-en-avant);
  }

  input[type='checkbox'] {
    appearance: none;
    border-radius: 4px;
    border: 1px solid #042794;
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
  }

  input[type='checkbox']:checked,
  input[type='checkbox']:indeterminate {
    background: var(--bleu-mise-en-avant);
    border-color: var(--bleu-mise-en-avant);
  }

  input[type='checkbox']:checked::before {
    content: '';
    width: 4px;
    height: 8px;
    border-right: 1.5px solid white;
    border-bottom: 1.5px solid white;
    display: block;
    transform: translate(4px, 1px) rotate(45deg);
  }

  input[type='checkbox']:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  input[type='checkbox']:indeterminate::before {
    content: '';
    height: 8px;
    border-bottom: 1.5px solid white;
    display: block;
    transform: translate(4px, -1.5px) rotate(0);
    border-right: 0;
    width: 6px;
  }

  .case-conteneur-action {
    padding: 0;
  }

  .conteneur-actions {
    padding: 12px 24px;
  }

  .nombre-selection {
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem;
    color: var(--gris-texte-additionnel);
  }
</style>
