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
  import type { ServiceAssocieAUneMesure } from '../../../listeMesures.d';

  export let statuts: ReferentielStatut;
  export let mesure: MesureReferentiel;
  export let modificationPrecisionUniquement: boolean;
  export let idsServicesSelectionnes: string[];

  const doitEtreALaFin = (service: {
    peutEtreModifie: boolean;
    statut?: string;
  }) => {
    return (
      !service.peutEtreModifie ||
      (modificationPrecisionUniquement && !service.statut)
    );
  };

  $: servicesAssocies =
    mesure &&
    $servicesAvecMesuresAssociees
      .filter((s) => {
        return $mesuresAvecServicesAssociesStore[mesure.id].includes(s?.id);
      })
      .map(({ mesuresAssociees, ...autresDonnees }) => ({
        ...mesuresAssociees[mesure.id],
        ...autresDonnees,
      }))
      .sort((a, b) => {
        if (
          (doitEtreALaFin(a) && doitEtreALaFin(b)) ||
          (!doitEtreALaFin(a) && !doitEtreALaFin(b))
        ) {
          return a.nomService.localeCompare(b.nomService);
        }
        return doitEtreALaFin(a) ? 1 : -1;
      });

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

<span class="explication">
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
      (modificationPrecisionUniquement && !donnee.statut) ||
      !donnee.peutEtreModifie,
  }}
  bind:selection={idsServicesSelectionnes}
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {@const desactive =
      !donnee.peutEtreModifie ||
      (modificationPrecisionUniquement && !donnee.statut)}
    {#if colonne.cle === 'nom'}
      <div class="contenu-nom-service">
        <div class="intitule-service" class:desactive>
          <span class="nom">{decode(donnee.nomService)}</span>
          <span class="organisation">{donnee.organisationResponsable}</span>
        </div>
        {#if !donnee.peutEtreModifie}
          <Infobulle
            contenu="Vous ne pouvez pas sélectionner ce service car vous ne disposez pas des droits d’écriture."
          />
        {/if}
      </div>
    {:else if colonne.cle === 'statut'}
      <div class="conteneur-statut">
        <div class:desactive>
          <TagStatutMesure
            referentielStatuts={statuts}
            statut={donnee.statut}
          />
        </div>
        {#if modificationPrecisionUniquement && !donnee.statut}
          <Infobulle
            contenu="Cette précision ne peut pas être appliquée à ce service, car il ne dispose pas actuellement d'un statut."
          ></Infobulle>
        {/if}
      </div>
    {:else if colonne.cle === 'modalites'}
      <div class:desactive>
        {decode(donnee.modalites) || ''}
      </div>
    {/if}
  </svelte:fragment>
</Tableau>

<style lang="scss">
  span {
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .contenu-nom-service {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
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

  .desactive {
    opacity: 0.5;
  }

  .explication {
    max-width: 500px;
  }
</style>
