<script lang="ts">
  import Toast from '../../../ui/Toast.svelte';
  import type {
    ModeleMesureSpecifique,
    ReferentielTypesService,
  } from '../../../ui/types.d';
  import { servicesAvecMesuresAssociees } from '../../servicesAssocies/servicesAvecMesuresAssociees.store';
  import Tableau from '../../../ui/Tableau.svelte';
  import { referentielNiveauxSecurite } from '../../../ui/referentielNiveauxSecurite';
  import SeparateurHorizontal from '../../../ui/SeparateurHorizontal.svelte';

  export let modeleMesure: ModeleMesureSpecifique;
  export let referentielTypesService: ReferentielTypesService;

  $: servicesAssocies =
    modeleMesure &&
    $servicesAvecMesuresAssociees.filter((s) =>
      modeleMesure.idsServicesAssocies.includes(s.id)
    );
</script>

<div class="entete">
  <h3>Modifier les informations de la mesure</h3>
  <div class="alerte-modification-indice-cyber">
    <Toast
      avecOmbre={false}
      titre="Modification sur {servicesAssocies.length === 1
        ? 'un service'
        : 'plusieurs services'}"
      avecAnimation={false}
      niveau="info"
      contenu="Vous vous apprêtez à modifier cette mesure sur <b>{servicesAssocies.length}
      {servicesAssocies.length === 1 ? 'service' : 'services'}</b>."
    />
  </div>
  <div class="conteneur-separateur">
    <SeparateurHorizontal />
  </div>
  <h5>
    {servicesAssocies.length}
    {servicesAssocies.length === 1 ? 'service concerné' : 'services concernés'} par
    cette modification
  </h5>
</div>
<Tableau
  colonnes={[
    { cle: 'nom', libelle: 'Nom du service' },
    { cle: 'typeService', libelle: 'Type de service' },
    { cle: 'niveauSecurite', libelle: 'Besoins de sécurité' },
  ]}
  donnees={servicesAssocies}
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {#if colonne.cle === 'nom'}
      <div class="contenu-nom-service">
        <div class="intitule-service">
          <span class="nom">{donnee.nomService}</span>
          <span class="organisation">{donnee.organisationResponsable}</span>
        </div>
      </div>
    {:else if colonne.cle === 'typeService'}
      <div class="contenu-type-service">
        <div>
          <span class="type-service"
            >{donnee.typeService
              .map((t) => referentielTypesService[t].description)
              .join(', ')}</span
          >
        </div>
      </div>
    {:else if colonne.cle === 'niveauSecurite'}
      <div class="contenu-besoin-securite">
        <div>
          <span class="besoin-securite">
            {referentielNiveauxSecurite[donnee.niveauSecurite]}
          </span>
        </div>
      </div>
    {/if}
  </svelte:fragment>
</Tableau>

<style lang="scss">
  h3 {
    margin: 2px 0 0;
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  div {
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

  .entete {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: -6px;

    .alerte-modification-indice-cyber {
      max-width: 590px;
      margin-top: 16px;
    }

    .conteneur-separateur {
      margin: 16px 0;
    }

    h5 {
      margin: 0;
      font-size: 1.375rem;
      font-weight: bold;
      line-height: 1.75rem;
      color: #161616;
    }
  }
</style>
