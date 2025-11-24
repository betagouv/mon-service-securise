<script lang="ts">
  import TagStatutMesure from '../../ui/TagStatutMesure.svelte';
  import Tableau from '../../ui/Tableau.svelte';
  import type {
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../ui/types.d';
  import type { ServiceAssocieAUneMesure } from '../listeMesures.d';
  import { referentielNiveauxSecurite } from '../../ui/referentielNiveauxSecurite';

  export let referentielStatuts: ReferentielStatut;
  export let referentielTypesService: ReferentielTypesService | undefined =
    undefined;
  export let servicesAssocies: ServiceAssocieAUneMesure[];
  export let avecNomCliquable: boolean = false;
  export let avecTypeEtBesoinDeSecurite: boolean = false;
</script>

<Tableau
  colonnes={[
    { cle: 'nom', libelle: 'Nom du service' },
    ...(avecTypeEtBesoinDeSecurite
      ? [
          { cle: 'typeService', libelle: 'Type de service' },
          { cle: 'niveauSecurite', libelle: 'Besoin de sécurité' },
        ]
      : []),
    { cle: 'statut', libelle: 'Statut actuel' },
    { cle: 'modalites', libelle: 'Précision actuelle' },
  ]}
  donnees={servicesAssocies}
>
  <svelte:fragment slot="cellule" let:donnee let:colonne>
    {#if colonne.cle === 'nom'}
      {#if avecNomCliquable}
        {@const urlSecuriserService = `/service/${donnee.id}/mesures?${
          donnee.mesure.type === 'generale' ? 'idMesure=' : 'idModele='
        }${donnee.mesure.id}`}
        <a
          class="intitule-service intitule-service-cliquable"
          href={urlSecuriserService}
        >
          <span class="nom">{donnee.nomService}</span>
          <span class="organisation"
            >{donnee.organisationResponsable ?? '-'}</span
          >
        </a>
      {:else}
        <div class="intitule-service">
          <span class="nom">{donnee.nomService}</span>
          <span class="organisation"
            >{donnee.organisationResponsable ?? '-'}</span
          >
        </div>
      {/if}
    {:else if colonne.cle === 'typeService' && referentielTypesService}
      <div class="type-service">
        <span
          >{donnee.typeService
            .map((t) => referentielTypesService[t].description)
            .join(', ')}</span
        >
      </div>
    {:else if colonne.cle === 'niveauSecurite'}
      <div class="besoin-securite">
        <span>{referentielNiveauxSecurite[donnee.niveauSecurite]}</span>
      </div>
    {:else if colonne.cle === 'statut'}
      <div class="statut">
        <TagStatutMesure {referentielStatuts} statut={donnee.mesure.statut} />
      </div>
    {:else if colonne.cle === 'modalites'}
      {@const contenu = donnee.mesure.modalites ?? ''}
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
  :global(tr:has(.intitule-service-cliquable:hover)) {
    box-shadow: var(--ombre-md);
  }

  .intitule-service {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #3a3a3a;
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

  .intitule-service-cliquable:hover {
    .nom {
      color: var(--bleu-mise-en-avant);
    }
  }

  .type-service,
  .besoin-securite {
    width: 128px;
  }

  .statut {
    width: 148px;
  }

  .precision {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }
</style>
