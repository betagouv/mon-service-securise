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
  import Infobulle from '../../../../ui/Infobulle.svelte';

  export let statuts: ReferentielStatut;
  export let mesure: MesureReferentiel;
  export let modificationPrecisionUniquement: boolean;
  export let idsServicesSelectionnes: string[];

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
  configurationSelection={{
    texteIndicatif: {
      vide: 'Aucun service sélectionné',
      unique: 'service sélectionné',
      multiple: 'services sélectionnés',
    },
    champSelection: 'id',
    predicatSelectionDesactive: (donnee) =>
      modificationPrecisionUniquement && !donnee.statut,
  }}
  bind:selection={idsServicesSelectionnes}
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {#if colonne.cle === 'nom'}
      <div class="intitule-service">
        <span class="nom">{decode(donnee.nomService)}</span>
        <span class="organisation">{donnee.organisationResponsable}</span>
      </div>
    {:else if colonne.cle === 'statut'}
      <div class="conteneur-statut">
        <TagStatutMesure referentielStatuts={statuts} statut={donnee.statut} />
        {#if modificationPrecisionUniquement && !donnee.statut}
          <Infobulle
            contenu="Cette précision ne peut pas être appliquée à ce service, car il ne dispose pas actuellement d'un statut."
          ></Infobulle>
        {/if}
      </div>
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

  .conteneur-statut {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }
</style>
