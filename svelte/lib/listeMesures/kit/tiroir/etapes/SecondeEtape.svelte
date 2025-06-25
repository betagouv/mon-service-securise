<script lang="ts">
  import type {
    MesureReferentiel,
    ReferentielStatut,
  } from '../../../../ui/types';
  import { decode } from 'html-entities';
  import TagStatutMesure from '../../../../ui/TagStatutMesure.svelte';
  import { servicesAvecMesuresAssociees } from '../../../stores/servicesAvecMesuresAssociees.store';
  import { mesuresAvecServicesAssociesStore } from '../../../stores/mesuresAvecServicesAssocies.store';
  import Tableau from '../../../../ui/Tableau.svelte';

  export let statuts: ReferentielStatut;
  export let mesure: MesureReferentiel;

  $: servicesAssocies =
    mesure &&
    $servicesAvecMesuresAssociees
      .filter((s) => {
        return $mesuresAvecServicesAssociesStore[mesure.id].includes(s?.id);
      })
      .map(({ mesuresAssociees, ...autresDonnees }) => ({
        ...mesuresAssociees[mesure.id],
        ...autresDonnees,
      }));

  const optionsFiltrage = {
    categories: [{ id: 'statut', libelle: 'Statuts' }],
    items: [
      { libelle: 'À définir', valeur: undefined, idCategorie: 'statut' },
      ...Object.entries(statuts).map(([id, statut]) => ({
        libelle: statut,
        valeur: id,
        idCategorie: 'statut',
      })),
    ],
  };
</script>

<span>
  Sélectionnez les services concernés par ces modifications. Les données
  existantes seront remplacées.
</span>
<Tableau
  colonnes={[
    { cle: 'nom', libelle: 'Nom du service' },
    { cle: 'statut', libelle: 'Statut actuel' },
    { cle: 'modalites', libelle: 'Précision actuelle' },
  ]}
  donnees={servicesAssocies}
  configurationRecherche={{
    champsRecherche: ['nomService', 'organisationResponsable'],
  }}
  configurationFiltrage={{ options: optionsFiltrage }}
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {#if colonne.cle === 'nom'}
      <div class="intitule-service">
        <span class="nom">{decode(donnee.nomService)}</span>
        <span class="organisation">{donnee.organisationResponsable}</span>
      </div>
    {:else if colonne.cle === 'statut'}
      <TagStatutMesure referentielStatuts={statuts} statut={donnee.statut} />
    {:else if colonne.cle === 'modalites'}
      {decode(donnee.modalites) || ''}
    {/if}
  </svelte:fragment>
</Tableau>

<style lang="scss">
  span {
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .intitule-service {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .nom {
      font-weight: bold;
    }
  }
</style>
