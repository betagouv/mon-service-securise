<script lang="ts">
  import type { ReferentielStatut } from '../../../../ui/types';
  import { decode } from 'html-entities';
  import TagStatutMesure from '../../../../ui/TagStatutMesure.svelte';
  import Tableau from '../../../../ui/Tableau.svelte';
  import Infobulle from '../../../../ui/Infobulle.svelte';

  export let statuts: ReferentielStatut;
  export let modificationPrecisionUniquement: boolean;
  export let idsServicesSelectionnes: string[];
  export let servicesAssocies;

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
      {@const contenu = decode(donnee.modalites)}
      {@const contenuTropLong = contenu.length > 90}
      <div class="precision">
        <span>{contenuTropLong ? contenu.slice(0, 90) + '...' : contenu}</span>
        {#if contenuTropLong}
          <img
            src="/statique/assets/images/icone_voir_plus.svg"
            alt={contenu}
            title={contenu}
            width="16px"
            height="16px"
          />
        {/if}
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
    width: 318px;

    .nom {
      font-weight: bold;
    }

    .nom,
    .organisation {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .conteneur-statut {
    width: 148px;
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

  .precision {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }
</style>
