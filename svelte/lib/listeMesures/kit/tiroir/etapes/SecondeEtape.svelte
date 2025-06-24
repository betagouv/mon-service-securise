<script lang="ts">
  import BarreDeRecherche from '../../../../ui/BarreDeRecherche.svelte';
  import ListeDeroulanteRiche from '../../../../ui/ListeDeroulanteRiche.svelte';
  import type {
    MesureReferentiel,
    ReferentielStatut,
  } from '../../../../ui/types';
  import { decode } from 'html-entities';
  import TagStatutMesure from '../../../../ui/TagStatutMesure.svelte';
  import { servicesAvecMesuresAssociees } from '../../../stores/servicesAvecMesuresAssociees.store';
  import { mesuresAvecServicesAssociesStore } from '../../../stores/mesuresAvecServicesAssocies.store';
  import AucunResultat from '../../AucunResultat.svelte';

  export let statuts: ReferentielStatut;
  export let mesure: MesureReferentiel;
  let recherche: string = '';
  let filtrageStatut: Record<'statut', string[]> = { statut: [] };

  const effaceRechercheEtFiltres = () => {
    recherche = '';
    filtrageStatut = { statut: [] };
  };

  $: servicesAssocies =
    mesure &&
    $servicesAvecMesuresAssociees.filter((s) => {
      return $mesuresAvecServicesAssociesStore[mesure.id].includes(s?.id);
    });

  $: servicesFiltres = servicesAssocies
    .filter((s) =>
      recherche
        ? s.nomService.toLowerCase().includes(recherche.toLowerCase()) ||
          s.organisationResponsable
            .toLowerCase()
            .includes(recherche.toLowerCase())
        : true
    )
    .filter((s) =>
      filtrageStatut.statut.length > 0
        ? filtrageStatut.statut.includes(
            s.mesuresAssociees[mesure.id].statut || 'aDefinir'
          )
        : true
    );
</script>

<span>
  Sélectionnez les services concernés par ces modifications. Les données
  existantes seront remplacées.
</span>
<div class="filtres">
  <BarreDeRecherche bind:recherche />
  <ListeDeroulanteRiche
    bind:valeursSelectionnees={filtrageStatut}
    id="filtres"
    libelle="Filtrer"
    options={{
      categories: [{ id: 'statut', libelle: 'Statuts' }],
      items: [
        { libelle: 'À définir', valeur: 'aDefinir', idCategorie: 'statut' },
        ...Object.entries(statuts).map(([id, statut]) => ({
          libelle: statut,
          valeur: id,
          idCategorie: 'statut',
        })),
      ],
    }}
  />
</div>
<table>
  <thead>
    <tr>
      <th>Nom du service</th>
      <th>Statut actuel</th>
      <th>Précision actuelle</th>
    </tr>
  </thead>
  <tbody>
    {#each servicesFiltres as service}
      <tr>
        <td>
          <div class="intitule-service">
            <span class="nom">{decode(service.nomService)}</span>
            <span class="organisation">{service.organisationResponsable}</span>
          </div>
        </td>
        <td
          ><TagStatutMesure
            referentielStatuts={statuts}
            statut={service.mesuresAssociees[mesure.id].statut}
          /></td
        >
        <td>{decode(service.mesuresAssociees[mesure.id].modalites) || ''}</td>
      </tr>
    {/each}
    {#if servicesFiltres.length === 0}
      <tr>
        <td colspan="3">
          <AucunResultat on:click={effaceRechercheEtFiltres} />
        </td>
      </tr>
    {/if}
  </tbody>
</table>

<style lang="scss">
  span {
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }
  .filtres {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;

    thead {
      border: 1px solid #dddddd;

      th {
        white-space: nowrap;
        padding: 8px 16px;
        color: #666666;
        font-weight: bold;
      }
    }

    tbody {
      border: 1px solid #dddddd;

      td {
        padding: 8px 16px;
        border-top: 1px solid #dddddd;
      }
    }

    .intitule-service {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .nom {
        font-weight: bold;
      }
    }
  }
</style>
