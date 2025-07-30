<script lang="ts">
  import Tableau from '../../ui/Tableau.svelte';
  import Infobulle from '../../ui/Infobulle.svelte';
  import type {
    IdNiveauDeSecurite,
    ReferentielTypesService,
  } from '../../ui/types';
  import { decode } from 'html-entities';
  import { servicesAvecMesuresAssociees } from '../stores/servicesAvecMesuresAssociees.store';

  export let idMesure: string;
  export let referentielTypesService: ReferentielTypesService;
  let idsServicesSelectionnes: string[] = [];

  const libellesBesoinsSecurite: Record<IdNiveauDeSecurite, string> = {
    niveau1: 'Basiques',
    niveau2: 'Modérés',
    niveau3: 'Avancés',
  };

  const optionsFiltrage = {
    categories: [
      { id: 'typeService', libelle: 'Type de service' },
      { id: 'niveauSecurite', libelle: 'Besoins de sécurité' },
    ],
    items: [
      ...Object.entries(referentielTypesService).map(
        ([id, { description }]) => ({
          libelle: description,
          valeur: id,
          idCategorie: 'typeService',
        })
      ),
      ...Object.entries(libellesBesoinsSecurite).map(([id, valeur]) => ({
        libelle: valeur,
        valeur: id,
        idCategorie: 'niveauSecurite',
      })),
    ],
  };
</script>

<span class="entete">
  <h3>Associer cette mesures à un/des services</h3>
  <span class="explication">
    Sélectionnez les services que vous souhaitez associer à cette mesure.
  </span>
</span>
<Tableau
  colonnes={[
    { cle: 'nom', libelle: 'Nom du service' },
    { cle: 'typeService', libelle: 'Type de service' },
    { cle: 'niveauSecurite', libelle: 'Besoins de sécurité' },
  ]}
  donnees={$servicesAvecMesuresAssociees}
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
      donnee.mesuresSpecifiques.some((mesure) => mesure.id === idMesure),
  }}
  bind:selection={idsServicesSelectionnes}
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {@const desactive = donnee.mesuresSpecifiques.some(
      (mesure) => mesure.id === idMesure
    )}
    {#if colonne.cle === 'nom'}
      <div class="contenu-nom-service">
        <div class="intitule-service" class:desactive>
          <span class="nom">{decode(donnee.nomService)}</span>
          <span class="organisation">{donnee.organisationResponsable}</span>
        </div>
        {#if desactive}
          <Infobulle
            contenu="Vous ne pouvez pas sélectionner ce service car il est déjà associé à cette mesure."
          />
        {/if}
      </div>
    {:else if colonne.cle === 'typeService'}
      <div class="contenu-type-service">
        <div class:desactive>
          <span class="type-service"
            >{donnee.typeService
              .map((t) => referentielTypesService[t].description)
              .join(', ')}</span
          >
        </div>
      </div>
    {:else if colonne.cle === 'besoinSecurite'}
      <div class="contenu-besoin-securite">
        <div class:desactive>
          <span class="besoin-securite"
            >{libellesBesoinsSecurite[donnee.niveauSecurite]}</span
          >
        </div>
      </div>
    {/if}
  </svelte:fragment>
</Tableau>

<style lang="scss">
  h3 {
    margin: 2px 0 0 0;
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  span {
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .contenu-type-service {
    width: 158px;
  }

  .contenu-besoin-securite {
    width: 182px;
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
    max-width: 318px;

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

  .desactive {
    opacity: 0.5;
  }

  .explication {
    max-width: 500px;
  }

  .entete {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: -6px;
  }
</style>
