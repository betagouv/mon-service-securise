<script lang="ts">
  import Tableau from '../../ui/Tableau.svelte';
  import Infobulle from '../../ui/Infobulle.svelte';
  import type { ServiceAvecMesuresAssociees } from '../listeMesures.d';
  import type {
    IdNiveauDeSecurite,
    ModeleMesureSpecifique,
    ReferentielTypesService,
  } from '../../ui/types';
  import { decode } from 'html-entities';
  import { servicesAvecMesuresAssociees } from '../servicesAssocies/servicesAvecMesuresAssociees.store';
  import Toast from '../../ui/Toast.svelte';
  import { referentielNiveauxSecurite } from '../../ui/referentielNiveauxSecurite';
  import SeparateurHorizontal from '../../ui/SeparateurHorizontal.svelte';

  export let modeleMesure: ModeleMesureSpecifique;
  export let referentielTypesService: ReferentielTypesService;
  export let idsServicesSelectionnes: string[];

  export let etapeActive: 1 | 2;

  $: configurationRecherche =
    etapeActive === 1
      ? {
          champsRecherche: ['nomService', 'organisationResponsable'],
        }
      : null;

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
      ...Object.entries(referentielNiveauxSecurite).map(([id, valeur]) => ({
        libelle: valeur,
        valeur: id,
        idCategorie: 'niveauSecurite',
      })),
    ],
  };

  $: configurationFiltrage =
    etapeActive === 1 ? { options: optionsFiltrage } : null;
  $: configurationSelection =
    etapeActive === 1
      ? {
          texteIndicatif: {
            vide: 'Aucun service sélectionné',
            unique: 'service sélectionné',
            multiple: 'services sélectionnés',
          },
          champSelection: 'id',
          predicatSelectionDesactive: (donnee: ServiceAvecMesuresAssociees) =>
            modeleMesure!.idsServicesAssocies.includes(donnee.id),
        }
      : null;

  const doitEtreALaFin = (service: ServiceAvecMesuresAssociees) =>
    !service.peutEtreModifie ||
    modeleMesure.idsServicesAssocies.includes(service.id);

  $: servicesAvecMesuresAssocieesOrdonnes = $servicesAvecMesuresAssociees.sort(
    (a, b) => {
      if (
        (doitEtreALaFin(a) && doitEtreALaFin(b)) ||
        (!doitEtreALaFin(a) && !doitEtreALaFin(b))
      ) {
        return a.nomService.localeCompare(b.nomService);
      }
      return doitEtreALaFin(a) ? 1 : -1;
    }
  );
</script>

<span class="entete">
  <h3>Associer cette mesures à un/des services</h3>
  {#if etapeActive === 1}
    <span class="explication">
      Sélectionnez les services que vous souhaitez associer à cette mesure.
    </span>
  {:else if etapeActive === 2}
    <span class="alerte-modification-indice-cyber">
      <Toast
        avecOmbre={false}
        titre="Cette action peut avoir un impact significatif."
        avecAnimation={false}
        niveau="info"
        contenu="Vous vous apprêtez à associer cette mesure à <b>{idsServicesSelectionnes.length}
        {idsServicesSelectionnes.length === 1 ? 'service' : 'services'}</b>.
        Cela aura un impact sur {idsServicesSelectionnes.length === 1
          ? 'son'
          : 'leur'}
        indice cyber."
      />
    </span>
    <div class="conteneur-separateur">
      <SeparateurHorizontal />
    </div>
    <h5>
      {idsServicesSelectionnes.length}
      {idsServicesSelectionnes.length === 1
        ? 'service concerné'
        : 'services concernés'} par cette modification
    </h5>
  {/if}
</span>
<Tableau
  colonnes={[
    { cle: 'nom', libelle: 'Nom du service' },
    { cle: 'typeService', libelle: 'Type de service' },
    { cle: 'niveauSecurite', libelle: 'Besoins de sécurité' },
  ]}
  donnees={etapeActive === 1
    ? servicesAvecMesuresAssocieesOrdonnes
    : servicesAvecMesuresAssocieesOrdonnes.filter((s) =>
        idsServicesSelectionnes.includes(s.id)
      )}
  {configurationRecherche}
  {configurationFiltrage}
  {configurationSelection}
  bind:selection={idsServicesSelectionnes}
  preSelectionImmuable={modeleMesure.idsServicesAssocies}
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {@const desactive = donnee.mesuresSpecifiques.some(
      (mesure) => mesure.idModele === modeleMesure.id
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
    {:else if colonne.cle === 'niveauSecurite'}
      <div class="contenu-besoin-securite">
        <div class:desactive>
          <span class="besoin-securite"
            >{referentielNiveauxSecurite[donnee.niveauSecurite]}</span
          >
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

  .entete {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: -6px;

    .alerte-modification-indice-cyber {
      max-width: 590px;
      margin-top: 16px;
    }

    .explication {
      max-width: 500px;
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
